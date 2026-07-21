import { useState } from 'react';
import { ChevronDown, Menu, X, Sun, Moon, Search, Trophy } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import { LEAGUES } from '../constants';
import { useTheme } from '../contexts/ThemeContext';

interface NavItem {
  label: string;
  to: string;
  icon?: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Matches', to: '/' },
  { label: 'Standings', to: '/standings', icon: Trophy },
];

interface NavbarProps {
  selectedLeagueId: string;
  onSelectLeague: (id: string) => void;
  leagues?: typeof LEAGUES;
}

export const Navbar = ({ selectedLeagueId, onSelectLeague, leagues = LEAGUES }: NavbarProps) => {
  const location = useLocation();
  const { toggleTheme, isDark } = useTheme();
  const [openLeague, setOpenLeague] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const currentLeague = leagues.find(l => l.id === selectedLeagueId) || leagues[0];

  return (
    <nav className="h-12 sm:h-14 bg-gradient-to-r from-[#6D00FF] to-[#9D4EDD] flex items-center justify-between px-3 sm:px-6 sticky top-0 z-50">
      {/* Left: Logo */}
      <Link to="/" className="text-lg sm:text-xl font-bold font-display text-accent tracking-tight">
        statscore
      </Link>

      {/* Desktop Nav - Center */}
      <div className="hidden md:flex items-center h-full">
        {NAV_ITEMS.map(item => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "cursor-pointer px-3 py-4 text-sm transition-all relative",
                isActive
                  ? "text-accent font-medium"
                  : "text-white/70 hover:text-white"
              )}
            >
              {item.label}
              {isActive && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-accent rounded-full" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Right: Icons & Selectors */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun className="w-3.5 h-3.5 text-white" /> : <Moon className="w-3.5 h-3.5 text-white" />}
        </button>

        {/* League Selector */}
        <div className="relative">
          <button 
            onClick={() => setOpenLeague(!openLeague)}
            className="flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-white/10 rounded-full text-xs sm:text-sm hover:bg-white/20 transition-colors"
          >
            <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-sm bg-white flex items-center justify-center text-[8px] sm:text-[10px] text-primary font-bold">
              {currentLeague?.code?.substring(0, 2)}
            </span>
            <span className="hidden sm:inline text-white">{currentLeague?.name}</span>
            <ChevronDown className={cn("w-3 h-3 sm:w-4 sm:h-4 text-white/70 transition-transform", openLeague && "rotate-180")} />
          </button>

          {openLeague && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setOpenLeague(false)} />
              <div className="absolute right-0 mt-2 w-52 bg-surface border border-divider rounded-xl shadow-xl overflow-hidden z-50 animate-fade-in">
                {leagues.map((league) => (
                  <button
                    key={league.id}
                    onClick={() => {
                      onSelectLeague(league.id);
                      setOpenLeague(false);
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2.5 text-sm hover:bg-surface-hover flex items-center gap-2.5 transition-colors",
                      league.id === selectedLeagueId && "bg-surface-hover text-accent"
                    )}
                  >
                    <span className="text-base">{league.flag}</span>
                    <span className={cn("text-text-secondary", league.id === selectedLeagueId && "text-accent font-medium")}>{league.name}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-1.5 text-white"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="absolute top-12 left-0 right-0 bg-surface border-b border-divider md:hidden z-50 animate-slide-up">
          <div className="flex flex-col p-3">
            {NAV_ITEMS.map((item) => (
              <Link 
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "px-4 py-2.5 text-sm rounded-lg transition-colors",
                  location.pathname === item.to
                    ? "text-accent bg-surface-hover font-medium"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};
