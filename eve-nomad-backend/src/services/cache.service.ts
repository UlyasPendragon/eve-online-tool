import { PrismaClient } from '@prisma/client';
import * as redis from './redis.service';
import crypto from 'crypto';
import { createLogger } from './logger.service';

const logger = createLogger({ service: 'CacheService' });

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
export function generateCacheKey(endpoint: string, params?: Record<string, unknown>): string {
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
          logger.info('Cache hit (Redis)', { cacheKey });
          return {
            ...entry,
            expiresAt: new Date(entry.expiresAt), // Parse date string
          };
        } else {
          // Expired, delete from Redis
          await redis.del(cacheKey);
          logger.info('Cache expired (Redis)', { cacheKey });
        }
      }
    } catch (error) {
      logger.error('Redis cache get error', error as Error, { cacheKey });
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
        logger.info('Cache hit (Database)', { cacheKey });

        // Warm Redis cache
        if (redis.isConnected()) {
          const ttl = Math.floor((cached.expiresAt.getTime() - Date.now()) / 1000);
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
        logger.info('Cache expired (Database)', { cacheKey });
      }
    }
  } catch (error) {
    logger.error('Database cache get error', error as Error, { cacheKey });
  }

  logger.info('Cache miss', { cacheKey });
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
    logger.warn('Skipping cache for already expired entry', { cacheKey });
    return;
  }

  // Save to Redis (L1)
  if (redis.isConnected()) {
    try {
      await redis.set(cacheKey, JSON.stringify(entry), ttl);
      logger.info('Cache set (Redis)', { cacheKey, ttl });
    } catch (error) {
      logger.error('Redis cache set error', error as Error, { cacheKey });
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
    logger.info('Cache set (Database)', { cacheKey });
  } catch (error) {
    logger.error('Database cache set error', error as Error, { cacheKey });
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
      logger.info('Cache delete (Redis)', { cacheKey });
    } catch (error) {
      logger.error('Redis cache delete error', error as Error, { cacheKey });
    }
  }

  // Delete from PostgreSQL
  try {
    await prisma.cachedData.deleteMany({
      where: { cacheKey },
    });
    logger.info('Cache delete (Database)', { cacheKey });
  } catch (error) {
    logger.error('Database cache delete error', error as Error, { cacheKey });
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
      logger.info('Cache delete pattern (Redis)', { pattern, deleted });
    } catch (error) {
      logger.error('Redis cache delete pattern error', error as Error, { pattern });
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
    logger.info('Cache delete pattern (Database)', { pattern, count: deleted.count });
  } catch (error) {
    logger.error('Database cache delete pattern error', error as Error, { pattern });
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

    logger.info('Cache cleanup completed', { deletedCount: deleted.count });
    return deleted.count;
  } catch (error) {
    logger.error('Cache cleanup error', error as Error);
    return 0;
  }
}
