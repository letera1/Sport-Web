import { memo } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { TeamBadge } from './TeamBadge';
import type { SportMatch } from '../services/sportdb/models';

const timeLabel = (match: SportMatch): string => {
  if (match.state === 'live') return match.statusLabel ? `${match.statusLabel}'` : 'LIVE';
  if (match.state === 'finished') return 'FT';
  if (match.state === 'postponed') return 'PP';
  if (!match.kickoff) return '--:--';
  return new Date(match.kickoff).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

interface LiveMatchRowProps {
  match: SportMatch;
}

export const LiveMatchRow = memo(({ match }: LiveMatchRowProps) => {
  const isLive = match.state === 'live';
  const isFinished = match.state === 'finished';
  const hasScore = match.homeScore !== null && match.awayScore !== null;
  const homeWon = hasScore && match.homeScore! > match.awayScore!;
  const awayWon = hasScore && match.awayScore! > match.homeScore!;

  return (
    <Link
      to={`/match/${match.id}?src=sportdb`}
      state={{ sportMatch: match }}
      aria-label={`${match.home.name} versus ${match.away.name}`}
      className={cn(
        'flex items-center gap-3 px-3 sm:px-4 py-2.5 border-l-2 transition-colors',
        'hover:bg-surface-hover/60 focus-visible:outline-none focus-visible:bg-surface-hover/60',
        isLive ? 'border-l-live bg-live/[0.04]' : 'border-l-transparent'
      )}
    >
      <div className="w-11 sm:w-12 shrink-0 flex flex-col items-center gap-0.5">
        <span className={cn(
          'text-[11px] font-bold font-score tabular-nums',
          isLive ? 'text-live' : isFinished ? 'text-text-muted' : 'text-text-secondary'
        )}>
          {timeLabel(match)}
        </span>
        {isLive && <span className="live-dot" aria-label="Live" />}
      </div>

      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        {([
          { team: match.home, score: match.homeScore, won: homeWon },
          { team: match.away, score: match.awayScore, won: awayWon },
        ]).map(({ team, score, won }, i) => (
          <div key={i} className="flex items-center justify-between gap-2 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <TeamBadge name={team.name} badgeUrl={team.badgeUrl} className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className={cn(
                'truncate text-xs sm:text-sm',
                isFinished && !won ? 'text-text-secondary' : 'text-text-primary',
                won && 'font-semibold'
              )}>
                {team.name}
              </span>
            </div>
            <span className={cn(
              'shrink-0 w-5 text-right text-xs sm:text-sm font-bold font-score tabular-nums',
              isLive ? 'text-live' : won ? 'text-text-primary' : 'text-text-secondary'
            )}>
              {score ?? '–'}
            </span>
          </div>
        ))}
      </div>
    </Link>
  );
});

LiveMatchRow.displayName = 'LiveMatchRow';
