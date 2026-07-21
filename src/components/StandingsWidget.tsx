import { Link } from 'react-router-dom';
import { useStandings } from '../hooks/useStandings';
import { cn } from '../lib/utils';
import { getProxiedImageUrl, FALLBACK_BADGE } from '../services/sportsApi';
import { Skeleton } from './Skeleton';
import { Trophy, ChevronRight } from 'lucide-react';

interface StandingsWidgetProps {
  leagueId: string;
}

export const StandingsWidget = ({ leagueId }: StandingsWidgetProps) => {
  const { standings, loading } = useStandings(leagueId);

  if (loading) {
    return (
      <div className="bg-surface rounded-xl overflow-hidden border border-divider/30">
        <div className="px-4 py-3 border-b border-divider/30">
          <Skeleton className="w-36 h-5" />
        </div>
        <div className="divide-y divide-divider/20">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="px-4 py-2.5 flex items-center gap-3">
              <Skeleton className="w-5 h-4" />
              <Skeleton className="w-5 h-5 rounded-full" />
              <Skeleton className="w-24 h-4 flex-1" />
              <Skeleton className="w-8 h-4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (standings.length === 0) return null;

  return (
    <div className="bg-surface rounded-xl overflow-hidden border border-divider/30">
      <div className="px-4 py-3 flex items-center justify-between border-b border-divider/30">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-accent" />
          <h3 className="text-text-primary font-medium text-sm">League Table ({standings.length} Teams)</h3>
        </div>
        <Link to="/standings" className="text-accent text-xs font-medium hover:underline flex items-center gap-0.5">
          Full Table <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="divide-y divide-divider/20">
        {standings.map((row) => {
          const rank = parseInt(row.intRank);
          return (
            <Link
              to={`/team/${row.idTeam}`}
              key={row.idTeam}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-surface-hover transition-colors"
            >
              <span className={cn(
                "w-5 text-center text-xs font-bold",
                rank <= 4 ? "text-accent" : "text-text-secondary"
              )}>
                {row.intRank}
              </span>
              <img
                src={row.strTeamBadge ? `${getProxiedImageUrl(row.strTeamBadge)}/tiny` : FALLBACK_BADGE}
                alt={row.strTeam}
                className="w-5 h-5 object-contain shrink-0"
                onError={(e) => { const img = e.currentTarget; img.onerror = null; img.src = FALLBACK_BADGE; }}
              />
              <span className="text-text-primary text-sm flex-1 truncate">{row.strTeam}</span>
              <span className="text-text-primary text-sm font-bold w-8 text-right">{row.intPoints}</span>
              
              {/* Form dots */}
              <div className="hidden sm:flex items-center gap-0.5">
                {row.strForm?.split('').slice(-5).map((c, i) => (
                  <span key={i} className={cn(
                    "w-2 h-2 rounded-full",
                    c === 'W' ? "bg-accent" :
                    c === 'D' ? "bg-text-muted/40" :
                    c === 'L' ? "bg-danger" :
                    "bg-surface-hover"
                  )} />
                ))}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
