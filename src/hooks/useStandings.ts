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

      const [startYear] = s.split('-').map(Number);
      const prevSeason = startYear ? `${startYear - 1}-${startYear}` : undefined;

      // A new season's table is empty until the first matches are played — fall back to last season.
      let table = await lookupStandings(leagueId, s);
      if (table.length === 0 && prevSeason) {
        table = await lookupStandings(leagueId, prevSeason);
      }

      if (table.length === 0) {
        setStandings([]);
        setError('No data found for this league');
        return;
      }

      setStandings(
        table
          .map(entry => ({
            ...entry,
            strTeamBadge: entry.strBadge || entry.strTeamBadge || '',
          }))
          .sort((a, b) => (parseInt(a.intRank, 10) || 0) - (parseInt(b.intRank, 10) || 0))
      );
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
