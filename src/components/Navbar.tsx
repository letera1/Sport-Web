import { useState } from 'react';
import { ChevronDown, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import { LEAGUES } from '../constants';

const NavItem = ({ label, to, active }: { label: string; to: string; active?: boolean }) => (
  <Link 
    to={to}
    className={cn(
      "cursor-pointer px-3 py-4 text-sm transition-all",
      active 
        ? "text-accent font-medium" 
        : "text-text-secondary hover:text-white"
    )}
  >
    {label}
  </Link>
);

interface NavbarProps {
  selectedLeagueId: string;
  onSelectLeague: (id: string) => void;
  leagues?: typeof LEAGUES;
}

export const Navbar = ({ selectedLeagueId, onSelectLeague, leagues = LEAGUES }: NavbarProps) => {
  const location = useLocation();
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
        <NavItem label="Live" to="/" />
        <NavItem label="Matches" to="/" active={location.pathname === '/'} />
        <NavItem label="Standings" to="/" />
        <NavItem label="Teams" to="/" />
        <NavItem label="Comparison" to="/" />
        <NavItem label="Statistics" to="/" />
        <NavItem label="Venues" to="/" />
      </div>

      {/* Right: Icons & Selectors */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Icons - visible on mobile too */}
        <button className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 flex items-center justify-center text-sm">
          ⚽
        </button>
        <button className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 flex items-center justify-center text-sm">
          🌍
        </button>

        {/* Flag */}
        <button className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden">
          <img src="https://flagcdn.com/w40/gb.png" alt="UK" className="w-full h-full object-cover" />
        </button>

        {/* League Selector */}
        <div className="relative">
          <button 
            onClick={() => setOpenLeague(!openLeague)}
            className="flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-white/10 rounded-full text-xs sm:text-sm"
          >
            <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-sm bg-white flex items-center justify-center text-[8px] sm:text-[10px] text-primary font-bold">
              {currentLeague?.code?.substring(0, 2)}
            </span>
            <span className="hidden sm:inline text-white">{currentLeague?.name}</span>
            <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-white/70" />
          </button>

          {openLeague && (
            <div className="absolute right-0 mt-2 w-48 bg-surface border border-divider rounded-lg shadow-xl overflow-hidden z-50">
              {leagues.map((league) => (
                <button
                  key={league.id}
                  onClick={() => {
                    onSelectLeague(league.id);
                    setOpenLeague(false);
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm hover:bg-white/10 flex items-center gap-2",
                    league.id === selectedLeagueId && "bg-white/10 text-accent"
                  )}
                >
                  <span className="text-gray-200">{league.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Season - Desktop only */}
        <button className="hidden lg:flex items-center gap-1 px-3 py-1.5 bg-white/10 rounded-full text-sm text-white">
          2024/25
          <ChevronDown className="w-4 h-4 text-white/70" />
        </button>

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
        <div className="absolute top-12 left-0 right-0 bg-surface border-b border-divider md:hidden z-50">
          <div className="flex flex-col p-3">
            {['Live', 'Matches', 'Standings', 'Teams', 'Comparison', 'Statistics', 'Venues'].map((item) => (
              <Link 
                key={item}
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2.5 text-sm text-text-secondary hover:text-white hover:bg-white/5 rounded-lg"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};
