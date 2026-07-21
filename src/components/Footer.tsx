import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="mt-auto border-t border-divider bg-surface">
      <div className="container mx-auto max-w-6xl px-4 py-8 sm:py-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <Link to="/" className="text-xl font-bold font-display text-accent tracking-tight">
              statscore
            </Link>
            <p className="text-text-secondary text-xs mt-2 leading-relaxed">
              Live football scores, match details, standings and statistics. Your premier destination for football data.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-text-primary font-semibold text-sm mb-3">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { label: 'Matches', to: '/' },
                { label: 'Standings', to: '/standings' },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-text-secondary text-xs hover:text-accent transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Leagues */}
          <div>
            <h4 className="text-text-primary font-semibold text-sm mb-3">Leagues</h4>
            <ul className="space-y-2">
              {['Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1'].map(league => (
                <li key={league}>
                  <span className="text-text-secondary text-xs">{league}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="text-text-primary font-semibold text-sm mb-3">About</h4>
            <ul className="space-y-2">
              <li><span className="text-text-secondary text-xs">Powered by TheSportsDB</span></li>
              <li><span className="text-text-secondary text-xs">Built with React & TypeScript</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-divider flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-text-muted text-xs">
            © {new Date().getFullYear()} Statscore. All rights reserved.
          </p>
          <p className="text-text-muted text-xs">
            Data provided by <a href="https://www.thesportsdb.com" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">TheSportsDB</a>
          </p>
        </div>
      </div>
    </footer>
  );
};
