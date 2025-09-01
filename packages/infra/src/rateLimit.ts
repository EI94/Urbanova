import { getFirestoreInstance, serverTimestamp } from './firebase';
import type { RateLimitResult, RateLimitConfig } from '@urbanova/types';

// Default rate limit configuration
const DEFAULT_CONFIG: RateLimitConfig = {
  capacity: 10,
  refillRate: 1,
  windowSeconds: 20,
  burstSize: 15,
};

/**
 * Rate limiter using token bucket algorithm with Firestore
 */
export class TokenBucketRateLimiter {
  private config: RateLimitConfig = DEFAULT_CONFIG;

  constructor(config?: Partial<RateLimitConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }

  /**
   * Check if request is allowed and consume token
   */
  async checkRateLimit(
    key: string,
    config: RateLimitConfig = this.config
  ): Promise<RateLimitResult> {
    try {
      const firestore = getFirestoreInstance();
      const docRef = firestore.collection('rateLimits').doc(key);
      const docSnap = await docRef.get();

      const now = Date.now();
      let tokens: number;
      let lastRefill: number;

      if (docSnap.exists) {
        const data = docSnap.data()!;
        tokens = data.tokens || 0;
        lastRefill = data.lastRefill || now;

        // Refill tokens based on time elapsed
        const timePassed = now - lastRefill;
        const tokensToAdd =
          Math.floor(timePassed / (config.windowSeconds * 1000)) * config.refillRate;
        tokens = Math.min(config.capacity, tokens + tokensToAdd);
        lastRefill = now;
      } else {
        // Create new bucket
        tokens = config.capacity;
        lastRefill = now;
      }

      // Check if request is allowed
      if (tokens <= 0) {
        const resetTime = new Date(now + config.windowSeconds * 1000);
        const retryAfter = Math.ceil(config.windowSeconds);

        return {
          allowed: false,
          remaining: 0,
          resetTime,
          retryAfter,
          limit: config.capacity,
          window: config.windowSeconds,
        };
      }

      // Consume token
      const remaining = tokens - 1;

      // Update state
      if (docSnap.exists) {
        await docRef.update({
          tokens: remaining,
          lastRefill,
          updatedAt: serverTimestamp(),
        });
      } else {
        await docRef.set({
          tokens: remaining,
          lastRefill,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      return {
        allowed: true,
        remaining,
        resetTime: new Date(now + config.windowSeconds * 1000),
        retryAfter: 0,
        limit: config.capacity,
        window: config.windowSeconds,
      };
    } catch (error) {
      console.error('Rate limit check failed:', error);

      // On error, deny request
      return {
        allowed: false,
        remaining: 0,
        resetTime: new Date(Date.now() + config.windowSeconds * 1000),
        retryAfter: Math.ceil(config.windowSeconds),
        limit: config.capacity,
        window: config.windowSeconds,
      };
    }
  }

  /**
   * Get current rate limit status without consuming token
   */
  async getRateLimitStatus(
    key: string,
    config: RateLimitConfig = this.config
  ): Promise<RateLimitResult> {
    try {
      const firestore = getFirestoreInstance();
      const docRef = firestore.collection('rateLimits').doc(key);
      const docSnap = await docRef.get();

      const now = Date.now();
      let tokens: number;

      if (docSnap.exists) {
        const data = docSnap.data()!;
        tokens = data.tokens || 0;
        const lastRefill = data.lastRefill || now;

        // Refill tokens based on time elapsed
        const timePassed = now - lastRefill;
        const tokensToAdd =
          Math.floor(timePassed / (config.windowSeconds * 1000)) * config.refillRate;
        tokens = Math.min(config.capacity, tokens + tokensToAdd);
      } else {
        // New bucket would have full capacity
        tokens = config.capacity;
      }

      return {
        allowed: tokens > 0,
        remaining: tokens,
        resetTime: new Date(now + config.windowSeconds * 1000),
        retryAfter: tokens > 0 ? 0 : Math.ceil(config.windowSeconds),
        limit: config.capacity,
        window: config.windowSeconds,
      };
    } catch (error) {
      console.error('Rate limit status check failed:', error);
      return {
        allowed: false,
        remaining: 0,
        resetTime: new Date(Date.now() + config.windowSeconds * 1000),
        retryAfter: Math.ceil(config.windowSeconds),
        limit: config.capacity,
        window: config.windowSeconds,
      };
    }
  }
}

// Export singleton instance
export const rateLimiter = new TokenBucketRateLimiter();

/**
 * Check rate limit for WhatsApp sender
 */
export async function checkWhatsAppRateLimit(waSenderId: string): Promise<RateLimitResult> {
  return rateLimiter.checkRateLimit(waSenderId);
}

/**
 * Get rate limit status for WhatsApp sender
 */
export async function getWhatsAppRateLimitStatus(waSenderId: string): Promise<RateLimitResult> {
  return rateLimiter.getRateLimitStatus(waSenderId);
}
