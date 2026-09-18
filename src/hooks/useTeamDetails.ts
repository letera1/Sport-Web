import { useState, useEffect, useCallback } from 'react';
import { lookupTeam, getTeamNextEvents, getTeamLastEvents, lookupAllPlayers } from '../services/sportsApi';
import type { TeamDetails, MatchEvent, PlayerDetails } from '../types';

export const useTeamDetails = (teamId: string | undefined) => {
  const [team, setTeam] = useState<TeamDetails | null>(null);
  const [nextMatches, setNextMatches] = useState<MatchEvent[]>([]);
  const [lastMatches, setLastMatches] = useState<MatchEvent[]>([]);
  const [players, setPlayers] = useState<PlayerDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    if (!teamId) {
      setError('No team ID provided');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [teamData, nextData, lastData, playersData] = await Promise.allSettled([
        lookupTeam(teamId),
        getTeamNextEvents(teamId),
        getTeamLastEvents(teamId),
        lookupAllPlayers(teamId),
      ]);

      let fetchedTeam: TeamDetails | null = null;
      if (teamData.status === 'fulfilled') {
        fetchedTeam = teamData.value;
        setTeam(fetchedTeam);
      }
      if (nextData.status === 'fulfilled') setNextMatches(nextData.value);
      if (lastData.status === 'fulfilled') setLastMatches(lastData.value);

      let fetchedPlayers = playersData.status === 'fulfilled' ? playersData.value : [];
      if (fetchedPlayers.length === 0 && fetchedTeam?.strTeam) {
        fetchedPlayers = await lookupAllPlayers(teamId, fetchedTeam.strTeam);
      }
      setPlayers(fetchedPlayers);

      setError(null);
    } catch (err) {
      console.error('Error fetching team details:', err);
      setError('Failed to load team details');
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { team, nextMatches, lastMatches, players, loading, error };
};
