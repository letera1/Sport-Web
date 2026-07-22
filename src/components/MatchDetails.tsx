import { MatchDetails as MatchDetailsType } from '../types';
import { Calendar, Clock, MapPin, Trophy, Info } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface MatchDetailsProps {
  match?: MatchDetailsType | null;
  error?: string | null;
}

export const MatchDetailsTab = ({ match, error }: MatchDetailsProps) => {
  if (error) {
    return (
      <div className="bg-surface rounded-b-lg p-4 sm:p-6 min-h-[300px] sm:min-h-[400px] flex flex-col items-center justify-center">
        <div className="text-center space-y-3 sm:space-y-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-danger/10 rounded-full flex items-center justify-center border border-danger/30">
            <span className="text-danger text-xl sm:text-2xl">!</span>
          </div>
          <h3 className="text-text-primary font-medium text-base sm:text-lg">Server Error</h3>
          <p className="text-text-secondary text-xs sm:text-sm max-w-[250px]">{error}</p>
        </div>
      </div>
    );
  }

  if (!match) return null;

  const formattedDate = match.dateEvent 
    ? format(parseISO(match.dateEvent), 'EEE, dd MMM yyyy')
    : 'TBD';

  const venueText = match.strVenue || (match.strCountry ? `Stadium in ${match.strCountry}` : 'Main Stadium');

  return (
    <div className="bg-surface rounded-b-lg p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-divider">
        <h2 className="text-text-primary font-semibold text-base">Match Information & Context</h2>
        {match.intRound && (
          <span className="px-2.5 py-1 bg-accent/10 text-accent rounded-full text-xs font-bold border border-divider">
            Round {match.intRound}
          </span>
        )}
      </div>

      {/* Media Thumb Banner */}
      {match.strThumb && (
        <div className="w-full h-44 sm:h-64 rounded-xl overflow-hidden border border-divider shadow-lg relative bg-surface-hover">
          <img
            src={match.strThumb}
            alt={match.strEvent}
            className="w-full h-full object-cover"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-4">
            <div>
              <p className="text-white font-bold text-lg">{match.strHomeTeam} vs {match.strAwayTeam}</p>
              <p className="text-accent text-xs">{match.strLeague} ({match.strSeason})</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Basic Info */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3.5 bg-surface-hover/50 rounded-xl border border-divider/40">
            <Calendar className="w-5 h-5 text-accent shrink-0" />
            <div>
              <p className="text-text-secondary text-[10px] uppercase tracking-wide">Date</p>
              <p className="text-text-primary text-sm font-medium">{formattedDate}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 bg-surface-hover/50 rounded-xl border border-divider/40">
            <Clock className="w-5 h-5 text-accent shrink-0" />
            <div>
              <p className="text-text-secondary text-[10px] uppercase tracking-wide">Kick-off Time</p>
              <p className="text-text-primary text-sm font-medium">{match.strTime?.slice(0, 5) || 'TBD'} UTC</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 bg-surface-hover/50 rounded-xl border border-divider/40">
            <Trophy className="w-5 h-5 text-accent shrink-0" />
            <div className="min-w-0">
              <p className="text-text-secondary text-[10px] uppercase tracking-wide">Competition & Season</p>
              <p className="text-text-primary text-sm font-medium truncate">{match.strLeague}</p>
              <p className="text-text-muted text-xs">{match.strSeason}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 bg-surface-hover/50 rounded-xl border border-divider/40">
            <MapPin className="w-5 h-5 text-accent shrink-0" />
            <div>
              <p className="text-text-secondary text-[10px] uppercase tracking-wide">Venue & Location</p>
              <p className="text-text-primary text-sm font-medium">{venueText}</p>
              {match.strCountry && <p className="text-text-muted text-xs">{match.strCountry}</p>}
            </div>
          </div>
        </div>

        {/* Description / Broadcast */}
        <div className="flex flex-col gap-3">
          <div className="flex-1 flex items-start gap-3 p-4 bg-surface-hover/50 rounded-xl border border-divider/40">
            <Info className="w-5 h-5 text-accent mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="text-text-secondary text-[10px] uppercase tracking-wide mb-1.5 font-medium">Match Overview</p>
              {match.strDescriptionEN ? (
                <p className="text-text-primary text-xs leading-relaxed max-h-48 overflow-y-auto pr-1">{match.strDescriptionEN}</p>
              ) : (
                <p className="text-text-secondary text-xs leading-relaxed">
                  Official match between {match.strHomeTeam} and {match.strAwayTeam} competing in the {match.strLeague} ({match.strSeason} season).
                </p>
              )}
            </div>
          </div>

          {match.strTVStation && (
            <div className="p-3.5 bg-surface-hover/50 rounded-xl border border-divider/40 flex items-center justify-between">
              <span className="text-text-secondary text-xs">Official Broadcast:</span>
              <span className="text-accent text-xs font-bold px-2.5 py-1 bg-accent/10 rounded-md border border-accent/30">
                {match.strTVStation}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Video Highlight Link */}
      {match.strVideo && (
        <div className="p-4 bg-accent/10 rounded-xl border border-accent/30 flex items-center justify-between">
          <span className="text-text-primary text-xs font-semibold">Match Video & Highlights Available</span>
          <a 
            href={match.strVideo} 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-accent text-black rounded-lg text-xs font-bold hover:bg-accent/90 transition-colors flex items-center gap-1"
          >
            <span>Watch Video</span>
            <span>→</span>
          </a>
        </div>
      )}
    </div>
  );
};
