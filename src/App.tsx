import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { MatchDetailsPage } from './pages/MatchDetailsPage';
import { DEFAULT_LEAGUE_ID, LEAGUES } from './constants';

// ScrollToTop helper
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

function App() {
  const [selectedLeagueId, setSelectedLeagueId] = useState<string>(DEFAULT_LEAGUE_ID);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background font-sans text-text-primary selection:bg-accent selection:text-black">
        <ScrollToTop />
        <Navbar 
          selectedLeagueId={selectedLeagueId} 
          onSelectLeague={setSelectedLeagueId}
          leagues={LEAGUES}
        />
        
        <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-4xl">
          <Routes>
            <Route path="/" element={<Dashboard leagueId={selectedLeagueId} />} />
            <Route path="/match/:id" element={<MatchDetailsPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
