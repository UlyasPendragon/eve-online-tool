// @ts-nocheck - Prisma schema type mismatch
import { Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { createLogger } from '../services/logger.service';
import { captureException } from '../config/sentry.config';
import { addJob, createWorker } from '../services/queue.service';
import {
  JobType,
  JobPriority,
  CacheCleanupJobData,
  CacheCleanupJobResult,
} from '../types/jobs';
import * as redis from '../services/redis.service';

const prisma = new PrismaClient();
const logger = createLogger({ module: 'cache-cleanup-job' });

const QUEUE_NAME = 'cache-cleanup';

/**
 * Process cache cleanup job
 * Removes expired or stale cache entries from Redis and PostgreSQL
 */
async function processCacheCleanup(job: Job<CacheCleanupJobData>): Promise<CacheCleanupJobResult> {
  const startTime = Date.now();
  const { type, pattern, maxAge, maxSize, dryRun = false } = job.data;

  logger.info('Processing cache cleanup', {
    type,
    pattern,
    maxAge,
    maxSize,
    dryRun,
    jobId: job.id,
  });

  let itemsRemoved = 0;
  let bytesFreed = 0;

  try {
    switch (type) {
      case 'expired':
        ({ itemsRemoved, bytesFreed } = await cleanExpiredCache(dryRun));
        break;

      case 'lru':
        ({ itemsRemoved, bytesFreed } = await cleanLRUCache(maxSize || 0, dryRun));
        break;

      case 'pattern':
        if (!pattern) {
          throw new Error('Pattern is required for pattern-based cleanup');
        }
        ({ itemsRemoved, bytesFreed } = await cleanCacheByPattern(pattern, dryRun));
        break;

      case 'all':
        ({ itemsRemoved, bytesFreed } = await cleanAllCache(dryRun));
        break;

      default:
        throw new Error(`Unsupported cleanup type: ${type}`);
    }

    const duration = Date.now() - startTime;

    logger.info('Cache cleanup completed', {
      type,
      itemsRemoved,
      bytesFreed,
      dryRun,
      duration,
      jobId: job.id,
    });

    return {
      type,
      itemsRemoved,
      bytesFreed,
      duration,
    };
  } catch (error) {
    const duration = Date.now() - startTime;

    logger.error('Cache cleanup failed', error as Error, {
      type,
      pattern,
      duration,
      jobId: job.id,
    });

    captureException(error as Error, {
      tags: {
        error_type: 'cache_cleanup_failed',
        job_type: JobType.CACHE_CLEANUP,
        cleanup_type: type,
      },
      extra: { pattern, maxAge, maxSize, duration },
    });

    return {
      type,
      itemsRemoved,
      bytesFreed,
      duration,
      error: (error as Error).message,
    };
  }
}

/**
 * Clean expired cache entries
 */
async function cleanExpiredCache(
  dryRun: boolean,
): Promise<{ itemsRemoved: number; bytesFreed: number }> {
  logger.info('Cleaning expired cache entries', { dryRun });

  let itemsRemoved = 0;
  let bytesFreed = 0;

  // Clean expired entries from PostgreSQL
  if (!dryRun) {
    const result = await prisma.cachedData.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    itemsRemoved = result.count;

    logger.info('Expired PostgreSQL cache entries removed', {
      count: result.count,
    });
  } else {
    const count = await prisma.cachedData.count({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    logger.info('Expired PostgreSQL cache entries found (dry run)', { count });
    itemsRemoved = count;
  }

  // Note: Redis automatically handles TTL expiration
  // We don't need to manually clean expired Redis entries

  return { itemsRemoved, bytesFreed };
}

/**
 * Clean cache using LRU (Least Recently Used) strategy
 * Removes oldest entries when cache size exceeds maxSize
 */
async function cleanLRUCache(
  maxSize: number,
  dryRun: boolean,
): Promise<{ itemsRemoved: number; bytesFreed: number }> {
  logger.info('Cleaning cache using LRU strategy', { maxSize, dryRun });

  let itemsRemoved = 0;
  let bytesFreed = 0;

  // Get total cache size
  const totalEntries = await prisma.cachedData.count();

  if (totalEntries <= maxSize) {
    logger.info('Cache size within limits', { totalEntries, maxSize });
    return { itemsRemoved: 0, bytesFreed: 0 };
  }

  const entriesToRemove = totalEntries - maxSize;

  if (!dryRun) {
    // Get oldest entries
    const oldestEntries = await prisma.cachedData.findMany({
      orderBy: {
        updatedAt: 'asc',
      },
      take: entriesToRemove,
      select: {
        id: true,
      },
    });

    // Delete oldest entries
    const result = await prisma.cachedData.deleteMany({
      where: {
        id: {
          in: oldestEntries.map((e) => e.id),
        },
      },
    });

    itemsRemoved = result.count;

    logger.info('LRU cache cleanup completed', {
      removed: result.count,
      remaining: totalEntries - result.count,
    });
  } else {
    logger.info('LRU cache cleanup (dry run)', {
      wouldRemove: entriesToRemove,
      totalEntries,
      maxSize,
    });
    itemsRemoved = entriesToRemove;
  }

  return { itemsRemoved, bytesFreed };
}

/**
 * Clean cache entries matching a pattern
 */
async function cleanCacheByPattern(
  pattern: string,
  dryRun: boolean,
): Promise<{ itemsRemoved: number; bytesFreed: number }> {
  logger.info('Cleaning cache by pattern', { pattern, dryRun });

  let itemsRemoved = 0;
  let bytesFreed = 0;

  // Clean from Redis
  if (redis.isConnected()) {
    const deleted = await redis.deletePattern(pattern);
    itemsRemoved += deleted;

    logger.info('Redis cache entries removed by pattern', {
      pattern,
      count: deleted,
      dryRun,
    });
  }

  // Clean from PostgreSQL
  // Convert Redis pattern to SQL LIKE pattern
  const sqlPattern = pattern.replace('*', '%');

  if (!dryRun) {
    const result = await prisma.cachedData.deleteMany({
      where: {
        cacheKey: {
          contains: sqlPattern,
        },
      },
    });

    itemsRemoved += result.count;

    logger.info('PostgreSQL cache entries removed by pattern', {
      pattern: sqlPattern,
      count: result.count,
    });
  } else {
    const count = await prisma.cachedData.count({
      where: {
        cacheKey: {
          contains: sqlPattern,
        },
      },
    });

    logger.info('PostgreSQL cache entries found by pattern (dry run)', {
      pattern: sqlPattern,
      count,
    });
    itemsRemoved += count;
  }

  return { itemsRemoved, bytesFreed };
}

/**
 * Clean all cache entries (dangerous!)
 */
async function cleanAllCache(
  dryRun: boolean,
): Promise<{ itemsRemoved: number; bytesFreed: number }> {
  logger.warn('Cleaning ALL cache entries', { dryRun });

  let itemsRemoved = 0;
  let bytesFreed = 0;

  if (!dryRun) {
    // Clear all ESI cache from Redis
    if (redis.isConnected()) {
      const deleted = await redis.deletePattern('esi:*');
      itemsRemoved += deleted;

      logger.info('All Redis ESI cache cleared', { count: deleted });
    }

    // Clear all cache from PostgreSQL
    const result = await prisma.cachedData.deleteMany();
    itemsRemoved += result.count;

    logger.info('All PostgreSQL cache cleared', { count: result.count });
  } else {
    const count = await prisma.cachedData.count();
    logger.warn('Would clear ALL cache (dry run)', { count });
    itemsRemoved = count;
  }

  return { itemsRemoved, bytesFreed };
}

/**
 * Start the cache cleanup worker
 */
export function startCacheCleanupWorker() {
  const worker = createWorker<CacheCleanupJobData, CacheCleanupJobResult>(
    QUEUE_NAME,
    processCacheCleanup,
    {
      concurrency: 1, // Run cache cleanup jobs one at a time
    },
  );

  logger.info('Cache cleanup worker started');
  return worker;
}

/**
 * Queue cache cleanup job
 */
export async function cleanupCache(
  type: CacheCleanupJobData['type'],
  options?: {
    pattern?: string;
    maxAge?: number;
    maxSize?: number;
    dryRun?: boolean;
    priority?: JobPriority;
  },
): Promise<void> {
  logger.info('Queueing cache cleanup', {
    type,
    pattern: options?.pattern,
    maxAge: options?.maxAge,
    maxSize: options?.maxSize,
    dryRun: options?.dryRun,
  });

  await addJob<CacheCleanupJobData>(
    QUEUE_NAME,
    JobType.CACHE_CLEANUP,
    {
      type,
      pattern: options?.pattern,
      maxAge: options?.maxAge,
      maxSize: options?.maxSize,
      dryRun: options?.dryRun || false,
    },
    {
      priority: options?.priority || JobPriority.LOW,
      attempts: 1,
      removeOnComplete: 10,
      removeOnFail: false,
    },
  );

  logger.info('Cache cleanup queued', { type });
}

/**
 * Schedule daily cache cleanup
 */
export async function scheduleDailyCacheCleanup(): Promise<void> {
  logger.info('Scheduling daily cache cleanup');

  // Clean expired entries
  await cleanupCache('expired', {
    priority: JobPriority.LOW,
  });

  logger.info('Daily cache cleanup scheduled');
}

// Export queue name for reference
export { QUEUE_NAME as cacheCleanupQueueName };
