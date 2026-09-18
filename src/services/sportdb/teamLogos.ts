/**
 * Team crest resolution with permanent client-side caching.
 *
 * Standings payloads carry no crests, and neither provider exposes a bulk logo
 * lookup on the free tier (TheSportsDB caps its league list at 10 teams and its
 * search at 1 result). SportDB's team endpoint does return `teamLogo` and we
 * already hold the exact `slug`/`id` from the standings row, so it needs no
 * fuzzy name matching.
 *
 * Crests effectively never change, so results are persisted to localStorage and
 * reused indefinitely — each team costs at most one request per browser.
 */

import { sportdb } from './client';

const STORAGE_KEY = 'statscore-team-logos-v1';
/** Bounds a single page load so a large table cannot drain the monthly quota. */
const MAX_LOOKUPS_PER_BATCH = 24;

type LogoMap = Record<string, string>;

function readStore(): LogoMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LogoMap) : {};
  } catch {
    return {};
  }
}

function writeStore(map: LogoMap): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Storage full or blocked — crests are cosmetic, so degrade silently.
  }
}

const memory: LogoMap = readStore();
const inflight = new Map<string, Promise<string | null>>();

export const getCachedLogo = (teamId: string): string | null => memory[teamId] ?? null;

async function fetchLogo(slug: string, teamId: string): Promise<string | null> {
  const cached = memory[teamId];
  if (cached) return cached;

  const existing = inflight.get(teamId);
  if (existing) return existing;

  const promise = (async () => {
    try {
      const result = await sportdb.team(slug, teamId);
      const data = result.data as { teamLogo?: unknown } | null;
      const logo = typeof data?.teamLogo === 'string' ? data.teamLogo : null;
      if (logo) {
        memory[teamId] = logo;
        writeStore(memory);
      }
      return logo;
    } catch {
      return null;
    } finally {
      inflight.delete(teamId);
    }
  })();

  inflight.set(teamId, promise);
  return promise;
}

export interface LogoTarget {
  teamId: string | null;
  slug: string | null;
}

/**
 * Resolves crests for the given teams, skipping any already cached.
 * Runs sequentially to stay gentle on the upstream rate limit.
 */
export async function resolveTeamLogos(targets: LogoTarget[]): Promise<LogoMap> {
  const pending = targets
    .filter((t): t is { teamId: string; slug: string } => Boolean(t.teamId && t.slug))
    .filter((t) => !memory[t.teamId])
    .slice(0, MAX_LOOKUPS_PER_BATCH);

  for (const target of pending) {
    await fetchLogo(target.slug, target.teamId);
  }

  return { ...memory };
}
