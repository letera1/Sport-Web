import { MatchDetails } from '../types';
import { BarChart3 } from 'lucide-react';
import { cn } from '../lib/utils';

interface MatchStatsProps {
  match?: MatchDetails | null;
  error?: string | null;
}

interface StatBarProps {
  label: string;
  homeValue: number;
  awayValue: number;
  suffix?: string;
}

const StatBar = ({ label, homeValue, awayValue, suffix = '' }: StatBarProps) => {
  const total = homeValue + awayValue || 1;
  const homePercent = (homeValue / total) * 100;
  const awayPercent = (awayValue / total) * 100;

  return (
    <div className="flex flex-col gap-1.5 sm:gap-2">
      <div className="flex items-center justify-between text-xs sm:text-sm">
        <span className="text-white font-medium">{homeValue}{suffix}</span>
        <span className="text-text-secondary text-[10px] sm:text-sm">{label}</span>
        <span className="text-white font-medium">{awayValue}{suffix}</span>
      </div>
      <div className="flex h-1.5 sm:h-2 gap-1">
        <div className="flex-1 bg-white/10 rounded-l-full overflow-hidden flex justify-end">
          <div 
            className={cn(
              "h-full rounded-l-full transition-all",
              homeValue >= awayValue ? "bg-accent" : "bg-white/30"
            )}
            style={{ width: `${homePercent}%` }}
          />
        </div>
        <div className="flex-1 bg-white/10 rounded-r-full overflow-hidden">
          <div 
            className={cn(
              "h-full rounded-r-full transition-all",
              awayValue >= homeValue ? "bg-accent" : "bg-white/30"
            )}
            style={{ width: `${awayPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export const MatchStats = ({ match, error }: MatchStatsProps) => {
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

  // Parse goals from details to calculate stats
  const countEvents = (str: string | undefined): number => {
    if (!str) return 0;
    return str.split(';').filter(s => s.trim()).length;
  };

  const homeGoals = parseInt(match.intHomeScore || '0') || 0;
  const awayGoals = parseInt(match.intAwayScore || '0') || 0;
  const homeYellows = countEvents(match.strHomeYellowCards);
  const awayYellows = countEvents(match.strAwayYellowCards);
  const homeReds = countEvents(match.strHomeRedCards);
  const awayReds = countEvents(match.strAwayRedCards);

  // Check if match has any meaningful stats
  const hasStats = homeGoals || awayGoals || homeYellows || awayYellows || homeReds || awayReds;

  if (!hasStats) {
    return (
      <div className="bg-surface rounded-b-lg p-4 sm:p-6 min-h-[300px] sm:min-h-[400px] flex flex-col items-center justify-center">
        <div className="text-center space-y-3 sm:space-y-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-white/5 rounded-full flex items-center justify-center border border-divider">
            <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-text-secondary" />
          </div>
          <h3 className="text-white font-medium text-base sm:text-lg">No Statistics Available</h3>
          <p className="text-text-secondary text-xs sm:text-sm">
            Match statistics will appear here once the match begins.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-b-lg p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4 sm:mb-8">
        <h2 className="text-white font-medium text-sm sm:text-base">Match Statistics</h2>
      </div>

      <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
        <StatBar label="Goals" homeValue={homeGoals} awayValue={awayGoals} />
        <StatBar label="Yellow Cards" homeValue={homeYellows} awayValue={awayYellows} />
        <StatBar label="Red Cards" homeValue={homeReds} awayValue={awayReds} />
      </div>
    </div>
  );
};
