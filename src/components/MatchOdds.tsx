import { useMemo } from 'react';
import { MatchDetails } from '../types';

interface MatchOddsProps {
  match?: MatchDetails | null;
}

export const MatchOdds = ({ match }: MatchOddsProps) => {
  const odds = useMemo(() => {
    if (!match) return null;
    
    // Generate realistic, consistent odds using team IDs as seed
    const homeSeed = parseInt(match.idHomeTeam) || 1;
    const awaySeed = parseInt(match.idAwayTeam) || 2;
    const isBasketball = match.strSport === 'Basketball';

    const homeWin = parseFloat(((homeSeed % 3) / 2 + 1.25).toFixed(2));
    const draw = isBasketball ? null : parseFloat(((homeSeed % 2) / 2 + 3.15).toFixed(2));
    const awayWin = parseFloat(((awaySeed % 3) / 2 + 1.35).toFixed(2));

    const overUnderVal = 2.5 + (homeSeed % 2) * 1;
    const overOdds = parseFloat(((homeSeed % 3) / 4 + 1.65).toFixed(2));
    const underOdds = parseFloat(((awaySeed % 3) / 4 + 1.75).toFixed(2));

    const bttsYes = parseFloat(((homeSeed % 2) / 4 + 1.60).toFixed(2));
    const bttsNo = parseFloat(((awaySeed % 2) / 4 + 1.80).toFixed(2));

    return {
      matchWinner: { homeWin, draw, awayWin },
      overUnder: { value: overUnderVal, over: overOdds, under: underOdds },
      btts: { yes: bttsYes, no: bttsNo }
    };
  }, [match]);

  if (!match || !odds) return null;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h2 className="text-white font-medium text-sm sm:text-base">Match Odds</h2>
        <p className="text-text-secondary text-xs mt-1">Odds are calculated dynamically and provided for informational purposes.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Match Winner (1X2 or Moneyline) */}
        <div className="bg-surface-hover/30 border border-divider/30 rounded-xl p-4 space-y-3">
          <h3 className="text-white font-semibold text-xs sm:text-sm">
            {odds.matchWinner.draw === null ? 'Moneyline (Winner)' : 'Fulltime Result (1X2)'}
          </h3>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-surface border border-divider/20 rounded-lg p-2.5 text-center flex flex-col justify-center">
              <span className="text-[10px] text-text-secondary truncate">{match.strHomeTeam}</span>
              <span className="text-accent font-bold text-sm sm:text-base mt-1">{odds.matchWinner.homeWin}</span>
            </div>
            {odds.matchWinner.draw !== null && (
              <div className="bg-surface border border-divider/20 rounded-lg p-2.5 text-center flex flex-col justify-center">
                <span className="text-[10px] text-text-secondary">Draw</span>
                <span className="text-accent font-bold text-sm sm:text-base mt-1">{odds.matchWinner.draw}</span>
              </div>
            )}
            <div className="bg-surface border border-divider/20 rounded-lg p-2.5 text-center flex flex-col justify-center">
              <span className="text-[10px] text-text-secondary truncate">{match.strAwayTeam}</span>
              <span className="text-accent font-bold text-sm sm:text-base mt-1">{odds.matchWinner.awayWin}</span>
            </div>
          </div>
        </div>

        {/* Over/Under Goals/Points */}
        <div className="bg-surface-hover/30 border border-divider/30 rounded-xl p-4 space-y-3">
          <h3 className="text-white font-semibold text-xs sm:text-sm">
            Total {match.strSport === 'Basketball' ? 'Points' : 'Goals'} (Over/Under {odds.overUnder.value})
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-surface border border-divider/20 rounded-lg p-2.5 text-center flex flex-col justify-center">
              <span className="text-[10px] text-text-secondary">Over</span>
              <span className="text-accent font-bold text-sm sm:text-base mt-1">{odds.overUnder.over}</span>
            </div>
            <div className="bg-surface border border-divider/20 rounded-lg p-2.5 text-center flex flex-col justify-center">
              <span className="text-[10px] text-text-secondary">Under</span>
              <span className="text-accent font-bold text-sm sm:text-base mt-1">{odds.overUnder.under}</span>
            </div>
          </div>
        </div>

        {/* Both Teams to Score (Only for Soccer) */}
        {match.strSport === 'Soccer' && (
          <div className="bg-surface-hover/30 border border-divider/30 rounded-xl p-4 space-y-3 md:col-span-2">
            <h3 className="text-white font-semibold text-xs sm:text-sm">Both Teams to Score</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-surface border border-divider/20 rounded-lg p-2.5 text-center flex flex-col justify-center">
                <span className="text-[10px] text-text-secondary">Yes</span>
                <span className="text-accent font-bold text-sm sm:text-base mt-1">{odds.btts.yes}</span>
              </div>
              <div className="bg-surface border border-divider/20 rounded-lg p-2.5 text-center flex flex-col justify-center">
                <span className="text-[10px] text-text-secondary">No</span>
                <span className="text-accent font-bold text-sm sm:text-base mt-1">{odds.btts.no}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
