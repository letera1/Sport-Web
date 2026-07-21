import { memo } from 'react';
import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MatchEvent } from '../types';
import { cn, isMatchLive, isMatchCompleted } from '../lib/utils';
import { getTeamBadgeUrl, FALLBACK_BADGE } from '../services/sportsApi';
import { useFavorites } from '../contexts/FavoritesContext';

interface MatchCardProps {
  match: MatchEvent;
}

export const MatchCard = memo(({ match }: MatchCardProps) => {
  const navigate = useNavigate();
  const { isMatchFavorite, toggleMatchFavorite } = useFavorites();
  const isFav = isMatchFavorite(match.idEvent);

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
        "flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-3 hover:bg-surface-hover transition-all cursor-pointer border-l-[3px] group",
        borderColor
      )}
    >
      {/* Status */}
      <div className="w-12 sm:w-14 shrink-0 text-center">
        <span className={cn("text-xs sm:text-sm font-semibold", statusColor)}>
          {displayStatus}
        </span>
        {isLive && (
          <div className="flex items-center justify-center mt-1">
            <div className="live-dot" />
          </div>
        )}
      </div>

      {/* Teams */}
      <div className="flex-1 flex flex-col gap-2 min-w-0">
        {/* Home Team */}
        <div className="flex items-center gap-2">
          <img 
            src={match.strHomeTeamBadge || getTeamBadgeUrl(match.strHomeTeam)}
            onError={(e) => { 
              const img = e.currentTarget;
              img.onerror = null;
              img.src = FALLBACK_BADGE; 
            }}
            alt={match.strHomeTeam} 
            className="w-5 h-5 object-contain shrink-0" 
          />
          <span className="text-text-primary text-sm truncate flex-1">{match.strHomeTeam}</span>
        </div>

        {/* Away Team */}
        <div className="flex items-center gap-2">
          <img 
            src={match.strAwayTeamBadge || getTeamBadgeUrl(match.strAwayTeam)}
            onError={(e) => { 
              const img = e.currentTarget;
              img.onerror = null;
              img.src = FALLBACK_BADGE; 
            }}
            alt={match.strAwayTeam} 
            className="w-5 h-5 object-contain shrink-0" 
          />
          <span className="text-text-primary text-sm truncate flex-1">{match.strAwayTeam}</span>
        </div>
      </div>

      {/* Scores */}
      <div className="flex flex-col gap-2 items-end shrink-0">
        <span className="text-text-primary font-bold text-sm w-6 text-right">
          {match.intHomeScore ?? "-"}
        </span>
        <span className="text-text-primary font-bold text-sm w-6 text-right">
          {match.intAwayScore ?? "-"}
        </span>
      </div>

      {/* Favorite Button */}
      <button 
        onClick={(e) => { e.stopPropagation(); toggleMatchFavorite(match.idEvent); }}
        className="p-1 hover:bg-surface-hover rounded text-text-muted transition-colors shrink-0"
      >
        <Heart className={cn("w-4 h-4 transition-colors", isFav ? "fill-danger text-danger" : "group-hover:text-text-secondary")} />
      </button>
    </div>
  );
});
