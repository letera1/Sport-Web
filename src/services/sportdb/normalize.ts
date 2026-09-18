/**
 * Normalizers written against the verified SportDB/Flashscore response schema.
 *
 * Official values are passed through untouched — nothing is invented, rounded or
 * zero-filled. Fields the provider omits stay null/empty.
 */

import type {
  MatchState, SportLineup, SportLineupPlayer, SportMatch, SportMatchStat,
  SportStanding, SportTeamRef, StandingZone,
} from './models';

type Rec = Record<string, unknown>;

const isRec = (v: unknown): v is Rec => typeof v === 'object' && v !== null && !Array.isArray(v);

const asString = (v: unknown): string | null => {
  if (typeof v === 'string') return v.trim() === '' ? null : v;
  if (typeof v === 'number' && Number.isFinite(v)) return String(v);
  return null;
};

const asInt = (v: unknown): number | null => {
  const s = asString(v);
  if (s === null) return null;
  const n = Number.parseInt(s, 10);
  return Number.isFinite(n) ? n : null;
};

export const asArray = (payload: unknown): Rec[] =>
  Array.isArray(payload) ? payload.filter(isRec) : [];

/** Flashscore encodes goals as "scored:conceded", e.g. "8:1". */
function splitGoals(raw: unknown): { for: number | null; against: number | null } {
  const value = asString(raw);
  if (!value?.includes(':')) return { for: null, against: null };
  const [scored, conceded] = value.split(':');
  return { for: asInt(scored), against: asInt(conceded) };
}

/** `rankClass` is the provider's own qualification marker (q1/q2/q3/r1...). */
function zoneFrom(rankClass: string | null): StandingZone {
  if (!rankClass) return 'none';
  if (rankClass.startsWith('q')) return rankClass === 'q1' ? 'champions' : 'europa';
  if (rankClass.startsWith('r')) return 'relegation';
  return 'none';
}

export function normalizeStandings(payload: unknown): SportStanding[] {
  return asArray(payload)
    .map((row, index): SportStanding | null => {
      const name = asString(row.teamName);
      if (!name) return null;

      const goals = splitGoals(row.goals);
      const played = asInt(row.matches);
      const wins = asInt(row.wins);
      const draws = asInt(row.draws);
      // Derived only when the provider gives all three inputs.
      const losses =
        played !== null && wins !== null && draws !== null ? played - wins - draws : null;

      const rankClass = asString(row.rankClass);

      return {
        rank: asInt(row.rank) ?? index + 1,
        team: {
          id: asString(row.teamId),
          name,
          slug: asString(row.teamSlug),
          badgeUrl: null,
        },
        played,
        wins,
        draws,
        losses,
        goalsFor: goals.for,
        goalsAgainst: goals.against,
        goalDifference: asInt(row.goalDiff),
        points: asInt(row.points),
        pointsPerMatch: asString(row.pointsPerMatchesPlayed),
        zone: zoneFrom(rankClass),
        zoneColor: asString(row.rankColor),
        form: normalizeForm(row.events),
      };
    })
    .filter((row): row is SportStanding => row !== null)
    .sort((a, b) => a.rank - b.rank);
}

/**
 * `events[]` carries each team's matches with `eventType` already expressed from
 * that team's perspective ("w" | "d" | "l" | "upcoming"). Returned oldest-first.
 */
function normalizeForm(events: unknown, limit = 5): string[] {
  return asArray(events)
    .map((event) => asString(event.eventType)?.toLowerCase())
    .filter((type): type is string => type === 'w' || type === 'd' || type === 'l')
    .slice(0, limit)
    .reverse()
    .map((type) => type.toUpperCase());
}

function matchState(stage: string | null): MatchState {
  switch (stage?.toUpperCase()) {
    case 'LIVE': return 'live';
    case 'FINISHED': return 'finished';
    case 'SCHEDULED': return 'scheduled';
    case 'POSTPONED':
    case 'CANCELED':
    case 'CANCELLED': return 'postponed';
    default: return 'unknown';
  }
}

function team(row: Rec, side: 'home' | 'away'): SportTeamRef {
  return {
    id: asString(row[`${side}ParticipantIds`]) ?? asString(row[`${side}EventParticipantId`]),
    name: asString(row[`${side}Name`]) ?? 'Unknown',
    slug: asString(row[`${side}ParticipantNameUrl`]),
    badgeUrl: asString(row[`${side}Logo`]),
  };
}

export function normalizeMatch(row: Rec): SportMatch | null {
  const id = asString(row.eventId);
  if (!id) return null;

  const state = matchState(asString(row.eventStage));
  const gameTime = asString(row.gameTime);

  return {
    id,
    competition: asString(row.tournamentName),
    season: asString(row.season),
    home: team(row, 'home'),
    away: team(row, 'away'),
    homeScore: asInt(row.homeScore),
    awayScore: asInt(row.awayScore),
    state,
    // Only shown for genuinely live matches; "-1" is the provider's null marker.
    statusLabel: state === 'live' && gameTime && gameTime !== '-1' ? gameTime : null,
    kickoff: asString(row.startDateTimeUtc),
    venue: null,
  };
}

export function normalizeMatches(payload: unknown): SportMatch[] {
  return asArray(payload)
    .map(normalizeMatch)
    .filter((m): m is SportMatch => m !== null);
}

/** Competition payload is self-describing: it lists its own season links. */
export interface CompetitionInfo {
  name: string | null;
  slug: string | null;
  logoUrl: string | null;
  seasons: string[];
  currentSeason: string | null;
}

export function normalizeCompetition(payload: unknown): CompetitionInfo | null {
  if (!isRec(payload)) return null;
  const seasons = Array.isArray(payload.seasons)
    ? payload.seasons
        .filter(isRec)
        .map((s) => asString(s.season))
        .filter((s): s is string => s !== null)
    : [];

  return {
    name: asString(payload.name),
    slug: asString(payload.slug),
    logoUrl: asString(payload.logo),
    seasons,
    currentSeason: seasons[0] ?? null,
  };
}

function lineupPlayer(raw: Rec, isStarter: boolean): SportLineupPlayer | null {
  const name = asString(raw.playerName) ?? asString(raw.name) ?? asString(raw.player);
  if (!name) return null;
  return {
    id: asString(raw.playerId) ?? asString(raw.id),
    name,
    position: asString(raw.playerTypeName) ?? asString(raw.position) ?? asString(raw.role),
    shirtNumber: asString(raw.jerseyNumber) ?? asString(raw.number),
    isStarter,
  };
}

export function normalizeLineups(payload: unknown): SportLineup | null {
  if (!isRec(payload)) return null;

  const collect = (node: unknown, starter: boolean): SportLineupPlayer[] =>
    asArray(node)
      .flatMap((group) => (Array.isArray(group.players) ? group.players.filter(isRec) : [group]))
      .map((p) => lineupPlayer(p, starter))
      .filter((p): p is SportLineupPlayer => p !== null);

  const home = [
    ...collect(payload.homeStarters ?? payload.homeLineup, true),
    ...collect(payload.homeSubstitutes ?? payload.homeBench, false),
  ];
  const away = [
    ...collect(payload.awayStarters ?? payload.awayLineup, true),
    ...collect(payload.awaySubstitutes ?? payload.awayBench, false),
  ];

  if (!home.length && !away.length) return null;

  return {
    homeFormation: asString(payload.homeFormation),
    awayFormation: asString(payload.awayFormation),
    home,
    away,
  };
}

/** Emits only metrics where the provider supplied both sides. */
export function normalizeMatchStats(payload: unknown): SportMatchStat[] {
  const rows = Array.isArray(payload)
    ? payload.filter(isRec)
    : isRec(payload) && Array.isArray(payload.stats)
      ? payload.stats.filter(isRec)
      : [];

  return rows
    .map((row): SportMatchStat | null => {
      const label = asString(row.name) ?? asString(row.label) ?? asString(row.type);
      const home = asString(row.homeValue) ?? asString(row.home);
      const away = asString(row.awayValue) ?? asString(row.away);
      return label && home !== null && away !== null ? { label, home, away } : null;
    })
    .filter((row): row is SportMatchStat => row !== null);
}
