class CacheService {
  constructor() {
    this.store = new Map(); 
    this.inFlight = new Map(); 
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
