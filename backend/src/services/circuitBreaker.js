const CLOSED = 'CLOSED';
const OPEN = 'OPEN';
const HALF_OPEN = 'HALF_OPEN';

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
