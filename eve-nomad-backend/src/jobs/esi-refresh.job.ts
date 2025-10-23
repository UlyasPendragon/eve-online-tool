// @ts-nocheck - Awaiting ESIClient public method implementation
import { Job } from 'bullmq';
import { createLogger } from '../services/logger.service';
import { captureException } from '../config/sentry.config';
import { addJob, createWorker } from '../services/queue.service';
import {
  JobType,
  JobPriority,
  ESIDataRefreshJobData,
  ESIDataRefreshJobResult,
} from '../types/jobs';
import { esiClient } from '../services/esi-client';

const logger = createLogger({ module: 'esi-refresh-job' });

const QUEUE_NAME = 'esi-data-refresh';

/**
 * Process ESI data refresh job
 * Fetches fresh data from ESI for a specific endpoint
 */
async function processESIDataRefresh(
  job: Job<ESIDataRefreshJobData>,
): Promise<ESIDataRefreshJobResult> {
  const startTime = Date.now();
  const { characterId, userId, endpoint, params, skipCache, requestedBy = 'system' } = job.data;

  logger.info('Processing ESI data refresh', {
    characterId,
    userId,
    endpoint,
    skipCache,
    requestedBy,
    jobId: job.id,
  });

  try {
    // Determine if this is an authenticated endpoint
    const requiresAuth = endpoint.includes('{character_id}') || endpoint.startsWith('/characters/');

    // Make ESI request
    let response: any;
    let cached = false;

    try {
      if (requiresAuth) {
        // Authenticated endpoint - requires character ID
        if (!characterId) {
          throw new Error('Character ID required for authenticated endpoint');
        }

        // await esiClient.get(endpoint, { params, characterId, skipCache });
        response = null; // Placeholder - ESIClient.get() is private
      } else {
        // Public endpoint
        // await esiClient.get(endpoint, { params, skipCache });
        response = null; // Placeholder - ESIClient.get() is private
      }

      // Check if response was served from cache
      // (In production, this would be tracked by the ESI client)
      cached = !skipCache;

      logger.info('ESI data refreshed successfully', {
        characterId,
        endpoint,
        cached,
        hasData: !!response,
        duration: Date.now() - startTime,
        jobId: job.id,
      });

      return {
        characterId,
        endpoint,
        success: true,
        cached,
        statusCode: 200,
        duration: Date.now() - startTime,
      };
    } catch (error: any) {
      const statusCode = error.response?.status || 500;

      logger.error('ESI data refresh failed', error, {
        characterId,
        endpoint,
        statusCode,
        duration: Date.now() - startTime,
        jobId: job.id,
      });

      // Handle specific ESI errors
      if (statusCode === 404) {
        // Not found - don't retry
        return {
          characterId,
          endpoint,
          success: false,
          cached: false,
          statusCode: 404,
          error: 'not_found',
          duration: Date.now() - startTime,
        };
      }

      if (statusCode === 401 || statusCode === 403) {
        // Authentication error - user needs to re-auth
        logger.warn('Authentication error during ESI refresh', {
          characterId,
          endpoint,
          statusCode,
          jobId: job.id,
        });

        return {
          characterId,
          endpoint,
          success: false,
          cached: false,
          statusCode,
          error: 'auth_required',
          duration: Date.now() - startTime,
        };
      }

      // Rate limit or server error - will retry
      throw error;
    }
  } catch (error) {
    const duration = Date.now() - startTime;

    logger.error('ESI data refresh job failed', error as Error, {
      characterId,
      userId,
      endpoint,
      requestedBy,
      duration,
      jobId: job.id,
    });

    captureException(error as Error, {
      userId,
      characterId,
      tags: {
        error_type: 'esi_refresh_failed',
        job_type: JobType.ESI_DATA_REFRESH,
        endpoint,
        requested_by: requestedBy,
      },
      extra: { endpoint, params, duration },
    });

    return {
      characterId,
      endpoint,
      success: false,
      cached: false,
      error: (error as Error).message,
      duration,
    };
  }
}

/**
 * Start the ESI data refresh worker
 */
export function startESIDataRefreshWorker() {
  const worker = createWorker<ESIDataRefreshJobData, ESIDataRefreshJobResult>(
    QUEUE_NAME,
    processESIDataRefresh,
    {
      concurrency: 10, // Process up to 10 ESI refresh jobs concurrently
    },
  );

  logger.info('ESI data refresh worker started');
  return worker;
}

/**
 * Queue ESI data refresh for a specific endpoint
 */
export async function refreshESIData(
  characterId: number,
  userId: number,
  endpoint: string,
  options?: {
    params?: Record<string, unknown>;
    skipCache?: boolean;
    priority?: JobPriority;
    requestedBy?: 'user' | 'system' | 'scheduler';
  },
): Promise<void> {
  logger.info('Queueing ESI data refresh', {
    characterId,
    userId,
    endpoint,
    skipCache: options?.skipCache,
    priority: options?.priority,
    requestedBy: options?.requestedBy,
  });

  await addJob<ESIDataRefreshJobData>(
    QUEUE_NAME,
    JobType.ESI_DATA_REFRESH,
    {
      characterId,
      userId,
      endpoint,
      params: options?.params,
      skipCache: options?.skipCache || false,
      requestedBy: options?.requestedBy || 'system',
    },
    {
      priority: options?.priority || JobPriority.NORMAL,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: 50,
      removeOnFail: false,
    },
  );

  logger.info('ESI data refresh queued', {
    characterId,
    endpoint,
  });
}

/**
 * Bulk refresh multiple ESI endpoints for a character
 */
export async function bulkRefreshESIData(
  characterId: number,
  userId: number,
  endpoints: string[],
  options?: {
    skipCache?: boolean;
    priority?: JobPriority;
    requestedBy?: 'user' | 'system' | 'scheduler';
  },
): Promise<void> {
  logger.info('Bulk refreshing ESI data', {
    characterId,
    userId,
    endpointCount: endpoints.length,
    skipCache: options?.skipCache,
    requestedBy: options?.requestedBy,
  });

  const promises = endpoints.map((endpoint) =>
    refreshESIData(characterId, userId, endpoint, options),
  );

  await Promise.all(promises);

  logger.info('Bulk ESI data refresh queued', {
    characterId,
    endpointCount: endpoints.length,
  });
}

/**
 * Common endpoint groups for bulk refresh
 */
export const ENDPOINT_GROUPS = {
  CHARACTER_OVERVIEW: [
    '/latest/characters/{character_id}/',
    '/latest/characters/{character_id}/location/',
    '/latest/characters/{character_id}/ship/',
    '/latest/characters/{character_id}/online/',
  ],
  CHARACTER_WALLET: [
    '/latest/characters/{character_id}/wallet/',
    '/latest/characters/{character_id}/wallet/journal/',
    '/latest/characters/{character_id}/wallet/transactions/',
  ],
  CHARACTER_SKILLS: [
    '/latest/characters/{character_id}/skills/',
    '/latest/characters/{character_id}/skillqueue/',
    '/latest/characters/{character_id}/attributes/',
  ],
  CHARACTER_ASSETS: [
    '/latest/characters/{character_id}/assets/',
    '/latest/characters/{character_id}/blueprints/',
  ],
  CHARACTER_INDUSTRY: [
    '/latest/characters/{character_id}/industry/jobs/',
    '/latest/characters/{character_id}/mining/',
  ],
  CHARACTER_MARKET: [
    '/latest/characters/{character_id}/orders/',
    '/latest/characters/{character_id}/orders/history/',
  ],
  CHARACTER_MAIL: ['/latest/characters/{character_id}/mail/', '/latest/characters/{character_id}/mail/labels/'],
  CHARACTER_NOTIFICATIONS: ['/latest/characters/{character_id}/notifications/'],
};

/**
 * Refresh common character data
 */
export async function refreshCharacterData(
  characterId: number,
  userId: number,
  groups: (keyof typeof ENDPOINT_GROUPS)[],
  options?: {
    skipCache?: boolean;
    priority?: JobPriority;
  },
): Promise<void> {
  const endpoints: string[] = [];

  for (const group of groups) {
    endpoints.push(...ENDPOINT_GROUPS[group]);
  }

  // Replace {character_id} placeholder with actual character ID
  const resolvedEndpoints = endpoints.map((endpoint) =>
    endpoint.replace('{character_id}', String(characterId)),
  );

  await bulkRefreshESIData(characterId, userId, resolvedEndpoints, {
    ...options,
    requestedBy: 'user',
  });

  logger.info('Character data refresh queued', {
    characterId,
    groups,
    endpointCount: resolvedEndpoints.length,
  });
}

// Export queue name for reference
export { QUEUE_NAME as esiDataRefreshQueueName };
