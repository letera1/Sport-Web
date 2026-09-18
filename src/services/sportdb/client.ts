/**
 * Browser-side SportDB client.
 *
 * Talks only to our own `/api/sportdb/*` proxy — it holds no key and has no
 * knowledge of the upstream host, so nothing secret can leak into the bundle.
 */

import type { SportDataMeta, SportResult } from './models';

const PROXY_ROOT = '/api/sportdb';

export type SportdbErrorCode =
  | 'not_configured'
  | 'feature_unavailable'
  | 'budget_exhausted'
  | 'rate_limited'
  | 'upstream_rate_limited'
  | 'upstream_unavailable'
  | 'unknown_endpoint'
  | 'not_found'
  | 'network'
  | 'unknown';

export class SportdbError extends Error {
  readonly code: SportdbErrorCode;
  readonly status: number;
  readonly feature?: string;

  constructor(code: SportdbErrorCode, message: string, status: number, feature?: string) {
    super(message);
    this.name = 'SportdbError';
    this.code = code;
    this.status = status;
    this.feature = feature;
  }

  /** True when retrying is pointless until configuration or quota changes. */
  get isPermanent(): boolean {
    return (
      this.code === 'not_configured' ||
      this.code === 'feature_unavailable' ||
      this.code === 'budget_exhausted' ||
      this.code === 'unknown_endpoint'
    );
  }
}

interface ProxyEnvelope<T> {
  data?: T;
  meta?: SportDataMeta;
  error?: { code?: string; message?: string; feature?: string };
}

async function request<T>(path: string, signal?: AbortSignal): Promise<SportResult<T>> {
  let response: Response;
  try {
    response = await fetch(`${PROXY_ROOT}/${path}`, {
      headers: { Accept: 'application/json' },
      signal,
    });
  } catch (error) {
    if ((error as Error).name === 'AbortError') throw error;
    throw new SportdbError('network', 'Could not reach the sports service.', 0);
  }

  let body: ProxyEnvelope<T>;
  try {
    body = (await response.json()) as ProxyEnvelope<T>;
  } catch {
    throw new SportdbError('unknown', 'Malformed response from the sports service.', response.status);
  }

  if (!response.ok || body.error) {
    const code = (body.error?.code ?? 'unknown') as SportdbErrorCode;
    throw new SportdbError(
      code,
      body.error?.message ?? 'Sports data request failed.',
      response.status,
      body.error?.feature
    );
  }

  return { data: body.data as T, meta: body.meta ?? null };
}

export interface SportdbStatus {
  configured: boolean;
  health: 'healthy' | 'degraded' | 'unavailable';
  allowedSports: string[];
  budget: { used: number; budget: number; remaining: number; exhausted: boolean };
  features: Array<{ id: string; state: 'unknown' | 'available' | 'unavailable'; reason?: string }>;
}

export const sportdb = {
  status: (signal?: AbortSignal) =>
    request<never>('__status', signal).catch(() => null) as Promise<SportResult<never> | null>,

  /** Raw status payload (the proxy returns it unwrapped). */
  async rawStatus(signal?: AbortSignal): Promise<SportdbStatus | null> {
    try {
      const response = await fetch(`${PROXY_ROOT}/__status`, { signal });
      if (!response.ok) return null;
      return (await response.json()) as SportdbStatus;
    } catch {
      return null;
    }
  },

  live: (sport: string, signal?: AbortSignal) =>
    request<unknown>(`${sport}/live`, signal),

  standings: (sport: string, country: string, competition: string, season: string, signal?: AbortSignal) =>
    request<unknown>(`${sport}/${country}/${competition}/${season}/standings`, signal),

  fixtures: (sport: string, country: string, competition: string, season: string, signal?: AbortSignal) =>
    request<unknown>(`${sport}/${country}/${competition}/${season}/fixtures`, signal),

  match: (matchId: string, signal?: AbortSignal) =>
    request<unknown>(`match/${encodeURIComponent(matchId)}`, signal),

  lineups: (matchId: string, signal?: AbortSignal) =>
    request<unknown>(`match/${encodeURIComponent(matchId)}/lineups`, signal),

  matchStats: (matchId: string, signal?: AbortSignal) =>
    request<unknown>(`match/${encodeURIComponent(matchId)}/stats`, signal),

  searchClubs: (term: string, signal?: AbortSignal) =>
    request<unknown>(`clubs/search/${encodeURIComponent(term)}`, signal),

  clubProfile: (clubId: string, signal?: AbortSignal) =>
    request<unknown>(`clubs/${encodeURIComponent(clubId)}/profile`, signal),

  clubPlayers: (clubId: string, signal?: AbortSignal) =>
    request<unknown>(`clubs/${encodeURIComponent(clubId)}/players`, signal),

  searchPlayers: (term: string, signal?: AbortSignal) =>
    request<unknown>(`players/search/${encodeURIComponent(term)}`, signal),

  playerProfile: (playerId: string, signal?: AbortSignal) =>
    request<unknown>(`players/${encodeURIComponent(playerId)}/profile`, signal),

  playerStats: (playerId: string, signal?: AbortSignal) =>
    request<unknown>(`players/${encodeURIComponent(playerId)}/stats`, signal),

  playerTransfers: (playerId: string, signal?: AbortSignal) =>
    request<unknown>(`players/${encodeURIComponent(playerId)}/transfers`, signal),
};
