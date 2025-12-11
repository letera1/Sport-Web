import { memo } from 'react';
import { MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MatchEvent } from '../types';
import { cn, isMatchLive, isMatchCompleted } from '../lib/utils';
import { api } from '../services/api';

interface MatchCardProps {
  match: MatchEvent;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
}

export const MatchCard = memo(({ match }: MatchCardProps) => {
  const navigate = useNavigate();

  const isLive = isMatchLive(match.strStatus);
  const isFinished = isMatchCompleted(match.strStatus, match.intHomeScore, match.intAwayScore, match.dateEvent);
  
  const displayStatus = isLive 
    ? (match.strProgress || match.strStatus) 
    : (isFinished ? "FT" : match.strTime?.slice(0, 5) || '--:--');
  
  const statusColor = isLive ? "text-accent" : (isFinished ? "text-danger" : "text-text-secondary");
  const borderColor = isLive ? "border-l-accent" : (isFinished ? "border-l-danger" : "border-l-transparent");

  return (
    <div 
      onClick={() => navigate(`/match/${match.idEvent}`, { state: { match } })}
      className={cn(
        "flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer border-l-[3px]",
        borderColor
      )}
    >
      {/* Status */}
      <div className="w-12 sm:w-14 shrink-0 text-center">
        <span className={cn("text-xs sm:text-sm font-semibold", statusColor)}>
          {displayStatus}
        </span>
        {isLive && (
          <div className="h-0.5 w-6 bg-accent mx-auto mt-1 rounded-full" />
        )}
      </div>

      {/* Teams */}
      <div className="flex-1 flex flex-col gap-2 min-w-0">
        {/* Home Team */}
        <div className="flex items-center gap-2">
          <img 
            src={match.strHomeTeamBadge || api.getTeamBadge(match.strHomeTeam)}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://www.thesportsdb.com/images/icons/user/anon.png";
            }}
            alt={match.strHomeTeam} 
            className="w-5 h-5 object-contain shrink-0" 
          />
          <span className="text-white text-sm truncate flex-1">{match.strHomeTeam}</span>
        </div>

        {/* Away Team */}
        <div className="flex items-center gap-2">
          <img 
            src={match.strAwayTeamBadge || api.getTeamBadge(match.strAwayTeam)}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://www.thesportsdb.com/images/icons/user/anon.png";
            }}
            alt={match.strAwayTeam} 
            className="w-5 h-5 object-contain shrink-0" 
          />
          <span className="text-white text-sm truncate flex-1">{match.strAwayTeam}</span>
        </div>
      </div>

      {/* Scores */}
      <div className="flex flex-col gap-2 items-end shrink-0">
        <span className="text-white font-bold text-sm w-6 text-right">
          {match.intHomeScore ?? "-"}
        </span>
        <span className="text-white font-bold text-sm w-6 text-right">
          {match.intAwayScore ?? "-"}
        </span>
      </div>

      {/* More Button */}
      <button 
        onClick={(e) => e.stopPropagation()}
        className="p-1 hover:bg-white/10 rounded text-text-secondary transition-colors shrink-0"
      >
        <MoreVertical className="w-4 h-4" />
      </button>
    </div>
  );
});
