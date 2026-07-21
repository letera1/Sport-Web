import { useState, useEffect, useCallback } from 'react';
import { lookupPlayer, lookupPlayerStats, lookupPlayerHonours, lookupFormerTeams, lookupMilestones, lookupContracts } from '../services/sportsApi';
import type { PlayerDetails, PlayerStats, PlayerHonour, FormerTeam, PlayerMilestone, PlayerContract } from '../types';

export const usePlayerDetails = (playerId: string | undefined) => {
  const [player, setPlayer] = useState<PlayerDetails | null>(null);
  const [stats, setStats] = useState<PlayerStats[]>([]);
  const [honours, setHonours] = useState<PlayerHonour[]>([]);
  const [formerTeams, setFormerTeams] = useState<FormerTeam[]>([]);
  const [milestones, setMilestones] = useState<PlayerMilestone[]>([]);
  const [contracts, setContracts] = useState<PlayerContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    if (!playerId) {
      setError('No player ID provided');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [playerData, statsData, honoursData, teamsData, milestonesData, contractsData] = await Promise.allSettled([
        lookupPlayer(playerId),
        lookupPlayerStats(playerId),
        lookupPlayerHonours(playerId),
        lookupFormerTeams(playerId),
        lookupMilestones(playerId),
        lookupContracts(playerId),
      ]);

      if (playerData.status === 'fulfilled') setPlayer(playerData.value);
      if (statsData.status === 'fulfilled') setStats(statsData.value);
      if (honoursData.status === 'fulfilled') setHonours(honoursData.value);
      if (teamsData.status === 'fulfilled') setFormerTeams(teamsData.value);
      if (milestonesData.status === 'fulfilled') setMilestones(milestonesData.value);
      if (contractsData.status === 'fulfilled') setContracts(contractsData.value);

      setError(null);
    } catch (err) {
      console.error('Error fetching player details:', err);
      setError('Failed to load player details');
    } finally {
      setLoading(false);
    }
  }, [playerId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { player, stats, honours, formerTeams, milestones, contracts, loading, error };
};
