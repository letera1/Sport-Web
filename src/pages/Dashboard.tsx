import { useState, useEffect, useMemo, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Wifi, Heart, ChevronRight as ChevronRightIcon } from 'lucide-react';
import { MatchCard } from '../components/MatchCard';
import { cn, isMatchLive } from '../lib/utils';
import { format, addDays, subDays, isSameDay, parseISO, startOfDay } from 'date-fns';
import { useMatches } from '../hooks/useMatches';
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
        : "bg-transparent text-text-secondary hover:bg-white/5"
    )}
  >
    {Icon && <Icon className="w-4 h-4" />}
    {label}
    <span className={cn(
      "ml-1 text-xs px-1.5 py-0.5 rounded-full min-w-[20px]",
      active ? "bg-black/20" : "bg-white/10"
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
  const { matches, loading, error } = useMatches(leagueId);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filterMode, setFilterMode] = useState<'all' | 'live' | 'favorites'>('all');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const dateScrollRef = useRef<HTMLDivElement>(null);

  const dates = useMemo(() => generateDates(selectedDate, 3), [selectedDate]);

  // Always start from today when league changes
  useEffect(() => {
    setSelectedDate(startOfDay(new Date()));
  }, [leagueId]);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredMatches = useMemo(() => {
    return matches.filter(match => {
      const matchDate = parseISO(match.dateEvent);
      const isDateMatch = isSameDay(matchDate, selectedDate);
      const isLive = isMatchLive(match.strStatus);
      const isFavorite = favorites.has(match.idEvent);

      if (filterMode === 'live') return isLive && isDateMatch;
      if (filterMode === 'favorites') return isFavorite && isDateMatch;
      return isDateMatch;
    });
  }, [matches, selectedDate, filterMode, favorites]);

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
      favoritesCount: matchesOnDate.filter(m => favorites.has(m.idEvent)).length,
      allCount: matchesOnDate.length
    };
  }, [matches, selectedDate, favorites]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-text-secondary">
        <p>Failed to load matches</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-surface rounded-lg hover:bg-white/5 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      {/* Page Title */}
      <h1 className="text-xl sm:text-2xl font-semibold text-white">Matches</h1>

      {/* Horizontal Date Picker */}
      <div className="bg-surface rounded-xl overflow-hidden">
        <div className="flex items-center">
          <button 
            onClick={handlePrevDay} 
            className="p-3 sm:p-4 hover:bg-white/5 text-text-secondary transition-colors shrink-0"
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
                      : "text-text-secondary hover:bg-white/5"
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
            className="p-3 sm:p-4 hover:bg-white/5 text-text-secondary transition-colors shrink-0"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <button className="p-3 sm:p-4 hover:bg-white/5 text-accent transition-colors shrink-0 border-l border-divider">
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
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-28 bg-surface rounded-xl animate-pulse" />)}
        </div>
      ) : (
        Object.keys(groupedMatches).length > 0 ? (
          <div className="flex flex-col gap-4">
            {Object.entries(groupedMatches).map(([league, leagueMatches]) => (
              <div key={league} className="flex flex-col rounded-xl overflow-hidden bg-surface">
                {/* League Header */}
                <div className="px-4 py-3 flex items-center justify-between border-b border-divider/30">
                  <h3 className="text-white font-medium text-sm">{league}</h3>
                  <ChevronRightIcon className="w-4 h-4 text-text-secondary" />
                </div>
                
                {/* Matches */}
                <div className="flex flex-col divide-y divide-divider/30">
                  {leagueMatches.map((match) => (
                    <MatchCard 
                      key={match.idEvent} 
                      match={match} 
                      isFavorite={favorites.has(match.idEvent)}
                      onToggleFavorite={toggleFavorite}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-text-secondary bg-surface rounded-xl">
            <Calendar className="w-12 h-12 mb-4 opacity-30" />
            <p className="text-sm">No matches found for this date</p>
          </div>
        )
      )}
    </div>
  );
};
