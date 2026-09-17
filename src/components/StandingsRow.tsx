import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { getProxiedImageUrl, FALLBACK_BADGE } from '../services/sportsApi';
import type { StandingsEntry } from '../types';

/**
 * Shared column layout for the full standings table (StandingsPage + MatchStandingsTab).
 * Columns collapse progressively on narrow viewports so the Team column never
 * gets squeezed below a legible width — # and Team are the only columns that
 * are always visible; everything else reveals itself as space allows.
 */
const CELL = {
  rank: 'w-6 sm:w-8 shrink-0 text-center',
  stat: 'hidden sm:block w-7 sm:w-8 shrink-0 text-center',
  wide: 'hidden lg:block w-8 shrink-0 text-center',
  played: 'hidden xs:block w-7 sm:w-8 shrink-0 text-center',
  gd: 'w-9 sm:w-11 shrink-0 text-center',
  pts: 'w-9 sm:w-12 shrink-0 text-right',
  form: 'hidden xl:flex w-24 shrink-0 justify-center gap-1',
};

function zoneTextClass(rank: number, totalTeams: number): string {
  if (rank <= 4) return 'text-accent';
  if (rank > totalTeams - 3) return 'text-danger';
  return 'text-text-secondary';
}

function zoneBorderClass(rank: number, totalTeams: number): string {
  if (rank <= 4) return 'border-l-accent';
  if (rank === 5) return 'border-l-info';
  if (rank > totalTeams - 3) return 'border-l-danger';
  return 'border-l-transparent';
}

interface StandingsHeaderRowProps {
  className?: string;
}

export const StandingsHeaderRow = ({ className }: StandingsHeaderRowProps) => (
  <div
    className={cn(
      'flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-2.5 border-l-2 border-l-transparent',
      'text-[11px] font-bold text-text-muted uppercase tracking-wider',
      'border-b border-border/50 bg-surface-hover/40',
      className
    )}
  >
    <span className={CELL.rank}>#</span>
    <span className="flex-1 min-w-0">Team</span>
    <span className={CELL.played}>P</span>
    <span className={CELL.stat}>W</span>
    <span className={CELL.stat}>D</span>
    <span className={CELL.stat}>L</span>
    <span className={CELL.wide}>GF</span>
    <span className={CELL.wide}>GA</span>
    <span className={CELL.gd}>GD</span>
    <span className={CELL.pts}>Pts</span>
    <span className={CELL.form}>Form</span>
  </div>
);

interface StandingsRowProps {
  entry: StandingsEntry;
  totalTeams: number;
  highlight?: 'home' | 'away' | boolean;
}

export const StandingsRow = ({ entry, totalTeams, highlight }: StandingsRowProps) => {
  const rank = parseInt(entry.intRank, 10) || 0;
  const gd = parseInt(entry.intGoalDifference || '0', 10) || 0;
  const formChars = entry.strForm?.split('') || [];
  const isHome = highlight === 'home';
  const isAway = highlight === 'away';
  const isHighlighted = highlight === true || isHome || isAway;

  return (
    <Link
      to={`/team/${entry.idTeam}`}
      className={cn(
        'flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-2.5 border-l-2 transition-colors',
        'text-xs sm:text-sm hover:bg-surface-hover/70',
        zoneBorderClass(rank, totalTeams),
        isHome && 'bg-accent/[0.06] border-l-accent',
        isAway && 'bg-info/[0.06] border-l-info'
      )}
    >
      <span className={cn(CELL.rank, 'font-bold font-score', zoneTextClass(rank, totalTeams))}>
        {entry.intRank}
      </span>

      <div className="flex-1 min-w-0 flex items-center gap-2">
        <img
          src={getProxiedImageUrl(entry.strTeamBadge || entry.strBadge)}
          alt=""
          className="w-5 h-5 sm:w-6 sm:h-6 object-contain shrink-0"
          onError={(e) => { const img = e.currentTarget; img.onerror = null; img.src = FALLBACK_BADGE; }}
        />
        <span className={cn('truncate font-medium', isHighlighted ? 'text-accent font-bold' : 'text-text-primary')}>
          {entry.strTeam}
        </span>
        {isHome && (
          <span className="hidden sm:inline-block shrink-0 text-[9px] px-1.5 py-0.5 rounded bg-accent/15 text-accent border border-accent/30 font-bold uppercase tracking-wide">
            Home
          </span>
        )}
        {isAway && (
          <span className="hidden sm:inline-block shrink-0 text-[9px] px-1.5 py-0.5 rounded bg-info/15 text-info border border-info/30 font-bold uppercase tracking-wide">
            Away
          </span>
        )}
      </div>

      <span className={cn(CELL.played, 'text-text-secondary font-score')}>{entry.intPlayed}</span>
      <span className={cn(CELL.stat, 'text-text-secondary font-score')}>{entry.intWin}</span>
      <span className={cn(CELL.stat, 'text-text-secondary font-score')}>{entry.intDraw}</span>
      <span className={cn(CELL.stat, 'text-text-secondary font-score')}>{entry.intLoss}</span>
      <span className={cn(CELL.wide, 'text-text-secondary font-score')}>{entry.intGoalsFor}</span>
      <span className={cn(CELL.wide, 'text-text-secondary font-score')}>{entry.intGoalsAgainst}</span>
      <span className={cn(
        CELL.gd, 'font-score font-semibold',
        gd > 0 ? 'text-accent' : gd < 0 ? 'text-danger' : 'text-text-secondary'
      )}>
        {gd > 0 ? `+${gd}` : gd}
      </span>
      <span className={cn(CELL.pts, 'font-bold font-score text-text-primary text-sm')}>{entry.intPoints}</span>

      <div className={CELL.form}>
        {formChars.slice(-5).map((c, i) => (
          <span
            key={i}
            className={cn(
              'w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0',
              c === 'W' ? 'bg-accent text-black' :
              c === 'L' ? 'bg-danger text-white' :
              c === 'D' ? 'bg-text-muted/40 text-text-primary' :
              'bg-surface-hover text-text-muted'
            )}
          >
            {c}
          </span>
        ))}
      </div>
    </Link>
  );
};
