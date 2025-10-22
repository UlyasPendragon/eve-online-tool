import { Queue, Worker, Job, QueueEvents, ConnectionOptions } from 'bullmq';
import { createLogger } from './logger.service';
import { captureException } from '../config/sentry.config';
import { JobType, JobPriority, BaseJobOptions } from '../types/jobs';

/**
 * Centralized Queue Management Service
 * Manages all BullMQ queues and workers with shared Redis connection
 */

const logger = createLogger({ module: 'queue-service' });

// Shared Redis connection configuration
const connection: ConnectionOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || '0', 10),
  maxRetriesPerRequest: null, // Required for BullMQ
  enableReadyCheck: false,
};

// Queue registry
const queues = new Map<string, Queue>();
const workers = new Map<string, Worker>();
const queueEvents = new Map<string, QueueEvents>();

/**
 * Default job options by priority
 */
const DEFAULT_JOB_OPTIONS: Record<JobPriority, BaseJobOptions> = {
  [JobPriority.CRITICAL]: {
    priority: 1,
    attempts: 5,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: 100,
    removeOnFail: false,
  },
  [JobPriority.HIGH]: {
    priority: 2,
    attempts: 4,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: 50,
    removeOnFail: false,
  },
  [JobPriority.NORMAL]: {
    priority: 3,
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: 25,
    removeOnFail: false,
  },
  [JobPriority.LOW]: {
    priority: 4,
    attempts: 2,
    backoff: { type: 'fixed', delay: 10000 },
    removeOnComplete: 10,
    removeOnFail: false,
  },
  [JobPriority.BATCH]: {
    priority: 5,
    attempts: 1,
    backoff: { type: 'fixed', delay: 30000 },
    removeOnComplete: 5,
    removeOnFail: false,
  },
};

/**
 * Get or create a queue by name
 */
export function getQueue<T = any>(queueName: string): Queue<T> {
  if (queues.has(queueName)) {
    return queues.get(queueName) as Queue<T>;
  }

  const queue = new Queue<T>(queueName, {
    connection,
    defaultJobOptions: {
      removeOnComplete: 25,
      removeOnFail: 100,
    },
  });

  queues.set(queueName, queue);

  logger.info('Queue created', { queueName });

  return queue;
}

/**
 * Add a job to a queue
 */
export async function addJob<T>(
  queueName: string,
  jobType: JobType,
  data: T,
  options?: BaseJobOptions,
): Promise<Job<T>> {
  const queue = getQueue<T>(queueName);

  const priority = options?.priority || JobPriority.NORMAL;
  const defaultOptions = DEFAULT_JOB_OPTIONS[priority];
  const mergedOptions = { ...defaultOptions, ...options };

  try {
    const job = await queue.add(jobType, data, mergedOptions);

    logger.info('Job added to queue', {
      queueName,
      jobType,
      jobId: job.id,
      priority,
    });

    return job;
  } catch (error) {
    logger.error('Failed to add job to queue', error as Error, {
      queueName,
      jobType,
      data,
    });
    captureException(error as Error, {
      tags: { queueName, jobType: String(jobType) },
      extra: { data },
    });
    throw error;
  }
}

/**
 * Create a worker for a queue
 */
export function createWorker<T, R = any>(
  queueName: string,
  processor: (job: Job<T>) => Promise<R>,
  options?: {
    concurrency?: number;
    limiter?: {
      max: number;
      duration: number;
    };
  },
): Worker<T, R> {
  if (workers.has(queueName)) {
    logger.warn('Worker already exists for queue', { queueName });
    return workers.get(queueName) as Worker<T, R>;
  }

  const worker = new Worker<T, R>(
    queueName,
    async (job: Job<T>) => {
      const timer = logger.createTimer(`job_${job.name}`);

      logger.info('Job started', {
        queueName,
        jobType: job.name,
        jobId: job.id,
        attemptsMade: job.attemptsMade,
      });

      try {
        const result = await processor(job);

        const duration = timer.end({
          queueName,
          jobType: job.name,
          jobId: job.id,
          success: true,
        });

        logger.info('Job completed successfully', {
          queueName,
          jobType: job.name,
          jobId: job.id,
          duration,
        });

        return result;
      } catch (error) {
        const duration = timer.end({
          queueName,
          jobType: job.name,
          jobId: job.id,
          success: false,
        });

        logger.error('Job failed', error as Error, {
          queueName,
          jobType: job.name,
          jobId: job.id,
          attemptsMade: job.attemptsMade,
          duration,
        });

        captureException(error as Error, {
          tags: {
            queueName,
            jobType: job.name,
            jobId: String(job.id),
            attemptsMade: String(job.attemptsMade),
          },
          extra: { jobData: job.data },
        });

        throw error;
      }
    },
    {
      connection,
      concurrency: options?.concurrency || parseInt(process.env.BULLMQ_CONCURRENCY || '5', 10),
      limiter: options?.limiter,
    },
  );

  // Worker event handlers
  worker.on('ready', () => {
    logger.info('Worker ready', { queueName });
  });

  worker.on('active', (job: Job<T>) => {
    logger.debug('Job active', {
      queueName,
      jobType: job.name,
      jobId: job.id,
    });
  });

  worker.on('completed', (job: Job<T>, result: R) => {
    logger.debug('Job completed event', {
      queueName,
      jobType: job.name,
      jobId: job.id,
    });
  });

  worker.on('failed', (job: Job<T> | undefined, error: Error) => {
    logger.warn('Job failed event', {
      queueName,
      jobType: job?.name,
      jobId: job?.id,
      error: error.message,
      attemptsMade: job?.attemptsMade,
    });
  });

  worker.on('error', (error: Error) => {
    logger.error('Worker error', error, { queueName });
    captureException(error, { tags: { queueName, component: 'worker' } });
  });

  workers.set(queueName, worker);

  logger.info('Worker created', {
    queueName,
    concurrency: options?.concurrency || 5,
  });

  return worker;
}

/**
 * Create queue events listener
 */
export function createQueueEvents(queueName: string): QueueEvents {
  if (queueEvents.has(queueName)) {
    return queueEvents.get(queueName)!;
  }

  const events = new QueueEvents(queueName, { connection });

  events.on('waiting', ({ jobId }) => {
    logger.debug('Job waiting', { queueName, jobId });
  });

  events.on('progress', ({ jobId, data }) => {
    logger.debug('Job progress', { queueName, jobId, progress: data });
  });

  events.on('completed', ({ jobId, returnvalue }) => {
    logger.debug('Job completed (event)', { queueName, jobId });
  });

  events.on('failed', ({ jobId, failedReason }) => {
    logger.warn('Job failed (event)', { queueName, jobId, reason: failedReason });
  });

  queueEvents.set(queueName, events);

  return events;
}

/**
 * Get queue counts (waiting, active, completed, failed, etc.)
 */
export async function getQueueCounts(queueName: string): Promise<{
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  paused: number;
}> {
  const queue = getQueue(queueName);

  try {
    const counts = await queue.getJobCounts(
      'waiting',
      'active',
      'completed',
      'failed',
      'delayed',
      'paused',
    );

    return counts;
  } catch (error) {
    logger.error('Failed to get queue counts', error as Error, { queueName });
    throw error;
  }
}

/**
 * Get jobs from a queue by status
 */
export async function getJobs(
  queueName: string,
  status: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed' | 'paused',
  start = 0,
  end = 10,
): Promise<Job[]> {
  const queue = getQueue(queueName);

  try {
    return await queue.getJobs(status, start, end);
  } catch (error) {
    logger.error('Failed to get jobs', error as Error, { queueName, status });
    throw error;
  }
}

/**
 * Get a specific job by ID
 */
export async function getJob<T = any>(queueName: string, jobId: string): Promise<Job<T> | undefined> {
  const queue = getQueue<T>(queueName);

  try {
    return await queue.getJob(jobId);
  } catch (error) {
    logger.error('Failed to get job', error as Error, { queueName, jobId });
    return undefined;
  }
}

/**
 * Retry a failed job
 */
export async function retryJob(queueName: string, jobId: string): Promise<void> {
  const job = await getJob(queueName, jobId);

  if (!job) {
    throw new Error(`Job ${jobId} not found in queue ${queueName}`);
  }

  try {
    await job.retry();
    logger.info('Job retried', { queueName, jobId });
  } catch (error) {
    logger.error('Failed to retry job', error as Error, { queueName, jobId });
    throw error;
  }
}

/**
 * Remove a job from the queue
 */
export async function removeJob(queueName: string, jobId: string): Promise<void> {
  const job = await getJob(queueName, jobId);

  if (!job) {
    throw new Error(`Job ${jobId} not found in queue ${queueName}`);
  }

  try {
    await job.remove();
    logger.info('Job removed', { queueName, jobId });
  } catch (error) {
    logger.error('Failed to remove job', error as Error, { queueName, jobId });
    throw error;
  }
}

/**
 * Clean old jobs from a queue
 */
export async function cleanQueue(
  queueName: string,
  grace: number,
  status?: 'completed' | 'failed',
  limit?: number,
): Promise<string[]> {
  const queue = getQueue(queueName);

  try {
    const removed = await queue.clean(grace, limit || 1000, status);

    logger.info('Queue cleaned', {
      queueName,
      status: status || 'all',
      grace,
      removedCount: removed.length,
    });

    return removed;
  } catch (error) {
    logger.error('Failed to clean queue', error as Error, { queueName });
    throw error;
  }
}

/**
 * Pause a queue
 */
export async function pauseQueue(queueName: string): Promise<void> {
  const queue = getQueue(queueName);

  try {
    await queue.pause();
    logger.info('Queue paused', { queueName });
  } catch (error) {
    logger.error('Failed to pause queue', error as Error, { queueName });
    throw error;
  }
}

/**
 * Resume a paused queue
 */
export async function resumeQueue(queueName: string): Promise<void> {
  const queue = getQueue(queueName);

  try {
    await queue.resume();
    logger.info('Queue resumed', { queueName });
  } catch (error) {
    logger.error('Failed to resume queue', error as Error, { queueName });
    throw error;
  }
}

/**
 * Get all registered queues
 */
export function getAllQueues(): Map<string, Queue> {
  return queues;
}

/**
 * Get all registered workers
 */
export function getAllWorkers(): Map<string, Worker> {
  return workers;
}

/**
 * Gracefully close all queues and workers
 */
export async function closeAll(): Promise<void> {
  logger.info('Closing all queues and workers');

  // Close all workers
  for (const [name, worker] of workers.entries()) {
    try {
      await worker.close();
      logger.info('Worker closed', { queueName: name });
    } catch (error) {
      logger.error('Failed to close worker', error as Error, { queueName: name });
    }
  }

  // Close all queue events
  for (const [name, events] of queueEvents.entries()) {
    try {
      await events.close();
      logger.info('Queue events closed', { queueName: name });
    } catch (error) {
      logger.error('Failed to close queue events', error as Error, { queueName: name });
    }
  }

  // Close all queues
  for (const [name, queue] of queues.entries()) {
    try {
      await queue.close();
      logger.info('Queue closed', { queueName: name });
    } catch (error) {
      logger.error('Failed to close queue', error as Error, { queueName: name });
    }
  }

  workers.clear();
  queueEvents.clear();
  queues.clear();

  logger.info('All queues and workers closed');
}

/**
 * Health check for queue system
 */
export async function healthCheck(): Promise<{
  healthy: boolean;
  queues: number;
  workers: number;
  errors: string[];
}> {
  const errors: string[] = [];

  // Check if queues are responsive
  for (const [name, queue] of queues.entries()) {
    try {
      await queue.getJobCounts();
    } catch (error) {
      errors.push(`Queue ${name}: ${(error as Error).message}`);
    }
  }

  // Check if workers are running
  for (const [name, worker] of workers.entries()) {
    if (!worker.isRunning()) {
      errors.push(`Worker ${name}: not running`);
    }
  }

  return {
    healthy: errors.length === 0,
    queues: queues.size,
    workers: workers.size,
    errors,
  };
}

// Export connection for direct use if needed
export { connection };
