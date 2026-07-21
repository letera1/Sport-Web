import { MatchDetails, EventLineup } from '../types';
import { getProxiedImageUrl, FALLBACK_BADGE } from '../services/sportsApi';
import { Users } from 'lucide-react';
import { useMemo } from 'react';

interface MatchLineupsProps {
  match?: MatchDetails | null;
  lineup?: EventLineup[];
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

const LineupPlayerCard = ({ player }: { player: EventLineup }) => (
  <div className="flex items-center gap-2.5 px-3 py-2 bg-white/5 rounded-xl border border-divider/50 hover:bg-surface-hover/50 transition-colors">
    <div className="w-8 h-8 rounded-full overflow-hidden bg-surface-hover shrink-0 flex items-center justify-center border border-divider">
      <img
        src={player.strPlayerCutout || player.strPlayerThumb ? getProxiedImageUrl(player.strPlayerCutout || player.strPlayerThumb) : FALLBACK_BADGE}
        alt={player.strPlayer}
        className="w-full h-full object-cover"
        onError={(e) => { const img = e.currentTarget; img.onerror = null; img.src = FALLBACK_BADGE; }}
      />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-white text-xs font-semibold truncate">{player.strPlayer}</p>
      <p className="text-text-secondary text-[10px] truncate">{player.strPosition || 'Player'}</p>
    </div>
    {player.intSquadNumber && (
      <span className="text-accent text-xs font-bold shrink-0">#{player.intSquadNumber}</span>
    )}
  </div>
);

export const MatchLineups = ({ match, lineup, error }: MatchLineupsProps) => {
  const homeBadge = getProxiedImageUrl(match?.strHomeTeamBadge);
  const awayBadge = getProxiedImageUrl(match?.strAwayTeamBadge);

  // Group API Lineup data if present
  const groupedLineup = useMemo(() => {
    if (!lineup || lineup.length === 0) return null;

    return {
      homeStarters: lineup.filter(p => p.strHome === 'Yes' && p.strSubstitute === 'No'),
      homeSubs: lineup.filter(p => p.strHome === 'Yes' && p.strSubstitute === 'Yes'),
      awayStarters: lineup.filter(p => p.strHome === 'No' && p.strSubstitute === 'No'),
      awaySubs: lineup.filter(p => p.strHome === 'No' && p.strSubstitute === 'Yes'),
    };
  }, [lineup]);

  if (error) {
    return (
      <div className="p-6 min-h-[250px] flex flex-col items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 mx-auto bg-danger/10 rounded-full flex items-center justify-center border border-danger/30">
            <span className="text-danger text-lg">!</span>
          </div>
          <h3 className="text-white font-medium text-sm">Server Error</h3>
          <p className="text-text-secondary text-xs max-w-[200px]">{error}</p>
        </div>
      </div>
    );
  }

  if (!match) return null;

  // Fallback to text parsed lineups (for soccer matches without rich lineup API)
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

  const hasTextLineup = homeGK.length || homeDef.length || homeMid.length || homeFwd.length || 
                        awayGK.length || awayDef.length || awayMid.length || awayFwd.length;

  if (!groupedLineup && !hasTextLineup) {
    return (
      <div className="bg-surface rounded-b-lg p-4 sm:p-6 min-h-[300px] sm:min-h-[400px] flex flex-col items-center justify-center">
        <div className="text-center space-y-3 sm:space-y-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-white/5 rounded-full flex items-center justify-center border border-divider">
            <Users className="w-6 h-6 sm:w-8 sm:h-8 text-text-secondary" />
          </div>
          <h3 className="text-white font-medium text-base sm:text-lg">Lineups Not Available</h3>
          <p className="text-text-secondary text-xs sm:text-sm">
            Lineup information will be available closer to event start.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-b-lg p-4 sm:p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        
        {/* Home Team Column */}
        <div className="flex flex-col gap-4 sm:gap-6">
          <div className="flex items-center gap-2 sm:gap-3 pb-2 sm:pb-3 border-b border-divider">
            <img 
              src={homeBadge}
              alt={match.strHomeTeam}
              onError={(e) => { const img = e.currentTarget; img.onerror = null; img.src = FALLBACK_BADGE; }}
              className="w-6 h-6 sm:w-8 sm:h-8 object-contain"
            />
            <span className="text-white font-semibold text-sm sm:text-base">{match.strHomeTeam}</span>
          </div>

          {groupedLineup ? (
            <div className="flex flex-col gap-6">
              {/* Starters */}
              <div className="flex flex-col gap-3">
                <span className="text-[10px] sm:text-xs text-text-secondary uppercase tracking-wide font-medium">Starting Lineup ({groupedLineup.homeStarters.length})</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {groupedLineup.homeStarters.map(player => (
                    <LineupPlayerCard key={player.idLineup} player={player} />
                  ))}
                </div>
              </div>
              
              {/* Subs */}
              {groupedLineup.homeSubs.length > 0 && (
                <div className="flex flex-col gap-3">
                  <span className="text-[10px] sm:text-xs text-text-secondary uppercase tracking-wide font-medium">Substitutes</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {groupedLineup.homeSubs.map(player => (
                      <LineupPlayerCard key={player.idLineup} player={player} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <LineupSection title="Goalkeeper" players={homeGK} teamBadge={homeBadge} teamName={match.strHomeTeam} />
              <LineupSection title="Defense" players={homeDef} teamBadge={homeBadge} teamName={match.strHomeTeam} />
              <LineupSection title="Midfield" players={homeMid} teamBadge={homeBadge} teamName={match.strHomeTeam} />
              <LineupSection title="Forward" players={homeFwd} teamBadge={homeBadge} teamName={match.strHomeTeam} />
            </>
          )}
        </div>

        {/* Away Team Column */}
        <div className="flex flex-col gap-4 sm:gap-6">
          <div className="flex items-center gap-2 sm:gap-3 pb-2 sm:pb-3 border-b border-divider">
            <img 
              src={awayBadge}
              alt={match.strAwayTeam}
              onError={(e) => { const img = e.currentTarget; img.onerror = null; img.src = FALLBACK_BADGE; }}
              className="w-6 h-6 sm:w-8 sm:h-8 object-contain"
            />
            <span className="text-white font-semibold text-sm sm:text-base">{match.strAwayTeam}</span>
          </div>

          {groupedLineup ? (
            <div className="flex flex-col gap-6">
              {/* Starters */}
              <div className="flex flex-col gap-3">
                <span className="text-[10px] sm:text-xs text-text-secondary uppercase tracking-wide font-medium">Starting Lineup ({groupedLineup.awayStarters.length})</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {groupedLineup.awayStarters.map(player => (
                    <LineupPlayerCard key={player.idLineup} player={player} />
                  ))}
                </div>
              </div>
              
              {/* Subs */}
              {groupedLineup.awaySubs.length > 0 && (
                <div className="flex flex-col gap-3">
                  <span className="text-[10px] sm:text-xs text-text-secondary uppercase tracking-wide font-medium">Substitutes</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {groupedLineup.awaySubs.map(player => (
                      <LineupPlayerCard key={player.idLineup} player={player} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <LineupSection title="Goalkeeper" players={awayGK} teamBadge={awayBadge} teamName={match.strAwayTeam} />
              <LineupSection title="Defense" players={awayDef} teamBadge={awayBadge} teamName={match.strAwayTeam} />
              <LineupSection title="Midfield" players={awayMid} teamBadge={awayBadge} teamName={match.strAwayTeam} />
              <LineupSection title="Forward" players={awayFwd} teamBadge={awayBadge} teamName={match.strAwayTeam} />
            </>
          )}
        </div>

      </div>
    </div>
  );
};
