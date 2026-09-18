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
  normalize: (payload: unknown) => T | null
): SportdbResource<T> {
  const [state, setState] = useState<SportdbResource<T>>(IDLE);
  const requestedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!eventId) {
      requestedFor.current = null;
      setState(IDLE);
      return;
    }
    if (!enabled || requestedFor.current === eventId) return;

    requestedFor.current = eventId;
    const controller = new AbortController();
    setState({ data: null, loading: true, error: null });

    fetcher(eventId, controller.signal)
      .then(({ data }) => {
        if (controller.signal.aborted) return;
        setState({ data: normalize(data), loading: false, error: null });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted || (error as Error)?.name === 'AbortError') return;
        // Allow a retry after a transient failure.
        requestedFor.current = null;
        setState({ data: null, loading: false, error: messageFor(error) });
      });

    return () => controller.abort();
  }, [eventId, enabled, fetcher, normalize]);

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
  const key = eventId ? `${eventId}#${nonce}` : undefined;

  const info = useLazyResource(key, true, sportdb.matchDetails, normalizeMatchInfo);
  const stats = useLazyResource(key, activeTab === 'stats', sportdb.matchStats, normalizeStatPeriods);
  const lineups = useLazyResource(key, activeTab === 'lineups', sportdb.matchLineups, normalizeLineups);
  const odds = useLazyResource(key, activeTab === 'odds', sportdb.matchOdds, normalizeOdds);

  const refresh = useCallback(() => setNonce((value) => value + 1), []);

  return { info, stats, lineups, odds, refresh };
}
