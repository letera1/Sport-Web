import { useStandings } from '../hooks/useStandings';
import { MatchDetails } from '../types';
import { StandingsHeaderRow, StandingsRow } from './StandingsRow';
import { Trophy, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MatchStandingsTabProps {
  match?: MatchDetails | null;
  error?: string | null;
}

export const MatchStandingsTab = ({ match }: MatchStandingsTabProps) => {
  const navigate = useNavigate();
  const leagueId = match?.idLeague || '4328';
  const { standings, loading, error } = useStandings(leagueId, match?.strSeason);

  if (!match) return null;

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[300px] text-text-secondary">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (error || standings.length === 0) {
    return (
      <div className="p-6 min-h-[250px] flex flex-col items-center justify-center text-center">
        <Trophy className="w-12 h-12 text-text-muted mb-3" />
        <h3 className="text-text-primary font-medium text-sm">No League Table Available</h3>
        <p className="text-text-secondary text-xs mt-1">
          Standings are not available for {match.strLeague || 'this competition'}.
        </p>
      </div>
    );
  }

  const normalize = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, '');
  const homeNorm = normalize(match.strHomeTeam || '');
  const awayNorm = normalize(match.strAwayTeam || '');

  return (
    <div className="bg-surface rounded-b-lg space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 pt-4 sm:pt-6 pb-3 border-b border-divider">
        <div className="flex items-center gap-2 min-w-0">
          <Trophy className="w-5 h-5 text-accent shrink-0" />
          <h2 className="text-text-primary font-semibold text-base truncate">{match.strLeague} Standings</h2>
        </div>
        <button
          onClick={() => navigate('/standings')}
          className="text-xs text-accent hover:underline font-semibold shrink-0"
        >
          Full Table &rarr;
        </button>
      </div>

      {/* Table */}
      <div className="border border-border/40 rounded-xl overflow-hidden mx-4 sm:mx-6 mb-4 sm:mb-6">
        <StandingsHeaderRow />
        <div className="divide-y divide-border/20">
          {standings.map((entry) => {
            const entryNorm = normalize(entry.strTeam);
            const isHome = entryNorm.includes(homeNorm) || homeNorm.includes(entryNorm);
            const isAway = entryNorm.includes(awayNorm) || awayNorm.includes(entryNorm);
            return (
              <StandingsRow
                key={entry.idStanding || entry.idTeam || entry.intRank}
                entry={entry}
                totalTeams={standings.length}
                highlight={isHome ? 'home' : isAway ? 'away' : undefined}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

