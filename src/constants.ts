export const POLLING_INTERVAL = 20000; // 20 seconds as per spec

export const DEFAULT_LEAGUE_ID = import.meta.env.VITE_PREMIER_LEAGUE_ID || '4328';

export const LEAGUES: { id: string; name: string; code: string }[] = [
  { id: '4328', name: 'Premier League', code: 'PL' },
  { id: '4335', name: 'La Liga', code: 'LL' },
  { id: '4332', name: 'Serie A', code: 'SA' },
  { id: '4331', name: 'Bundesliga', code: 'BL' },
  { id: '4334', name: 'Ligue 1', code: 'L1' },
];

export const API_ENDPOINTS = {
  NEXT_LEAGUE: '/eventsnextleague.php',
  PAST_LEAGUE: '/eventspastleague.php',
  SEASON_LEAGUE: '/eventsseason.php',
  LOOKUP_EVENT: '/lookupevent.php',
};

export const ROUTES = {
  DASHBOARD: '/',
  MATCH_DETAILS: '/match/:id',
};
