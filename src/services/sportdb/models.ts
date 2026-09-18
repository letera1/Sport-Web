/**
 * Provider-agnostic domain models.
 *
 * Components bind to these, never to raw provider JSON, so a provider change is
 * contained to the normalizers.
 */

export type MatchState = 'scheduled' | 'live' | 'finished' | 'postponed' | 'unknown';

export interface SportTeamRef {
  id: string | null;
  name: string;
  badgeUrl: string | null;
}

export interface SportMatch {
  id: string;
  competition: string | null;
  season: string | null;
  round: string | null;
  home: SportTeamRef;
  away: SportTeamRef;
  homeScore: number | null;
  awayScore: number | null;
  state: MatchState;
  /** Provider-supplied status text, e.g. "63'" or "HT". Never synthesised. */
  statusLabel: string | null;
  kickoff: string | null;
  venue: string | null;
}

export interface SportStanding {
  rank: number;
  team: SportTeamRef;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  /** Most-recent-last, e.g. ['W','D','L']. Empty when the provider omits it. */
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

/** Only metrics the provider actually returned — never zero-filled. */
export interface SportMatchStat {
  label: string;
  home: string;
  away: string;
}

export interface SportClub {
  id: string;
  name: string;
  badgeUrl: string | null;
  country: string | null;
  stadium: string | null;
  founded: string | null;
  description: string | null;
  website: string | null;
}

export interface SportPlayer {
  id: string;
  name: string;
  position: string | null;
  nationality: string | null;
  photoUrl: string | null;
  shirtNumber: string | null;
}

/** Envelope returned by our proxy, carrying cache provenance for the UI. */
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
