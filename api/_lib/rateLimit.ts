/** Fixed-window per-client limiter guarding *our* endpoint from quota abuse. */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();
const MAX_TRACKED = 5_000;

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSec: number;
}

export function checkRateLimit(clientId: string, windowMs: number, max: number): RateLimitResult {
  const now = Date.now();
  let bucket = buckets.get(clientId);

  if (!bucket || now >= bucket.resetAt) {
    if (buckets.size >= MAX_TRACKED) buckets.clear();
    bucket = { count: 0, resetAt: now + windowMs };
    buckets.set(clientId, bucket);
  }

  bucket.count += 1;
  const remaining = Math.max(0, max - bucket.count);

  return {
    allowed: bucket.count <= max,
    remaining,
    retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
  };
}

/** Derives a client id from proxy headers without trusting arbitrary user input. */
export function clientIdFrom(headers: Record<string, string | string[] | undefined>): string {
  const pick = (name: string): string | undefined => {
    const raw = headers[name];
    const value = Array.isArray(raw) ? raw[0] : raw;
    return value?.split(',')[0]?.trim() || undefined;
  };

  const ip = pick('x-real-ip') || pick('x-forwarded-for') || 'unknown';
  return ip.slice(0, 64);
}
