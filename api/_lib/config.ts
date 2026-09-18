/**
 * Server-only configuration. This module must never be imported from `src/`
 * (anything under `src/` is bundled into the browser).
 */

const DEFAULT_BASE_URL = 'https://api.sportdb.dev';

export interface SportdbConfig {
  apiKey: string | null;
  baseUrl: string;
  /** Hard ceiling on upstream calls per counter window. Free tier is ~100-1000 lifetime requests. */
  requestBudget: number;
  budgetWindowMs: number;
  allowedSports: string[];
  timeoutMs: number;
  maxRetries: number;
  /** Per-IP request allowance against *our* endpoint (not upstream). */
  rateLimit: { windowMs: number; max: number };
}

function parseIntEnv(value: string | undefined, fallback: number): number {
  const n = Number.parseInt(value ?? '', 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

/** Operator-controlled only — never derived from request input, to avoid SSRF. */
function resolveBaseUrl(): string {
  const raw = process.env.SPORTDB_BASE_URL?.trim();
  if (!raw) return DEFAULT_BASE_URL;
  try {
    const url = new URL(raw);
    if (url.protocol !== 'https:' || url.username || url.password) return DEFAULT_BASE_URL;
    return url.origin;
  } catch {
    return DEFAULT_BASE_URL;
  }
}

let cached: SportdbConfig | null = null;

export function getConfig(): SportdbConfig {
  if (cached) return cached;

  cached = {
    apiKey: process.env.SPORTDB_API_KEY?.trim() || null,
    baseUrl: resolveBaseUrl(),
    requestBudget: parseIntEnv(process.env.SPORTDB_REQUEST_BUDGET, 800),
    budgetWindowMs: parseIntEnv(process.env.SPORTDB_BUDGET_WINDOW_MS, 30 * 24 * 60 * 60 * 1000),
    allowedSports: (process.env.SPORTDB_ALLOWED_SPORTS || 'football')
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
    timeoutMs: parseIntEnv(process.env.SPORTDB_TIMEOUT_MS, 10_000),
    maxRetries: parseIntEnv(process.env.SPORTDB_MAX_RETRIES, 2),
    rateLimit: {
      windowMs: parseIntEnv(process.env.SPORTDB_RL_WINDOW_MS, 60_000),
      max: parseIntEnv(process.env.SPORTDB_RL_MAX, 30),
    },
  };

  return cached;
}

/** Test seam — lets the dev server pick up .env edits without a restart. */
export function resetConfigCache(): void {
  cached = null;
}
