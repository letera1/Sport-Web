import { MatchDetails } from '../types';
import { getProxiedImageUrl, FALLBACK_BADGE } from '../services/sportsApi';
import { cn, isMatchLive, isMatchCompleted } from '../lib/utils';
import { format, parseISO } from 'date-fns';
import { Trophy, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MatchHeaderProps {
  match?: MatchDetails | null;
  loading?: boolean;
}

export const MatchHeader = ({ match, loading }: MatchHeaderProps) => {
  const navigate = useNavigate();

  if (loading) {
    return <div className="w-full h-44 sm:h-52 bg-surface rounded-xl animate-pulse border border-border/50" />;
  }

  if (!match) return null;

  const isLive = isMatchLive(match.strStatus);
  const isFinished = isMatchCompleted(match.strStatus, match.intHomeScore, match.intAwayScore, match.dateEvent);
  const isUpcoming = !isLive && !isFinished;

  const formattedDate = match.dateEvent ? format(parseISO(match.dateEvent), 'EEE, d MMM yyyy') : '';

  let statusText = match.strStatus;
  let statusBadgeClass = "bg-surface-hover text-text-primary border-border/50";
  
  if (isFinished) {
    statusText = "Full Time";
    statusBadgeClass = "bg-surface-hover text-text-secondary border-border/50";
  } else if (isLive) {
    statusText = match.strProgress || match.strStatus || 'LIVE';
    statusBadgeClass = "bg-live/20 text-live border-live/40 shadow-glow-live animate-pulse";
  } else if (isUpcoming) {
    statusText = match.strTime?.slice(0, 5) || "Upcoming";
    statusBadgeClass = "bg-accent/15 text-accent border-accent/30";
  }

  return (
    <div className="w-full bg-surface rounded-xl p-4 sm:p-6 border border-border/60 shadow-card space-y-4 relative overflow-hidden">
      {/* Background Subtle Gradient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-accent/5 blur-3xl pointer-events-none rounded-full" />

      {/* Top Competition Bar */}
      <div className="flex items-center justify-between text-xs border-b border-border/40 pb-3">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-accent" />
          <span className="text-text-primary font-bold font-display">{match.strLeague}</span>
          {match.strSeason && <span className="text-text-muted">({match.strSeason})</span>}
          {match.intRound && (
            <span className="text-[10px] px-2 py-0.5 rounded bg-surface-hover text-text-secondary font-medium">
              Round {match.intRound}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-text-muted text-[11px]">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formattedDate}</span>
        </div>
      </div>

      {/* Teams & Score Section */}
      <div className="flex items-center justify-between gap-4 py-2">
        {/* Home Team */}
        <div 
          onClick={() => match.idHomeTeam && navigate(`/team/${match.idHomeTeam}`)}
          className="flex flex-col items-center gap-2 flex-1 cursor-pointer group"
        >
          <div className="w-14 h-14 sm:w-20 sm:h-20 flex items-center justify-center p-1 bg-surface-hover/30 rounded-2xl border border-border/40 group-hover:border-accent/40 transition-colors">
            <img 
              src={getProxiedImageUrl(match.strHomeTeamBadge)}
              onError={(e) => { const img = e.currentTarget; img.onerror = null; img.src = FALLBACK_BADGE; }}
              alt={match.strHomeTeam} 
              className="w-full h-full object-contain filter drop-shadow"
            />
          </div>
          <span className="text-text-primary font-bold text-xs sm:text-base text-center leading-tight group-hover:text-accent transition-colors">
            {match.strHomeTeam}
          </span>
        </div>

        {/* Center Score & Status Display */}
        <div className="flex flex-col items-center gap-2 shrink-0 px-2">
          {isUpcoming ? (
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-4xl font-extrabold text-text-primary font-display tracking-tight">
                {match.strTime?.slice(0, 5) || 'VS'}
              </span>
              <span className="text-[11px] text-text-muted mt-1">Kick-off</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-4">
              <span className={cn(
                "text-3xl sm:text-5xl font-extrabold font-score tracking-tight",
                isFinished && Number(match.intHomeScore) > Number(match.intAwayScore) ? "text-accent" : "text-text-primary"
              )}>
                {match.intHomeScore ?? 0}
              </span>
              <span className="text-xl sm:text-3xl text-text-muted font-bold">-</span>
              <span className={cn(
                "text-3xl sm:text-5xl font-extrabold font-score tracking-tight",
                isFinished && Number(match.intAwayScore) > Number(match.intHomeScore) ? "text-accent" : "text-text-primary"
              )}>
                {match.intAwayScore ?? 0}
              </span>
            </div>
          )}
          
          <span className={cn(
            "px-3 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider",
            statusBadgeClass
          )}>
            {statusText}
          </span>
        </div>

        {/* Away Team */}
        <div 
          onClick={() => match.idAwayTeam && navigate(`/team/${match.idAwayTeam}`)}
          className="flex flex-col items-center gap-2 flex-1 cursor-pointer group"
        >
          <div className="w-14 h-14 sm:w-20 sm:h-20 flex items-center justify-center p-1 bg-surface-hover/30 rounded-2xl border border-border/40 group-hover:border-accent/40 transition-colors">
            <img 
              src={getProxiedImageUrl(match.strAwayTeamBadge)}
              onError={(e) => { const img = e.currentTarget; img.onerror = null; img.src = FALLBACK_BADGE; }}
              alt={match.strAwayTeam} 
              className="w-full h-full object-contain filter drop-shadow"
            />
          </div>
          <span className="text-text-primary font-bold text-xs sm:text-base text-center leading-tight group-hover:text-accent transition-colors">
            {match.strAwayTeam}
          </span>
        </div>
      </div>
    </div>
  );
};
