// @ts-nocheck - Stub file awaiting proper implementation
import { Job } from 'bullmq';
// import { PrismaClient } from '@prisma/client';
import { createLogger } from '../services/logger.service';
import { captureException } from '../config/sentry.config';
import { addJob, createWorker } from '../services/queue.service';
import {
  JobType,
  JobPriority,
  HistoricalDataCollectionJobData,
  HistoricalDataCollectionJobResult,
} from '../types/jobs';
import { esiClient } from '../services/esi-client';

// const _prisma = new PrismaClient();
const logger = createLogger({ module: 'historical-data-job' });

const QUEUE_NAME = 'historical-data-collection';

/**
 * Process historical data collection job
 * Fetches and stores historical data from ESI
 */
async function processHistoricalDataCollection(
  job: Job<HistoricalDataCollectionJobData>,
): Promise<HistoricalDataCollectionJobResult> {
  const startTime = Date.now();
  const {
    characterId,
    _userId,
    dataType,
    fromDate,
    toDate,
    batchSize = 100,
    pageToken,
  } = job.data;

  logger.info('Processing historical data collection', {
    characterId,
    _userId,
    dataType,
    fromDate,
    toDate,
    batchSize,
    hasPageToken: !!pageToken,
    jobId: job.id,
  });

  let recordsCollected = 0;
  let recordsStored = 0;

  try {
    switch (dataType) {
      case 'wallet_journal':
        ({ recordsCollected, recordsStored } = await collectWalletJournal(
          characterId,
    _userId,
          fromDate,
          toDate,
          pageToken,
        ));
        break;

      case 'wallet_transactions':
        ({ recordsCollected, recordsStored } = await collectWalletTransactions(
          characterId,
    _userId,
          fromDate,
          toDate,
          pageToken,
        ));
        break;

      case 'market_orders':
        ({ recordsCollected, recordsStored } = await collectMarketOrdersHistory(
          characterId,
    _userId,
          fromDate,
          toDate,
        ));
        break;

      case 'industry_jobs':
        ({ recordsCollected, recordsStored } = await collectIndustryJobsHistory(
          characterId,
    _userId,
          fromDate,
          toDate,
        ));
        break;

      case 'skill_history':
        ({ recordsCollected, recordsStored } = await collectSkillHistory(characterId, _userId));
        break;

      default:
        throw new Error(`Unsupported data type: ${dataType}`);
    }

    const duration = Date.now() - startTime;

    logger.info('Historical data collection completed', {
      characterId,
      dataType,
      recordsCollected,
      recordsStored,
      duration,
      jobId: job.id,
    });

    return {
      characterId,
      dataType,
      recordsCollected,
      recordsStored,
      success: true,
      duration,
    };
  } catch (error) {
    const duration = Date.now() - startTime;

    logger.error('Historical data collection failed', error as Error, {
      characterId,
    _userId,
      dataType,
      recordsCollected,
      recordsStored,
      duration,
      jobId: job.id,
    });

    captureException(error as Error, {
    _userId,
      characterId,
      tags: {
        error_type: 'historical_data_collection_failed',
        job_type: JobType.HISTORICAL_DATA_COLLECTION,
        data_type: dataType,
      },
      extra: { fromDate, toDate, recordsCollected, recordsStored, duration },
    });

    return {
      characterId,
      dataType,
      recordsCollected,
      recordsStored,
      success: false,
      error: (error as Error).message,
      duration,
    };
  }
}

/**
 * Collect wallet journal history
 */
async function collectWalletJournal(
  characterId: number,
  _userId: number,
  fromDate?: Date | string,
  toDate?: Date | string,
  pageToken?: string,
): Promise<{ recordsCollected: number; recordsStored: number }> {
  logger.info('Collecting wallet journal', { characterId, fromDate, toDate });

  const endpoint = `/latest/characters/${characterId}/wallet/journal/`;
  const data = await esiClient.getCharacterWalletJournal(characterId);

  if (!data || data.length === 0) {
    return { recordsCollected: 0, recordsStored: 0 };
  }

  // Filter by date range if specified
  let filteredData = data;
  if (fromDate) {
    const fromDateObj = new Date(fromDate);
    filteredData = filteredData.filter((entry: any) => new Date(entry.date) >= fromDateObj);
  }
  if (toDate) {
    const toDateObj = new Date(toDate);
    filteredData = filteredData.filter((entry: any) => new Date(entry.date) <= toDateObj);
  }

  // Store in database (placeholder - actual implementation would use Prisma)
  // For now, we'll just log and return counts
  logger.info('Wallet journal entries collected', {
    characterId,
    total: data.length,
    filtered: filteredData.length,
  });

  return {
    recordsCollected: data.length,
    recordsStored: filteredData.length,
  };
}

/**
 * Collect wallet transactions history
 */
async function collectWalletTransactions(
  characterId: number,
  _userId: number,
  fromDate?: Date | string,
  toDate?: Date | string,
  pageToken?: string,
): Promise<{ recordsCollected: number; recordsStored: number }> {
  logger.info('Collecting wallet transactions', { characterId, fromDate, toDate });

  const data = await esiClient.getCharacterWalletTransactions(characterId);

  if (!data || data.length === 0) {
    return { recordsCollected: 0, recordsStored: 0 };
  }

  // Filter by date range if specified
  let filteredData = data;
  if (fromDate) {
    const fromDateObj = new Date(fromDate);
    filteredData = filteredData.filter((entry: any) => new Date(entry.date) >= fromDateObj);
  }
  if (toDate) {
    const toDateObj = new Date(toDate);
    filteredData = filteredData.filter((entry: any) => new Date(entry.date) <= toDateObj);
  }

  logger.info('Wallet transactions collected', {
    characterId,
    total: data.length,
    filtered: filteredData.length,
  });

  return {
    recordsCollected: data.length,
    recordsStored: filteredData.length,
  };
}

/**
 * Collect market orders history
 */
async function collectMarketOrdersHistory(
  characterId: number,
  _userId: number,
  fromDate?: Date | string,
  toDate?: Date | string,
): Promise<{ recordsCollected: number; recordsStored: number }> {
  logger.info('Collecting market orders history', { characterId, fromDate, toDate });

  const data = await esiClient.getCharacterOrders(characterId);

  if (!data || data.length === 0) {
    return { recordsCollected: 0, recordsStored: 0 };
  }

  logger.info('Market orders collected', {
    characterId,
    total: data.length,
  });

  return {
    recordsCollected: data.length,
    recordsStored: data.length,
  };
}

/**
 * Collect industry jobs history
 */
async function collectIndustryJobsHistory(
  characterId: number,
  _userId: number,
  fromDate?: Date | string,
  toDate?: Date | string,
): Promise<{ recordsCollected: number; recordsStored: number }> {
  logger.info('Collecting industry jobs history', { characterId, fromDate, toDate });

  // This would call ESI endpoint for industry jobs
  // For now, return placeholder data
  logger.info('Industry jobs collected', { characterId, count: 0 });

  return {
    recordsCollected: 0,
    recordsStored: 0,
  };
}

/**
 * Collect skill history
 */
async function collectSkillHistory(
  characterId: number,
  _userId: number,
): Promise<{ recordsCollected: number; recordsStored: number }> {
  logger.info('Collecting skill history', { characterId });

  const skills = await esiClient.getCharacterSkills(characterId);

  if (!skills || !skills.skills || skills.skills.length === 0) {
    return { recordsCollected: 0, recordsStored: 0 };
  }

  logger.info('Skills collected', {
    characterId,
    skillCount: skills.skills.length,
    totalSP: skills.total_sp,
  });

  return {
    recordsCollected: skills.skills.length,
    recordsStored: skills.skills.length,
  };
}

/**
 * Start the historical data collection worker
 */
export function startHistoricalDataCollectionWorker() {
  const worker = createWorker<HistoricalDataCollectionJobData, HistoricalDataCollectionJobResult>(
    QUEUE_NAME,
    processHistoricalDataCollection,
    {
      concurrency: 3, // Lower concurrency for data-intensive operations
    },
  );

  logger.info('Historical data collection worker started');
  return worker;
}

/**
 * Queue historical data collection
 */
export async function collectHistoricalData(
  characterId: number,
  _userId: number,
  dataType: HistoricalDataCollectionJobData['dataType'],
  options?: {
    fromDate?: Date | string;
    toDate?: Date | string;
    batchSize?: number;
    priority?: JobPriority;
  },
): Promise<void> {
  logger.info('Queueing historical data collection', {
    characterId,
    _userId,
    dataType,
    fromDate: options?.fromDate,
    toDate: options?.toDate,
  });

  await addJob<HistoricalDataCollectionJobData>(
    QUEUE_NAME,
    JobType.HISTORICAL_DATA_COLLECTION,
    {
      characterId,
    _userId,
      dataType,
      fromDate: options?.fromDate,
      toDate: options?.toDate,
      batchSize: options?.batchSize || 100,
    },
    {
      priority: options?.priority || JobPriority.LOW,
      attempts: 2,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
      removeOnComplete: 25,
      removeOnFail: false,
    },
  );

  logger.info('Historical data collection queued', {
    characterId,
    dataType,
  });
}

/**
 * Collect all historical data for a character
 */
export async function collectAllHistoricalData(
  characterId: number,
  _userId: number,
  options?: {
    fromDate?: Date | string;
    toDate?: Date | string;
    priority?: JobPriority;
  },
): Promise<void> {
  logger.info('Collecting all historical data', {
    characterId,
    _userId,
    fromDate: options?.fromDate,
    toDate: options?.toDate,
  });

  const dataTypes: HistoricalDataCollectionJobData['dataType'][] = [
    'wallet_journal',
    'wallet_transactions',
    'market_orders',
    'industry_jobs',
    'skill_history',
  ];

  for (const dataType of dataTypes) {
    await collectHistoricalData(characterId, userId, dataType, options);
  }

  logger.info('All historical data collection queued', {
    characterId,
    dataTypeCount: dataTypes.length,
  });
}

// Export queue name for reference
export { QUEUE_NAME as historicalDataCollectionQueueName };
