import { PrismaClient } from '@prisma/client';
import * as redis from './redis.service';
import crypto from 'crypto';

/**
 * Cache Service
 * Handles ESI response caching with Redis (L1) and PostgreSQL (L2) fallback
 */

const prisma = new PrismaClient();

interface CacheEntry {
  data: unknown;
  expiresAt: Date;
  etag?: string;
}

/**
 * Generate cache key from ESI endpoint and parameters
 */
export function generateCacheKey(
  endpoint: string,
  params?: Record<string, unknown>,
): string {
  const baseKey = endpoint.replace(/^\/+|\/+$/g, '').replace(/\//g, ':');

  if (!params || Object.keys(params).length === 0) {
    return `esi:${baseKey}`;
  }

  // Sort params for consistent hashing
  const sortedParams = Object.keys(params)
    .sort()
    .reduce(
      (acc, key) => {
        acc[key] = params[key];
        return acc;
      },
      {} as Record<string, unknown>,
    );

  const paramHash = crypto
    .createHash('md5')
    .update(JSON.stringify(sortedParams))
    .digest('hex')
    .substring(0, 8);

  return `esi:${baseKey}:${paramHash}`;
}

/**
 * Get cached data from Redis or PostgreSQL
 */
export async function get(cacheKey: string): Promise<CacheEntry | null> {
  // Try Redis first (L1 cache)
  if (redis.isConnected()) {
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        const entry = JSON.parse(cached) as CacheEntry;

        // Check if expired
        if (new Date(entry.expiresAt) > new Date()) {
          console.info(`[Cache] Redis HIT: ${cacheKey}`);
          return {
            ...entry,
            expiresAt: new Date(entry.expiresAt), // Parse date string
          };
        } else {
          // Expired, delete from Redis
          await redis.del(cacheKey);
          console.info(`[Cache] Redis EXPIRED: ${cacheKey}`);
        }
      }
    } catch (error) {
      console.error(`[Cache] Redis get error for ${cacheKey}:`, error);
      // Fall through to database
    }
  }

  // Try PostgreSQL (L2 cache)
  try {
    const cached = await prisma.cachedData.findUnique({
      where: { cacheKey },
    });

    if (cached) {
      // Check if expired
      if (cached.expiresAt > new Date()) {
        console.info(`[Cache] Database HIT: ${cacheKey}`);

        // Warm Redis cache
        if (redis.isConnected()) {
          const ttl = Math.floor(
            (cached.expiresAt.getTime() - Date.now()) / 1000,
          );
          await redis
            .set(
              cacheKey,
              JSON.stringify({
                data: cached.data,
                expiresAt: cached.expiresAt,
              }),
              ttl,
            )
            .catch(() => {
              /* Ignore Redis errors */
            });
        }

        return {
          data: cached.data,
          expiresAt: cached.expiresAt,
        };
      } else {
        // Expired, delete from database
        await prisma.cachedData.delete({ where: { cacheKey } });
        console.info(`[Cache] Database EXPIRED: ${cacheKey}`);
      }
    }
  } catch (error) {
    console.error(`[Cache] Database get error for ${cacheKey}:`, error);
  }

  console.info(`[Cache] MISS: ${cacheKey}`);
  return null;
}

/**
 * Set cached data in both Redis and PostgreSQL
 */
export async function set(
  cacheKey: string,
  data: unknown,
  expiresAt: Date,
  etag?: string,
): Promise<void> {
  const entry: CacheEntry = {
    data,
    expiresAt,
    etag,
  };

  const ttl = Math.floor((expiresAt.getTime() - Date.now()) / 1000);

  // Don't cache if already expired
  if (ttl <= 0) {
    console.warn(`[Cache] Skipping cache for ${cacheKey} (already expired)`);
    return;
  }

  // Save to Redis (L1)
  if (redis.isConnected()) {
    try {
      await redis.set(cacheKey, JSON.stringify(entry), ttl);
      console.info(`[Cache] Redis SET: ${cacheKey} (TTL: ${ttl}s)`);
    } catch (error) {
      console.error(`[Cache] Redis set error for ${cacheKey}:`, error);
    }
  }

  // Save to PostgreSQL (L2) for persistence
  try {
    await prisma.cachedData.upsert({
      where: { cacheKey },
      create: {
        cacheKey,
        data: data as object,
        expiresAt,
      },
      update: {
        data: data as object,
        expiresAt,
      },
    });
    console.info(`[Cache] Database SET: ${cacheKey}`);
  } catch (error) {
    console.error(`[Cache] Database set error for ${cacheKey}:`, error);
  }
}

/**
 * Delete cached data from both Redis and PostgreSQL
 */
export async function del(cacheKey: string): Promise<void> {
  // Delete from Redis
  if (redis.isConnected()) {
    try {
      await redis.del(cacheKey);
      console.info(`[Cache] Redis DELETE: ${cacheKey}`);
    } catch (error) {
      console.error(`[Cache] Redis delete error for ${cacheKey}:`, error);
    }
  }

  // Delete from PostgreSQL
  try {
    await prisma.cachedData.deleteMany({
      where: { cacheKey },
    });
    console.info(`[Cache] Database DELETE: ${cacheKey}`);
  } catch (error) {
    console.error(`[Cache] Database delete error for ${cacheKey}:`, error);
  }
}

/**
 * Delete all cached data matching a pattern
 */
export async function deletePattern(pattern: string): Promise<void> {
  // Delete from Redis
  if (redis.isConnected()) {
    try {
      const deleted = await redis.deletePattern(pattern);
      console.info(`[Cache] Redis DELETE PATTERN: ${pattern} (${deleted} keys)`);
    } catch (error) {
      console.error(`[Cache] Redis delete pattern error for ${pattern}:`, error);
    }
  }

  // Delete from PostgreSQL (pattern matching with SQL LIKE)
  try {
    const sqlPattern = pattern.replace(/\*/g, '%');
    const deleted = await prisma.cachedData.deleteMany({
      where: {
        cacheKey: {
          contains: sqlPattern.replace('%', ''),
        },
      },
    });
    console.info(
      `[Cache] Database DELETE PATTERN: ${pattern} (${deleted.count} entries)`,
    );
  } catch (error) {
    console.error(`[Cache] Database delete pattern error for ${pattern}:`, error);
  }
}

/**
 * Parse Cache-Control header and return TTL in seconds
 */
export function parseCacheControl(cacheControl: string | undefined): number {
  if (!cacheControl) {
    return parseInt(process.env['REDIS_CACHE_TTL_DEFAULT'] || '300', 10);
  }

  // Look for max-age directive
  const maxAgeMatch = cacheControl.match(/max-age=(\d+)/);
  if (maxAgeMatch && maxAgeMatch[1]) {
    return parseInt(maxAgeMatch[1], 10);
  }

  // Default TTL
  return parseInt(process.env['REDIS_CACHE_TTL_DEFAULT'] || '300', 10);
}

/**
 * Calculate expiration date from Cache-Control header
 */
export function calculateExpiration(
  cacheControl: string | undefined,
  expiresHeader?: string,
): Date {
  // Try Cache-Control first
  if (cacheControl) {
    const ttl = parseCacheControl(cacheControl);
    return new Date(Date.now() + ttl * 1000);
  }

  // Try Expires header
  if (expiresHeader) {
    const expiresDate = new Date(expiresHeader);
    if (!isNaN(expiresDate.getTime())) {
      return expiresDate;
    }
  }

  // Default expiration (5 minutes)
  const defaultTtl = parseInt(process.env['REDIS_CACHE_TTL_DEFAULT'] || '300', 10);
  return new Date(Date.now() + defaultTtl * 1000);
}

/**
 * Clean up expired cache entries
 */
export async function cleanupExpired(): Promise<number> {
  try {
    const deleted = await prisma.cachedData.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    console.info(`[Cache] Cleaned up ${deleted.count} expired entries`);
    return deleted.count;
  } catch (error) {
    console.error('[Cache] Cleanup error:', error);
    return 0;
  }
}
