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
  shirtNumber: string | null;
  /** Provider's 0-10 performance rating, e.g. "7.1". */
  rating: string | null;
  country: string | null;
  photoUrl: string | null;
  /** Substitution/card note attached to the player, e.g. "87'". */
  incident: string | null;
  incidentType: string | null;
}

/** One lineup block as grouped by the provider: starters, bench or coaches. */
export interface SportLineupGroup {
  group: string;
  home: SportLineupPlayer[];
  away: SportLineupPlayer[];
}

export interface SportLineup {
  homeFormation: string | null;
  awayFormation: string | null;
  homeRating: string | null;
  awayRating: string | null;
  groups: SportLineupGroup[];
}

export interface SportMatchStat {
  id: string | null;
  label: string;
  home: string;
  away: string;
}

/** Stats as split by the provider: "Match", "1st Half", "2nd Half". */
export interface SportStatPeriod {
  period: string;
  stats: SportMatchStat[];
}

export type MatchSide = 'home' | 'away';

export interface SportTimelineEvent {
  id: string;
  minute: string | null;
  /** Provider's own label, e.g. "Goal", "Yellow Card", "Substitution". */
  type: string | null;
  side: MatchSide | null;
  player: string | null;
  playerId: string | null;
  homeScore: number | null;
  awayScore: number | null;
  commentary: string | null;
}

export interface SportMatchInfo {
  home: SportTeamRef;
  away: SportTeamRef;
  venue: string | null;
  venueCity: string | null;
  capacity: string | null;
  referee: string | null;
  timeline: SportTimelineEvent[];
}

export interface SportOddsSelection {
  label: string;
  /** Current decimal price as quoted, e.g. "2.55". */
  value: string;
  /** Opening price, enabling a drift indicator. */
  opening: string | null;
  active: boolean;
}

export interface SportOddsOffer {
  bookmaker: string;
  selections: SportOddsSelection[];
}

/** Match-winner prices grouped per bookmaker, full time only. */
export interface SportOdds {
  offers: SportOddsOffer[];
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
