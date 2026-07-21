import { useStandings } from '../hooks/useStandings';
import { MatchDetails } from '../types';
import { getProxiedImageUrl, FALLBACK_BADGE } from '../services/sportsApi';
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
        <h3 className="text-white font-medium text-sm">No League Table Available</h3>
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
    <div className="bg-surface rounded-b-lg p-4 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-divider">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-accent" />
          <h2 className="text-white font-semibold text-base">{match.strLeague} Standings</h2>
        </div>
        <button
          onClick={() => navigate('/standings')}
          className="text-xs text-accent hover:underline font-medium"
        >
          View Full League Table →
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="text-text-secondary uppercase text-[10px] tracking-wider border-b border-divider/60">
              <th className="py-2.5 px-3">#</th>
              <th className="py-2.5 px-3">Team</th>
              <th className="py-2.5 px-3 text-center">P</th>
              <th className="py-2.5 px-3 text-center">W</th>
              <th className="py-2.5 px-3 text-center">D</th>
              <th className="py-2.5 px-3 text-center">L</th>
              <th className="py-2.5 px-3 text-center hidden sm:table-cell">GD</th>
              <th className="py-2.5 px-3 text-right font-bold">PTS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-divider/30">
            {standings.map((entry) => {
              const entryNorm = normalize(entry.strTeam);
              const isHome = entryNorm.includes(homeNorm) || homeNorm.includes(entryNorm);
              const isAway = entryNorm.includes(awayNorm) || awayNorm.includes(entryNorm);
              const isMatchTeam = isHome || isAway;

              return (
                <tr
                  key={entry.idStanding || entry.idTeam || entry.intRank}
                  onClick={() => entry.idTeam && navigate(`/team/${entry.idTeam}`)}
                  className={`hover:bg-white/10 transition-colors cursor-pointer ${
                    isMatchTeam ? 'bg-accent/20 font-semibold text-white' : 'text-text-secondary hover:text-white'
                  }`}
                >
                  <td className="py-3 px-3">
                    <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] ${
                      isMatchTeam ? 'bg-accent text-black font-bold' : 'text-text-secondary'
                    }`}>
                      {entry.intRank}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={getProxiedImageUrl(entry.strTeamBadge || entry.strBadge)}
                        alt={entry.strTeam}
                        className="w-6 h-6 object-contain shrink-0"
                        onError={(e) => { const img = e.currentTarget; img.onerror = null; img.src = FALLBACK_BADGE; }}
                      />
                      <span className={`truncate text-xs ${isMatchTeam ? 'text-accent font-bold' : 'text-white'}`}>
                        {entry.strTeam}
                      </span>
                      {isHome && <span className="text-[9px] px-1.5 py-0.5 rounded bg-accent/30 text-accent border border-accent/50 uppercase font-bold">Home</span>}
                      {isAway && <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/20 text-white border border-white/30 uppercase font-bold">Away</span>}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-center font-medium text-white">{entry.intPlayed}</td>
                  <td className="py-3 px-3 text-center text-white/80">{entry.intWin}</td>
                  <td className="py-3 px-3 text-center text-white/80">{entry.intDraw}</td>
                  <td className="py-3 px-3 text-center text-white/80">{entry.intLoss}</td>
                  <td className="py-3 px-3 text-center hidden sm:table-cell text-white/80">{entry.intGoalDifference}</td>
                  <td className="py-3 px-3 text-right font-bold text-accent text-sm">{entry.intPoints}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
