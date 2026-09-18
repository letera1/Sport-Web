/**
 * Team badge resolution.
 *
 * SportDB's standings payload carries no crests, so badges are sourced from
 * TheSportsDB, whose team lookup is free, unmetered and returns a whole league
 * in one call. That keeps the SportDB quota reserved for authoritative data.
 *
 * The two providers name clubs differently ("Manchester Utd" vs "Manchester
 * United", "Brighton" vs "Brighton and Hove Albion"), so names are normalised to
 * a comparable key before matching.
 */

import { getAllTeamsInLeague } from '../sportsApi';

/** Club-type suffixes and articles that carry no identifying information. */
const NOISE = new Set([
  'fc', 'afc', 'cf', 'sc', 'ac', 'as', 'ss', 'ssc', 'club', 'the', 'de', 'cd',
  'ud', 'rc', 'sv', 'vfl', 'vfb', 'tsg', 'fsv', 'bsc', 'if', 'ff', 'bk',
]);

const ALIASES: Record<string, string> = {
  utd: 'united',
  man: 'manchester',
  wolves: 'wolverhampton',
  spurs: 'tottenham',
  psg: 'parissaintgermain',
  inter: 'internazionale',
  atleti: 'atletico',
  bayern: 'bayernmunich',
  juve: 'juventus',
};

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => ALIASES[word] ?? word)
    .filter((word) => !NOISE.has(word))
    .join('');
}

export type BadgeIndex = Map<string, string>;

/** Builds a normalised-name → badge URL index for a TheSportsDB league id. */
export async function loadBadgeIndex(leagueId: string): Promise<BadgeIndex> {
  const index: BadgeIndex = new Map();
  try {
    const teams = await getAllTeamsInLeague(leagueId);
    for (const team of teams) {
      const badge = team.strBadge || team.strTeamBadge;
      if (!team.strTeam || !badge) continue;
      index.set(normalizeName(team.strTeam), badge);
      // Alternate names catch short forms the other provider may use.
      for (const alt of (team.strTeamAlternate ?? '').split(',')) {
        const key = normalizeName(alt);
        if (key && !index.has(key)) index.set(key, badge);
      }
    }
  } catch {
    // Badges are cosmetic — a failure here must never break the table.
  }
  return index;
}

/**
 * Resolves a badge for a club name, tolerating short/long name variants.
 * Returns null rather than a wrong crest when confidence is low.
 */
export function resolveBadge(index: BadgeIndex, teamName: string): string | null {
  if (index.size === 0) return null;

  const key = normalizeName(teamName);
  if (!key) return null;

  const exact = index.get(key);
  if (exact) return exact;

  let best: { badge: string; score: number } | null = null;
  for (const [candidate, badge] of index) {
    if (candidate === key) return badge;

    const longer = candidate.length >= key.length ? candidate : key;
    const shorter = candidate.length >= key.length ? key : candidate;
    // Require a substantial prefix so "hull" never matches "hullkingstonrovers".
    if (shorter.length >= 4 && longer.startsWith(shorter)) {
      const score = shorter.length / longer.length;
      if (!best || score > best.score) best = { badge, score };
    }
  }

  return best && best.score >= 0.45 ? best.badge : null;
}
