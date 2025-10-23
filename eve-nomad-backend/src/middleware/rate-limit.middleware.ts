/**
 * Rate Limiting Middleware
 *
 * Protects authentication endpoints from brute force attacks
 * Uses Redis for distributed rate limiting across multiple servers
 *
 * @module middleware/rate-limit
 */

import rateLimit from '@fastify/rate-limit';
import { FastifyInstance } from 'fastify';
import { createLogger } from '../services/logger.service';
import { redis } from '../services/cache.service';

const logger = createLogger({ service: 'RateLimitMiddleware' });

/**
 * Rate limiting configuration for authentication endpoints
 */
export const authRateLimitConfig = {
  max: 5, // Maximum 5 requests
  timeWindow: '15 minutes', // Per 15 minutes
  cache: 10000, // Keep 10000 keys in memory
  allowList: ['127.0.0.1'], // Localhost exempt (for development/testing)
  redis, // Use Redis for distributed rate limiting
  skipSuccessfulRequests: false, // Count all requests
  skipOnError: true, // Skip rate limiting if Redis is down (fail open)
  keyGenerator: (request: any) => {
    // Rate limit by IP address
    return request.ip || 'unknown';
  },
  errorResponseBuilder: () => {
    return {
      statusCode: 429,
      error: 'Too Many Requests',
      message: 'Too many authentication attempts. Please try again later.',
      retryAfter: 900, // 15 minutes in seconds
    };
  },
  onExceeding: (request: any) => {
    logger.warn('Rate limit exceeded', {
      ip: request.ip,
      url: request.url,
      method: request.method,
    });
  },
};

/**
 * Stricter rate limiting for password reset endpoints
 * (More sensitive to abuse)
 */
export const passwordResetRateLimitConfig = {
  max: 3, // Maximum 3 requests
  timeWindow: '1 hour', // Per hour
  cache: 10000,
  allowList: ['127.0.0.1'],
  redis,
  skipSuccessfulRequests: false,
  skipOnError: true,
  keyGenerator: (request: any) => {
    return request.ip || 'unknown';
  },
  errorResponseBuilder: () => {
    return {
      statusCode: 429,
      error: 'Too Many Requests',
      message: 'Too many password reset attempts. Please try again in 1 hour.',
      retryAfter: 3600, // 1 hour in seconds
    };
  },
  onExceeding: (request: any) => {
    logger.warn('Password reset rate limit exceeded', {
      ip: request.ip,
      url: request.url,
    });
  },
};

/**
 * Register global rate limiting plugin
 */
export async function registerRateLimiting(
  fastify: FastifyInstance,
): Promise<void> {
  await fastify.register(rateLimit, {
    global: false, // Don't apply to all routes by default
    redis, // Use Redis for distributed rate limiting
    nameSpace: 'eve-nomad-rate-limit:', // Redis key prefix
  });

  logger.info('Rate limiting plugin registered');
}

/**
 * Per-email rate limiting (prevents targeting specific accounts)
 *
 * Usage in route handler:
 * ```
 * const limiter = createEmailRateLimiter();
 * await limiter.check(email);
 * ```
 */
export function createEmailRateLimiter() {
  const attempts = new Map<string, { count: number; resetAt: number }>();
  const MAX_ATTEMPTS = 10; // 10 attempts per email
  const WINDOW_MS = 60 * 60 * 1000; // 1 hour

  return {
    check: async (email: string): Promise<void> => {
      const now = Date.now();
      const record = attempts.get(email);

      if (record && now < record.resetAt) {
        if (record.count >= MAX_ATTEMPTS) {
          logger.warn('Email-based rate limit exceeded', { email });
          throw new Error(
            `Too many attempts for this email. Please try again in ${Math.ceil((record.resetAt - now) / 60000)} minutes.`,
          );
        }
        record.count++;
      } else {
        attempts.set(email, { count: 1, resetAt: now + WINDOW_MS });
      }

      // Clean up old entries periodically
      if (attempts.size > 10000) {
        for (const [key, value] of attempts.entries()) {
          if (now >= value.resetAt) {
            attempts.delete(key);
          }
        }
      }
    },

    reset: (email: string): void => {
      attempts.delete(email);
    },
  };
}

/**
 * Account lockout tracking (after repeated failed logins)
 * Stores in Redis for persistence across server restarts
 */
export async function trackFailedLogin(email: string): Promise<boolean> {
  const key = `failed-login:${email}`;
  const attempts = await redis.incr(key);

  if (attempts === 1) {
    // First failed attempt, set expiry to 30 minutes
    await redis.expire(key, 1800);
  }

  if (attempts >= 10) {
    // Lock account after 10 failed attempts
    const lockKey = `account-locked:${email}`;
    await redis.setex(lockKey, 3600, '1'); // Lock for 1 hour
    logger.warn('Account locked due to repeated failed logins', { email });
    return true; // Account is locked
  }

  return false; // Account is not locked
}

/**
 * Check if account is locked
 */
export async function isAccountLocked(email: string): Promise<boolean> {
  const lockKey = `account-locked:${email}`;
  const isLocked = await redis.get(lockKey);
  return isLocked === '1';
}

/**
 * Reset failed login attempts (on successful login)
 */
export async function resetFailedLogins(email: string): Promise<void> {
  const key = `failed-login:${email}`;
  const lockKey = `account-locked:${email}`;
  await redis.del(key);
  await redis.del(lockKey);
}
