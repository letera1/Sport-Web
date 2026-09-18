/**
 * Thin HTTP client for SportDB.dev. The API key is attached here and nowhere
 * else, and is never returned, logged, or echoed into error messages.
 */

import { getConfig } from './config';

export interface UpstreamSuccess {
  ok: true;
  data: unknown;
  latencyMs: number;
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

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function classify(status: number): UpstreamFailure['kind'] {
  if (status === 401) return 'auth';
  if (status === 402 || status === 403) return 'forbidden';
  if (status === 404) return 'not_found';
  if (status === 429) return 'rate_limited';
  return 'server';
}

async function attempt(upstreamPath: string): Promise<UpstreamResult> {
  const { apiKey, baseUrl, timeoutMs } = getConfig();
  const startedAt = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${baseUrl}/api/${upstreamPath}`, {
      method: 'GET',
      headers: {
        'X-API-Key': apiKey as string,
        Accept: 'application/json',
        'User-Agent': 'statscore/1.0',
      },
      signal: controller.signal,
    });

    const latencyMs = Date.now() - startedAt;

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
      return { ok: true, data: await response.json(), latencyMs };
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
export async function fetchUpstream(upstreamPath: string): Promise<UpstreamResult> {
  const { maxRetries } = getConfig();

  let last: UpstreamResult = await attempt(upstreamPath);
  for (let i = 0; i < maxRetries; i += 1) {
    if (last.ok) return last;
    if (last.kind !== 'network' && last.kind !== 'server') return last;
    await sleep(2 ** i * 500);
    last = await attempt(upstreamPath);
  }

  return last;
}
