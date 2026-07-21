import { useState, useEffect, useCallback } from 'react';
import { lookupTeam, lookupEquipment, getTeamNextEvents, getTeamLastEvents } from '../services/sportsApi';
import type { TeamDetails, Equipment, MatchEvent } from '../types';

export const useTeamDetails = (teamId: string | undefined) => {
  const [team, setTeam] = useState<TeamDetails | null>(null);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [nextMatches, setNextMatches] = useState<MatchEvent[]>([]);
  const [lastMatches, setLastMatches] = useState<MatchEvent[]>([]);
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
      const [teamData, equipData, nextData, lastData] = await Promise.allSettled([
        lookupTeam(teamId),
        lookupEquipment(teamId),
        getTeamNextEvents(teamId),
        getTeamLastEvents(teamId),
      ]);

      if (teamData.status === 'fulfilled') setTeam(teamData.value);
      if (equipData.status === 'fulfilled') setEquipment(equipData.value);
      if (nextData.status === 'fulfilled') setNextMatches(nextData.value);
      if (lastData.status === 'fulfilled') setLastMatches(lastData.value);

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

  return { team, equipment, nextMatches, lastMatches, loading, error };
};
