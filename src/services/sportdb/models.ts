/**
 * Provider-agnostic domain models.
 *
 * Components bind to these, never to raw provider JSON, so a provider change is
 * contained to the normalizers. `null` always means "the provider did not supply
 * this" — never a substituted default.
 */

export type MatchState = 'scheduled' | 'live' | 'finished' | 'postponed' | 'unknown';

/** Qualification zone as classified by the provider, not by us. */
export type StandingZone = 'champions' | 'europa' | 'relegation' | 'none';

export interface SportTeamRef {
  id: string | null;
  name: string;
  slug: string | null;
  badgeUrl: string | null;
}

export interface SportMatch {
  id: string;
  competition: string | null;
  season: string | null;
  home: SportTeamRef;
  away: SportTeamRef;
  homeScore: number | null;
  awayScore: number | null;
  state: MatchState;
  /** Provider-supplied live minute, e.g. "63". Never synthesised. */
  statusLabel: string | null;
  kickoff: string | null;
  venue: string | null;
}

export interface SportStanding {
  rank: number;
  team: SportTeamRef;
  played: number | null;
  wins: number | null;
  draws: number | null;
  losses: number | null;
  goalsFor: number | null;
  goalsAgainst: number | null;
  goalDifference: number | null;
  points: number | null;
  pointsPerMatch: string | null;
  zone: StandingZone;
  /** Provider's own hex colour for the zone, without a leading '#'. */
  zoneColor: string | null;
  /** Oldest-first, e.g. ['W','D','L']. Empty when unavailable. */
  form: string[];
}

export interface SportLineupPlayer {
  id: string | null;
  name: string;
  position: string | null;
  shirtNumber: string | null;
  isStarter: boolean;
}

export interface SportLineup {
  homeFormation: string | null;
  awayFormation: string | null;
  home: SportLineupPlayer[];
  away: SportLineupPlayer[];
}

export interface SportMatchStat {
  label: string;
  home: string;
  away: string;
}

/** Envelope from our proxy, carrying cache provenance for the UI. */
export interface SportDataMeta {
  feature: string;
  cached: boolean;
  stale: boolean;
  staleReason?: string;
  ageMs: number;
  fetchedAt: string;
}

export interface SportResult<T> {
  data: T;
  meta: SportDataMeta | null;
}
