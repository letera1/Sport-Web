/**
 * Vercel serverless entry point — the only place the browser can reach SportDB.
 * Everything below `/api/sportdb/` is validated and forwarded by the shared core.
 */

import { handleProxyRequest } from '../_lib/proxy.js';
import { clientIdFrom } from '../_lib/rateLimit.js';

interface VercelRequest {
  method?: string;
  url?: string;
  query: Record<string, string | string[] | undefined>;
  headers: Record<string, string | string[] | undefined>;
}

interface VercelResponse {
  status(code: number): VercelResponse;
  setHeader(name: string, value: string): void;
  json(body: unknown): void;
  end(): void;
}

function toSegments(query: VercelRequest['query']): string[] {
  const raw = query.path;
  if (Array.isArray(raw)) return raw;
  return typeof raw === 'string' && raw ? raw.split('/') : [];
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'GET') {
    res.status(405).setHeader('Allow', 'GET');
    res.json({ error: { code: 'method_not_allowed', message: 'Only GET is supported.' } });
    return;
  }

  const result = await handleProxyRequest({
    segments: toSegments(req.query),
    clientId: clientIdFrom(req.headers),
  });

  for (const [name, value] of Object.entries(result.headers)) res.setHeader(name, value);
  res.status(result.status).json(result.body);
}
