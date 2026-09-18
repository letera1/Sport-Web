import { useCallback, useEffect, useRef, useState } from 'react';
import { sportdb, SportdbError } from '../services/sportdb/client';
import {
  normalizeLineups,
  normalizeMatchInfo,
  normalizeOdds,
  normalizeStatPeriods,
} from '../services/sportdb/matchNormalize';
import type {
  SportLineup,
  SportMatchInfo,
  SportOdds,
  SportStatPeriod,
} from '../services/sportdb/models';

export type SportdbMatchTab = 'summary' | 'stats' | 'lineups' | 'odds';

export interface SportdbResource<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

const IDLE: SportdbResource<never> = { data: null, loading: false, error: null };

const messageFor = (error: unknown): string => {
  if (error instanceof SportdbError) {
    switch (error.code) {
      case 'not_found':
        return 'The provider has no data for this match.';
      case 'budget_exhausted':
      case 'feature_unavailable':
        return 'This section is unavailable on the current plan.';
      case 'rate_limited':
      case 'upstream_rate_limited':
        return 'Too many requests right now — try again shortly.';
      default:
        return error.message;
    }
  }
  return 'Could not load this section.';
};

type Fetcher = (eventId: string, signal?: AbortSignal) => Promise<{ data: unknown }>;

/**
 * Fetches a match sub-resource the first time its tab is opened and keeps it.
 *
 * The plan allows a limited number of requests per month, so loading all four
 * sub-resources up front would spend four of them on a visitor who only ever
 * looks at the summary. Deferring the request until the tab is actually used
 * keeps a match view at one request in the common case.
 */
function useLazyResource<T>(
  eventId: string | undefined,
  enabled: boolean,
  fetcher: Fetcher,
  normalize: (payload: unknown) => T | null,
  resetKey: number
): SportdbResource<T> {
  const [state, setState] = useState<SportdbResource<T>>(IDLE);
  const requestedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!eventId) {
      requestedFor.current = null;
      setState(IDLE);
      return;
    }

    const attempt = `${resetKey}:${eventId}`;
    if (!enabled || requestedFor.current === attempt) return;

    requestedFor.current = attempt;
    const controller = new AbortController();
    let settled = false;
    setState({ data: null, loading: true, error: null });

    fetcher(eventId, controller.signal)
      .then(({ data }) => {
        settled = true;
        if (controller.signal.aborted) return;
        setState({ data: normalize(data), loading: false, error: null });
      })
      .catch((error: unknown) => {
        settled = true;
        if (controller.signal.aborted || (error as Error)?.name === 'AbortError') return;
        setState({ data: null, loading: false, error: messageFor(error) });
      });

    return () => {
      controller.abort();
      // A request that never settled left no result behind, so forget the
      // attempt and let the next run retry. Without this, StrictMode's
      // mount/unmount/mount cycle would abort the only request and then skip
      // the retry, stranding the tab on its loading state.
      if (!settled) requestedFor.current = null;
    };
  }, [eventId, enabled, fetcher, normalize, resetKey]);

  return state;
}

export interface SportdbMatch {
  info: SportdbResource<SportMatchInfo>;
  stats: SportdbResource<SportStatPeriod[]>;
  lineups: SportdbResource<SportLineup>;
  odds: SportdbResource<SportOdds>;
  refresh: () => void;
}

/**
 * Loads a SportDB match view. The header data loads immediately; statistics,
 * lineups and odds load on first visit to their tab.
 */
export function useSportdbMatch(
  eventId: string | undefined,
  activeTab: SportdbMatchTab
): SportdbMatch {
  const [nonce, setNonce] = useState(0);

  const info = useLazyResource(eventId, true, sportdb.matchDetails, normalizeMatchInfo, nonce);
  const stats = useLazyResource(eventId, activeTab === 'stats', sportdb.matchStats, normalizeStatPeriods, nonce);
  const lineups = useLazyResource(eventId, activeTab === 'lineups', sportdb.matchLineups, normalizeLineups, nonce);
  const odds = useLazyResource(eventId, activeTab === 'odds', sportdb.matchOdds, normalizeOdds, nonce);

  const refresh = useCallback(() => setNonce((value) => value + 1), []);

  return { info, stats, lineups, odds, refresh };
}
