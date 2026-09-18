/**
 * Normalizers for the match sub-resources (details, lineups, stats, odds).
 *
 * Written against responses captured from the live API, not from documentation.
 * Every value shown in the UI originates here verbatim; nothing is derived,
 * rounded or substituted. When the provider omits a field it stays null and the
 * UI renders an explicit gap rather than a plausible-looking default.
 */

import { asArray, asInt, asString, isRec, type Rec } from './normalize';
import type {
  MatchSide,
  SportLineup,
  SportLineupGroup,
  SportLineupPlayer,
  SportMatchInfo,
  SportMatchStat,
  SportOdds,
  SportOddsOffer,
  SportOddsSelection,
  SportStatPeriod,
  SportTimelineEvent,
} from './models';

/** Player and crest images are returned as bare filenames on this CDN. */
const IMAGE_CDN = 'https://static.flashscore.com/res/image/data/';

const imageUrl = (raw: unknown): string | null => {
  const file = asString(raw);
  if (!file) return null;
  return file.startsWith('http') ? file : `${IMAGE_CDN}${file}`;
};

/** The provider marks the home team as side "1" and the away team as "2". */
const sideFrom = (raw: unknown): MatchSide | null => {
  const value = asString(raw);
  if (value === '1') return 'home';
  if (value === '2') return 'away';
  return null;
};

function timelineEvent(raw: Rec, index: number): SportTimelineEvent | null {
  const type = asString(raw.incidentTypeName);
  const player = asString(raw.incidentPlayerName);
  if (!type && !player) return null;

  return {
    id: asString(raw.eventId) ?? `incident-${index}`,
    minute: asString(raw.incidentTime),
    type,
    side: sideFrom(raw.incidentSide),
    player,
    playerId: asString(raw.incidentPlayerId),
    homeScore: asInt(raw.homeScore),
    awayScore: asInt(raw.awayScore),
    commentary: asString(raw.incidentCommentary),
  };
}

export function normalizeMatchInfo(payload: unknown): SportMatchInfo | null {
  if (!isRec(payload)) return null;

  const homeName = asString(payload.homeName);
  const awayName = asString(payload.awayName);
  if (!homeName || !awayName) return null;

  return {
    home: {
      id: asString(payload.homeId),
      name: homeName,
      slug: asString(payload.homeSlug),
      badgeUrl: imageUrl(payload.homeLogo),
    },
    away: {
      id: asString(payload.awayId),
      name: awayName,
      slug: asString(payload.awaySlug),
      badgeUrl: imageUrl(payload.awayLogo),
    },
    venue: asString(payload.venue),
    venueCity: asString(payload.venueCity),
    capacity: asString(payload.capacity),
    referee: asString(payload.referee),
    timeline: asArray(payload.events)
      .map(timelineEvent)
      .filter((event): event is SportTimelineEvent => event !== null),
  };
}

function lineupPlayer(raw: Rec): SportLineupPlayer | null {
  const name = asString(raw.participantName);
  if (!name) return null;

  return {
    id: asString(raw.participantId),
    name,
    shirtNumber: asString(raw.participantNumber),
    rating: asString(raw.participantRating),
    country: asString(raw.participantCountry),
    photoUrl: imageUrl(raw.participantImageVariant84 ?? raw.participantImage),
    incident: asString(raw.incidentTooltip),
    incidentType: asString(raw.incidentTypeName),
  };
}

/**
 * Lineups arrive pre-grouped ("Starting Lineups", "Substitutes", "Coaches").
 * The grouping is preserved so the UI mirrors the provider's own structure.
 */
export function normalizeLineups(payload: unknown): SportLineup | null {
  const blocks = asArray(payload);
  if (!blocks.length) return null;

  const players = (node: unknown): SportLineupPlayer[] =>
    asArray(node)
      .map(lineupPlayer)
      .filter((player): player is SportLineupPlayer => player !== null);

  const groups = blocks
    .map((block, index): SportLineupGroup => ({
      group: asString(block.group) ?? `Group ${index + 1}`,
      home: players(block.home),
      away: players(block.away),
    }))
    .filter((group) => group.home.length > 0 || group.away.length > 0);

  if (!groups.length) return null;

  // Formation and team rating are repeated on every player; read the first.
  const firstHome = asArray(blocks[0]?.home)[0];
  const firstAway = asArray(blocks[0]?.away)[0];

  return {
    homeFormation: asString(firstHome?.formation),
    awayFormation: asString(firstAway?.formation),
    homeRating: asString(firstHome?.homeTeamRating),
    awayRating: asString(firstAway?.awayTeamRating),
    groups,
  };
}

/**
 * Stats are split by period, and the "Match" period repeats its headline
 * metrics before listing the full set. Duplicates are collapsed by stat id so
 * each metric appears once, keeping the provider's original ordering.
 */
export function normalizeStatPeriods(payload: unknown): SportStatPeriod[] {
  return asArray(payload)
    .map((block): SportStatPeriod | null => {
      const period = asString(block.period);
      if (!period) return null;

      const seen = new Set<string>();
      const stats = asArray(block.stats)
        .map((row): SportMatchStat | null => {
          const label = asString(row.statName);
          const home = asString(row.homeValue);
          const away = asString(row.awayValue);
          if (!label || home === null || away === null) return null;
          return { id: asString(row.statId), label, home, away };
        })
        .filter((stat): stat is SportMatchStat => {
          if (stat === null) return false;
          const key = stat.id ?? stat.label;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

      return stats.length ? { period, stats } : null;
    })
    .filter((period): period is SportStatPeriod => period !== null);
}

/**
 * Match-winner prices only. The provider returns ten betting types across three
 * scopes; the 1X2 full-time market is the one that is comparable across
 * bookmakers, and its three selections arrive as [home, away, draw] with the
 * draw identified by a null participant.
 */
export function normalizeOdds(payload: unknown): SportOdds | null {
  const offers = asArray(payload)
    .filter(
      (row) =>
        asString(row.bettingScope) === 'FULL_TIME' &&
        asString(row.bettingType) === 'HOME_DRAW_AWAY'
    )
    .map((row): SportOddsOffer | null => {
      const bookmaker = asString(row.bookmakerName);
      const quotes = asArray(row.odds);
      if (!bookmaker || quotes.length < 3) return null;

      const draw = quotes.find((quote) => asString(quote.eventParticipantId) === null);
      const sides = quotes.filter((quote) => asString(quote.eventParticipantId) !== null);
      if (!draw || sides.length < 2) return null;

      const selection = (label: string, quote: Rec): SportOddsSelection | null => {
        const value = asString(quote.value);
        if (!value) return null;
        return {
          label,
          value,
          opening: asString(quote.opening),
          active: quote.active !== false,
        };
      };

      const selections = [
        selection('1', sides[0]),
        selection('X', draw),
        selection('2', sides[1]),
      ].filter((entry): entry is SportOddsSelection => entry !== null);

      return selections.length === 3 ? { bookmaker, selections } : null;
    })
    .filter((offer): offer is SportOddsOffer => offer !== null);

  return offers.length ? { offers } : null;
}
