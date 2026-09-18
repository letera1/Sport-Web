import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { getProxiedImageUrl, FALLBACK_BADGE } from '../services/sportsApi';
import type { SportStanding } from '../services/sportdb/models';

/**
 * Shared column layout for the full standings table (StandingsPage + MatchStandingsTab).
 * Every column is always rendered. The team column grows to absorb leftover width
 * on wide screens and holds a fixed basis on narrow ones, so the row overflows
 * into the shared horizontal scroll container with rank+team pinned via
 * `sticky left-0`. Rows need `w-max min-w-full` for that pinning to hold.
 */
const TEAM_COL = 'sticky left-0 z-10 flex items-center gap-2 grow shrink-0 basis-[148px] sm:basis-[190px] py-2.5 pl-2.5 sm:pl-4 pr-2';
const STATS_ROW = 'flex items-center gap-1.5 sm:gap-2 shrink-0 py-2.5 pr-2.5 sm:pr-4 pl-1';
const CELL = {
  stat: 'w-7 sm:w-8 shrink-0 text-center',
  wide: 'w-8 sm:w-9 shrink-0 text-center',
  gd: 'w-9 sm:w-11 shrink-0 text-center',
  pts: 'w-9 sm:w-12 shrink-0 text-right',
  form: 'w-24 shrink-0 flex justify-center gap-1',
};

/** Shows a dash rather than a fabricated 0 when the provider omits a value. */
const val = (n: number | null): string => (n === null ? '–' : String(n));

const ZONE_BORDER: Record<SportStanding['zone'], string> = {
  champions: 'border-l-accent',
  europa: 'border-l-info',
  relegation: 'border-l-danger',
  none: 'border-l-transparent',
};

const ZONE_RANK_TEXT: Record<SportStanding['zone'], string> = {
  champions: 'text-accent',
  europa: 'text-info',
  relegation: 'text-danger',
  none: 'text-text-secondary',
};

interface StandingsHeaderRowProps {
  className?: string;
}

export const StandingsHeaderRow = ({ className }: StandingsHeaderRowProps) => (
  <div
    className={cn(
      'flex items-stretch w-max min-w-full border-l-2 border-l-transparent',
      'text-[11px] font-bold text-text-muted uppercase tracking-wider',
      'border-b border-border/50',
      className
    )}
  >
    <div className={cn(TEAM_COL, 'bg-surface-hover/95')}>
      <span className="w-6 shrink-0 text-center">#</span>
      <span className="flex-1 min-w-0">Team</span>
    </div>
    <div className={cn(STATS_ROW, 'bg-surface-hover/40')}>
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
  entry: SportStanding;
  highlight?: 'home' | 'away' | boolean;
}

export const StandingsRow = ({ entry, highlight }: StandingsRowProps) => {
  const gd = entry.goalDifference;
  const isHome = highlight === 'home';
  const isAway = highlight === 'away';
  const isHighlighted = highlight === true || isHome || isAway;

  return (
    <Link
      to={entry.team.id ? `/team/${entry.team.id}` : '/standings'}
      className={cn(
        'group flex items-stretch w-max min-w-full border-l-2 transition-colors text-xs sm:text-sm',
        ZONE_BORDER[entry.zone],
        isHome && 'border-l-accent',
        isAway && 'border-l-info'
      )}
    >
      <div className={cn(
        TEAM_COL, 'transition-colors',
        isHighlighted ? 'bg-surface-hover' : 'bg-surface group-hover:bg-surface-hover'
      )}>
        <span className={cn('w-6 shrink-0 text-center font-bold font-score', ZONE_RANK_TEXT[entry.zone])}>
          {entry.rank}
        </span>
        <img
          src={entry.team.badgeUrl ? getProxiedImageUrl(entry.team.badgeUrl) : FALLBACK_BADGE}
          alt=""
          loading="lazy"
          className="w-5 h-5 sm:w-6 sm:h-6 object-contain shrink-0"
          onError={(e) => { const img = e.currentTarget; img.onerror = null; img.src = FALLBACK_BADGE; }}
        />
        <span className={cn('flex-1 min-w-0 truncate font-medium', isHighlighted ? 'text-accent font-bold' : 'text-text-primary')}>
          {entry.team.name}
        </span>
      </div>

      <div className={cn(STATS_ROW, 'transition-colors group-hover:bg-surface-hover/70')}>
        <span className={cn(CELL.stat, 'text-text-secondary font-score')}>{val(entry.played)}</span>
        <span className={cn(CELL.stat, 'text-text-secondary font-score')}>{val(entry.wins)}</span>
        <span className={cn(CELL.stat, 'text-text-secondary font-score')}>{val(entry.draws)}</span>
        <span className={cn(CELL.stat, 'text-text-secondary font-score')}>{val(entry.losses)}</span>
        <span className={cn(CELL.wide, 'text-text-secondary font-score')}>{val(entry.goalsFor)}</span>
        <span className={cn(CELL.wide, 'text-text-secondary font-score')}>{val(entry.goalsAgainst)}</span>
        <span className={cn(
          CELL.gd, 'font-score font-semibold',
          gd === null ? 'text-text-secondary' : gd > 0 ? 'text-accent' : gd < 0 ? 'text-danger' : 'text-text-secondary'
        )}>
          {gd === null ? '–' : gd > 0 ? `+${gd}` : gd}
        </span>
        <span className={cn(CELL.pts, 'font-bold font-score text-text-primary text-sm')}>
          {val(entry.points)}
        </span>

        <div className={CELL.form}>
          {entry.form.slice(-5).map((result, i) => (
            <span
              key={i}
              title={result === 'W' ? 'Win' : result === 'L' ? 'Loss' : 'Draw'}
              className={cn(
                'w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0',
                result === 'W' ? 'bg-accent text-black' :
                result === 'L' ? 'bg-danger text-white' :
                'bg-text-muted/40 text-text-primary'
              )}
            >
              {result}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
};
