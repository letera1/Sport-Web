import { MatchDetails } from '../types';
import { api } from '../services/api';
import { Users } from 'lucide-react';

interface MatchLineupsProps {
  match?: MatchDetails | null;
  error?: string | null;
}

interface LineupSectionProps {
  title: string;
  players: string[];
  teamBadge?: string;
  teamName: string;
}

const LineupSection = ({ title, players }: LineupSectionProps) => (
  <div className="flex flex-col gap-2">
    <span className="text-[10px] sm:text-xs text-text-secondary uppercase tracking-wide font-medium">{title}</span>
    {players.length > 0 ? (
      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        {players.map((player, idx) => (
          <span 
            key={idx}
            className="px-2 sm:px-3 py-1 sm:py-1.5 bg-white/5 rounded-lg text-xs sm:text-sm text-white border border-divider/50"
          >
            {player.trim()}
          </span>
        ))}
      </div>
    ) : (
      <span className="text-text-muted text-xs sm:text-sm">Not available</span>
    )}
  </div>
);

export const MatchLineups = ({ match, error }: MatchLineupsProps) => {
  if (error) {
    return (
      <div className="p-6 min-h-[250px] flex flex-col items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 mx-auto bg-danger/10 rounded-full flex items-center justify-center border border-danger/30">
            <span className="text-danger text-lg">!</span>
          </div>
          <h3 className="text-white font-medium text-sm">Server Error</h3>
          <p className="text-text-secondary text-xs max-w-[200px]">{error}</p>
        </div>
      </div>
    );
  }

  if (!match) return null;

  const parseLineup = (str: string | undefined): string[] => {
    if (!str) return [];
    return str.split(';').map(s => s.trim()).filter(Boolean);
  };

  const homeGK = parseLineup(match.strHomeLineupGoalkeeper);
  const homeDef = parseLineup(match.strHomeLineupDefense);
  const homeMid = parseLineup(match.strHomeLineupMidfield);
  const homeFwd = parseLineup(match.strHomeLineupForward);

  const awayGK = parseLineup(match.strAwayLineupGoalkeeper);
  const awayDef = parseLineup(match.strAwayLineupDefense);
  const awayMid = parseLineup(match.strAwayLineupMidfield);
  const awayFwd = parseLineup(match.strAwayLineupForward);

  const hasHomeLineup = homeGK.length || homeDef.length || homeMid.length || homeFwd.length;
  const hasAwayLineup = awayGK.length || awayDef.length || awayMid.length || awayFwd.length;

  if (!hasHomeLineup && !hasAwayLineup) {
    return (
      <div className="bg-surface rounded-b-lg p-4 sm:p-6 min-h-[300px] sm:min-h-[400px] flex flex-col items-center justify-center">
        <div className="text-center space-y-3 sm:space-y-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-white/5 rounded-full flex items-center justify-center border border-divider">
            <Users className="w-6 h-6 sm:w-8 sm:h-8 text-text-secondary" />
          </div>
          <h3 className="text-white font-medium text-base sm:text-lg">Lineups Not Available</h3>
          <p className="text-text-secondary text-xs sm:text-sm">
            Lineup information will be available closer to kick-off.
          </p>
        </div>
      </div>
    );
  }

  const homeBadge = match.strHomeTeamBadge || api.getTeamBadge(match.strHomeTeam);
  const awayBadge = match.strAwayTeamBadge || api.getTeamBadge(match.strAwayTeam);

  return (
    <div className="bg-surface rounded-b-lg p-4 sm:p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {/* Home Team */}
        <div className="flex flex-col gap-4 sm:gap-6">
          <div className="flex items-center gap-2 sm:gap-3 pb-2 sm:pb-3 border-b border-divider">
            <img 
              src={homeBadge}
              alt={match.strHomeTeam}
              onError={(e) => (e.target as HTMLImageElement).src = "https://www.thesportsdb.com/images/icons/user/anon.png"}
              className="w-6 h-6 sm:w-8 sm:h-8 object-contain"
            />
            <span className="text-white font-medium text-sm sm:text-base">{match.strHomeTeam}</span>
          </div>
          <LineupSection title="Goalkeeper" players={homeGK} teamBadge={homeBadge} teamName={match.strHomeTeam} />
          <LineupSection title="Defense" players={homeDef} teamBadge={homeBadge} teamName={match.strHomeTeam} />
          <LineupSection title="Midfield" players={homeMid} teamBadge={homeBadge} teamName={match.strHomeTeam} />
          <LineupSection title="Forward" players={homeFwd} teamBadge={homeBadge} teamName={match.strHomeTeam} />
        </div>

        {/* Away Team */}
        <div className="flex flex-col gap-4 sm:gap-6">
          <div className="flex items-center gap-2 sm:gap-3 pb-2 sm:pb-3 border-b border-divider">
            <img 
              src={awayBadge}
              alt={match.strAwayTeam}
              onError={(e) => (e.target as HTMLImageElement).src = "https://www.thesportsdb.com/images/icons/user/anon.png"}
              className="w-6 h-6 sm:w-8 sm:h-8 object-contain"
            />
            <span className="text-white font-medium text-sm sm:text-base">{match.strAwayTeam}</span>
          </div>
          <LineupSection title="Goalkeeper" players={awayGK} teamBadge={awayBadge} teamName={match.strAwayTeam} />
          <LineupSection title="Defense" players={awayDef} teamBadge={awayBadge} teamName={match.strAwayTeam} />
          <LineupSection title="Midfield" players={awayMid} teamBadge={awayBadge} teamName={match.strAwayTeam} />
          <LineupSection title="Forward" players={awayFwd} teamBadge={awayBadge} teamName={match.strAwayTeam} />
        </div>
      </div>
    </div>
  );
};
