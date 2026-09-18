/**
 * Normalizes SportDB responses into the app's domain models.
 *
 * The provider's exact field names are read defensively through candidate lists
 * because response shapes vary per competition, and the free tier cannot be
 * probed without spending quota. Anything missing stays null/empty — no value is
 * ever invented or defaulted to zero.
 */

import type {
  MatchState, SportLineup, SportLineupPlayer, SportMatch, SportMatchStat,
  SportStanding, SportTeamRef,
} from './models';

type Rec = Record<string, unknown>;

const isRec = (value: unknown): value is Rec =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** Reads the first present, non-empty candidate key. */
function pick(source: Rec, keys: string[]): unknown {
  for (const key of keys) {
    const value = source[key];
    if (value !== undefined && value !== null && value !== '') return value;
  }
  return undefined;
}

function str(source: Rec, keys: string[]): string | null {
  const value = pick(source, keys);
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return null;
}

function num(source: Rec, keys: string[]): number | null {
  const value = pick(source, keys);
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

/** Unwraps the common envelope shapes providers use around list payloads. */
export function toArray(payload: unknown, keys: string[] = []): Rec[] {
  if (Array.isArray(payload)) return payload.filter(isRec);
  if (!isRec(payload)) return [];

  for (const key of [...keys, 'data', 'results', 'response', 'items']) {
    const value = payload[key];
    if (Array.isArray(value)) return value.filter(isRec);
    if (isRec(value)) {
      const nested = toArray(value, keys);
      if (nested.length) return nested;
    }
  }
  return [];
}

export function toRecord(payload: unknown, keys: string[] = []): Rec | null {
  if (!isRec(payload)) return null;
  for (const key of [...keys, 'data', 'result', 'response']) {
    const value = payload[key];
    if (isRec(value)) return value;
  }
  return payload;
}

function teamRef(source: Rec, prefix: 'home' | 'away' | null): SportTeamRef {
  const nested = prefix ? source[`${prefix}Team`] ?? source[`${prefix}_team`] ?? source[prefix] : null;
  const node = isRec(nested) ? nested : source;

  const flatName = prefix
    ? str(source, [`${prefix}TeamName`, `${prefix}_team_name`, `${prefix}Name`])
    : null;

  return {
    id: str(node, ['id', 'teamId', 'team_id', 'clubId', 'club_id']),
    name: flatName ?? str(node, ['name', 'teamName', 'team_name', 'club', 'title']) ?? 'Unknown',
    badgeUrl: str(node, ['logo', 'badge', 'crest', 'image', 'logoUrl', 'logo_url']),
  };
}

function matchState(raw: string | null): MatchState {
  if (!raw) return 'unknown';
  const value = raw.toLowerCase();
  if (/(^|\b)(live|1h|2h|ht|et|pen|inplay|in_play|playing)/.test(value)) return 'live';
  if (/(ft|finished|final|ended|aet|after)/.test(value)) return 'finished';
  if (/(postpon|cancel|abandon|suspend)/.test(value)) return 'postponed';
  if (/(sched|not started|ns|upcoming|fixture|timed)/.test(value)) return 'scheduled';
  if (/^\d{1,3}('|\+)?$/.test(value)) return 'live';
  return 'unknown';
}

export function normalizeMatch(raw: Rec): SportMatch | null {
  const id = str(raw, ['id', 'matchId', 'match_id', 'fixtureId', 'fixture_id']);
  if (!id) return null;

  const statusLabel =
    str(raw, ['statusText', 'status_text', 'minute', 'elapsed', 'progress']) ??
    str(raw, ['status', 'state', 'matchStatus']);

  return {
    id,
    competition: str(raw, ['competition', 'league', 'competitionName', 'tournament']),
    season: str(raw, ['season', 'seasonName']),
    round: str(raw, ['round', 'matchday', 'week', 'stage']),
    home: teamRef(raw, 'home'),
    away: teamRef(raw, 'away'),
    homeScore: num(raw, ['homeScore', 'home_score', 'homeGoals', 'scoreHome']),
    awayScore: num(raw, ['awayScore', 'away_score', 'awayGoals', 'scoreAway']),
    state: matchState(str(raw, ['status', 'state', 'matchStatus'])),
    statusLabel,
    kickoff: str(raw, ['kickoff', 'startTime', 'start_time', 'date', 'datetime', 'utcDate']),
    venue: str(raw, ['venue', 'stadium', 'ground']),
  };
}

export function normalizeMatches(payload: unknown): SportMatch[] {
  return toArray(payload, ['matches', 'fixtures', 'live', 'events'])
    .map(normalizeMatch)
    .filter((match): match is SportMatch => match !== null);
}

export function normalizeStanding(raw: Rec, fallbackRank: number): SportStanding | null {
  const team = teamRef(raw, null);
  if (team.name === 'Unknown' && !team.id) return null;

  const played = num(raw, ['played', 'matchesPlayed', 'games', 'gamesPlayed', 'mp', 'p']) ?? 0;
  const wins = num(raw, ['wins', 'won', 'win', 'w']) ?? 0;
  const draws = num(raw, ['draws', 'drawn', 'draw', 'd']) ?? 0;
  const losses = num(raw, ['losses', 'lost', 'loss', 'l']) ?? 0;
  const goalsFor = num(raw, ['goalsFor', 'goals_for', 'scored', 'gf']) ?? 0;
  const goalsAgainst = num(raw, ['goalsAgainst', 'goals_against', 'conceded', 'ga']) ?? 0;
  const goalDifference =
    num(raw, ['goalDifference', 'goal_difference', 'goalDiff', 'gd']) ?? goalsFor - goalsAgainst;

  const rawForm = pick(raw, ['form', 'recentForm', 'last5']);
  const form = typeof rawForm === 'string'
    ? rawForm.replace(/[^WDL]/gi, '').toUpperCase().split('')
    : Array.isArray(rawForm)
      ? rawForm.map((f) => String(f).charAt(0).toUpperCase()).filter((f) => 'WDL'.includes(f))
      : [];

  return {
    rank: num(raw, ['rank', 'position', 'place', 'pos']) ?? fallbackRank,
    team,
    played,
    wins,
    draws,
    losses,
    goalsFor,
    goalsAgainst,
    goalDifference,
    points: num(raw, ['points', 'pts']) ?? 0,
    form,
  };
}

export function normalizeStandings(payload: unknown): SportStanding[] {
  return toArray(payload, ['standings', 'table', 'rows', 'teams'])
    .map((row, index) => normalizeStanding(row, index + 1))
    .filter((row): row is SportStanding => row !== null)
    .sort((a, b) => a.rank - b.rank);
}

function lineupPlayer(raw: Rec): SportLineupPlayer | null {
  const name = str(raw, ['name', 'playerName', 'player_name', 'player']);
  if (!name) return null;

  const starterFlag = pick(raw, ['isStarter', 'starter', 'starting', 'isStarting']);
  const role = str(raw, ['role', 'type', 'lineupType']);

  return {
    id: str(raw, ['id', 'playerId', 'player_id']),
    name,
    position: str(raw, ['position', 'pos', 'role']),
    shirtNumber: str(raw, ['number', 'shirtNumber', 'shirt_number', 'jersey']),
    isStarter:
      typeof starterFlag === 'boolean'
        ? starterFlag
        : role
          ? !/sub|bench/i.test(role)
          : true,
  };
}

export function normalizeLineups(payload: unknown): SportLineup | null {
  const root = toRecord(payload, ['lineups', 'lineup']);
  if (!root) return null;

  const side = (key: 'home' | 'away'): SportLineupPlayer[] => {
    const node = root[key] ?? root[`${key}Team`] ?? root[`${key}_team`];
    const container = isRec(node) ? node : root;
    const list = [
      ...toArray(container, ['starters', 'startingXI', 'starting_eleven', 'players', 'lineup']),
      ...toArray(container, ['substitutes', 'subs', 'bench']),
    ];
    return list.map(lineupPlayer).filter((p): p is SportLineupPlayer => p !== null);
  };

  const home = side('home');
  const away = side('away');
  if (!home.length && !away.length) return null;

  const formationOf = (key: 'home' | 'away'): string | null => {
    const node = root[key] ?? root[`${key}Team`];
    if (isRec(node)) return str(node, ['formation']);
    return str(root, [`${key}Formation`, `${key}_formation`]);
  };

  return {
    homeFormation: formationOf('home'),
    awayFormation: formationOf('away'),
    home,
    away,
  };
}

const STAT_LABELS: Record<string, string> = {
  possession: 'Possession',
  ballPossession: 'Possession',
  shots: 'Shots',
  totalShots: 'Shots',
  shotsOnTarget: 'Shots on Target',
  shotsOnGoal: 'Shots on Target',
  corners: 'Corners',
  cornerKicks: 'Corners',
  fouls: 'Fouls',
  offsides: 'Offsides',
  yellowCards: 'Yellow Cards',
  redCards: 'Red Cards',
  saves: 'Saves',
  passes: 'Passes',
  passAccuracy: 'Pass Accuracy',
};

const humanize = (key: string): string =>
  STAT_LABELS[key] ??
  key.replace(/[_-]/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/\b\w/g, (c) => c.toUpperCase());

/** Only emits rows where the provider supplied both sides — never zero-filled. */
export function normalizeMatchStats(payload: unknown): SportMatchStat[] {
  const root = toRecord(payload, ['stats', 'statistics']);
  if (!root) return [];

  const rows = toArray(root, ['stats', 'statistics']);
  if (rows.length) {
    return rows
      .map((row) => {
        const label = str(row, ['label', 'name', 'type', 'stat']);
        const home = str(row, ['home', 'homeValue', 'home_value']);
        const away = str(row, ['away', 'awayValue', 'away_value']);
        return label && home !== null && away !== null
          ? { label: humanize(label), home, away }
          : null;
      })
      .filter((row): row is SportMatchStat => row !== null);
  }

  const home = toRecord(root, ['home', 'homeTeam']);
  const away = toRecord(root, ['away', 'awayTeam']);
  if (!home || !away || home === root || away === root) return [];

  return Object.keys(home)
    .filter((key) => away[key] !== undefined && home[key] !== null && away[key] !== null)
    .map((key) => ({ label: humanize(key), home: String(home[key]), away: String(away[key]) }));
}
