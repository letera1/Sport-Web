import { useState } from 'react';
import { ChevronDown, Menu, X, Sun, Moon, Search, Trophy, Heart } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { LEAGUES } from '../constants';
import { useTheme } from '../contexts/ThemeContext';
import { useFavorites } from '../contexts/FavoritesContext';

interface NavbarProps {
  selectedLeagueId: string;
  onSelectLeague: (id: string) => void;
  leagues?: typeof LEAGUES;
}

export const Navbar = ({ selectedLeagueId, onSelectLeague, leagues = LEAGUES }: NavbarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toggleTheme, isDark } = useTheme();
  const { favoritesCount } = useFavorites();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search results or handle search
      setSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-navbar border-b border-border/80 shadow-nav">
      {/* Top Main Navigation Bar */}
      <div className="max-w-app mx-auto px-3 sm:px-6 h-13 sm:h-14 flex items-center justify-between gap-4">
        {/* Left: Brand & Main Navigation */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center font-bold text-accent text-lg group-hover:bg-accent group-hover:text-black transition-all">
              S
            </div>
            <span className="text-lg sm:text-xl font-bold font-display tracking-tight text-white">
              stat<span className="text-accent">score</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors relative",
                location.pathname === '/' 
                  ? "text-white bg-surface-hover font-semibold" 
                  : "text-text-secondary hover:text-white hover:bg-surface-hover/50"
              )}
            >
              Scores & Matches
              {location.pathname === '/' && (
                <div className="absolute bottom-0 left-3 right-3 h-0.5 bg-accent rounded-full animate-fade-in" />
              )}
            </Link>
            <Link
              to="/standings"
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 relative",
                location.pathname === '/standings' 
                  ? "text-white bg-surface-hover font-semibold" 
                  : "text-text-secondary hover:text-white hover:bg-surface-hover/50"
              )}
            >
              <Trophy className="w-3.5 h-3.5 text-accent" />
              Standings
              {location.pathname === '/standings' && (
                <div className="absolute bottom-0 left-3 right-3 h-0.5 bg-accent rounded-full animate-fade-in" />
              )}
            </Link>
          </nav>
        </div>

        {/* Right Tools: Search, Favorites, Theme, Mobile Menu */}
        <div className="flex items-center gap-2">
          {/* Search Trigger / Input */}
          <div className="relative">
            {searchOpen ? (
              <form onSubmit={handleSearchSubmit} className="flex items-center">
                <input
                  type="text"
                  placeholder="Search team or player..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  onBlur={() => !searchQuery && setSearchOpen(false)}
                  className="w-44 sm:w-60 bg-surface border border-border rounded-full px-3 py-1 text-xs text-white placeholder:text-text-muted focus:outline-none focus:border-accent"
                />
                <button type="submit" className="absolute right-2 text-text-muted hover:text-white">
                  <Search className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="w-8 h-8 rounded-full bg-surface hover:bg-surface-hover border border-border/50 flex items-center justify-center text-text-secondary hover:text-white transition-colors"
                title="Search"
              >
                <Search className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-8 h-8 rounded-full bg-surface hover:bg-surface-hover border border-border/50 flex items-center justify-center text-text-secondary hover:text-white transition-colors"
            title={isDark ? 'Light Mode' : 'Dark Mode'}
          >
            {isDark ? <Sun className="w-4 h-4 text-warning" /> : <Moon className="w-4 h-4 text-info" />}
          </button>

          {/* Favorites Count Pill */}
          {favoritesCount > 0 && (
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-danger/10 border border-danger/30 text-danger text-xs font-semibold hover:bg-danger/20 transition-colors"
            >
              <Heart className="w-3.5 h-3.5 fill-danger" />
              <span>{favoritesCount}</span>
            </button>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-text-secondary hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Sub-Header: Horizontal League Scroller (BeSoccer/FlashScore style) */}
      <div className="border-t border-border/60 bg-surface/80 glass">
        <div className="max-w-app mx-auto px-3 sm:px-6">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-2">
            {leagues.map((league) => {
              const isSelected = league.id === selectedLeagueId;
              return (
                <button
                  key={league.id}
                  onClick={() => onSelectLeague(league.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all shrink-0 border",
                    isSelected
                      ? "bg-accent text-black font-bold border-accent shadow-glow-accent"
                      : "bg-surface-hover/40 text-text-secondary border-border/40 hover:text-white hover:bg-surface-hover"
                  )}
                >
                  <span className="text-xs leading-none">{league.flag}</span>
                  <span>{league.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-surface border-b border-border animate-slide-up p-4 space-y-4">
          <nav className="flex flex-col gap-2">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-between",
                location.pathname === '/' ? "bg-accent/15 text-accent font-bold" : "text-text-secondary"
              )}
            >
              <span>Matches & Scores</span>
            </Link>
            <Link
              to="/standings"
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-between",
                location.pathname === '/standings' ? "bg-accent/15 text-accent font-bold" : "text-text-secondary"
              )}
            >
              <span>Standings</span>
              <Trophy className="w-4 h-4 text-accent" />
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};
