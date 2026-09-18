import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { getProxiedImageUrl, FALLBACK_BADGE } from '../services/sportsApi';
import type { StandingsEntry } from '../types';

/**
 * Shared column layout for the full standings table (StandingsPage + MatchStandingsTab).
 * Every column (P/W/D/L/GF/GA/GD/Pts/Form) is always rendered — on narrow screens
 * the row simply becomes wider than the viewport and the shared scroll container
 * (see StandingsPage/MatchStandingsTab) scrolls horizontally, with rank+team
 * pinned via `sticky left-0` so you never lose track of which team a stat belongs to.
 */
const TEAM_COL = 'sticky left-0 z-10 flex items-center gap-2 shrink-0 w-[148px] sm:w-[190px] py-2.5 pl-2.5 sm:pl-4 pr-2';
const CELL = {
  stat: 'w-7 sm:w-8 shrink-0 text-center',
  wide: 'w-8 sm:w-9 shrink-0 text-center',
  gd: 'w-9 sm:w-11 shrink-0 text-center',
  pts: 'w-9 sm:w-12 shrink-0 text-right',
  form: 'w-24 shrink-0 flex justify-center gap-1',
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
      'flex items-stretch border-l-2 border-l-transparent',
      'text-[11px] font-bold text-text-muted uppercase tracking-wider',
      'border-b border-border/50',
      className
    )}
  >
    <div className={cn(TEAM_COL, 'bg-surface-hover/95')}>
      <span className="w-6 shrink-0 text-center">#</span>
      <span className="flex-1 min-w-0">Team</span>
    </div>
    <div className="flex items-center gap-1.5 sm:gap-2 py-2.5 pr-2.5 sm:pr-4 pl-1 bg-surface-hover/40">
      <span className={CELL.stat}>P</span>
      <span className={CELL.stat}>W</span>
      <span className={CELL.stat}>D</span>
      <span className={CELL.stat}>L</span>
      <span className={CELL.wide}>GF</span>
      <span className={CELL.wide}>GA</span>
      <span className={CELL.gd}>GD</span>
      <span className={CELL.pts}>Pts</span>
      <span className={CELL.form}>Form</span>
    </div>
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
        'group flex items-stretch border-l-2 transition-colors text-xs sm:text-sm',
        zoneBorderClass(rank, totalTeams),
        isHome && 'border-l-accent',
        isAway && 'border-l-info'
      )}
    >
      <div className={cn(
        TEAM_COL, 'transition-colors',
        isHighlighted ? 'bg-surface-hover' : 'bg-surface group-hover:bg-surface-hover'
      )}>
        <span className={cn('w-6 shrink-0 text-center font-bold font-score', zoneTextClass(rank, totalTeams))}>
          {entry.intRank}
        </span>
        <img
          src={getProxiedImageUrl(entry.strTeamBadge || entry.strBadge)}
          alt=""
          className="w-5 h-5 sm:w-6 sm:h-6 object-contain shrink-0"
          onError={(e) => { const img = e.currentTarget; img.onerror = null; img.src = FALLBACK_BADGE; }}
        />
        <span className={cn('flex-1 min-w-0 truncate font-medium', isHighlighted ? 'text-accent font-bold' : 'text-text-primary')}>
          {entry.strTeam}
        </span>
      </div>

      <div className="flex-1 flex items-center gap-1.5 sm:gap-2 py-2.5 pr-2.5 sm:pr-4 pl-1 transition-colors group-hover:bg-surface-hover/70">
        <span className={cn(CELL.stat, 'text-text-secondary font-score')}>{entry.intPlayed}</span>
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
      </div>
    </Link>
  );
};

