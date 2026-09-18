/**
 * Endpoint allowlist. Only paths matched here are ever forwarded upstream, which
 * is what prevents arbitrary-URL proxying / SSRF and stops quota being burned on
 * endpoints the product doesn't use.
 *
 * Route shapes mirror the published SportDB.dev REST surface.
 */

import { getConfig } from './config.js';

export type FeatureId =
  | 'live'
  | 'countries'
  | 'competitions'
  | 'competitionSeasons'
  | 'standings'
  | 'fixtures'
  | 'match'
  | 'lineups'
  | 'matchStats'
  | 'clubSearch'
  | 'clubProfile'
  | 'clubPlayers'
  | 'playerSearch'
  | 'playerProfile'
  | 'playerStats'
  | 'playerTransfers';

export interface ResolvedRoute {
  feature: FeatureId;
  /** Path forwarded to the upstream API, already validated segment by segment. */
  upstreamPath: string;
  ttlMs: number;
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** TTLs are deliberately per-data-type: volatile data short, reference data long. */
export const FEATURE_TTL: Record<FeatureId, number> = {
  live: 30_000,
  countries: 7 * DAY,
  competitions: DAY,
  competitionSeasons: DAY,
  standings: 10 * MINUTE,
  fixtures: 15 * MINUTE,
  match: MINUTE,
  lineups: 5 * MINUTE,
  matchStats: MINUTE,
  clubSearch: 6 * HOUR,
  clubProfile: 7 * DAY,
  clubPlayers: 2 * DAY,
  playerSearch: 6 * HOUR,
  playerProfile: 7 * DAY,
  playerStats: DAY,
  playerTransfers: 2 * DAY,
};

const SLUG = /^[a-z0-9][a-z0-9-]{0,63}$/i;
const ID = /^[a-z0-9][a-z0-9_-]{0,63}$/i;
const SEASON = /^\d{4}(-\d{2,4})?$/;
const SEARCH_TERM = /^[\p{L}\p{N} .'&-]{2,64}$/u;

const isSport = (segment: string): boolean =>
  SLUG.test(segment) && getConfig().allowedSports.includes(segment.toLowerCase());

function route(feature: FeatureId, segments: string[]): ResolvedRoute {
  return {
    feature,
    upstreamPath: segments.map(encodeURIComponent).join('/'),
    ttlMs: FEATURE_TTL[feature],
  };
}

/**
 * Returns a route only when every segment passes validation, otherwise null.
 * `match`, `clubs` and `players` are reserved namespaces checked before the
 * generic `{sport}/{country}/...` shapes so they can never be shadowed.
 */
export function resolveRoute(segments: string[]): ResolvedRoute | null {
  if (segments.length === 0 || segments.length > 5) return null;
  if (segments.some((s) => !s || s.length > 64 || s === '.' || s === '..')) return null;

  const [a, b, c, d, e] = segments;

  if (a === 'match') {
    if (!ID.test(b ?? '')) return null;
    if (segments.length === 2) return route('match', ['match', b]);
    if (segments.length === 3 && c === 'lineups') return route('lineups', ['match', b, 'lineups']);
    if (segments.length === 3 && c === 'stats') return route('matchStats', ['match', b, 'stats']);
    return null;
  }

  if (a === 'clubs' || a === 'players') {
    const isClub = a === 'clubs';
    if (segments.length === 3 && b === 'search') {
      if (!SEARCH_TERM.test(c ?? '')) return null;
      return route(isClub ? 'clubSearch' : 'playerSearch', [a, 'search', c]);
    }
    if (segments.length === 3 && ID.test(b ?? '')) {
      if (c === 'profile') return route(isClub ? 'clubProfile' : 'playerProfile', [a, b, 'profile']);
      if (isClub && c === 'players') return route('clubPlayers', [a, b, 'players']);
      if (!isClub && c === 'stats') return route('playerStats', [a, b, 'stats']);
      if (!isClub && c === 'transfers') return route('playerTransfers', [a, b, 'transfers']);
    }
    return null;
  }

  if (!isSport(a ?? '')) return null;

  if (segments.length === 2 && b === 'live') return route('live', [a, 'live']);
  if (segments.length === 2 && b === 'countries') return route('countries', [a, 'countries']);
  if (segments.length === 2 && SLUG.test(b)) return route('competitions', [a, b]);
  if (segments.length === 3 && SLUG.test(b) && SLUG.test(c)) {
    return route('competitionSeasons', [a, b, c]);
  }
  if (segments.length === 5 && SLUG.test(b) && SLUG.test(c) && SEASON.test(d ?? '')) {
    if (e === 'standings') return route('standings', [a, b, c, d, 'standings']);
    if (e === 'fixtures') return route('fixtures', [a, b, c, d, 'fixtures']);
  }

  return null;
}

export const ALL_FEATURES = Object.keys(FEATURE_TTL) as FeatureId[];
