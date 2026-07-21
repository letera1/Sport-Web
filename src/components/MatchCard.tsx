import { memo } from 'react';
import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MatchEvent } from '../types';
import { cn, isMatchLive, isMatchCompleted } from '../lib/utils';
import { getProxiedImageUrl, FALLBACK_BADGE } from '../services/sportsApi';
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
    ? (match.strProgress || match.strStatus || 'LIVE') 
    : (isFinished ? "FT" : match.strTime?.slice(0, 5) || '--:--');

  return (
    <div 
      onClick={() => navigate(`/match/${match.idEvent}`, { state: { match } })}
      className={cn(
        "group flex items-center gap-3 px-3.5 py-2.5 hover:bg-surface-hover/70 transition-all cursor-pointer border-l-2 select-none",
        isLive ? "border-l-live bg-live/5" : "border-l-transparent"
      )}
    >
      {/* Time / Status Column */}
      <div className="w-12 sm:w-14 shrink-0 flex flex-col items-center justify-center text-center border-r border-border/40 pr-2">
        <span className={cn(
          "text-xs font-bold font-score",
          isLive ? "text-live" : isFinished ? "text-text-muted" : "text-text-secondary"
        )}>
          {displayStatus}
        </span>
        {isLive && (
          <div className="mt-0.5">
            <span className="live-dot" />
          </div>
        )}
      </div>

      {/* Teams Column */}
      <div className="flex-1 flex flex-col gap-1.5 min-w-0">
        {/* Home Team Row */}
        <div className="flex items-center justify-between gap-2 min-w-0">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <img 
              src={getProxiedImageUrl(match.strHomeTeamBadge)}
              onError={(e) => { 
                const img = e.currentTarget;
                img.onerror = null;
                img.src = FALLBACK_BADGE; 
              }}
              alt={match.strHomeTeam} 
              className="w-4 h-4 sm:w-5 sm:h-5 object-contain shrink-0" 
            />
            <span className={cn(
              "text-xs sm:text-sm truncate font-medium",
              isFinished && match.intHomeScore !== null && match.intAwayScore !== null && Number(match.intHomeScore) > Number(match.intAwayScore)
                ? "text-white font-bold"
                : "text-text-primary"
            )}>
              {match.strHomeTeam}
            </span>
          </div>
          <span className={cn(
            "text-xs sm:text-sm font-bold font-score shrink-0 w-5 text-right",
            isLive ? "text-live" : "text-white"
          )}>
            {match.intHomeScore ?? "-"}
          </span>
        </div>

        {/* Away Team Row */}
        <div className="flex items-center justify-between gap-2 min-w-0">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <img 
              src={getProxiedImageUrl(match.strAwayTeamBadge)}
              onError={(e) => { 
                const img = e.currentTarget;
                img.onerror = null;
                img.src = FALLBACK_BADGE; 
              }}
              alt={match.strAwayTeam} 
              className="w-4 h-4 sm:w-5 sm:h-5 object-contain shrink-0" 
            />
            <span className={cn(
              "text-xs sm:text-sm truncate font-medium",
              isFinished && match.intHomeScore !== null && match.intAwayScore !== null && Number(match.intAwayScore) > Number(match.intHomeScore)
                ? "text-white font-bold"
                : "text-text-primary"
            )}>
              {match.strAwayTeam}
            </span>
          </div>
          <span className={cn(
            "text-xs sm:text-sm font-bold font-score shrink-0 w-5 text-right",
            isLive ? "text-live" : "text-white"
          )}>
            {match.intAwayScore ?? "-"}
          </span>
        </div>
      </div>

      {/* Favorite Action */}
      <button 
        onClick={(e) => { e.stopPropagation(); toggleMatchFavorite(match.idEvent); }}
        className="p-1.5 hover:bg-surface-hover rounded-full text-text-muted hover:text-danger transition-colors shrink-0 ml-1"
        title={isFav ? "Remove favorite" : "Add favorite"}
      >
        <Heart className={cn("w-3.5 h-3.5 transition-all", isFav ? "fill-danger text-danger scale-110" : "group-hover:text-text-secondary")} />
      </button>
    </div>
  );
});
