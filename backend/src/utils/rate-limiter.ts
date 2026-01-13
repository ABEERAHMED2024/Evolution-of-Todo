// Rate limiter implementation for API endpoints
// Located in backend/src/utils/rate-limiter.ts

interface RateLimitOptions {
  windowMs: number; // Window in milliseconds
  max: number; // Max number of requests per window
}

class RateLimitStore {
  private hits: Map<string, number[]> = new Map();

  increment(key: string): number {
    const now = Date.now();
    const timestamps = this.hits.get(key) || [];
    
    // Remove old hits that are outside the window
    const windowStart = now - 1000; // 1 second window
    const recentHits = timestamps.filter(timestamp => timestamp > windowStart);
    
    // Add current hit
    recentHits.push(now);
    this.hits.set(key, recentHits);
    
    return recentHits.length;
  }

  reset(key: string): void {
    this.hits.delete(key);
  }
}

export class RateLimiter {
  private store: RateLimitStore;
  private readonly windowMs: number;
  private readonly max: number;

  constructor(options: RateLimitOptions) {
    this.store = new RateLimitStore();
    this.windowMs = options.windowMs;
    this.max = options.max;
  }

  check(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    const hits = this.store.increment(identifier);
    const now = Date.now();
    const resetTime = now + this.windowMs;

    return {
      allowed: hits <= this.max,
      remaining: Math.max(0, this.max - hits),
      resetTime
    };
  }

  reset(identifier: string): void {
    this.store.reset(identifier);
  }
}
