// @ts-nocheck - ESI rate limiting needs type refactoring
import * as redis from './redis.service';
import { createLogger } from './logger.service';

const logger = createLogger({ service: 'RateLimiter' });

/**
 * Rate Limiter Service
 * Handles ESI error limits (420) and rate limits (429)
 *
 * ESI Error Limits:
 * - 100 errors per 60-second window
 * - Headers: X-ESI-Error-Limit-Remain, X-ESI-Error-Limit-Reset
 *
 * ESI Rate Limits (new in 2025):
 * - Token bucket system per route group
 * - Headers: X-Ratelimit-Group, X-Ratelimit-Limit, X-Ratelimit-Used
 */

interface ErrorLimitState {
  errorsRemaining: number;
  resetAt: Date;
}

interface RateLimitState {
  group: string;
  tokensRemaining: number;
  windowSeconds: number;
  resetAt: Date;
}

const ERROR_LIMIT_THRESHOLD = parseInt(process.env['ESI_ERROR_LIMIT_THRESHOLD'] || '80', 10); // Stop at 80%

/**
 * Track error limit from response headers
 */
export function trackErrorLimit(headers: Record<string, string | string[]>): void {
  const remain = headers['x-esi-error-limit-remain'];
  const reset = headers['x-esi-error-limit-reset'];

  if (!remain || !reset) {
    return;
  }

  const errorsRemaining = parseInt(Array.isArray(remain) ? remain[0] : remain!, 10);
  const resetSeconds = parseInt(Array.isArray(reset) ? reset[0] : reset!, 10);

  const state: ErrorLimitState = {
    errorsRemaining,
    resetAt: new Date(Date.now() + resetSeconds * 1000),
  };

  // Store in Redis if available
  if (redis.isConnected()) {
    redis.set('esi:error_limit', JSON.stringify(state), resetSeconds).catch(() => {
      /* Ignore errors */
    });
  }

  // Warn if approaching limit
  if (errorsRemaining <= ERROR_LIMIT_THRESHOLD) {
    logger.warn('Approaching ESI error limit', { errorsRemaining });
  }
}

/**
 * Track rate limit from response headers
 */
export function trackRateLimit(headers: Record<string, string | string[]>): void {
  const group = headers['x-ratelimit-group'];
  const limit = headers['x-ratelimit-limit'];
  const used = headers['x-ratelimit-used'];

  if (!group || !limit || !used) {
    return;
  }

  const groupStr = Array.isArray(group) ? group[0] : group!;
  const usedTokens = parseInt(Array.isArray(used) ? used[0] : used!, 10);

  // Parse limit format: "150/15m"
  const limitStr = Array.isArray(limit) ? limit[0] : limit!;
  const limitMatch = limitStr.match(/(\d+)\/(\d+)([smh])/);

  if (!limitMatch) {
    return;
  }

  const totalTokens = parseInt(limitMatch[1], 10);
  const windowValue = parseInt(limitMatch[2], 10);
  const windowUnit = limitMatch[3];

  let windowSeconds = windowValue;
  if (windowUnit === 'm') windowSeconds *= 60;
  else if (windowUnit === 'h') windowSeconds *= 3600;

  const tokensRemaining = totalTokens - usedTokens;

  const state: RateLimitState = {
    group: groupStr,
    tokensRemaining,
    windowSeconds,
    resetAt: new Date(Date.now() + windowSeconds * 1000),
  };

  // Store in Redis if available
  if (redis.isConnected()) {
    redis.set(`esi:rate_limit:${groupStr}`, JSON.stringify(state), windowSeconds).catch(() => {
      /* Ignore errors */
    });
  }

  // Warn if approaching limit (80% of tokens used)
  const threshold = totalTokens * 0.2; // 20% remaining = 80% used
  if (tokensRemaining <= threshold) {
    logger.warn('Approaching ESI rate limit', {
      group: groupStr,
      tokensRemaining,
      totalTokens,
    });
  }
}

/**
 * Check if we should throttle requests due to error limit
 */
export async function shouldThrottleErrors(): Promise<{
  shouldWait: boolean;
  waitSeconds: number;
  reason?: string;
}> {
  if (!redis.isConnected()) {
    return { shouldWait: false, waitSeconds: 0 };
  }

  try {
    const stateStr = await redis.get('esi:error_limit');
    if (!stateStr) {
      return { shouldWait: false, waitSeconds: 0 };
    }

    const state = JSON.parse(stateStr) as ErrorLimitState;

    // Check if limit is breached or approaching threshold
    if (state.errorsRemaining <= 0) {
      const waitSeconds = Math.ceil((new Date(state.resetAt).getTime() - Date.now()) / 1000);
      return {
        shouldWait: true,
        waitSeconds: Math.max(waitSeconds, 0),
        reason: 'Error limit exceeded (420)',
      };
    }

    if (state.errorsRemaining <= ERROR_LIMIT_THRESHOLD) {
      // Slow down requests when approaching limit
      return {
        shouldWait: true,
        waitSeconds: 2, // Small delay to reduce error rate
        reason: `Approaching error limit (${state.errorsRemaining} remaining)`,
      };
    }

    return { shouldWait: false, waitSeconds: 0 };
  } catch (error) {
    logger.error('Error checking ESI error limit', error as Error);
    return { shouldWait: false, waitSeconds: 0 };
  }
}

/**
 * Check if we should throttle requests due to rate limit
 */
export async function shouldThrottleRate(routeGroup?: string): Promise<{
  shouldWait: boolean;
  waitSeconds: number;
  reason?: string;
}> {
  if (!routeGroup || !redis.isConnected()) {
    return { shouldWait: false, waitSeconds: 0 };
  }

  try {
    const stateStr = await redis.get(`esi:rate_limit:${routeGroup}`);
    if (!stateStr) {
      return { shouldWait: false, waitSeconds: 0 };
    }

    const state = JSON.parse(stateStr) as RateLimitState;

    // Check if no tokens remaining
    if (state.tokensRemaining <= 0) {
      const waitSeconds = Math.ceil((new Date(state.resetAt).getTime() - Date.now()) / 1000);
      return {
        shouldWait: true,
        waitSeconds: Math.max(waitSeconds, 0),
        reason: `Rate limit exceeded for ${routeGroup} (429)`,
      };
    }

    return { shouldWait: false, waitSeconds: 0 };
  } catch (error) {
    logger.error('Error checking ESI rate limit', error as Error);
    return { shouldWait: false, waitSeconds: 0 };
  }
}

/**
 * Wait for rate limit to reset
 */
export async function waitForReset(seconds: number, reason?: string): Promise<void> {
  if (seconds <= 0) {
    return;
  }

  logger.warn('Rate limit wait initiated', { seconds, reason: reason || 'rate limit' });

  return new Promise((resolve) => {
    setTimeout(resolve, seconds * 1000);
  });
}

/**
 * Parse Retry-After header (from 429 response)
 */
export function parseRetryAfter(retryAfter: string | string[] | undefined): number {
  if (!retryAfter) {
    return 60; // Default 1 minute
  }

  const value = Array.isArray(retryAfter) ? retryAfter[0] : retryAfter!;

  // Try parsing as seconds
  const seconds = parseInt(value, 10);
  if (!isNaN(seconds)) {
    return seconds;
  }

  // Try parsing as HTTP date
  const date = new Date(value);
  if (!isNaN(date.getTime())) {
    return Math.ceil((date.getTime() - Date.now()) / 1000);
  }

  return 60; // Default fallback
}

/**
 * Reset error limit tracking (for testing)
 */
export async function resetErrorLimit(): Promise<void> {
  if (redis.isConnected()) {
    await redis.del('esi:error_limit');
  }
}

/**
 * Reset rate limit tracking for a group (for testing)
 */
export async function resetRateLimit(group: string): Promise<void> {
  if (redis.isConnected()) {
    await redis.del(`esi:rate_limit:${group}`);
  }
}
