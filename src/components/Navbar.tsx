import { useState } from 'react';
import { Menu, X, Sun, Moon, Search, Trophy, Heart, Zap } from 'lucide-react';
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
      setSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-[100] bg-surface/95 backdrop-blur-md border-b border-border/60 shadow-sm">
      {/* Top Main Navigation Bar */}
      <div className="max-w-app mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
        {/* Left: Brand & Main Navigation */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center font-extrabold text-black text-lg shadow-sm group-hover:scale-105 transition-transform duration-200">
              S
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold font-display tracking-tight leading-none text-text-primary">
                stat<span className="text-accent">score</span>
              </span>
              <span className="text-[9px] font-bold text-text-muted tracking-widest uppercase hidden sm:block mt-0.5">
                live sports
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className={cn(
                "px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-2",
                location.pathname === '/'
                  ? "bg-accent/10 text-accent font-bold border border-accent/30"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
              )}
            >
              <Zap className="w-4 h-4 text-accent" />
              <span>Scores & Matches</span>
            </Link>
            <Link
              to="/standings"
              className={cn(
                "px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-2",
                location.pathname === '/standings'
                  ? "bg-accent/10 text-accent font-bold border border-accent/30"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
              )}
            >
              <Trophy className="w-4 h-4 text-accent" />
              <span>Standings</span>
            </Link>
          </nav>
        </div>

        {/* Right Tools: Search, Favorites, Theme, Mobile Menu */}
        <div className="flex items-center gap-2">
          {/* Search Input / Trigger */}
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
                  className="w-44 sm:w-60 bg-background text-text-primary border border-border/80 rounded-lg px-3 py-1.5 text-xs placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent"
                />
                <button type="submit" className="absolute right-2.5 text-text-muted hover:text-text-primary transition-colors">
                  <Search className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="w-9 h-9 rounded-lg bg-surface-hover border border-border/50 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
                title="Search"
              >
                <Search className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-lg bg-surface-hover border border-border/50 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun className="w-4 h-4 text-warning" /> : <Moon className="w-4 h-4 text-info" />}
          </button>

          {/* Favorites Pill */}
          {favoritesCount > 0 && (
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-danger/10 text-danger border border-danger/30 text-xs font-bold hover:bg-danger/20 transition-colors"
            >
              <Heart className="w-3.5 h-3.5 fill-danger" />
              <span>{favoritesCount}</span>
            </button>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-9 h-9 rounded-lg bg-surface-hover border border-border/50 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Sub-Header: Horizontal League Scroller */}
      <div className="border-t border-border/40 bg-surface/60">
        <div className="max-w-app mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-2">
            {leagues.map((league) => {
              const isSelected = league.id === selectedLeagueId;
              return (
                <button
                  key={league.id}
                  onClick={() => onSelectLeague(league.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 border",
                    isSelected
                      ? "bg-accent text-black font-bold border-accent shadow-sm"
                      : "bg-surface text-text-secondary border-border/60 hover:text-text-primary hover:bg-surface-hover"
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
        <div className="md:hidden animate-slide-up p-4 space-y-2 border-b border-border bg-surface shadow-lg">
          <nav className="flex flex-col gap-1">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "px-3.5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-3 transition-colors",
                location.pathname === '/'
                  ? "bg-accent/10 text-accent border border-accent/30 font-bold"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
              )}
            >
              <Zap className="w-4 h-4 text-accent" />
              <span>Matches & Scores</span>
            </Link>
            <Link
              to="/standings"
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "px-3.5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-3 transition-colors",
                location.pathname === '/standings'
                  ? "bg-accent/10 text-accent border border-accent/30 font-bold"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
              )}
            >
              <Trophy className="w-4 h-4 text-accent" />
              <span>Standings</span>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};
