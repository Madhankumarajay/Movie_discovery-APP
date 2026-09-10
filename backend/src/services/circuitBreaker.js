const CLOSED = 'CLOSED';
const OPEN = 'OPEN';
const HALF_OPEN = 'HALF_OPEN';

/**
 * Minimal circuit breaker around calls to the external TMDB API.
 *
 * Why: if TMDB is slow or down, we don't want every incoming request to
 * hang waiting on a timeout, or to keep hammering an already-struggling
 * service. After N consecutive failures we "open" the circuit and fail
 * fast for a cooldown window, giving stale cache data a chance to be
 * served instead (see cacheService.getOrFetch). After the cooldown we
 * allow a single trial request through (HALF_OPEN) to check recovery.
 */
class CircuitBreaker {
  constructor({ failureThreshold, resetTimeoutMs }) {
    this.failureThreshold = failureThreshold;
    this.resetTimeoutMs = resetTimeoutMs;
    this.state = CLOSED;
    this.failureCount = 0;
    this.nextAttemptAt = 0;
  }

  canRequest() {
    if (this.state === OPEN) {
      if (Date.now() >= this.nextAttemptAt) {
        this.state = HALF_OPEN;
        return true;
      }
      return false;
    }
    return true;
  }

  onSuccess() {
    this.failureCount = 0;
    this.state = CLOSED;
  }

  onFailure() {
    this.failureCount += 1;
    if (this.state === HALF_OPEN || this.failureCount >= this.failureThreshold) {
      this.state = OPEN;
      this.nextAttemptAt = Date.now() + this.resetTimeoutMs;
    }
  }

  getState() {
    return this.state;
  }
}

module.exports = { CircuitBreaker, CLOSED, OPEN, HALF_OPEN };
