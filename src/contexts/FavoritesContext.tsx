import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

interface FavoritesContextType {
  favoriteTeams: Set<string>;
  favoriteMatches: Set<string>;
  toggleTeamFavorite: (id: string) => void;
  toggleMatchFavorite: (id: string) => void;
  isTeamFavorite: (id: string) => boolean;
  isMatchFavorite: (id: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

function loadFromStorage(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return new Set(JSON.parse(raw));
  } catch { /* ignore */ }
  return new Set();
}

function saveToStorage(key: string, set: Set<string>) {
  localStorage.setItem(key, JSON.stringify([...set]));
}

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const [favoriteTeams, setFavoriteTeams] = useState<Set<string>>(() => loadFromStorage('statscore-fav-teams'));
  const [favoriteMatches, setFavoriteMatches] = useState<Set<string>>(() => loadFromStorage('statscore-fav-matches'));

  useEffect(() => saveToStorage('statscore-fav-teams', favoriteTeams), [favoriteTeams]);
  useEffect(() => saveToStorage('statscore-fav-matches', favoriteMatches), [favoriteMatches]);

  const toggleTeamFavorite = useCallback((id: string) => {
    setFavoriteTeams(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const toggleMatchFavorite = useCallback((id: string) => {
    setFavoriteMatches(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const isTeamFavorite = useCallback((id: string) => favoriteTeams.has(id), [favoriteTeams]);
  const isMatchFavorite = useCallback((id: string) => favoriteMatches.has(id), [favoriteMatches]);

  return (
    <FavoritesContext.Provider value={{ favoriteTeams, favoriteMatches, toggleTeamFavorite, toggleMatchFavorite, isTeamFavorite, isMatchFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = (): FavoritesContextType => {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
};
