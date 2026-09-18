/**
 * Browser-side SportDB client.
 *
 * Talks only to our own `/api/sportdb/*` proxy — it holds no key and has no
 * knowledge of the upstream host, so nothing secret can enter the bundle.
 * Paths mirror the provider's own `links` values.
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

  constructor(code: SportdbErrorCode, message: string, status: number) {
    super(message);
    this.name = 'SportdbError';
    this.code = code;
    this.status = status;
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
  error?: { code?: string; message?: string };
}

async function request<T = unknown>(path: string, signal?: AbortSignal): Promise<SportResult<T>> {
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
    throw new SportdbError(
      (body.error?.code ?? 'unknown') as SportdbErrorCode,
      body.error?.message ?? 'Sports data request failed.',
      response.status
    );
  }

  return { data: body.data as T, meta: body.meta ?? null };
}

export interface SportdbStatus {
  configured: boolean;
  health: 'healthy' | 'degraded' | 'unavailable';
  providerQuota: { plan: string | null; quota: number | null; usedThisMonth: number | null } | null;
  budget: { used: number; budget: number; remaining: number; exhausted: boolean };
  features: Array<{ id: string; state: 'unknown' | 'available' | 'unavailable'; reason?: string }>;
}

export const sportdb = {
  async status(signal?: AbortSignal): Promise<SportdbStatus | null> {
    try {
      const response = await fetch(`${PROXY_ROOT}/__status`, { signal });
      return response.ok ? ((await response.json()) as SportdbStatus) : null;
    } catch {
      return null;
    }
  },

  liveAll: (sport = 'football', signal?: AbortSignal) =>
    request(`flashscore/${sport}/live`, signal),

  competition: (sport: string, country: string, competition: string, signal?: AbortSignal) =>
    request(`flashscore/${sport}/${country}/${competition}`, signal),

  competitionLive: (sport: string, country: string, competition: string, signal?: AbortSignal) =>
    request(`flashscore/${sport}/${country}/${competition}/live`, signal),

  standings: (sport: string, country: string, competition: string, season: string, signal?: AbortSignal) =>
    request(`flashscore/${sport}/${country}/${competition}/${season}/standings`, signal),

  fixtures: (sport: string, country: string, competition: string, season: string, page = 1, signal?: AbortSignal) =>
    request(`flashscore/${sport}/${country}/${competition}/${season}/fixtures?page=${page}`, signal),

  results: (sport: string, country: string, competition: string, season: string, page = 1, signal?: AbortSignal) =>
    request(`flashscore/${sport}/${country}/${competition}/${season}/results?page=${page}`, signal),

  matchDetails: (eventId: string, signal?: AbortSignal) =>
    request(`flashscore/match/${encodeURIComponent(eventId)}/details`, signal),

  matchLineups: (eventId: string, signal?: AbortSignal) =>
    request(`flashscore/match/${encodeURIComponent(eventId)}/lineups`, signal),

  matchStats: (eventId: string, signal?: AbortSignal) =>
    request(`flashscore/match/${encodeURIComponent(eventId)}/stats`, signal),

  matchOdds: (eventId: string, signal?: AbortSignal) =>
    request(`flashscore/match/${encodeURIComponent(eventId)}/odds`, signal),

  team: (slug: string, teamId: string, signal?: AbortSignal) =>
    request(`flashscore/team/${encodeURIComponent(slug)}/${encodeURIComponent(teamId)}`, signal),
};
