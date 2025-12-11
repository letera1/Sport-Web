import { useState, useEffect, useRef, useCallback } from 'react';
import { addDays, subDays, parseISO } from 'date-fns';
import { apiClient } from '../api/client';
import { API_ENDPOINTS, POLLING_INTERVAL } from '../constants';
import { MatchEvent } from '../types';

export const useMatches = (leagueId: string) => {
  const [matches, setMatches] = useState<MatchEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchMatches = useCallback(async () => {
    try {
      // Determine current season dynamically (e.g., 2024-2025 for dates between Aug 2024 - Jul 2025)
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth(); // 0-indexed (0=Jan, 11=Dec)
      // Football seasons typically run Aug-May
      // Dec 2024 (month=11) -> season 2024-2025
      // Jan 2025 (month=0) -> season 2024-2025
      const seasonStartYear = month >= 7 ? year : year - 1;
      const currentSeason = `${seasonStartYear}-${seasonStartYear + 1}`;

      // Strategy: Fetch Next 15 and Past 15 (Reliable) AND Season (Comprehensive)
      const [nextRes, pastRes, seasonRes] = await Promise.allSettled([
        apiClient.get(`${API_ENDPOINTS.NEXT_LEAGUE}?id=${leagueId}`),
        apiClient.get(`${API_ENDPOINTS.PAST_LEAGUE}?id=${leagueId}`),
        apiClient.get(`${API_ENDPOINTS.SEASON_LEAGUE}?id=${leagueId}&s=${currentSeason}`)
      ]);

      const nextEvents: MatchEvent[] = nextRes.status === 'fulfilled' ? (nextRes.value.data.events || []) : [];
      const pastEvents: MatchEvent[] = pastRes.status === 'fulfilled' ? (pastRes.value.data.events || []) : [];
      const seasonEvents: MatchEvent[] = seasonRes.status === 'fulfilled' ? (seasonRes.value.data.events || []) : [];

      // Merge and deduplicate by idEvent
      const allEvents = [...pastEvents, ...nextEvents, ...seasonEvents];
      const uniqueEvents = Array.from(new Map(allEvents.map((item: MatchEvent) => [item.idEvent, item])).values());

      // Sort by date/time
      const sortedEvents = uniqueEvents.sort((a, b) => 
        new Date(a.dateEvent + 'T' + a.strTime).getTime() - new Date(b.dateEvent + 'T' + b.strTime).getTime()
      );

      // Keep only a reasonable window around today to avoid stale historical matches
      const windowStart = subDays(now, 7); // Show last 7 days of results
      const windowEnd = addDays(now, 30);  // Show next 30 days of fixtures
      const currentYear = now.getFullYear();
      
      const filteredEvents = sortedEvents.filter((evt) => {
        const d = parseISO(evt.dateEvent);
        if (isNaN(d.getTime())) return false;
        
        // Strict year check - only allow current year or previous year (for Jan matches of current season)
        const matchYear = d.getFullYear();
        if (matchYear < currentYear - 1) return false;
        
        return d >= windowStart && d <= windowEnd;
      });

      setMatches(filteredEvents);
      setError(null);
    } catch (err) {
      console.error("Error fetching fixtures:", err);
      setError('Failed to fetch matches');
    } finally {
      setLoading(false);
    }
  }, [leagueId]);

  useEffect(() => {
    // reset state when league changes
    setLoading(true);
    setMatches([]);
    setError(null);
    fetchMatches();

    // Start polling
    timerRef.current = setInterval(fetchMatches, POLLING_INTERVAL);

    // Cleanup on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [fetchMatches]);

  return { matches, loading, error };
};
