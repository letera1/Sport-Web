/**
 * Runtime-agnostic proxy core, shared by the Vercel function (production) and
 * the Vite dev middleware (local), so both environments behave identically.
 */

import { getConfig } from './config';
import { cacheStats, dedupe, readCache, writeCache } from './cache';
import { checkRateLimit } from './rateLimit';
import { resolveRoute, ALL_FEATURES, FEATURE_TTL } from './routes';
import {
  budgetStatus, getFeatureState, getProviderQuota, health, recordCacheHit, recordCacheMiss,
  recordDeduped, recordProviderQuota, recordUpstreamError, recordUpstreamSuccess, snapshot,
} from './metrics';
import { fetchUpstream } from './sportdbClient';

export interface ProxyRequest {
  segments: string[];
  query?: Record<string, string | undefined>;
  clientId: string;
}

export interface ProxyResponse {
  status: number;
  headers: Record<string, string>;
  body: unknown;
}

const json = (status: number, body: unknown, headers: Record<string, string> = {}): ProxyResponse => ({
  status,
  headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers },
  body,
});

const fail = (status: number, code: string, message: string, extra: Record<string, unknown> = {}) =>
  json(status, { error: { code, message, ...extra } });

/** Public diagnostics. Deliberately exposes no key material. */
export function buildStatus(): ProxyResponse {
  const config = getConfig();
  const budget = budgetStatus(config.requestBudget, config.budgetWindowMs);
  const metrics = snapshot();

  return json(200, {
    configured: Boolean(config.apiKey),
    health: config.apiKey ? health() : 'unavailable',
    baseUrl: config.baseUrl,
    allowedSports: config.allowedSports,
    budget,
    providerQuota: getProviderQuota(),
    cache: cacheStats(),
    metrics: {
      cacheHits: metrics.cacheHits,
      cacheMisses: metrics.cacheMisses,
      cacheHitRate: metrics.cacheHitRate,
      staleServed: metrics.staleServed,
      dedupedRequests: metrics.dedupedRequests,
      upstreamRequests: metrics.upstreamRequests,
      errors: metrics.errors,
      rateLimited429: metrics.rateLimited429,
      avgLatencyMs: metrics.avgLatencyMs,
      lastSuccessAt: metrics.lastSuccessAt ? new Date(metrics.lastSuccessAt).toISOString() : null,
      lastErrorAt: metrics.lastErrorAt ? new Date(metrics.lastErrorAt).toISOString() : null,
      lastError: metrics.lastError,
    },
    features: ALL_FEATURES.map((id) => ({
      id,
      ttlMs: FEATURE_TTL[id],
      ...getFeatureState(id),
    })),
  });
}

export async function handleProxyRequest(request: ProxyRequest): Promise<ProxyResponse> {
  const config = getConfig();

  if (request.segments[0] === '__status') return buildStatus();

  const limit = checkRateLimit(request.clientId, config.rateLimit.windowMs, config.rateLimit.max);
  if (!limit.allowed) {
    return fail(429, 'rate_limited', 'Too many requests. Please slow down.', {
      retryAfterSec: limit.retryAfterSec,
    });
  }

  const route = resolveRoute(request.segments, request.query ?? {});
  if (!route) {
    return fail(404, 'unknown_endpoint', 'This endpoint is not part of the allowed SportDB surface.');
  }

  // Without a key we must not attempt any upstream call.
  if (!config.apiKey) {
    return fail(503, 'not_configured', 'SportDB is not configured on the server.', {
      feature: route.feature,
    });
  }

  const querySuffix = new URLSearchParams(route.query).toString();
  const cacheKey = querySuffix ? `${route.upstreamPath}?${querySuffix}` : route.upstreamPath;
  const cached = readCache<unknown>(cacheKey);

  if (cached?.fresh) {
    recordCacheHit(false);
    return json(200, {
      data: cached.entry.data,
      meta: {
        feature: route.feature, cached: true, stale: false,
        ageMs: Date.now() - cached.entry.storedAt,
        fetchedAt: new Date(cached.entry.storedAt).toISOString(),
      },
    });
  }

  const serveStale = (reason: string): ProxyResponse | null => {
    if (!cached) return null;
    recordCacheHit(true);
    return json(200, {
      data: cached.entry.data,
      meta: {
        feature: route.feature, cached: true, stale: true, staleReason: reason,
        ageMs: Date.now() - cached.entry.storedAt,
        fetchedAt: new Date(cached.entry.storedAt).toISOString(),
      },
    });
  };

  // Features the plan rejected are never retried — this is the free-quota guard.
  const featureState = getFeatureState(route.feature);
  if (featureState.state === 'unavailable') {
    return (
      serveStale('feature_unavailable') ??
      fail(503, 'feature_unavailable', 'This feature is not available on the current SportDB plan.', {
        feature: route.feature, reason: featureState.reason,
      })
    );
  }

  const budget = budgetStatus(config.requestBudget, config.budgetWindowMs);
  if (budget.exhausted) {
    return (
      serveStale('budget_exhausted') ??
      fail(503, 'budget_exhausted', 'The configured SportDB request budget is used up.', { budget })
    );
  }

  recordCacheMiss();

  const result = await dedupe(cacheKey, async () => {
    recordDeduped();
    return fetchUpstream(route.upstreamPath, route.query);
  });

  if (result.ok) {
    recordUpstreamSuccess(route.feature, result.latencyMs);
    recordProviderQuota(result.quota);
    const entry = writeCache(cacheKey, result.data, route.ttlMs);
    return json(200, {
      data: result.data,
      meta: {
        feature: route.feature, cached: false, stale: false, ageMs: 0,
        fetchedAt: new Date(entry.storedAt).toISOString(),
      },
    });
  }

  recordUpstreamError(route.feature, result.status, result.message);

  if (result.kind === 'not_found') {
    return fail(404, 'not_found', 'SportDB has no data for this resource.', { feature: route.feature });
  }
  if (result.kind === 'auth' || result.kind === 'forbidden') {
    return (
      serveStale('feature_unavailable') ??
      fail(503, 'feature_unavailable', 'SportDB rejected this request for the current plan or key.', {
        feature: route.feature,
      })
    );
  }
  if (result.kind === 'rate_limited') {
    return (
      serveStale('upstream_rate_limited') ??
      fail(429, 'upstream_rate_limited', 'SportDB rate limit reached. Try again shortly.', {
        feature: route.feature, retryAfterSec: result.retryAfterSec,
      })
    );
  }

  return (
    serveStale('upstream_unavailable') ??
    fail(502, 'upstream_unavailable', 'SportDB is temporarily unavailable.', { feature: route.feature })
  );
}
