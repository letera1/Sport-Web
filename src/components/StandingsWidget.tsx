import { Link } from 'react-router-dom';
import { useStandings } from '../hooks/useStandings';
import { cn } from '../lib/utils';
import { getProxiedImageUrl, FALLBACK_BADGE } from '../services/sportsApi';
import { Skeleton } from './Skeleton';
import { Trophy, ChevronRight } from 'lucide-react';

interface StandingsWidgetProps {
  leagueId: string;
  limit?: number;
}

export const StandingsWidget = ({ leagueId, limit = 8 }: StandingsWidgetProps) => {
  const { standings, loading } = useStandings(leagueId);

  if (loading) {
    return (
      <div className="bg-surface rounded-xl overflow-hidden border border-border/50">
        <div className="px-4 py-3 border-b border-border/40">
          <Skeleton className="w-36 h-4" />
        </div>
        <div className="divide-y divide-border/30 p-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="py-2 px-2 flex items-center gap-3">
              <Skeleton className="w-4 h-4" />
              <Skeleton className="w-5 h-5 rounded-full" />
              <Skeleton className="w-24 h-4 flex-1" />
              <Skeleton className="w-6 h-4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (standings.length === 0) return null;

  const displayStandings = limit ? standings.slice(0, limit) : standings;

  return (
    <div className="bg-surface rounded-xl overflow-hidden border border-border/50 shadow-card">
      {/* Widget Header */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-border/40 bg-surface-hover/30">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-accent" />
          <h3 className="text-text-primary font-semibold text-xs uppercase tracking-wider font-display">
            League Standings
          </h3>
        </div>
        <Link 
          to="/standings" 
          className="text-accent text-xs font-bold hover:underline flex items-center gap-0.5"
        >
          Full Table <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Mini Table Header */}
      <div className="grid grid-cols-[1.5rem_1fr_2rem_2rem_2.5rem] px-3 py-1.5 text-[10px] font-bold text-text-muted uppercase border-b border-border/30 bg-surface-hover/20">
        <span className="text-center">#</span>
        <span>Team</span>
        <span className="text-center">P</span>
        <span className="text-center">GD</span>
        <span className="text-right">PTS</span>
      </div>

      {/* Rows */}
      <div className="divide-y divide-border/20">
        {displayStandings.map((row) => {
          const rank = parseInt(row.intRank);
          const isChampionsLeague = rank <= 4;
          const isRelegation = rank >= standings.length - 2;

          return (
            <Link
              to={`/team/${row.idTeam}`}
              key={row.idTeam || row.intRank}
              className="grid grid-cols-[1.5rem_1fr_2rem_2rem_2.5rem] items-center px-3 py-2 text-xs hover:bg-surface-hover/60 transition-colors group"
            >
              <span className={cn(
                "text-center font-bold text-[11px]",
                isChampionsLeague ? "text-accent" : isRelegation ? "text-danger" : "text-text-muted"
              )}>
                {row.intRank}
              </span>
              <div className="flex items-center gap-2 min-w-0 pr-1">
                <img
                  src={getProxiedImageUrl(row.strTeamBadge || row.strBadge)}
                  alt={row.strTeam}
                  className="w-4 h-4 object-contain shrink-0"
                  onError={(e) => { const img = e.currentTarget; img.onerror = null; img.src = FALLBACK_BADGE; }}
                />
                <span className="text-text-primary group-hover:text-accent truncate font-medium text-xs">
                  {row.strTeam}
                </span>
              </div>
              <span className="text-center text-text-secondary">{row.intPlayed}</span>
              <span className={cn(
                "text-center font-medium text-[11px]",
                Number(row.intGoalDifference) > 0 ? "text-accent" : Number(row.intGoalDifference) < 0 ? "text-danger" : "text-text-muted"
              )}>
                {Number(row.intGoalDifference) > 0 ? `+${row.intGoalDifference}` : row.intGoalDifference}
              </span>
              <span className="text-right font-bold text-text-primary">{row.intPoints}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
