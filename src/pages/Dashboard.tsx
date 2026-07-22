import { useState, useEffect, useMemo, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Wifi, Heart, Trophy, Sparkles } from 'lucide-react';
import { MatchCard } from '../components/MatchCard';
import { MatchCardSkeleton } from '../components/Skeleton';
import { EmptyState } from '../components/EmptyState';
import { StandingsWidget } from '../components/StandingsWidget';
import { cn, isMatchLive } from '../lib/utils';
import { format, addDays, subDays, isSameDay, parseISO, startOfDay } from 'date-fns';
import { useMatches } from '../hooks/useMatches';
import { useFavorites } from '../contexts/FavoritesContext';
import { MatchEvent } from '../types';
import { LEAGUES } from '../constants';

// Generate array of dates for horizontal picker
const generateDates = (centerDate: Date, range: number = 3) => {
  const dates = [];
  for (let i = -range; i <= range; i++) {
    dates.push(addDays(centerDate, i));
  }
  return dates;
};

export const Dashboard = ({ leagueId }: { leagueId: string }) => {
  const [selectedDate, setSelectedDate] = useState(() => startOfDay(new Date()));
  const { matches, loading, error, preloadedMatches } = useMatches(leagueId, selectedDate);
  const { isMatchFavorite } = useFavorites();
  const [filterMode, setFilterMode] = useState<'all' | 'live' | 'favorites'>('all');
  const dateScrollRef = useRef<HTMLDivElement>(null);

  const currentLeague = useMemo(() => LEAGUES.find(l => l.id === leagueId) || LEAGUES[0], [leagueId]);
  const dates = useMemo(() => generateDates(selectedDate, 3), [selectedDate]);

  // Jump to nearest match date when league changes and preloadedMatches are loaded
  useEffect(() => {
    if (preloadedMatches.length > 0) {
      const today = startOfDay(new Date());
      const hasMatchToday = preloadedMatches.some(m => isSameDay(parseISO(m.dateEvent), today));
      
      if (!hasMatchToday) {
        const futureMatches = preloadedMatches.filter(m => parseISO(m.dateEvent) >= today);
        if (futureMatches.length > 0) {
          setSelectedDate(startOfDay(parseISO(futureMatches[0].dateEvent)));
          return;
        }
        const pastMatches = preloadedMatches.filter(m => parseISO(m.dateEvent) < today);
        if (pastMatches.length > 0) {
          setSelectedDate(startOfDay(parseISO(pastMatches[pastMatches.length - 1].dateEvent)));
          return;
        }
      }
    }
    setSelectedDate(startOfDay(new Date()));
  }, [leagueId, preloadedMatches.length]);

  const filteredMatches = useMemo(() => {
    return matches.filter(match => {
      const matchDate = parseISO(match.dateEvent);
      const isDateMatch = isSameDay(matchDate, selectedDate);
      const isLive = isMatchLive(match.strStatus);
      const isFav = isMatchFavorite(match.idEvent);

      if (filterMode === 'live') return isLive && isDateMatch;
      if (filterMode === 'favorites') return isFav && isDateMatch;
      return isDateMatch;
    });
  }, [matches, selectedDate, filterMode, isMatchFavorite]);

  const groupedMatches = useMemo(() => {
    return filteredMatches.reduce((acc, match) => {
      const league = match.strLeague;
      if (!acc[league]) acc[league] = [];
      acc[league].push(match);
      return acc;
    }, {} as Record<string, MatchEvent[]>);
  }, [filteredMatches]);

  const handlePrevDay = () => setSelectedDate(prev => subDays(prev, 1));
  const handleNextDay = () => setSelectedDate(prev => addDays(prev, 1));

  const { liveCount, favoritesCount, allCount } = useMemo(() => {
    const matchesOnDate = matches.filter(m => isSameDay(parseISO(m.dateEvent), selectedDate));
    return {
      liveCount: matchesOnDate.filter(m => isMatchLive(m.strStatus)).length,
      favoritesCount: matchesOnDate.filter(m => isMatchFavorite(m.idEvent)).length,
      allCount: matchesOnDate.length
    };
  }, [matches, selectedDate, isMatchFavorite]);

  if (error) {
    return (
      <EmptyState variant="error" description={error} action={
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-accent text-black rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors"
        >
          Retry
        </button>
      } />
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Main Column (Left - 8 cols) */}
      <div className="lg:col-span-8 flex flex-col gap-4">
        
        {/* Header Title & Date Bar */}
        <div className="bg-surface rounded-xl p-4 border border-border/50 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">{currentLeague.flag}</span>
              <h1 className="text-lg font-bold text-text-primary font-display">
                {currentLeague.name} Matches
              </h1>
            </div>
            <span className="text-xs text-text-muted px-2.5 py-1 bg-surface-hover rounded-full border border-border/40">
              {format(selectedDate, 'EEEE, d MMMM')}
            </span>
          </div>

          {/* Date Selector Strip */}
          <div className="flex items-center gap-1.5 bg-background/60 p-1.5 rounded-xl border border-border/40">
            <button 
              onClick={handlePrevDay} 
              className="p-2 hover:bg-surface-hover rounded-lg text-text-secondary hover:text-text-primary transition-colors shrink-0"
              title="Previous day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <div 
              ref={dateScrollRef}
              className="flex-1 flex items-center justify-between gap-1 overflow-x-auto scrollbar-hide px-1"
            >
              {dates.map((date) => {
                const isToday = isSameDay(date, new Date());
                const isSelected = isSameDay(date, selectedDate);
                
                return (
                  <button
                    key={date.toISOString()}
                    onClick={() => setSelectedDate(startOfDay(date))}
                    className={cn(
                      "flex-1 flex flex-col items-center py-1.5 px-2 rounded-lg transition-all min-w-[55px] text-center border",
                      isSelected 
                        ? "bg-accent text-black font-bold border-accent shadow-sm" 
                        : "bg-transparent text-text-secondary border-transparent hover:bg-surface-hover hover:text-text-primary"
                    )}
                  >
                    <span className="text-[10px] uppercase font-semibold">
                      {format(date, 'EEE')}
                    </span>
                    <span className="text-xs font-score font-bold">
                      {isToday ? 'Today' : format(date, 'd MMM')}
                    </span>
                  </button>
                );
              })}
            </div>

            <button 
              onClick={handleNextDay} 
              className="p-2 hover:bg-surface-hover rounded-lg text-text-secondary hover:text-text-primary transition-colors shrink-0"
              title="Next day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Bar (All / Live / Favorites) */}
        <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-2">
          <div className="flex items-center gap-1 bg-surface p-1 rounded-xl border border-border/50">
            <button
              onClick={() => setFilterMode('all')}
              className={cn(
                "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5",
                filterMode === 'all'
                  ? "bg-surface-hover text-text-primary shadow-sm"
                  : "text-text-secondary hover:text-text-primary"
              )}
            >
              <span>All Matches</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-surface-hover text-text-primary font-mono">
                {allCount}
              </span>
            </button>

            <button
              onClick={() => setFilterMode('live')}
              className={cn(
                "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5",
                filterMode === 'live'
                  ? "bg-live/20 text-live border border-live/40 font-bold"
                  : "text-text-secondary hover:text-text-primary"
              )}
            >
              <Wifi className="w-3.5 h-3.5" />
              <span>LIVE</span>
              {liveCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-live text-black font-bold animate-pulse">
                  {liveCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setFilterMode('favorites')}
              className={cn(
                "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5",
                filterMode === 'favorites'
                  ? "bg-danger/20 text-danger border border-danger/40"
                  : "text-text-secondary hover:text-text-primary"
              )}
            >
              <Heart className="w-3.5 h-3.5" />
              <span>Favorites</span>
              {favoritesCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-danger/20 text-danger font-bold">
                  {favoritesCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Matches List */}
        {loading ? (
          <div className="bg-surface rounded-xl overflow-hidden border border-border/50 divide-y divide-border/30">
            {[1,2,3,4,5,6].map(i => <MatchCardSkeleton key={i} />)}
          </div>
        ) : Object.keys(groupedMatches).length > 0 ? (
          <div className="flex flex-col gap-4 stagger-children">
            {Object.entries(groupedMatches).map(([league, leagueMatches]) => (
              <div key={league} className="rounded-xl overflow-hidden bg-surface border border-border/50 shadow-card">
                {/* League Header */}
                <div className="px-4 py-2.5 bg-surface-hover/40 flex items-center justify-between border-b border-border/40">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-3.5 h-3.5 text-accent" />
                    <h3 className="text-text-primary font-bold text-xs font-display">{league}</h3>
                  </div>
                  <span className="text-[10px] text-text-muted font-medium">
                    {leagueMatches.length} {leagueMatches.length === 1 ? 'match' : 'matches'}
                  </span>
                </div>

                {/* Match Cards List */}
                <div className="divide-y divide-border/30">
                  {leagueMatches.map((match) => (
                    <MatchCard key={match.idEvent} match={match} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState variant="no-matches" />
        )}
      </div>

      {/* Sidebar Column (Right - 4 cols) */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        {/* League Standings Sidebar Widget */}
        <StandingsWidget leagueId={leagueId} limit={10} />
      </div>
    </div>
  );
};
