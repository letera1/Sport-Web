import { apiClient } from '../api/client';
import { API_ENDPOINTS, CACHE_TTL } from '../constants';
import type {
  MatchEvent, MatchDetails, StandingsEntry,
  TeamDetails, PlayerDetails, PlayerHonour,
  PlayerContract, FormerTeam, PlayerMilestone, PlayerStats,
  EventTimeline, EventLineup,
} from '../types';

// ========================
// In-Memory TTL Cache
// ========================
interface CacheEntry<T> {
  data: T;
  expiry: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiry) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache<T>(key: string, data: T, ttl: number): void {
  cache.set(key, { data, expiry: Date.now() + ttl });
}

// ========================
// Request Deduplication
// ========================
const inflightRequests = new Map<string, Promise<unknown>>();

async function deduplicatedGet<T>(url: string, params: Record<string, string> = {}, ttl: number = 0): Promise<T | null> {
  const paramStr = new URLSearchParams(params).toString();
  const cacheKey = `${url}?${paramStr}`;

  // Check cache first
  if (ttl > 0) {
    const cached = getCached<T>(cacheKey);
    if (cached !== null) return cached;
  }

  // Check if already in-flight
  if (inflightRequests.has(cacheKey)) {
    return inflightRequests.get(cacheKey) as Promise<T | null>;
  }

  const promise = (async () => {
    try {
      const response = await apiClient.get(url, { params });
      const data = response.data;
      if (ttl > 0 && data) {
        setCache(cacheKey, data, ttl);
      }
      return data as T;
    } catch (err) {
      console.error(`API Error [${url}]:`, err);
      return null;
    } finally {
      inflightRequests.delete(cacheKey);
    }
  })();

  inflightRequests.set(cacheKey, promise);
  return promise;
}

// ========================
// Schedule Endpoints
// ========================

export async function getNextLeagueEvents(leagueId: string): Promise<MatchEvent[]> {
  const data = await deduplicatedGet<{ events: MatchEvent[] | null }>(
    API_ENDPOINTS.NEXT_LEAGUE, { id: leagueId }, CACHE_TTL.MATCHES
  );
  return data?.events || [];
}

export async function getPastLeagueEvents(leagueId: string): Promise<MatchEvent[]> {
  const data = await deduplicatedGet<{ events: MatchEvent[] | null }>(
    API_ENDPOINTS.PAST_LEAGUE, { id: leagueId }, CACHE_TTL.MATCHES
  );
  return data?.events || [];
}

export async function getTeamNextEvents(teamId: string): Promise<MatchEvent[]> {
  const data = await deduplicatedGet<{ events: MatchEvent[] | null }>(
    API_ENDPOINTS.NEXT_TEAM, { id: teamId }, CACHE_TTL.MATCHES
  );
  return data?.events || [];
}

export async function getTeamLastEvents(teamId: string): Promise<MatchEvent[]> {
  const data = await deduplicatedGet<{ results: MatchEvent[] | null }>(
    API_ENDPOINTS.LAST_TEAM, { id: teamId }, CACHE_TTL.MATCHES
  );
  return data?.results || [];
}

export async function getEventsOnDay(date: string, leagueId?: string): Promise<MatchEvent[]> {
  const params: Record<string, string> = { d: date };
  if (leagueId) params.l = leagueId;
  const data = await deduplicatedGet<{ events: MatchEvent[] | null }>(
    API_ENDPOINTS.EVENTS_DAY, params, CACHE_TTL.MATCHES
  );
  return data?.events || [];
}

// ========================
// Lookup Endpoints
// ========================

export async function lookupEvent(eventId: string): Promise<MatchDetails | null> {
  const data = await deduplicatedGet<{ events: MatchDetails[] | null }>(
    API_ENDPOINTS.LOOKUP_EVENT, { id: eventId }, CACHE_TTL.MATCHES
  );
  return data?.events?.[0] || null;
}

export async function lookupTeam(teamId: string): Promise<TeamDetails | null> {
  const data = await deduplicatedGet<{ teams: TeamDetails[] | null }>(
    API_ENDPOINTS.LOOKUP_TEAM, { id: teamId }, CACHE_TTL.TEAM
  );
  const team = data?.teams?.[0] || null;
  if (team) {
    team.strTeamBadge = team.strBadge || team.strTeamBadge || '';
  }
  return team;
}

export async function lookupPlayer(playerId: string): Promise<PlayerDetails | null> {
  const data = await deduplicatedGet<{ players: PlayerDetails[] | null }>(
    API_ENDPOINTS.LOOKUP_PLAYER, { id: playerId }, CACHE_TTL.PLAYER
  );
  return data?.players?.[0] || null;
}

export async function lookupStandings(leagueId: string, season?: string): Promise<StandingsEntry[]> {
  const params: Record<string, string> = { l: leagueId };
  if (season) params.s = season;
  const data = await deduplicatedGet<{ table: StandingsEntry[] | null }>(
    API_ENDPOINTS.LOOKUP_TABLE, params, CACHE_TTL.STANDINGS
  );
  return data?.table || [];
}

export async function lookupPlayerHonours(playerId: string): Promise<PlayerHonour[]> {
  const data = await deduplicatedGet<{ honours: PlayerHonour[] | null }>(
    API_ENDPOINTS.LOOKUP_HONOURS, { id: playerId }, CACHE_TTL.PLAYER
  );
  return data?.honours || [];
}

export async function lookupFormerTeams(playerId: string): Promise<FormerTeam[]> {
  const data = await deduplicatedGet<{ formerteams: FormerTeam[] | null }>(
    API_ENDPOINTS.LOOKUP_FORMER_TEAMS, { id: playerId }, CACHE_TTL.PLAYER
  );
  return data?.formerteams || [];
}

export async function lookupMilestones(playerId: string): Promise<PlayerMilestone[]> {
  const data = await deduplicatedGet<{ milestones: PlayerMilestone[] | null }>(
    API_ENDPOINTS.LOOKUP_MILESTONES, { id: playerId }, CACHE_TTL.PLAYER
  );
  return data?.milestones || [];
}

export async function lookupContracts(playerId: string): Promise<PlayerContract[]> {
  const data = await deduplicatedGet<{ contracts: PlayerContract[] | null }>(
    API_ENDPOINTS.LOOKUP_CONTRACTS, { id: playerId }, CACHE_TTL.PLAYER
  );
  return data?.contracts || [];
}

export async function lookupPlayerStats(playerId: string): Promise<PlayerStats[]> {
  const data = await deduplicatedGet<{ playerstats: PlayerStats[] | null }>(
    API_ENDPOINTS.LOOKUP_PLAYER_STATS, { id: playerId }, CACHE_TTL.PLAYER
  );
  return data?.playerstats || [];
}

export async function lookupEventLineup(eventId: string): Promise<EventLineup[]> {
  const data = await deduplicatedGet<{ lineup: EventLineup[] | null }>(
    API_ENDPOINTS.LOOKUP_LINEUP, { id: eventId }, CACHE_TTL.MATCHES
  );
  return data?.lineup || [];
}

export async function lookupEventTimeline(eventId: string): Promise<EventTimeline[]> {
  const data = await deduplicatedGet<{ timeline: EventTimeline[] | null }>(
    API_ENDPOINTS.LOOKUP_TIMELINE, { id: eventId }, CACHE_TTL.MATCHES
  );
  return data?.timeline || [];
}

// ========================
// List Endpoints
// ========================

export async function getAllTeamsInLeague(leagueId: string): Promise<TeamDetails[]> {
  // Note: lookup_all_teams.php ignores the `id` param on this API tier and always
  // returns the same unrelated team list, so it must not be trusted/merged here.
  const data = await deduplicatedGet<{ teams: TeamDetails[] | null }>(
    API_ENDPOINTS.SEARCH_ALL_TEAMS, { id: leagueId }, CACHE_TTL.LEAGUE
  );
  const teams = data?.teams || [];

  const teamMap = new Map<string, TeamDetails>();

  teams.forEach(t => {
    if (t.idTeam && (!t.idLeague || t.idLeague === leagueId) && !teamMap.has(t.idTeam)) {
      teamMap.set(t.idTeam, {
        ...t,
        strTeamBadge: t.strBadge || t.strTeamBadge || ''
      });
    }
  });

  return Array.from(teamMap.values());
}

export async function lookupAllPlayers(teamId: string, teamName?: string): Promise<PlayerDetails[]> {
  const data = await deduplicatedGet<{ player: PlayerDetails[] | null }>(
    API_ENDPOINTS.LOOKUP_ALL_PLAYERS, { id: teamId }, CACHE_TTL.TEAM
  );
  if (Array.isArray(data?.player) && data.player.length > 0) {
    return data.player;
  }
  if (teamName) {
    const searchData = await deduplicatedGet<{ player: PlayerDetails[] | null }>(
      API_ENDPOINTS.SEARCH_PLAYERS, { t: teamName }, CACHE_TTL.TEAM
    );
    return Array.isArray(searchData?.player) ? searchData.player : [];
  }
  return [];
}

// ========================
// Image helpers
// ========================

/** Routes provider images through the local proxy; other hosts pass through. */
export function getProxiedImageUrl(url: string | null | undefined): string {
  if (!url) return FALLBACK_BADGE;
  try {
    const u = new URL(url);
    const cleanPath = u.pathname.replace(/\/(tiny|small|medium|preview)$/i, '');
    if (u.hostname === 'r2.thesportsdb.com') return `/images-r2${cleanPath}`;
    if (u.hostname.endsWith('thesportsdb.com')) return `/images-www${cleanPath}`;
    return url;
  } catch {
    return url;
  }
}

export const FALLBACK_BADGE = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="%23938F99" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>';
