/**
 * Endpoint allowlist — the SSRF / quota boundary.
 *
 * Paths mirror SportDB.dev's real surface (verified against the live API), which
 * proxies Flashscore and Transfermarkt under two namespaces. Our proxy path is
 * the upstream path minus the `/api/` prefix, so the `links` values the API
 * returns inside its own payloads can be used verbatim by the client.
 */

import { getConfig } from './config';

export type FeatureId =
  | 'live'
  | 'competition'
  | 'competitionLive'
  | 'standings'
  | 'fixtures'
  | 'results'
  | 'matchDetails'
  | 'matchLineups'
  | 'matchStats'
  | 'matchOdds'
  | 'matchPlayerStats'
  | 'team'
  | 'transfermarkt';

export interface ResolvedRoute {
  feature: FeatureId;
  upstreamPath: string;
  /** Query params copied through to upstream, already validated. */
  query: Record<string, string>;
  ttlMs: number;
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * Tuned for a 1000-requests/month quota: volatile data short, everything else
 * cached hard. Expired entries stay usable as fallback when upstream fails.
 */
export const FEATURE_TTL: Record<FeatureId, number> = {
  live: 45_000,
  competition: 7 * DAY,
  competitionLive: 45_000,
  standings: 2 * HOUR,
  fixtures: 6 * HOUR,
  results: 2 * HOUR,
  matchDetails: 2 * MINUTE,
  matchLineups: 30 * MINUTE,
  matchStats: 2 * MINUTE,
  matchOdds: 30 * MINUTE,
  matchPlayerStats: 10 * MINUTE,
  team: 3 * DAY,
  transfermarkt: 3 * DAY,
};

const SLUG = /^[a-z0-9][a-z0-9-]{0,63}$/i;
const ID = /^[a-z0-9]{1,32}$/i;
const SEASON = /^\d{4}(-\d{4})?$/;

const isSport = (segment: string): boolean =>
  SLUG.test(segment) && getConfig().allowedSports.includes(segment.toLowerCase());

/** Only `page` is forwarded; anything else is dropped before reaching upstream. */
function safeQuery(query: Record<string, string | undefined>): Record<string, string> {
  const page = query.page;
  if (page && /^\d{1,3}$/.test(page) && Number(page) >= 1 && Number(page) <= 200) {
    return { page };
  }
  return {};
}

function route(
  feature: FeatureId,
  segments: string[],
  query: Record<string, string> = {}
): ResolvedRoute {
  return {
    feature,
    upstreamPath: segments.map(encodeURIComponent).join('/'),
    query,
    ttlMs: FEATURE_TTL[feature],
  };
}

export function resolveRoute(
  segments: string[],
  rawQuery: Record<string, string | undefined> = {}
): ResolvedRoute | null {
  if (segments.length < 2 || segments.length > 6) return null;
  if (segments.some((s) => !s || s.length > 64 || s === '.' || s === '..')) return null;

  const [ns, ...rest] = segments;
  if (ns === 'flashscore') return resolveFlashscore(rest, rawQuery);
  if (ns === 'transfermarkt') return resolveTransfermarkt(rest);
  return null;
}

function resolveFlashscore(
  segments: string[],
  rawQuery: Record<string, string | undefined>
): ResolvedRoute | null {
  const [a, b, c, d, e] = segments;
  const p = (...parts: string[]) => ['flashscore', ...parts];

  if (a === 'match') {
    if (segments.length !== 3 || !ID.test(b ?? '')) return null;
    const subs: Record<string, FeatureId> = {
      details: 'matchDetails',
      lineups: 'matchLineups',
      stats: 'matchStats',
      odds: 'matchOdds',
      playerstats: 'matchPlayerStats',
    };
    const feature = subs[c ?? ''];
    return feature ? route(feature, p('match', b, c)) : null;
  }

  if (a === 'team') {
    if (segments.length !== 3 || !SLUG.test(b ?? '') || !ID.test(c ?? '')) return null;
    return route('team', p('team', b, c));
  }

  if (!isSport(a ?? '')) return null;

  if (segments.length === 2 && b === 'live') return route('live', p(a, 'live'));

  if (segments.length === 3 && SLUG.test(b ?? '') && SLUG.test(c ?? '')) {
    return route('competition', p(a, b, c));
  }

  if (segments.length === 4 && SLUG.test(b ?? '') && SLUG.test(c ?? '') && d === 'live') {
    return route('competitionLive', p(a, b, c, 'live'));
  }

  if (segments.length === 5 && SLUG.test(b ?? '') && SLUG.test(c ?? '') && SEASON.test(d ?? '')) {
    if (e === 'standings') return route('standings', p(a, b, c, d, 'standings'));
    if (e === 'fixtures') return route('fixtures', p(a, b, c, d, 'fixtures'), safeQuery(rawQuery));
    if (e === 'results') return route('results', p(a, b, c, d, 'results'), safeQuery(rawQuery));
  }

  return null;
}

function resolveTransfermarkt(segments: string[]): ResolvedRoute | null {
  if (segments.length === 3 && segments[0] === 'players' && /^\d{1,12}$/.test(segments[1])) {
    if (['profile', 'transfers', 'stats'].includes(segments[2])) {
      return route('transfermarkt', ['transfermarkt', ...segments]);
    }
  }
  return null;
}

export const ALL_FEATURES = Object.keys(FEATURE_TTL) as FeatureId[];
