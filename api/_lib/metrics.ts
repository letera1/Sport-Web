/**
 * In-process telemetry + capability registry.
 *
 * Capability state is how we honour "never burn requests on features the plan
 * doesn't allow": a 401/403 for a feature disables it until the process
 * restarts, so we stop probing it.
 */

import { ALL_FEATURES, type FeatureId } from './routes';

export type FeatureState = 'unknown' | 'available' | 'unavailable';

interface FeatureRecord {
  state: FeatureState;
  reason?: string;
  lastCheckedAt?: number;
}

interface Metrics {
  upstreamRequests: number;
  cacheHits: number;
  cacheMisses: number;
  staleServed: number;
  dedupedRequests: number;
  errors: number;
  rateLimited429: number;
  totalLatencyMs: number;
  lastSuccessAt: number | null;
  lastErrorAt: number | null;
  lastError: string | null;
  budgetWindowStart: number;
}

const metrics: Metrics = {
  upstreamRequests: 0,
  cacheHits: 0,
  cacheMisses: 0,
  staleServed: 0,
  dedupedRequests: 0,
  errors: 0,
  rateLimited429: 0,
  totalLatencyMs: 0,
  lastSuccessAt: null,
  lastErrorAt: null,
  lastError: null,
  budgetWindowStart: Date.now(),
};

const features: Record<FeatureId, FeatureRecord> = ALL_FEATURES.reduce(
  (acc, id) => ({ ...acc, [id]: { state: 'unknown' } }),
  {} as Record<FeatureId, FeatureRecord>
);

export const recordCacheHit = (stale: boolean) => {
  metrics.cacheHits += 1;
  if (stale) metrics.staleServed += 1;
};
export const recordCacheMiss = () => { metrics.cacheMisses += 1; };
export const recordDeduped = () => { metrics.dedupedRequests += 1; };

export function recordUpstreamSuccess(feature: FeatureId, latencyMs: number): void {
  metrics.upstreamRequests += 1;
  metrics.totalLatencyMs += latencyMs;
  metrics.lastSuccessAt = Date.now();
  features[feature] = { state: 'available', lastCheckedAt: Date.now() };
}

export function recordUpstreamError(feature: FeatureId, status: number, message: string): void {
  metrics.upstreamRequests += 1;
  metrics.errors += 1;
  metrics.lastErrorAt = Date.now();
  // Message is provider text only — the API key is never included in errors.
  metrics.lastError = `${status}: ${message}`.slice(0, 200);

  if (status === 429) metrics.rateLimited429 += 1;

  if (status === 401 || status === 403 || status === 402) {
    features[feature] = {
      state: 'unavailable',
      reason: status === 401 ? 'invalid_or_missing_key' : 'not_permitted_on_current_plan',
      lastCheckedAt: Date.now(),
    };
  }
}

export const getFeatureState = (feature: FeatureId): FeatureRecord => features[feature];

/** Budget counts *upstream* calls only; cache hits are free. */
export function budgetStatus(budget: number, windowMs: number) {
  if (Date.now() - metrics.budgetWindowStart > windowMs) {
    metrics.budgetWindowStart = Date.now();
    metrics.upstreamRequests = 0;
  }
  return {
    used: metrics.upstreamRequests,
    budget,
    remaining: Math.max(0, budget - metrics.upstreamRequests),
    exhausted: metrics.upstreamRequests >= budget,
    windowStart: new Date(metrics.budgetWindowStart).toISOString(),
  };
}

export function health(): 'healthy' | 'degraded' | 'unavailable' {
  if (!metrics.lastErrorAt) return 'healthy';
  const errorIsRecent = Date.now() - metrics.lastErrorAt < 5 * 60_000;
  const succeededSinceError = (metrics.lastSuccessAt ?? 0) > metrics.lastErrorAt;
  if (!errorIsRecent || succeededSinceError) return 'healthy';
  return metrics.lastSuccessAt ? 'degraded' : 'unavailable';
}

export function snapshot() {
  const served = metrics.cacheHits + metrics.cacheMisses;
  return {
    ...metrics,
    avgLatencyMs: metrics.upstreamRequests
      ? Math.round(metrics.totalLatencyMs / metrics.upstreamRequests)
      : 0,
    cacheHitRate: served ? Number((metrics.cacheHits / served).toFixed(3)) : 0,
    features,
  };
}
