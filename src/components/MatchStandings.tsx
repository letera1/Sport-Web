import { useStandings } from '../hooks/useStandings';
import { cn } from '../lib/utils';
import { getProxiedImageUrl, FALLBACK_BADGE } from '../services/sportsApi';
import { Skeleton } from './Skeleton';
import { Link } from 'react-router-dom';

interface MatchStandingsProps {
  leagueId?: string;
  homeTeamId?: string;
  awayTeamId?: string;
}

export const MatchStandings = ({ leagueId, homeTeamId, awayTeamId }: MatchStandingsProps) => {
  const { standings, loading, error } = useStandings(leagueId || '');

  if (!leagueId) {
    return (
      <div className="p-6 text-center text-text-muted text-xs">
        Standings not available for this league.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4 space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="w-full h-8" />
        ))}
      </div>
    );
  }

  if (error || standings.length === 0) {
    return (
      <div className="p-6 text-center text-text-muted text-xs">
        Standings data is not available.
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4">
      <h3 className="text-white font-medium text-sm mb-4">League Standings</h3>
      
      <div className="border border-divider/30 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[2.5rem_1fr_2.5rem_2.5rem_2.5rem_3rem] gap-1 px-3 py-2 text-[10px] sm:text-xs font-semibold text-text-muted uppercase bg-surface-hover/30 border-b border-divider/30">
          <span className="text-center">#</span>
          <span>Team</span>
          <span className="text-center">P</span>
          <span className="text-center">GD</span>
          <span className="text-center">Pts</span>
          <span className="text-center">Form</span>
        </div>

        {/* Rows */}
        <div className="divide-y divide-divider/20">
          {standings.map((row) => {
            const isHome = row.idTeam === homeTeamId;
            const isAway = row.idTeam === awayTeamId;
            const isMatchTeam = isHome || isAway;
            const rank = parseInt(row.intRank);
            const formChars = row.strForm?.split('') || [];

            return (
              <Link
                to={`/team/${row.idTeam}`}
                key={row.idTeam}
                className={cn(
                  "grid grid-cols-[2.5rem_1fr_2.5rem_2.5rem_2.5rem_3rem] gap-1 px-3 py-2.5 items-center text-xs sm:text-sm hover:bg-surface-hover/50 transition-colors",
                  isHome && "bg-accent/5 border-l-2 border-l-accent",
                  isAway && "bg-info/5 border-l-2 border-l-info"
                )}
              >
                <span className={cn(
                  "text-center font-bold text-xs",
                  isMatchTeam ? "text-white" : "text-text-secondary"
                )}>
                  {row.intRank}
                </span>

                <div className="flex items-center gap-1.5 min-w-0">
                  <img
                    src={row.strTeamBadge ? `${getProxiedImageUrl(row.strTeamBadge)}/tiny` : FALLBACK_BADGE}
                    alt={row.strTeam}
                    className="w-4 h-4 object-contain shrink-0"
                    onError={(e) => { const img = e.currentTarget; img.onerror = null; img.src = FALLBACK_BADGE; }}
                  />
                  <span className={cn(
                    "truncate font-medium text-xs sm:text-sm",
                    isMatchTeam ? "text-white font-bold" : "text-text-primary"
                  )}>
                    {row.strTeam}
                  </span>
                </div>

                <span className="text-center text-text-secondary text-xs">{row.intPlayed}</span>
                <span className={cn(
                  "text-center text-xs",
                  parseInt(row.intGoalDifference || '0') > 0 ? "text-accent" : parseInt(row.intGoalDifference || '0') < 0 ? "text-danger" : "text-text-secondary"
                )}>
                  {row.intGoalDifference}
                </span>
                <span className="text-center font-bold text-text-primary text-xs">{row.intPoints}</span>

                {/* Form */}
                <div className="flex items-center justify-center gap-0.5">
                  {formChars.slice(-3).map((c, i) => (
                    <span key={i} className={cn(
                      "w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold",
                      c === 'W' ? "bg-accent text-black" :
                      c === 'D' ? "bg-text-muted/30 text-text-secondary" :
                      c === 'L' ? "bg-danger text-white" :
                      "bg-surface-hover"
                    )}>
                      {c}
                    </span>
                  ))}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
