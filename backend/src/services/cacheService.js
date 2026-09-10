/**
 * Lightweight in-memory cache with per-key TTL and in-flight request
 * de-duplication.
 *
 * Why not just Redis? For the scope of this assignment a single backend
 * process is enough, and an in-memory cache avoids an extra infra
 * dependency. The interface below is deliberately small so it could be
 * swapped for a Redis-backed implementation later without touching the
 * services that call it (see README "What I'd improve").
 */
class CacheService {
  constructor() {
    this.store = new Map(); // key -> { value, expiresAt }
    this.inFlight = new Map(); // key -> Promise
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  /** Returns a stale value even if expired - used as a fallback when the
   * upstream API is unavailable, so users still see something instead of
   * a hard error. */
  getStale(key) {
    const entry = this.store.get(key);
    return entry ? entry.value : undefined;
  }

  set(key, value, ttlSeconds) {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  /**
   * Wraps a fetcher function so that:
   *  - a fresh cache hit is returned immediately
   *  - concurrent calls for the same key share a single in-flight request
   *    instead of firing N identical upstream requests (this is what
   *    protects us when the user changes filters quickly or several tabs
   *    request the same page at once)
   *  - a fresh value is cached, and on failure we fall back to a stale
   *    cached value if one exists
   */
  async getOrFetch(key, ttlSeconds, fetcher) {
    const cached = this.get(key);
    if (cached !== undefined) return { data: cached, source: 'cache' };

    if (this.inFlight.has(key)) {
      const data = await this.inFlight.get(key);
      return { data, source: 'in-flight' };
    }

    const promise = fetcher()
      .then((data) => {
        this.set(key, data, ttlSeconds);
        this.inFlight.delete(key);
        return data;
      })
      .catch((err) => {
        this.inFlight.delete(key);
        const stale = this.getStale(key);
        if (stale !== undefined) {
          return stale;
        }
        throw err;
      });

    this.inFlight.set(key, promise);
    const data = await promise;
    return { data, source: 'network' };
  }
}

module.exports = new CacheService();
