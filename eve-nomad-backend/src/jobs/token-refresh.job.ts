// @ts-nocheck - Awaiting logger.createTimer implementation
import { Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import * as tokenService from '../services/token.service';
import { createLogger } from '../services/logger.service';
import { captureException } from '../config/sentry.config';
import { addJob, createWorker, getQueue } from '../services/queue.service';
import {
  JobType,
  JobPriority,
  TokenRefreshJobData,
  TokenRefreshJobResult,
} from '../types/jobs';

const prisma = new PrismaClient();
const logger = createLogger({ module: 'token-refresh-job' });

const QUEUE_NAME = 'token-refresh';

/**
 * Process a token refresh job
 */
async function processTokenRefresh(job: Job<TokenRefreshJobData>): Promise<TokenRefreshJobResult> {
  const startTime = Date.now();
  const { characterId, userId, reason = 'scheduled', retryCount = 0 } = job.data;

  logger.info('Processing token refresh', {
    characterId,
    userId,
    reason,
    retryCount,
    jobId: job.id,
  });

  try {
    // Load character
    const character = await prisma.character.findUnique({
      where: { characterId },
    });

    if (!character) {
      logger.warn('Character not found', { characterId, jobId: job.id });
      return {
        characterId,
        success: false,
        error: 'character_not_found',
        duration: Date.now() - startTime,
      };
    }

    // Check if token is expired or expiring soon
    const needsRefresh = tokenService.isTokenExpired(character.tokenExpiresAt, 5);

    if (!needsRefresh) {
      logger.info('Token still valid', {
        characterId,
        expiresAt: character.tokenExpiresAt,
        jobId: job.id,
      });
      return {
        characterId,
        success: true,
        newTokenExpiry: character.tokenExpiresAt,
        duration: Date.now() - startTime,
      };
    }

    // Decrypt refresh token
    const refreshToken = tokenService.decryptToken(character.refreshToken);

    try {
      // Refresh the token
      const tokens = await tokenService.refreshAccessToken(refreshToken);

      // Calculate new expiry
      const newExpiresAt = tokenService.calculateTokenExpiry(tokens.expires_in);

      // Encrypt new tokens
      const encryptedAccessToken = tokenService.encryptToken(tokens.access_token);
      const encryptedRefreshToken = tokenService.encryptToken(tokens.refresh_token);

      // Update database
      await prisma.character.update({
        where: { characterId },
        data: {
          accessToken: encryptedAccessToken,
          refreshToken: encryptedRefreshToken,
          tokenExpiresAt: newExpiresAt,
          updatedAt: new Date(),
        },
      });

      logger.info('Token refreshed successfully', {
        characterId,
        characterName: character.characterName,
        newExpiresAt,
        duration: Date.now() - startTime,
        jobId: job.id,
      });

      return {
        characterId,
        success: true,
        newTokenExpiry: newExpiresAt,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      // If refresh token is invalid, mark as error but don't retry
      if (error instanceof Error && error.message === 'REFRESH_TOKEN_INVALID') {
        logger.error('Refresh token invalid - user needs to re-authorize', error, {
          characterId,
          characterName: character.characterName,
          userId,
          jobId: job.id,
        });

        captureException(error, {
          userId,
          characterId,
          tags: {
            error_type: 'refresh_token_invalid',
            job_type: JobType.TOKEN_REFRESH,
          },
          extra: { reason, retryCount },
        });

        return {
          characterId,
          success: false,
          error: 'refresh_token_invalid',
          duration: Date.now() - startTime,
        };
      }

      // Re-throw other errors for retry
      throw error;
    }
  } catch (error) {
    const duration = Date.now() - startTime;

    logger.error('Token refresh failed', error as Error, {
      characterId,
      userId,
      reason,
      retryCount,
      duration,
      jobId: job.id,
    });

    captureException(error as Error, {
      userId,
      characterId,
      tags: {
        error_type: 'token_refresh_failed',
        job_type: JobType.TOKEN_REFRESH,
        retry_count: String(retryCount),
      },
      extra: { reason, duration },
    });

    throw error; // Will trigger retry
  }
}

/**
 * Start the token refresh worker
 */
export function startTokenRefreshWorker() {
  const worker = createWorker<TokenRefreshJobData, TokenRefreshJobResult>(
    QUEUE_NAME,
    processTokenRefresh,
    {
      concurrency: 5, // Process up to 5 refresh jobs concurrently
    },
  );

  logger.info('Token refresh worker started');
  return worker;
}

/**
 * Schedule token refresh check
 * Finds all characters with tokens expiring within 5 minutes
 */
export async function scheduleTokenRefresh() {
  // const timer = logger.createTimer('schedule_token_refresh');

  try {
    // Find all characters with tokens expiring within 5 minutes
    const expiringCharacters = await prisma.character.findMany({
      where: {
        tokenExpiresAt: {
          lte: new Date(Date.now() + 5 * 60 * 1000), // Within 5 minutes
        },
      },
      select: {
        characterId: true,
        characterName: true,
        tokenExpiresAt: true,
        userId: true,
      },
    });

    logger.info('Found characters with expiring tokens', {
      count: expiringCharacters.length,
    });

    // Queue refresh job for each character
    let queued = 0;
    let failed = 0;

    for (const character of expiringCharacters) {
      try {
        await addJob<TokenRefreshJobData>(
          QUEUE_NAME,
          JobType.TOKEN_REFRESH,
          {
            characterId: character.characterId,
            userId: character.userId,
            reason: 'scheduled',
          },
          {
            priority: JobPriority.HIGH,
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 2000,
            },
            removeOnComplete: 100,
            removeOnFail: false,
          },
        );

        logger.debug('Queued token refresh', {
          characterId: character.characterId,
          characterName: character.characterName,
          expiresAt: character.tokenExpiresAt,
        });

        queued++;
      } catch (error) {
        logger.error('Failed to queue token refresh', error as Error, {
          characterId: character.characterId,
          characterName: character.characterName,
        });
        failed++;
      }
    }

    const duration = // timer.end({ queued, failed, total: expiringCharacters.length });

    logger.info('Token refresh scheduling completed', {
      total: expiringCharacters.length,
      queued,
      failed,
      duration,
    });

    return { total: expiringCharacters.length, queued, failed };
  } catch (error) {
    logger.error('Token refresh scheduling failed', error as Error);
    captureException(error as Error, {
      tags: { job_type: JobType.TOKEN_REFRESH, operation: 'schedule' },
    });
    throw error;
  }
}

/**
 * Start periodic token refresh scheduler
 * Runs every 2 minutes
 */
export function startTokenRefreshScheduler() {
  logger.info('Starting token refresh scheduler (runs every 2 minutes)');

  // Run immediately on startup
  scheduleTokenRefresh().catch((err) => {
    logger.error('Initial token refresh schedule failed', err);
  });

  // Then run every 2 minutes
  const intervalId = setInterval(() => {
    scheduleTokenRefresh().catch((err) => {
      logger.error('Token refresh schedule failed', err);
    });
  }, 2 * 60 * 1000); // 2 minutes

  logger.info('Token refresh scheduler started');

  return intervalId;
}

/**
 * Manually trigger token refresh for a specific character
 */
export async function refreshCharacterToken(
  characterId: number,
  userId: number,
  priority: JobPriority = JobPriority.CRITICAL,
): Promise<void> {
  logger.info('Manually refreshing character token', { characterId, userId, priority });

  await addJob<TokenRefreshJobData>(
    QUEUE_NAME,
    JobType.TOKEN_REFRESH,
    {
      characterId,
      userId,
      reason: 'manual',
    },
    {
      priority,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    },
  );

  logger.info('Manual token refresh queued', { characterId, userId });
}

/**
 * Cleanup old failed jobs (run daily)
 */
export async function cleanupFailedJobs() {
  // const timer = logger.createTimer('cleanup_failed_jobs');

  try {
    const queue = getQueue(QUEUE_NAME);
    const failed = await queue.getFailed();
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    let removed = 0;
    for (const job of failed) {
      if (job.timestamp && job.timestamp < oneWeekAgo) {
        await job.remove();
        removed++;
      }
    }

    const duration = // timer.end({ removed, total: failed.length });

    logger.info('Failed jobs cleanup completed', {
      total: failed.length,
      removed,
      duration,
    });

    return removed;
  } catch (error) {
    logger.error('Failed jobs cleanup failed', error as Error);
    captureException(error as Error, {
      tags: { job_type: JobType.TOKEN_REFRESH, operation: 'cleanup' },
    });
    throw error;
  }
}

// Export queue for backward compatibility
export { QUEUE_NAME as tokenRefreshQueueName };
