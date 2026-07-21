import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Dashboard } from './pages/Dashboard';
import { MatchDetailsPage } from './pages/MatchDetailsPage';
import { StandingsPage } from './pages/StandingsPage';
import { TeamProfilePage } from './pages/TeamProfilePage';
import { PlayerProfilePage } from './pages/PlayerProfilePage';
import { ThemeProvider } from './contexts/ThemeContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { DEFAULT_LEAGUE_ID, LEAGUES } from './constants';
import { PageSkeleton } from './components/Skeleton';

// ScrollToTop helper
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

function AppContent() {
  const [selectedLeagueId, setSelectedLeagueId] = useState<string>(DEFAULT_LEAGUE_ID);
  const selectedLeague = LEAGUES.find(l => l.id === selectedLeagueId);

  return (
    <div className="min-h-screen bg-background font-sans text-text-primary selection:bg-accent selection:text-black flex flex-col">
      <ScrollToTop />
      <Navbar 
        selectedLeagueId={selectedLeagueId} 
        onSelectLeague={setSelectedLeagueId}
        leagues={LEAGUES}
      />
      
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-4xl flex-1">
        <Routes>
          <Route path="/" element={<Dashboard leagueId={selectedLeagueId} />} />
          <Route path="/match/:id" element={<MatchDetailsPage />} />
          <Route path="/standings" element={
            <StandingsPage 
              leagueId={selectedLeagueId} 
              leagueName={selectedLeague?.name}
            />
          } />
          <Route path="/team/:id" element={<TeamProfilePage />} />
          <Route path="/player/:id" element={<PlayerProfilePage />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <FavoritesProvider>
          <AppContent />
        </FavoritesProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
