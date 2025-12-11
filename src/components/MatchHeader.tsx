import { MatchDetails } from '../types';
import { api } from '../services/api';
import { cn, isMatchLive, isMatchCompleted } from '../lib/utils';
import { format, parseISO } from 'date-fns';

interface MatchHeaderProps {
  match?: MatchDetails | null;
  loading?: boolean;
}

export const MatchHeader = ({ match, loading }: MatchHeaderProps) => {
  if (loading) {
    return <div className="w-full h-40 sm:h-48 bg-surface rounded-xl animate-pulse" />;
  }

  if (!match) return null;

  const isLive = isMatchLive(match.strStatus);
  const isFinished = isMatchCompleted(match.strStatus, match.intHomeScore, match.intAwayScore, match.dateEvent);
  const isUpcoming = !isLive && !isFinished;

  const formattedDate = format(parseISO(match.dateEvent), 'd MMM').toUpperCase();

  let statusText = match.strStatus;
  let statusClass = "bg-accent text-black";
  
  if (isFinished) {
    statusText = "Finished";
    statusClass = "bg-accent text-black";
  } else if (isLive) {
    statusText = match.strProgress || match.strStatus;
    statusClass = "bg-accent text-black";
  } else if (isUpcoming) {
    statusText = "Upcoming";
    statusClass = "bg-white/20 text-white";
  }

  return (
    <div className="w-full bg-surface rounded-xl p-4 sm:p-6">
      {/* Score Section */}
      <div className="flex items-start justify-between">
        {/* Home Team */}
        <div className="flex flex-col items-center gap-1.5 w-24 sm:w-32">
          <div className="relative">
            {/* Red card indicator */}
            {match.strHomeRedCards && (
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-3 bg-danger rounded-[1px]" />
            )}
            <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center">
              <img 
                src={match.strHomeTeamBadge || api.getTeamBadge(match.strHomeTeam)}
                onError={(e) => (e.target as HTMLImageElement).src = "https://www.thesportsdb.com/images/icons/user/anon.png"}
                alt={match.strHomeTeam} 
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          <span className="text-white font-medium text-xs sm:text-sm text-center leading-tight">
            {match.strHomeTeam}
          </span>
        </div>

        {/* Score & Status - Center */}
        <div className="flex flex-col items-center gap-1 flex-1">
          <span className="text-text-secondary text-[10px] sm:text-xs">{formattedDate}</span>
          
          {isUpcoming ? (
            <span className="text-xl sm:text-3xl font-bold text-white my-1">
              {match.strTime?.slice(0, 5)}
            </span>
          ) : (
            <div className="flex items-baseline gap-1.5 sm:gap-2 my-1">
              <span className="text-2xl sm:text-4xl font-bold text-white">
                {match.intHomeScore ?? 0}
              </span>
              <span className="text-lg sm:text-2xl text-text-secondary font-medium">-</span>
              <span className="text-2xl sm:text-4xl font-bold text-white">
                {match.intAwayScore ?? 0}
              </span>
            </div>
          )}
          
          <span className={cn(
            "px-2.5 py-0.5 rounded text-[10px] sm:text-xs font-semibold",
            statusClass
          )}>
            {statusText}
          </span>
        </div>

        {/* Away Team */}
        <div className="flex flex-col items-center gap-1.5 w-24 sm:w-32">
          <div className="relative">
            {match.strAwayRedCards && (
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-3 bg-danger rounded-[1px]" />
            )}
            <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center">
              <img 
                src={match.strAwayTeamBadge || api.getTeamBadge(match.strAwayTeam)}
                onError={(e) => (e.target as HTMLImageElement).src = "https://www.thesportsdb.com/images/icons/user/anon.png"}
                alt={match.strAwayTeam} 
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          <span className="text-white font-medium text-xs sm:text-sm text-center leading-tight">
            {match.strAwayTeam}
          </span>
        </div>
      </div>
    </div>
  );
};
