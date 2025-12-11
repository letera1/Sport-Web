import { MatchDetails as MatchDetailsType } from '../types';
import { Calendar, Clock, MapPin, Trophy, Info } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface MatchDetailsProps {
  match?: MatchDetailsType | null;
  error?: string | null;
}

export const MatchDetailsTab = ({ match, error }: MatchDetailsProps) => {
  // Show server error if there's an error
  if (error) {
    return (
      <div className="bg-surface rounded-b-lg p-4 sm:p-6 min-h-[300px] sm:min-h-[400px] flex flex-col items-center justify-center">
        <div className="text-center space-y-3 sm:space-y-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-danger/10 rounded-full flex items-center justify-center border border-danger/30">
            <span className="text-danger text-xl sm:text-2xl">!</span>
          </div>
          <h3 className="text-white font-medium text-base sm:text-lg">Server Error</h3>
          <p className="text-text-secondary text-xs sm:text-sm max-w-[250px]">
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (!match) return null;

  const formattedDate = match.dateEvent 
    ? format(parseISO(match.dateEvent), 'EEE, dd MMM yyyy')
    : 'TBD';

  return (
    <div className="bg-surface rounded-b-lg p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4 sm:mb-6">
        <h2 className="text-white font-medium text-sm sm:text-base">Match Information</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
        {/* Basic Info */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-white/5 rounded-lg border border-divider/30">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-accent mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="text-text-secondary text-[10px] sm:text-xs uppercase tracking-wide mb-0.5 sm:mb-1">Date</p>
              <p className="text-white text-sm sm:text-base">{formattedDate}</p>
            </div>
          </div>

          <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-white/5 rounded-lg border border-divider/30">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-accent mt-0.5 shrink-0" />
            <div>
              <p className="text-text-secondary text-[10px] sm:text-xs uppercase tracking-wide mb-0.5 sm:mb-1">Kick-off</p>
              <p className="text-white text-sm sm:text-base">{match.strTime?.slice(0, 5) || 'TBD'}</p>
            </div>
          </div>

          <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-white/5 rounded-lg border border-divider/30">
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-accent mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="text-text-secondary text-[10px] sm:text-xs uppercase tracking-wide mb-0.5 sm:mb-1">Competition</p>
              <p className="text-white text-sm sm:text-base truncate">{match.strLeague}</p>
              <p className="text-text-muted text-xs sm:text-sm">{match.strSeason}</p>
            </div>
          </div>

          <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-white/5 rounded-lg border border-divider/30">
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-accent mt-0.5 shrink-0" />
            <div>
              <p className="text-text-secondary text-[10px] sm:text-xs uppercase tracking-wide mb-0.5 sm:mb-1">Venue</p>
              <p className="text-white text-sm sm:text-base">Not available</p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="flex flex-col">
          <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-white/5 rounded-lg border border-divider/30 h-full">
            <Info className="w-4 h-4 sm:w-5 sm:h-5 text-accent mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="text-text-secondary text-[10px] sm:text-xs uppercase tracking-wide mb-1 sm:mb-2">Preview</p>
              {match.strDescriptionEN ? (
                <p className="text-white text-xs sm:text-sm leading-relaxed">{match.strDescriptionEN}</p>
              ) : (
                <p className="text-text-muted text-xs sm:text-sm">
                  {match.strHomeTeam} vs {match.strAwayTeam} in the {match.strLeague}. 
                  Details available closer to kick-off.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Video Highlight Link */}
      {match.strVideo && (
        <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-accent/10 rounded-lg border border-accent/30">
          <a 
            href={match.strVideo} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-accent hover:underline text-sm"
          >
            <span>Watch Highlights</span>
            <span>→</span>
          </a>
        </div>
      )}
    </div>
  );
};
