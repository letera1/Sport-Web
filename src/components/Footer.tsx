import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="mt-auto border-t border-border bg-navbar text-text-secondary">
      <div className="max-w-app mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-accent/20 border border-accent/40 flex items-center justify-center font-bold text-accent text-xs">
              S
            </div>
            <span className="font-bold text-sm text-text-primary font-display">
              stat<span className="text-accent">score</span>
            </span>
            <span className="text-text-muted hidden sm:inline">•</span>
            <span className="text-text-muted text-[11px]">Real-time live scores & sports intelligence</span>
          </div>

          {/* Quick Links */}
          <div className="flex items-center gap-4 text-xs font-medium">
            <Link to="/" className="hover:text-accent transition-colors">Scores</Link>
            <Link to="/standings" className="hover:text-accent transition-colors">Standings</Link>
            <a href="https://www.thesportsdb.com" target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-text-primary transition-colors">
              Data: TheSportsDB
            </a>
          </div>

          {/* Copyright */}
          <div className="text-[11px] text-text-muted">
            © {new Date().getFullYear()} Statscore. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};
