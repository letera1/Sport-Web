/**
 * Vercel serverless entry point — the only place the browser can reach SportDB.
 * Everything below `/api/sportdb/` is validated and forwarded by the shared core.
 */

import { handleProxyRequest } from '../_lib/proxy.js';
import { clientIdFrom } from '../_lib/rateLimit.js';

interface VercelRequest {
  method?: string;
  url?: string;
  query?: Record<string, string | string[] | undefined>;
  headers: Record<string, string | string[] | undefined>;
}

interface VercelResponse {
  status(code: number): VercelResponse;
  setHeader(name: string, value: string): void;
  json(body: unknown): void;
  end(): void;
}

const ROUTE_PREFIX = '/api/sportdb/';

/**
 * Resolves the catch-all segments.
 *
 * `query.path` is the documented source, but when `vercel.json` declares
 * `rewrites` the platform routes this request without injecting the dynamic
 * param, leaving it undefined — every path then looked like an empty route and
 * was rejected as `unknown_endpoint`. The raw URL is always present, so it is
 * used as the fallback.
 */
function toSegments(req: VercelRequest): string[] {
  const raw = req.query?.path;
  if (Array.isArray(raw) && raw.length > 0) return raw;
  if (typeof raw === 'string' && raw) return raw.split('/');

  const pathname = (req.url ?? '').split('?')[0];
  const start = pathname.indexOf(ROUTE_PREFIX);
  if (start === -1) return [];

  return pathname
    .slice(start + ROUTE_PREFIX.length)
    .split('/')
    .filter(Boolean)
    .map((segment) => {
      try {
        return decodeURIComponent(segment);
      } catch {
        return segment;
      }
    });
}

/** Decoding happens here rather than in the platform, so re-check traversal. */
const isSafeSegment = (segment: string): boolean =>
  segment !== '.' && segment !== '..' && !segment.includes('/') && !segment.includes('\\');

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'GET') {
    res.status(405).setHeader('Allow', 'GET');
    res.json({ error: { code: 'method_not_allowed', message: 'Only GET is supported.' } });
    return;
  }

  const query: Record<string, string> = {};
  for (const [name, value] of Object.entries(req.query ?? {})) {
    if (name === 'path') continue;
    const single = Array.isArray(value) ? value[0] : value;
    if (typeof single === 'string') query[name] = single;
  }

  const result = await handleProxyRequest({
    segments: toSegments(req).filter(isSafeSegment),
    query,
    clientId: clientIdFrom(req.headers),
  });

  for (const [name, value] of Object.entries(result.headers)) res.setHeader(name, value);
  res.status(result.status).json(result.body);
}
