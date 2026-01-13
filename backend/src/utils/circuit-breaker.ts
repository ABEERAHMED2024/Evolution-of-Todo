// Circuit breaker implementation for service resilience
// Located in backend/src/utils/circuit-breaker.ts

interface CircuitBreakerOptions {
  timeout?: number;
  maxFailures?: number;
  resetTimeout?: number;
}

type State = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export class CircuitBreaker {
  private state: State = 'CLOSED';
  private failureCount = 0;
  private lastFailureTime: number | null = null;
  
  private readonly timeout: number;
  private readonly maxFailures: number;
  private readonly resetTimeout: number;

  constructor(private name: string, options: CircuitBreakerOptions = {}) {
    this.timeout = options.timeout || 60000; // 60 seconds
    this.maxFailures = options.maxFailures || 5;
    this.resetTimeout = options.resetTimeout || 60000; // 60 seconds
  }

  async call<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (this.shouldAttemptReset()) {
        this.state = 'HALF_OPEN';
        console.log('Circuit breaker ' + this.name + ' transitioning to HALF_OPEN');
      } else {
        throw new Error('Circuit breaker ' + this.name + ' is OPEN. Call rejected.');
      }
    }

    try {
      const result = await this.executeWithTimeout(fn, this.timeout);
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private async executeWithTimeout<T>(fn: () => Promise<T>, timeout: number): Promise<T> {
    return Promise.race([
      fn(),
      new Promise<T>((_, reject) => 
        setTimeout(() => reject(new Error('Circuit breaker timeout')), timeout)
      )
    ]);
  }

  private onSuccess(): void {
    this.failureCount = 0;
    this.state = 'CLOSED';
    this.lastFailureTime = null;
    console.log('Circuit breaker ' + this.name + ' is CLOSED (success)');
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.maxFailures) {
      this.state = 'OPEN';
      console.log('Circuit breaker ' + this.name + ' is OPEN (too many failures)');
    } else {
      console.log('Circuit breaker ' + this.name + ' failure #' + this.failureCount);
    }
  }

  private shouldAttemptReset(): boolean {
    if (\!this.lastFailureTime) return false;
    return Date.now() - this.lastFailureTime > this.resetTimeout;
  }

  getState(): State {
    return this.state;
  }

  getFailureCount(): number {
    return this.failureCount;
  }
}
