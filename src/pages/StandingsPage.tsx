import { useStandings } from '../hooks/useStandings';
import { Skeleton } from '../components/Skeleton';
import { EmptyState } from '../components/EmptyState';
import { StandingsHeaderRow, StandingsRow } from '../components/StandingsRow';
import { Trophy } from 'lucide-react';

interface StandingsPageProps {
  leagueId: string;
  leagueName?: string;
}

export const StandingsPage = ({ leagueId, leagueName }: StandingsPageProps) => {
  const { standings, loading, error } = useStandings(leagueId);

  if (error) {
    const isUnsupported = error === 'No data found for this league';
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-text-primary">{leagueName || 'League'} Standings</h1>
        {isUnsupported ? (
          <EmptyState
            variant="no-data"
            title="Standings Not Available"
            description={`A league table isn't provided for ${leagueName || 'this competition'} — this is common for cup/continental competitions without a fixed group table.`}
          />
        ) : (
          <EmptyState variant="error" description={error} action={
            <button onClick={() => window.location.reload()} className="px-4 py-2 bg-accent text-black rounded-lg text-sm font-semibold hover:bg-accent/90 transition-colors">Retry</button>
          } />
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      {/* Page Header */}
      <div className="bg-surface rounded-xl p-4 sm:p-6 border border-border/50 shadow-card flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl font-bold text-text-primary truncate">
              {leagueName || 'League'} Standings
            </h1>
            <p className="text-xs text-text-muted">Season standings &amp; live form guide</p>
          </div>
        </div>
        <span className="text-xs font-bold text-accent px-3 py-1 bg-accent/10 rounded-full border border-accent/30 shrink-0">
          {standings.length} Teams
        </span>
      </div>

      {/* Table Container */}
      <div className="bg-surface rounded-xl overflow-hidden border border-border/50 shadow-card">
        <div className="overflow-x-auto">
          <StandingsHeaderRow className="sticky top-0" />

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
              {standings.map((row) => (
                <StandingsRow key={row.idTeam + row.intRank} entry={row} totalTeams={standings.length} />
              ))}
            </div>
          )}
        </div>

        {/* Empty */}
        {!loading && standings.length === 0 && (
          <EmptyState variant="no-data" title="Standings Unavailable" description="League standings data is not available for this season." />
        )}
      </div>

      {/* Legend Footer */}
      {!loading && standings.length > 0 && (
        <div className="flex flex-col gap-2 px-4 py-3 bg-surface rounded-xl border border-border/40">
          <div className="flex flex-wrap gap-4 text-xs text-text-secondary">
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-accent" /> Champions League</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-info" /> Europa League</div>
            {standings.length >= 10 && (
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-danger" /> Relegation</div>
            )}
          </div>
          {standings.length < 10 && (
            <p className="text-[11px] text-text-muted border-t border-border/40 pt-2">
              Showing the top {standings.length} positions — TheSportsDB&apos;s free API tier only returns a partial table.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

