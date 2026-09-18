/**
 * TTL cache with stale-while-error support plus in-flight request deduplication.
 *
 * Backed by process memory. On Vercel this is per-instance and resets on cold
 * start, which is acceptable because every miss is still protected by the
 * upstream budget guard. The `CacheStore` interface is the seam to swap in
 * Redis/Upstash for multi-instance production caching.
 */

export interface CacheEntry<T> {
  data: T;
  storedAt: number;
  /** Fresh until this timestamp. */
  expiresAt: number;
  /** Usable as emergency fallback until this timestamp, even though stale. */
  staleUntil: number;
}

export interface CacheStore {
  get<T>(key: string): CacheEntry<T> | undefined;
  set<T>(key: string, entry: CacheEntry<T>): void;
  size(): number;
}

const MAX_ENTRIES = 500;
/** How long an expired entry stays usable as a fallback when upstream fails. */
const STALE_GRACE_MS = 6 * 60 * 60 * 1000;

class MemoryStore implements CacheStore {
  private map = new Map<string, CacheEntry<unknown>>();

  get<T>(key: string): CacheEntry<T> | undefined {
    const entry = this.map.get(key) as CacheEntry<T> | undefined;
    if (!entry) return undefined;
    if (Date.now() > entry.staleUntil) {
      this.map.delete(key);
      return undefined;
    }
    return entry;
  }

  set<T>(key: string, entry: CacheEntry<T>): void {
    // Cheap LRU-ish bound: drop the oldest insertion when full.
    if (this.map.size >= MAX_ENTRIES) {
      const oldest = this.map.keys().next().value;
      if (oldest !== undefined) this.map.delete(oldest);
    }
    this.map.delete(key);
    this.map.set(key, entry as CacheEntry<unknown>);
  }

  size(): number {
    return this.map.size;
  }
}

const store: CacheStore = new MemoryStore();
const inflight = new Map<string, Promise<unknown>>();

export function readCache<T>(key: string): { entry: CacheEntry<T>; fresh: boolean } | undefined {
  const entry = store.get<T>(key);
  if (!entry) return undefined;
  return { entry, fresh: Date.now() <= entry.expiresAt };
}

export function writeCache<T>(key: string, data: T, ttlMs: number): CacheEntry<T> {
  const now = Date.now();
  const entry: CacheEntry<T> = {
    data,
    storedAt: now,
    expiresAt: now + ttlMs,
    staleUntil: now + ttlMs + STALE_GRACE_MS,
  };
  store.set(key, entry);
  return entry;
}

/**
 * Collapses concurrent identical requests into a single upstream call, so N
 * simultaneous users asking for the same standings cost exactly one request.
 */
export function dedupe<T>(key: string, factory: () => Promise<T>): Promise<T> {
  const existing = inflight.get(key);
  if (existing) return existing as Promise<T>;

  const promise = factory().finally(() => {
    inflight.delete(key);
  });

  inflight.set(key, promise);
  return promise;
}

export function cacheStats() {
  return { entries: store.size(), inflight: inflight.size };
}
