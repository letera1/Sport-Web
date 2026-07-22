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
    <header className="sticky top-0 z-[100]">
      {/* Top Main Navigation Bar — Premium Glass Effect */}
      <div
        className="relative border-b border-white/[0.06]"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(13,17,23,0.97) 0%, rgba(22,27,34,0.98) 50%, rgba(13,17,23,0.97) 100%)'
            : 'linear-gradient(135deg, rgba(255,255,255,0.97) 0%, rgba(246,248,250,0.98) 50%, rgba(255,255,255,0.97) 100%)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        }}
      >
        {/* Subtle top accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgb(var(--color-accent)) 30%, rgb(var(--color-info)) 70%, transparent 100%)',
            opacity: 0.7,
          }}
        />

        <div className="max-w-app mx-auto px-4 sm:px-6 h-16 sm:h-[72px] flex items-center justify-between gap-6">
          {/* Left: Brand & Main Navigation */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-3 group">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-black text-xl shadow-lg group-hover:scale-105 transition-transform duration-300"
                style={{
                  background: 'linear-gradient(135deg, rgb(var(--color-accent)), rgb(var(--color-info)))',
                  boxShadow: '0 4px 15px rgba(0, 230, 118, 0.25), 0 0 30px rgba(0, 230, 118, 0.1)',
                }}
              >
                S
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-extrabold font-display tracking-tight leading-none">
                  stat<span className="text-accent">score</span>
                </span>
                <span className="text-[10px] font-medium text-text-muted tracking-widest uppercase hidden sm:block">
                  live sports
                </span>
              </div>
            </Link>

            {/* Desktop Nav Links */}
            <nav className="hidden md:flex items-center gap-1.5">
              <Link
                to="/"
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 relative group",
                  location.pathname === '/'
                    ? "text-text-primary"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                )}
              >
                {location.pathname === '/' && (
                  <div
                    className="absolute inset-0 rounded-xl animate-fade-in"
                    style={{
                      background: 'linear-gradient(135deg, rgba(0,230,118,0.15), rgba(56,166,248,0.1))',
                      border: '1px solid rgba(0,230,118,0.2)',
                    }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-accent" />
                  Scores & Matches
                </span>
                {location.pathname === '/' && (
                  <div
                    className="absolute -bottom-[13px] left-4 right-4 h-[2px] rounded-full animate-fade-in"
                    style={{
                      background: 'linear-gradient(90deg, rgb(var(--color-accent)), rgb(var(--color-info)))',
                    }}
                  />
                )}
              </Link>
              <Link
                to="/standings"
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 relative group",
                  location.pathname === '/standings'
                    ? "text-text-primary"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                )}
              >
                {location.pathname === '/standings' && (
                  <div
                    className="absolute inset-0 rounded-xl animate-fade-in"
                    style={{
                      background: 'linear-gradient(135deg, rgba(0,230,118,0.15), rgba(56,166,248,0.1))',
                      border: '1px solid rgba(0,230,118,0.2)',
                    }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-accent" />
                  Standings
                </span>
                {location.pathname === '/standings' && (
                  <div
                    className="absolute -bottom-[13px] left-4 right-4 h-[2px] rounded-full animate-fade-in"
                    style={{
                      background: 'linear-gradient(90deg, rgb(var(--color-accent)), rgb(var(--color-info)))',
                    }}
                  />
                )}
              </Link>
            </nav>
          </div>

          {/* Right Tools: Search, Favorites, Theme, Mobile Menu */}
          <div className="flex items-center gap-2.5">
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
                    className="w-48 sm:w-64 rounded-xl px-4 py-2 text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/40"
                    style={{
                      background: isDark ? 'rgba(33,38,45,0.9)' : 'rgba(246,248,250,0.9)',
                      border: '1px solid rgba(var(--color-border), 0.5)',
                      color: isDark ? '#f0f6fc' : '#1f2328',
                    }}
                  />
                  <button type="submit" className="absolute right-3 text-text-muted hover:text-text-primary transition-colors">
                    <Search className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-text-secondary hover:text-text-primary transition-all duration-200 hover:scale-105"
                  style={{
                    background: isDark ? 'rgba(33,38,45,0.6)' : 'rgba(246,248,250,0.8)',
                    border: '1px solid rgba(var(--color-border), 0.3)',
                  }}
                  title="Search"
                >
                  <Search className="w-[18px] h-[18px]" />
                </button>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-text-secondary hover:text-text-primary transition-all duration-200 hover:scale-105"
              style={{
                background: isDark ? 'rgba(33,38,45,0.6)' : 'rgba(246,248,250,0.8)',
                border: '1px solid rgba(var(--color-border), 0.3)',
              }}
              title={isDark ? 'Light Mode' : 'Dark Mode'}
            >
              {isDark ? <Sun className="w-[18px] h-[18px] text-warning" /> : <Moon className="w-[18px] h-[18px] text-info" />}
            </button>

            {/* Favorites Count Pill */}
            {favoritesCount > 0 && (
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-danger text-sm font-bold hover:scale-105 transition-all duration-200"
                style={{
                  background: isDark ? 'rgba(248,81,73,0.1)' : 'rgba(207,34,46,0.08)',
                  border: '1px solid rgba(248,81,73,0.25)',
                }}
              >
                <Heart className="w-4 h-4 fill-danger" />
                <span>{favoritesCount}</span>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-10 h-10 rounded-xl flex items-center justify-center text-text-secondary hover:text-text-primary transition-all duration-200"
              style={{
                background: isDark ? 'rgba(33,38,45,0.6)' : 'rgba(246,248,250,0.8)',
                border: '1px solid rgba(var(--color-border), 0.3)',
              }}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Sub-Header: Horizontal League Scroller — Premium Glass Strip */}
      <div
        className="border-b border-white/[0.04]"
        style={{
          background: isDark
            ? 'linear-gradient(180deg, rgba(22,27,34,0.95), rgba(13,17,23,0.97))'
            : 'linear-gradient(180deg, rgba(246,248,250,0.95), rgba(255,255,255,0.97))',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        <div className="max-w-app mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-2.5">
            {leagues.map((league) => {
              const isSelected = league.id === selectedLeagueId;
              return (
                <button
                  key={league.id}
                  onClick={() => onSelectLeague(league.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 shrink-0 hover:scale-[1.03]",
                    isSelected
                      ? "text-black font-bold shadow-lg"
                      : "text-text-secondary hover:text-text-primary"
                  )}
                  style={
                    isSelected
                      ? {
                          background: 'linear-gradient(135deg, rgb(var(--color-accent)), rgb(var(--color-info)))',
                          boxShadow: '0 2px 12px rgba(0, 230, 118, 0.25)',
                        }
                      : {
                          background: isDark ? 'rgba(33,38,45,0.5)' : 'rgba(246,248,250,0.8)',
                          border: '1px solid rgba(var(--color-border), 0.3)',
                        }
                  }
                >
                  <span className="text-sm leading-none">{league.flag}</span>
                  <span>{league.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu — Premium Glass Panel */}
      {mobileMenuOpen && (
        <div
          className="md:hidden animate-slide-up p-5 space-y-3 border-b"
          style={{
            background: isDark
              ? 'linear-gradient(180deg, rgba(22,27,34,0.98), rgba(13,17,23,0.99))'
              : 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(246,248,250,0.99))',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderColor: isDark ? 'rgba(48,54,61,0.6)' : 'rgba(216,222,228,0.6)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          }}
        >
          <nav className="flex flex-col gap-1.5">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-3 transition-all duration-200",
                location.pathname === '/' ? "text-text-primary" : "text-text-secondary hover:text-text-primary"
              )}
              style={
                location.pathname === '/'
                  ? {
                      background: 'linear-gradient(135deg, rgba(0,230,118,0.12), rgba(56,166,248,0.08))',
                      border: '1px solid rgba(0,230,118,0.2)',
                    }
                  : {}
              }
            >
              <Zap className="w-5 h-5 text-accent" />
              <span>Matches & Scores</span>
            </Link>
            <div
              className="mx-4 h-px"
              style={{ background: isDark ? 'rgba(48,54,61,0.4)' : 'rgba(216,222,228,0.4)' }}
            />
            <Link
              to="/standings"
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-3 transition-all duration-200",
                location.pathname === '/standings' ? "text-text-primary" : "text-text-secondary hover:text-text-primary"
              )}
              style={
                location.pathname === '/standings'
                  ? {
                      background: 'linear-gradient(135deg, rgba(0,230,118,0.12), rgba(56,166,248,0.08))',
                      border: '1px solid rgba(0,230,118,0.2)',
                    }
                  : {}
              }
            >
              <Trophy className="w-5 h-5 text-accent" />
              <span>Standings</span>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};
