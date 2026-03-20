/**
 * Generic TTL-based query cache.
 *
 * Stores results with timestamps and evicts stale entries.
 * Used by the service layer to avoid redundant fetches.
 */

interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
  ttl: number;
}

class QueryCache {
  private cache = new Map<string, CacheEntry>();
  private defaultTtl: number;

  /**
   * @param defaultTtl Default time-to-live in milliseconds (default: 30s)
   */
  constructor(defaultTtl = 30_000) {
    this.defaultTtl = defaultTtl;
  }

  /**
   * Retrieve a cached value. Returns `undefined` if not found or expired.
   */
  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    const age = Date.now() - entry.timestamp;
    if (age > entry.ttl) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.data as T;
  }

  /**
   * Store a value in the cache.
   */
  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl ?? this.defaultTtl,
    });
  }

  /**
   * Check if a key exists and is not expired.
   */
  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  /**
   * Invalidate a specific key, or all keys matching a prefix.
   * @param keyOrPrefix Exact key, or prefix with trailing `*` for pattern matching.
   */
  invalidate(keyOrPrefix: string): void {
    if (keyOrPrefix.endsWith('*')) {
      const prefix = keyOrPrefix.slice(0, -1);
      for (const key of this.cache.keys()) {
        if (key.startsWith(prefix)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.delete(keyOrPrefix);
    }
  }

  /**
   * Clear the entire cache.
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get the number of (potentially stale) entries.
   */
  get size(): number {
    return this.cache.size;
  }
}

/** Singleton cache instance shared across services */
export const queryCache = new QueryCache();
