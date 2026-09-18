import { useState, useEffect, useCallback } from 'react';
import { lookupStandings } from '../services/sportsApi';
import { getCurrentSeason, getSportdbLeague } from '../constants';
import { sportdb } from '../services/sportdb/client';
import { normalizeCompetition, normalizeStandings } from '../services/sportdb/normalize';
import { loadBadgeIndex, resolveBadge } from '../services/sportdb/badges';
import type { SportStanding } from '../services/sportdb/models';
import type { StandingsEntry } from '../types';

export type StandingsSource = 'sportdb' | 'thesportsdb' | null;

function fromTheSportsDb(entries: StandingsEntry[]): SportStanding[] {
  const int = (value: string | undefined | null): number | null => {
    const n = Number.parseInt(value ?? '', 10);
    return Number.isFinite(n) ? n : null;
  };

  return entries.map((entry, index) => ({
    rank: int(entry.intRank) ?? index + 1,
    team: {
      id: entry.idTeam,
      name: entry.strTeam,
      slug: null,
      badgeUrl: entry.strBadge || entry.strTeamBadge || null,
    },
    played: int(entry.intPlayed),
    wins: int(entry.intWin),
    draws: int(entry.intDraw),
    losses: int(entry.intLoss),
    goalsFor: int(entry.intGoalsFor),
    goalsAgainst: int(entry.intGoalsAgainst),
    goalDifference: int(entry.intGoalDifference),
    points: int(entry.intPoints),
    pointsPerMatch: null,
    zone: 'none' as const,
    zoneColor: null,
    form: (entry.strForm ?? '').replace(/[^WDL]/gi, '').toUpperCase().split(''),
  }));
}

/**
 * Two-provider strategy: SportDB returns the complete table, and TheSportsDB
 * (top 5 only) is the fallback when SportDB has no data for the competition or
 * is unconfigured / out of quota.
 */
export const useStandings = (leagueId: string, season?: string) => {
  const [standings, setStandings] = useState<SportStanding[]>([]);
  const [source, setSource] = useState<StandingsSource>(null);
  const [partial, setPartial] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStandings = useCallback(async () => {
    setLoading(true);
    const mapping = getSportdbLeague(leagueId);

    if (mapping) {
      try {
        // The competition endpoint is self-describing, so the season is never
        // guessed. It is cached for a week server-side.
        const competition = await sportdb.competition(
          mapping.sport, mapping.country, mapping.competition
        );
        const info = normalizeCompetition(competition.data);
        const targetSeason = season ?? info?.currentSeason ?? getCurrentSeason();

        const result = await sportdb.standings(
          mapping.sport, mapping.country, mapping.competition, targetSeason
        );
        const rows = normalizeStandings(result.data);

        if (rows.length > 0) {
          setStandings(rows);
          setSource('sportdb');
          setPartial(false);
          setError(null);
          setLoading(false);
          return;
        }
      } catch {
        // Fall through to TheSportsDB rather than failing the page.
      }
    }

    try {
      const s = season || getCurrentSeason();
      const [startYear] = s.split('-').map(Number);
      let table = await lookupStandings(leagueId, s);
      if (table.length === 0 && startYear) {
        table = await lookupStandings(leagueId, `${startYear - 1}-${startYear}`);
      }

      if (table.length === 0) {
        setStandings([]);
        setSource(null);
        setError('No data found for this league');
        return;
      }

      setStandings(fromTheSportsDb(table));
      setSource('thesportsdb');
      setPartial(true);
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

  return { standings, loading, error, source, partial, refetch: fetchStandings };
};
