import { useNavigate } from 'react-router-dom';
import { useStandings } from '../hooks/useStandings';
import { cn } from '../lib/utils';
import { getProxiedImageUrl, FALLBACK_BADGE } from '../services/sportsApi';
import { Skeleton } from '../components/Skeleton';
import { EmptyState } from '../components/EmptyState';
import { Trophy, ChevronRight } from 'lucide-react';

interface StandingsPageProps {
  leagueId: string;
  leagueName?: string;
}

export const StandingsPage = ({ leagueId, leagueName }: StandingsPageProps) => {
  const { standings, loading, error } = useStandings(leagueId);
  const navigate = useNavigate();

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-xl sm:text-2xl font-bold font-display text-text-primary">Standings</h1>
        <EmptyState variant="error" description={error} action={
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-accent text-black rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors">Retry</button>
        } />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      {/* Page Header */}
      <div className="bg-surface rounded-xl p-4 sm:p-6 border border-border/50 shadow-card flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-2xl font-bold font-display text-text-primary">
              {leagueName || 'League'} Standings
            </h1>
            <p className="text-xs text-text-muted">Season standings & live form guide</p>
          </div>
        </div>
        <span className="text-xs font-bold text-accent px-3 py-1 bg-accent/10 rounded-full border border-accent/30">
          {standings.length} Teams
        </span>
      </div>

      {/* Table Container */}
      <div className="bg-surface rounded-xl overflow-hidden border border-border/50 shadow-card">
        {/* Table Header */}
        <div className="grid grid-cols-[2.5rem_1fr_2rem_2rem_2rem_2rem_2.5rem_2.5rem_2.5rem_3rem] sm:grid-cols-[3rem_1fr_2.5rem_2.5rem_2.5rem_2.5rem_3rem_3rem_3rem_3.5rem_5rem] gap-1 sm:gap-2 px-3 sm:px-4 py-2.5 text-[10px] sm:text-xs font-bold text-text-muted uppercase tracking-wider border-b border-border/40 bg-surface-hover/40 sticky top-0">
          <span className="text-center">#</span>
          <span>Team</span>
          <span className="text-center">P</span>
          <span className="text-center">W</span>
          <span className="text-center">D</span>
          <span className="text-center">L</span>
          <span className="text-center">GF</span>
          <span className="text-center">GA</span>
          <span className="text-center">GD</span>
          <span className="text-center">Pts</span>
          <span className="text-center hidden sm:block">Form</span>
        </div>

        {/* Skeleton Loading */}
        {loading && (
          <div className="divide-y divide-border/20">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="px-3 sm:px-4 py-3">
                <Skeleton className="w-full h-5" />
              </div>
            ))}
          </div>
        )}

        {/* Standings Rows */}
        {!loading && standings.length > 0 && (
          <div className="divide-y divide-border/20 stagger-children">
            {standings.map((row) => {
              const rank = parseInt(row.intRank);
              const isChampionsLeague = rank <= 4;
              const isEuropaLeague = rank === 5;
              const isRelegation = rank >= standings.length - 2;
              const gd = parseInt(row.intGoalDifference || '0');
              const formChars = row.strForm?.split('') || [];

              return (
                <div
                  key={row.idTeam + row.intRank}
                  onClick={() => navigate(`/team/${row.idTeam}`)}
                  className={cn(
                    "grid grid-cols-[2.5rem_1fr_2rem_2rem_2rem_2rem_2.5rem_2.5rem_2.5rem_3rem] sm:grid-cols-[3rem_1fr_2.5rem_2.5rem_2.5rem_2.5rem_3rem_3rem_3rem_3.5rem_5rem] gap-1 sm:gap-2 px-3 sm:px-4 py-2.5 items-center cursor-pointer hover:bg-surface-hover/80 transition-colors text-xs sm:text-sm",
                    "border-l-[3px]",
                    isChampionsLeague ? "border-l-accent bg-accent/5" :
                    isEuropaLeague ? "border-l-info bg-info/5" :
                    isRelegation ? "border-l-danger bg-danger/5" :
                    "border-l-transparent"
                  )}
                >
                  {/* Rank */}
                  <span className={cn(
                    "text-center font-bold text-xs font-score",
                    isChampionsLeague ? "text-accent" :
                    isRelegation ? "text-danger" :
                    "text-text-secondary"
                  )}>
                    {row.intRank}
                  </span>

                  {/* Team */}
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={getProxiedImageUrl(row.strTeamBadge || row.strBadge)}
                      alt={row.strTeam}
                      className="w-5 h-5 sm:w-6 sm:h-6 object-contain shrink-0"
                      onError={(e) => { const img = e.currentTarget; img.onerror = null; img.src = FALLBACK_BADGE; }}
                    />
                    <span className="text-text-primary font-medium truncate text-xs sm:text-sm">{row.strTeam}</span>
                    <ChevronRight className="w-3 h-3 text-text-muted shrink-0 hidden sm:block" />
                  </div>

                  {/* Stats */}
                  <span className="text-center text-text-secondary font-score">{row.intPlayed}</span>
                  <span className="text-center text-text-secondary font-score">{row.intWin}</span>
                  <span className="text-center text-text-secondary font-score">{row.intDraw}</span>
                  <span className="text-center text-text-secondary font-score">{row.intLoss}</span>
                  <span className="text-center text-text-secondary font-score">{row.intGoalsFor}</span>
                  <span className="text-center text-text-secondary font-score">{row.intGoalsAgainst}</span>
                  <span className={cn(
                    "text-center font-medium font-score",
                    gd > 0 ? "text-accent" : gd < 0 ? "text-danger" : "text-text-secondary"
                  )}>
                    {gd > 0 ? `+${gd}` : gd}
                  </span>
                  <span className="text-center font-bold text-text-primary font-score text-sm">{row.intPoints}</span>

                  {/* Form Indicator Dots (Desktop) */}
                  <div className="hidden sm:flex items-center justify-center gap-1">
                    {formChars.slice(-5).map((c, i) => (
                      <span key={i} className={cn(
                        "w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-black",
                        c === 'W' ? "bg-accent" :
                        c === 'D' ? "bg-text-muted/40 text-white" :
                        c === 'L' ? "bg-danger text-white" :
                        "bg-surface-hover text-text-muted"
                      )}>
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty */}
        {!loading && standings.length === 0 && (
          <EmptyState variant="no-data" title="Standings Unavailable" description="League standings data is not available for this season." />
        )}
      </div>

      {/* Legend Footer */}
      {!loading && standings.length > 0 && (
        <div className="flex flex-wrap gap-4 text-xs text-text-secondary px-2 py-1 bg-surface rounded-xl border border-border/40">
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-accent" /> Champions League</div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-info" /> Europa League</div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-danger" /> Relegation</div>
        </div>
      )}
    </div>
  );
};
