import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { addDays, subDays, parseISO, format } from 'date-fns';
import { getNextLeagueEvents, getPastLeagueEvents, getEventsOnDay } from '../services/sportsApi';
import { POLLING_INTERVAL } from '../constants';
import type { MatchEvent } from '../types';

export const useMatches = (leagueId: string, selectedDate: Date) => {
  const [preloadedMatches, setPreloadedMatches] = useState<MatchEvent[]>([]);
  const [dayMatches, setDayMatches] = useState<MatchEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 1. Fetch next & past matches when leagueId changes
  const fetchPreloaded = useCallback(async () => {
    try {
      const [nextEvents, pastEvents] = await Promise.allSettled([
        getNextLeagueEvents(leagueId),
        getPastLeagueEvents(leagueId),
      ]);

      const next = nextEvents.status === 'fulfilled' ? nextEvents.value : [];
      const past = pastEvents.status === 'fulfilled' ? pastEvents.value : [];
      setPreloadedMatches([...past, ...next]);
      setError(null);
    } catch (err) {
      console.error('Error fetching preloaded league fixtures:', err);
      setError('Failed to fetch matches');
    }
  }, [leagueId]);

  // 2. Fetch matches for selectedDate when leagueId or selectedDate changes
  const fetchDayMatches = useCallback(async () => {
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const events = await getEventsOnDay(dateStr, leagueId);
      setDayMatches(events);
    } catch (err) {
      console.error('Error fetching matches for day:', err);
    }
  }, [leagueId, selectedDate]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchPreloaded(), fetchDayMatches()]);
    setLoading(false);
  }, [fetchPreloaded, fetchDayMatches]);

  useEffect(() => {
    fetchAll();
    timerRef.current = setInterval(fetchAll, POLLING_INTERVAL);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [fetchAll]);

  // Merge and sort all matches
  const matches = useMemo(() => {
    const all = [...preloadedMatches, ...dayMatches];
    const unique = Array.from(new Map(all.map(item => [item.idEvent, item])).values());
    
    return unique.sort((a, b) =>
      new Date(a.dateEvent + 'T' + a.strTime).getTime() - new Date(b.dateEvent + 'T' + b.strTime).getTime()
    );
  }, [preloadedMatches, dayMatches]);

  return { matches, loading, error, preloadedMatches };
};
