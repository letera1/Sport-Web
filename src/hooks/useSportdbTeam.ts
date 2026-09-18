import { useCallback, useEffect, useState } from 'react';
import { sportdb } from '../services/sportdb/client';

export interface SportdbSquadPlayer {
  id: string | null;
  slug: string | null;
  name: string;
  jerseyNumber: string | null;
  position: string;
  countryName: string | null;
}

export interface SportdbTeam {
  id: string;
  name: string;
  logo: string | null;
  stadiumName: string | null;
  stadiumCapacity: number | null;
  countryName: string | null;
  squad: SportdbSquadPlayer[];
}

type Rec = Record<string, unknown>;
const isRec = (v: unknown): v is Rec => typeof v === 'object' && v !== null && !Array.isArray(v);
const str = (v: unknown): string | null => (typeof v === 'string' && v.trim() ? v : null);

function normalizeTeam(payload: unknown): SportdbTeam | null {
  if (!isRec(payload)) return null;
  const id = str(payload.id);
  const name = str(payload.teamName);
  if (!id || !name) return null;

  const squad: SportdbSquadPlayer[] = [];
  const seen = new Set<string>();
  const groups = Array.isArray(payload.squad) ? payload.squad.filter(isRec) : [];
  for (const group of groups) {
    const players = Array.isArray(group.players) ? group.players.filter(isRec) : [];
    for (const player of players) {
      const first = str(player.firstName) ?? '';
      const last = str(player.lastName) ?? '';
      const full = `${first} ${last}`.trim() || str(player.slug)?.replace(/-/g, ' ') || '';
      if (!full) continue;

      // The same player appears once per competition group, so dedupe by id.
      const key = str(player.id) ?? full.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);

      squad.push({
        id: str(player.id),
        slug: str(player.slug),
        name: full,
        jerseyNumber: str(player.jerseyNumber),
        position: str(player.position) ?? 'Other',
        countryName: str(player.countryName),
      });
    }
  }

  const country = isRec(payload.country) ? str(payload.country.name) : null;
  const capacity = typeof payload.stadiumCapacity === 'number' ? payload.stadiumCapacity : null;

  return {
    id,
    name,
    logo: str(payload.teamLogo),
    stadiumName: str(payload.stadiumName),
    stadiumCapacity: capacity,
    countryName: country,
    squad,
  };
}

export const useSportdbTeam = (slug: string | null, teamId: string | null) => {
  const [team, setTeam] = useState<SportdbTeam | null>(null);
  const [loading, setLoading] = useState(Boolean(slug && teamId));
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!slug || !teamId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const result = await sportdb.team(slug, teamId);
      const normalized = normalizeTeam(result.data);
      if (!normalized) throw new Error('Team profile unavailable');
      setTeam(normalized);
      setError(null);
    } catch (err) {
      setError((err as Error).message || 'Could not load this team.');
      setTeam(null);
    } finally {
      setLoading(false);
    }
  }, [slug, teamId]);

  useEffect(() => { void load(); }, [load]);

  return { team, loading, error };
};
