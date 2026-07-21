import { useState, useEffect, useRef, useCallback } from 'react';
import { addDays, subDays, parseISO } from 'date-fns';
import { getNextLeagueEvents, getPastLeagueEvents, getSeasonEvents } from '../services/sportsApi';
import { POLLING_INTERVAL, getCurrentSeason } from '../constants';
import type { MatchEvent } from '../types';

export const useMatches = (leagueId: string) => {
  const [matches, setMatches] = useState<MatchEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchMatches = useCallback(async () => {
    try {
      const currentSeason = getCurrentSeason();

      const [nextEvents, pastEvents, seasonEvents] = await Promise.allSettled([
        getNextLeagueEvents(leagueId),
        getPastLeagueEvents(leagueId),
        getSeasonEvents(leagueId, currentSeason),
      ]);

      const next: MatchEvent[] = nextEvents.status === 'fulfilled' ? nextEvents.value : [];
      const past: MatchEvent[] = pastEvents.status === 'fulfilled' ? pastEvents.value : [];
      const season: MatchEvent[] = seasonEvents.status === 'fulfilled' ? seasonEvents.value : [];

      // Merge and deduplicate by idEvent
      const allEvents = [...past, ...next, ...season];
      const uniqueEvents = Array.from(new Map(allEvents.map(item => [item.idEvent, item])).values());

      // Sort by date/time
      const sortedEvents = uniqueEvents.sort((a, b) =>
        new Date(a.dateEvent + 'T' + a.strTime).getTime() - new Date(b.dateEvent + 'T' + b.strTime).getTime()
      );

      // Keep a reasonable window
      const now = new Date();
      const windowStart = subDays(now, 7);
      const windowEnd = addDays(now, 30);
      const currentYear = now.getFullYear();

      const filteredEvents = sortedEvents.filter((evt) => {
        const d = parseISO(evt.dateEvent);
        if (isNaN(d.getTime())) return false;
        const matchYear = d.getFullYear();
        if (matchYear < currentYear - 1) return false;
        return d >= windowStart && d <= windowEnd;
      });

      setMatches(filteredEvents);
      setError(null);
    } catch (err) {
      console.error('Error fetching fixtures:', err);
      setError('Failed to fetch matches');
    } finally {
      setLoading(false);
    }
  }, [leagueId]);

  useEffect(() => {
    setLoading(true);
    setMatches([]);
    setError(null);
    fetchMatches();

    timerRef.current = setInterval(fetchMatches, POLLING_INTERVAL);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [fetchMatches]);

  return { matches, loading, error };
};
