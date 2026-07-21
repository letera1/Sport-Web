// ========================
// Polling & Rate Limits
// ========================
export const POLLING_INTERVAL = 30000; // 30 seconds (conservative for free tier 30 req/min)
export const CACHE_TTL = {
  STANDINGS: 5 * 60 * 1000,   // 5 minutes
  TEAM: 10 * 60 * 1000,       // 10 minutes
  PLAYER: 10 * 60 * 1000,     // 10 minutes
  LEAGUE: 30 * 60 * 1000,     // 30 minutes
  MATCHES: 30 * 1000,         // 30 seconds (live data)
  HIGHLIGHTS: 10 * 60 * 1000, // 10 minutes
  EQUIPMENT: 60 * 60 * 1000,  // 1 hour
};

// ========================
// League Config
// ========================
export const DEFAULT_LEAGUE_ID = import.meta.env.VITE_PREMIER_LEAGUE_ID || '4328';

export const LEAGUES: { id: string; name: string; code: string; country: string; flag: string }[] = [
  { id: '4328', name: 'Premier League', code: 'PL', country: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { id: '4335', name: 'La Liga', code: 'LL', country: 'Spain', flag: '🇪🇸' },
  { id: '4332', name: 'Serie A', code: 'SA', country: 'Italy', flag: '🇮🇹' },
  { id: '4331', name: 'Bundesliga', code: 'BL', country: 'Germany', flag: '🇩🇪' },
  { id: '4334', name: 'Ligue 1', code: 'L1', country: 'France', flag: '🇫🇷' },
  { id: '4387', name: 'Champions League', code: 'UCL', country: 'Europe', flag: '🏆' },
  { id: '4388', name: 'Europa League', code: 'UEL', country: 'Europe', flag: '🏆' },
  { id: '4337', name: 'Eredivisie', code: 'ERE', country: 'Netherlands', flag: '🇳🇱' },
  { id: '4344', name: 'Primeira Liga', code: 'POR', country: 'Portugal', flag: '🇵🇹' },
  { id: '4329', name: 'Championship', code: 'CHA', country: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { id: '4346', name: 'MLS', code: 'MLS', country: 'USA', flag: '🇺🇸' },
  { id: '4668', name: 'Saudi Pro League', code: 'SPL', country: 'Saudi Arabia', flag: '🇸🇦' },
  { id: '4351', name: 'Brasileirão', code: 'BRA', country: 'Brazil', flag: '🇧🇷' },
  { id: '4350', name: 'Primera División', code: 'ARG', country: 'Argentina', flag: '🇦🇷' },
];

// ========================
// API Endpoints (v1 free tier)
// ========================
export const API_ENDPOINTS = {
  // Schedule
  NEXT_LEAGUE: '/eventsnextleague.php',
  PAST_LEAGUE: '/eventspastleague.php',
  SEASON_LEAGUE: '/eventsseason.php',
  NEXT_TEAM: '/eventsnext.php',
  LAST_TEAM: '/eventslast.php',
  EVENTS_DAY: '/eventsday.php',

  // Lookup
  LOOKUP_EVENT: '/lookupevent.php',
  LOOKUP_TEAM: '/lookupteam.php',
  LOOKUP_PLAYER: '/lookupplayer.php',
  LOOKUP_LEAGUE: '/lookupleague.php',
  LOOKUP_TABLE: '/lookuptable.php',
  LOOKUP_EQUIPMENT: '/lookupequipment.php',
  LOOKUP_HONOURS: '/lookuphonours.php',
  LOOKUP_FORMER_TEAMS: '/lookupformerteams.php',
  LOOKUP_MILESTONES: '/lookupmilestones.php',
  LOOKUP_CONTRACTS: '/lookupcontracts.php',
  LOOKUP_PLAYER_STATS: '/lookupplayerstats.php',
  LOOKUP_LINEUP: '/lookuplineup.php',
  LOOKUP_TIMELINE: '/lookuptimeline.php',
  PLAYER_RESULTS: '/playerresults.php',
  EVENT_RESULTS: '/eventresults.php',

  // Search
  SEARCH_TEAMS: '/searchteams.php',
  SEARCH_PLAYERS: '/searchplayers.php',
  SEARCH_ALL_LEAGUES: '/search_all_leagues.php',
  SEARCH_ALL_TEAMS: '/search_all_teams.php',

  // List
  LOOKUP_ALL_TEAMS: '/lookup_all_teams.php',

  // Video
  HIGHLIGHTS: '/eventshighlights.php',

  // TV
  TV_SCHEDULE: '/eventstv.php',
};

// ========================
// Routes
// ========================
export const ROUTES = {
  DASHBOARD: '/',
  MATCH_DETAILS: '/match/:id',
  STANDINGS: '/standings',
  TEAM_PROFILE: '/team/:id',
  PLAYER_PROFILE: '/player/:id',
  HIGHLIGHTS: '/highlights',
};

// ========================
// Season Helper
// ========================
export function getCurrentSeason(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const seasonStartYear = month >= 7 ? year : year - 1;
  return `${seasonStartYear}-${seasonStartYear + 1}`;
}
