import { useCallback, useEffect, useRef, useState } from 'react';
import { sportdb } from '../services/sportdb/client';
import { normalizeMatches } from '../services/sportdb/normalize';
import type { SportMatch } from '../services/sportdb/models';

/** Refresh cadence while the tab is visible and the user is active. */
const REFRESH_MS = 60_000;
/** Auto-refresh stops after this long without interaction, to protect quota. */
const IDLE_TIMEOUT_MS = 10 * 60_000;

interface UseLiveMatchesResult {
  matches: SportMatch[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  stale: boolean;
  autoRefreshPaused: boolean;
  refresh: () => void;
}

/**
 * Live scores for a whole sport.
 *
 * The free plan allows ~1000 requests/month, so this deliberately does not poll
 * forever: refreshes pause when the tab is hidden and stop entirely once the
 * user has been idle, leaving a manual refresh available.
 */
export const useLiveMatches = (sport = 'football'): UseLiveMatchesResult => {
  const [matches, setMatches] = useState<SportMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [stale, setStale] = useState(false);
  const [autoRefreshPaused, setAutoRefreshPaused] = useState(false);

  const lastInteractionRef = useRef(Date.now());
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const result = await sportdb.liveAll(sport, controller.signal);
      setMatches(normalizeMatches(result.data));
      setStale(Boolean(result.meta?.stale));
      setLastUpdated(result.meta?.fetchedAt ? new Date(result.meta.fetchedAt) : new Date());
      setError(null);
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      setError((err as Error).message || 'Live scores are unavailable right now.');
    } finally {
      setLoading(false);
    }
  }, [sport]);

  const refresh = useCallback(() => {
    lastInteractionRef.current = Date.now();
    setAutoRefreshPaused(false);
    void load();
  }, [load]);

  useEffect(() => {
    void load();

    const markActive = () => { lastInteractionRef.current = Date.now(); };
    const events: Array<keyof WindowEventMap> = ['pointerdown', 'keydown', 'scroll', 'focus'];
    events.forEach((event) => window.addEventListener(event, markActive, { passive: true }));

    const timer = setInterval(() => {
      if (document.hidden) return;
      if (Date.now() - lastInteractionRef.current > IDLE_TIMEOUT_MS) {
        setAutoRefreshPaused(true);
        return;
      }
      void load();
    }, REFRESH_MS);

    return () => {
      clearInterval(timer);
      events.forEach((event) => window.removeEventListener(event, markActive));
      abortRef.current?.abort();
    };
  }, [load]);

  return { matches, loading, error, lastUpdated, stale, autoRefreshPaused, refresh };
};
