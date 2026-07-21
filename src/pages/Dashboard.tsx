import { useState, useEffect, useMemo, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Wifi, Heart, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MatchCard } from '../components/MatchCard';
import { MatchCardSkeleton } from '../components/Skeleton';
import { EmptyState } from '../components/EmptyState';
import { StandingsWidget } from '../components/StandingsWidget';
import { cn, isMatchLive } from '../lib/utils';
import { format, addDays, subDays, isSameDay, parseISO, startOfDay } from 'date-fns';
import { useMatches } from '../hooks/useMatches';
import { useFavorites } from '../contexts/FavoritesContext';
import { MatchEvent } from '../types';

const FilterButton = ({ 
  active, 
  label, 
  count, 
  icon: Icon,
  onClick
}: { 
  active?: boolean; 
  label: string; 
  count: number; 
  icon?: React.ElementType;
  onClick?: () => void;
}) => (
  <button 
    onClick={onClick}
    className={cn(
      "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap",
      active 
        ? "bg-accent text-black" 
        : "bg-transparent text-text-secondary hover:bg-surface-hover"
    )}
  >
    {Icon && <Icon className="w-4 h-4" />}
    {label}
    <span className={cn(
      "ml-1 text-xs px-1.5 py-0.5 rounded-full min-w-[20px]",
      active ? "bg-black/20" : "bg-surface-hover"
    )}>{count}</span>
  </button>
);

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

  const dates = useMemo(() => generateDates(selectedDate, 3), [selectedDate]);

  // Jump to nearest match date when league changes and preloadedMatches are loaded
  useEffect(() => {
    if (preloadedMatches.length > 0) {
      const today = startOfDay(new Date());
      const hasMatchToday = preloadedMatches.some(m => isSameDay(parseISO(m.dateEvent), today));
      
      if (!hasMatchToday) {
        // Find nearest future match
        const futureMatches = preloadedMatches.filter(m => parseISO(m.dateEvent) >= today);
        if (futureMatches.length > 0) {
          setSelectedDate(startOfDay(parseISO(futureMatches[0].dateEvent)));
          return;
        }
        // If no future matches, find nearest past match
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
    <div className="flex flex-col gap-4 sm:gap-6">
      {/* Page Title */}
      <h1 className="text-xl sm:text-2xl font-semibold text-text-primary">Matches</h1>

      {/* Horizontal Date Picker */}
      <div className="bg-surface rounded-xl overflow-hidden border border-divider/30">
        <div className="flex items-center">
          <button 
            onClick={handlePrevDay} 
            className="p-3 sm:p-4 hover:bg-surface-hover text-text-secondary transition-colors shrink-0"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div 
            ref={dateScrollRef}
            className="flex-1 flex items-center justify-center gap-1 sm:gap-2 overflow-x-auto scrollbar-hide py-2"
          >
            {dates.map((date) => {
              const isToday = isSameDay(date, new Date());
              const isSelected = isSameDay(date, selectedDate);
              
              return (
                <button
                  key={date.toISOString()}
                  onClick={() => setSelectedDate(startOfDay(date))}
                  className={cn(
                    "flex flex-col items-center px-3 sm:px-4 py-2 rounded-lg transition-all min-w-[60px] sm:min-w-[70px]",
                    isSelected 
                      ? "bg-accent text-black" 
                      : "text-text-secondary hover:bg-surface-hover"
                  )}
                >
                  <span className="text-[10px] sm:text-xs uppercase font-medium">
                    {format(date, 'EEE')}
                  </span>
                  <span className={cn(
                    "text-xs sm:text-sm",
                    isSelected ? "font-bold" : "font-medium"
                  )}>
                    {isToday ? 'Today' : format(date, 'd MMM')}
                  </span>
                </button>
              );
            })}
          </div>

          <button 
            onClick={handleNextDay} 
            className="p-3 sm:p-4 hover:bg-surface-hover text-text-secondary transition-colors shrink-0"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <button className="p-3 sm:p-4 hover:bg-surface-hover text-accent transition-colors shrink-0 border-l border-divider">
            <Calendar className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
        <FilterButton 
          active={filterMode === 'all'} 
          label="All" 
          count={allCount} 
          onClick={() => setFilterMode('all')}
        />
        <FilterButton 
          active={filterMode === 'live'} 
          label="Live" 
          count={liveCount} 
          icon={Wifi} 
          onClick={() => setFilterMode('live')}
        />
        <FilterButton 
          active={filterMode === 'favorites'} 
          label="Favorites" 
          count={favoritesCount} 
          icon={Heart} 
          onClick={() => setFilterMode('favorites')}
        />
      </div>

      {/* Match Lists */}
      {loading ? (
        <div className="bg-surface rounded-xl overflow-hidden border border-divider/30">
          <div className="divide-y divide-divider/30">
            {[1,2,3,4,5].map(i => <MatchCardSkeleton key={i} />)}
          </div>
        </div>
      ) : (
        Object.keys(groupedMatches).length > 0 ? (
          <div className="flex flex-col gap-4 stagger-children">
            {Object.entries(groupedMatches).map(([league, leagueMatches]) => (
              <div key={league} className="flex flex-col rounded-xl overflow-hidden bg-surface border border-divider/30">
                {/* League Header */}
                <div className="px-4 py-3 flex items-center justify-between border-b border-divider/30">
                  <h3 className="text-text-primary font-medium text-sm">{league}</h3>
                  <ChevronRight className="w-4 h-4 text-text-muted" />
                </div>
                
                {/* Matches */}
                <div className="flex flex-col divide-y divide-divider/20">
                  {leagueMatches.map((match) => (
                    <MatchCard key={match.idEvent} match={match} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState variant="no-matches" />
        )
      )}

      {/* Standings Widget */}
      <StandingsWidget leagueId={leagueId} />
    </div>
  );
};
