import axios from 'axios';
import { MatchEvent, MatchDetails } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const PREMIER_LEAGUE_ID = import.meta.env.VITE_PREMIER_LEAGUE_ID;

export const api = {
  // Fetch upcoming/live matches
  getFixtures: async (): Promise<MatchEvent[]> => {
    try {
      // Strategy: Fetch Next 15 and Past 15 (Reliable) AND Season (Comprehensive)
      // We merge them to ensure we have data even if one endpoint is flaky on the free tier.
      
      const [nextRes, pastRes, seasonRes] = await Promise.allSettled([
        axios.get(`${API_BASE_URL}/eventsnextleague.php?id=${PREMIER_LEAGUE_ID}`),
        axios.get(`${API_BASE_URL}/eventspastleague.php?id=${PREMIER_LEAGUE_ID}`),
        axios.get(`${API_BASE_URL}/eventsseason.php?id=${PREMIER_LEAGUE_ID}&s=2024-2025`)
      ]);

      const nextEvents = nextRes.status === 'fulfilled' ? (nextRes.value.data.events || []) : [];
      const pastEvents = pastRes.status === 'fulfilled' ? (pastRes.value.data.events || []) : [];
      const seasonEvents = seasonRes.status === 'fulfilled' ? (seasonRes.value.data.events || []) : [];

      // Merge and deduplicate by idEvent
      const allEvents = [...pastEvents, ...nextEvents, ...seasonEvents];
      const uniqueEvents = Array.from(new Map(allEvents.map(item => [item.idEvent, item])).values());

      // Sort by date/time
      return uniqueEvents.sort((a, b) => new Date(a.dateEvent + 'T' + a.strTime).getTime() - new Date(b.dateEvent + 'T' + b.strTime).getTime());
    } catch (error) {
      console.error("Error fetching fixtures:", error);
      return [];
    }
  },

  // Fetch specific match details
  getMatchDetails: async (id: string): Promise<MatchDetails | null> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/lookupevent.php?id=${id}`);
      return response.data.events ? response.data.events[0] : null;
    } catch (error) {
      console.error("Error fetching match details:", error);
      return null;
    }
  },

  // Helper to get team badge
  getTeamBadge: (teamName: string) => {
    return `https://www.thesportsdb.com/images/media/team/badge/${teamName.replace(/\s+/g, '_')}.png`;
  }
};
