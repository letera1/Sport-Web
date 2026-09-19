/**
 * Thin HTTP client for SportDB.dev. The API key is attached here and nowhere
 * else, and is never returned, logged, or echoed into error messages.
 */

import { getConfig } from './config.js';

export interface UpstreamSuccess {
  ok: true;
  data: unknown;
  latencyMs: number;
  quota: ProviderQuota | null;
}

/** Provider-reported plan usage, read from `x-plan` / `x-quota` / `x-usage-month`. */
export interface ProviderQuota {
  plan: string | null;
  quota: number | null;
  usedThisMonth: number | null;
}

export interface UpstreamFailure {
  ok: false;
  status: number;
  /** Machine-readable reason used to pick the client-facing response. */
  kind: 'auth' | 'forbidden' | 'not_found' | 'rate_limited' | 'server' | 'network' | 'malformed';
  message: string;
  retryAfterSec?: number;
  latencyMs: number;
}

export type UpstreamResult = UpstreamSuccess | UpstreamFailure;

/** Explicit predicate: discriminant narrowing on `ok` needs strictNullChecks,
 *  which the deployment platform does not guarantee when compiling functions. */
const isFailure = (result: UpstreamResult): result is UpstreamFailure => !result.ok;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function classify(status: number): UpstreamFailure['kind'] {
  if (status === 401) return 'auth';
  if (status === 402 || status === 403) return 'forbidden';
  if (status === 404) return 'not_found';
  if (status === 429) return 'rate_limited';
  return 'server';
}

async function attempt(upstreamPath: string, query: Record<string, string>): Promise<UpstreamResult> {
  const { apiKey, baseUrl, timeoutMs } = getConfig();
  const startedAt = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const search = new URLSearchParams(query).toString();
  const url = `${baseUrl}/api/${upstreamPath}${search ? `?${search}` : ''}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-API-Key': apiKey as string,
        Accept: 'application/json',
        'User-Agent': 'statscore/1.0',
      },
      signal: controller.signal,
    });

    const latencyMs = Date.now() - startedAt;
    const toInt = (raw: string | null): number | null => {
      const n = Number.parseInt(raw ?? '', 10);
      return Number.isFinite(n) ? n : null;
    };
    const quota: ProviderQuota = {
      plan: response.headers.get('x-plan'),
      quota: toInt(response.headers.get('x-quota')),
      usedThisMonth: toInt(response.headers.get('x-usage-month')),
    };

    if (!response.ok) {
      const retryAfter = Number.parseInt(response.headers.get('retry-after') ?? '', 10);
      let message = response.statusText || 'Upstream error';
      try {
        const body = await response.text();
        if (body) message = body.slice(0, 200);
      } catch { /* body is optional context only */ }

      return {
        ok: false,
        status: response.status,
        kind: classify(response.status),
        message,
        retryAfterSec: Number.isFinite(retryAfter) ? retryAfter : undefined,
        latencyMs,
      };
    }

    try {
      return { ok: true, data: await response.json(), latencyMs, quota };
    } catch {
      return {
        ok: false, status: 502, kind: 'malformed',
        message: 'Upstream returned a non-JSON body', latencyMs,
      };
    }
  } catch (error) {
    const aborted = error instanceof Error && error.name === 'AbortError';
    return {
      ok: false,
      status: aborted ? 504 : 502,
      kind: 'network',
      message: aborted ? `Upstream timed out after ${timeoutMs}ms` : 'Upstream request failed',
      latencyMs: Date.now() - startedAt,
    };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Retries only transient failures (network/5xx). Auth, permission, 404 and 429
 * are never retried — retrying those wastes a strictly limited free quota.
 */
export async function fetchUpstream(
  upstreamPath: string,
  query: Record<string, string> = {}
): Promise<UpstreamResult> {
  const { maxRetries } = getConfig();

  let last: UpstreamResult = await attempt(upstreamPath, query);
  for (let i = 0; i < maxRetries; i += 1) {
    if (!isFailure(last)) return last;
    if (last.kind !== 'network' && last.kind !== 'server') return last;
    await sleep(2 ** i * 500);
    last = await attempt(upstreamPath, query);
  }

  return last;
}
