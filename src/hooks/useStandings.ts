import { useState, useEffect, useCallback } from 'react';
import { lookupStandings } from '../services/sportsApi';
import { getCurrentSeason } from '../constants';
import type { StandingsEntry } from '../types';

export const useStandings = (leagueId: string, season?: string) => {
  const [standings, setStandings] = useState<StandingsEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStandings = useCallback(async () => {
    try {
      setLoading(true);
      const s = season || getCurrentSeason();
      const data = await lookupStandings(leagueId, s);
      setStandings(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching standings:', err);
      setError('Failed to load standings');
    } finally {
      setLoading(false);
    }
  }, [leagueId, season]);

  useEffect(() => {
    fetchStandings();
  }, [fetchStandings]);

  return { standings, loading, error, refetch: fetchStandings };
};
