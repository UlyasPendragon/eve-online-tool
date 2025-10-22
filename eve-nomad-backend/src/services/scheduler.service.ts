import { CronJob } from 'cron';
import { createLogger } from './logger.service';
import { captureException } from '../config/sentry.config';
import { JobSchedule } from '../types/jobs';

/**
 * Scheduler Service
 * Manages cron-based job scheduling using node-cron
 */

const logger = createLogger({ module: 'scheduler' });

// Registry of scheduled jobs
const scheduledJobs = new Map<string, CronJob>();

/**
 * Schedule a job using cron expression
 */
export function scheduleJob(
  name: string,
  cronExpression: string,
  handler: () => void | Promise<void>,
  options?: {
    timezone?: string;
    runOnInit?: boolean;
    enabled?: boolean;
  },
): CronJob {
  if (scheduledJobs.has(name)) {
    logger.warn('Job already scheduled, stopping existing job', { jobName: name });
    stopJob(name);
  }

  const enabled = options?.enabled !== false;
  const timezone = options?.timezone || 'UTC';
  const runOnInit = options?.runOnInit || false;

  logger.info('Scheduling job', {
    jobName: name,
    cronExpression,
    timezone,
    runOnInit,
    enabled,
  });

  const job = new CronJob(
    cronExpression,
    async () => {
      const timer = logger.createTimer(`cron_${name}`);

      logger.info('Cron job triggered', { jobName: name });

      try {
        await handler();

        const duration = timer.end({ jobName: name, success: true });

        logger.info('Cron job completed successfully', {
          jobName: name,
          duration,
        });
      } catch (error) {
        const duration = timer.end({ jobName: name, success: false });

        logger.error('Cron job failed', error as Error, {
          jobName: name,
          duration,
        });

        captureException(error as Error, {
          tags: {
            job_type: 'cron',
            job_name: name,
          },
          extra: {
            cronExpression,
            duration,
          },
        });
      }
    },
    null, // onComplete callback
    enabled, // start immediately if enabled
    timezone,
    null, // context
    runOnInit, // run immediately on init
  );

  scheduledJobs.set(name, job);

  logger.info('Job scheduled successfully', {
    jobName: name,
    nextRun: job.nextDate()?.toISO(),
  });

  return job;
}

/**
 * Schedule multiple jobs from configuration
 */
export function scheduleJobs(schedules: JobSchedule[]): void {
  logger.info('Scheduling multiple jobs', { count: schedules.length });

  for (const schedule of schedules) {
    if (!schedule.enabled) {
      logger.info('Skipping disabled job', { jobType: schedule.jobType });
      continue;
    }

    // Note: The actual job handler should be provided by the caller
    // This is a placeholder that logs a warning
    scheduleJob(
      String(schedule.jobType),
      schedule.cronExpression,
      () => {
        logger.warn('Job handler not implemented', { jobType: schedule.jobType });
      },
      {
        timezone: schedule.timezone,
        enabled: schedule.enabled,
      },
    );
  }

  logger.info('Multiple jobs scheduled', {
    total: schedules.length,
    enabled: schedules.filter((s) => s.enabled).length,
  });
}

/**
 * Stop a scheduled job
 */
export function stopJob(name: string): void {
  const job = scheduledJobs.get(name);

  if (!job) {
    logger.warn('Job not found for stopping', { jobName: name });
    return;
  }

  job.stop();
  scheduledJobs.delete(name);

  logger.info('Job stopped and removed', { jobName: name });
}

/**
 * Start a previously stopped job
 */
export function startJob(name: string): void {
  const job = scheduledJobs.get(name);

  if (!job) {
    logger.warn('Job not found for starting', { jobName: name });
    return;
  }

  job.start();

  logger.info('Job started', {
    jobName: name,
    nextRun: job.nextDate()?.toISO(),
  });
}

/**
 * Get status of a scheduled job
 */
export function getJobStatus(name: string): {
  exists: boolean;
  running: boolean;
  nextRun?: string;
  lastRun?: string;
} {
  const job = scheduledJobs.get(name);

  if (!job) {
    return { exists: false, running: false };
  }

  return {
    exists: true,
    running: job.running,
    nextRun: job.nextDate()?.toISO(),
    lastRun: job.lastDate()?.toISO(),
  };
}

/**
 * Get all scheduled jobs
 */
export function getAllJobs(): Map<string, CronJob> {
  return scheduledJobs;
}

/**
 * Get summary of all scheduled jobs
 */
export function getSchedulerSummary(): {
  total: number;
  running: number;
  stopped: number;
  jobs: {
    name: string;
    running: boolean;
    nextRun?: string;
    lastRun?: string;
  }[];
} {
  const jobs = [];
  let running = 0;
  let stopped = 0;

  for (const [name, job] of scheduledJobs.entries()) {
    const isRunning = job.running;

    jobs.push({
      name,
      running: isRunning,
      nextRun: job.nextDate()?.toISO(),
      lastRun: job.lastDate()?.toISO(),
    });

    if (isRunning) {
      running++;
    } else {
      stopped++;
    }
  }

  return {
    total: scheduledJobs.size,
    running,
    stopped,
    jobs,
  };
}

/**
 * Stop all scheduled jobs
 */
export function stopAll(): void {
  logger.info('Stopping all scheduled jobs', { count: scheduledJobs.size });

  for (const [name, job] of scheduledJobs.entries()) {
    try {
      job.stop();
      logger.info('Job stopped', { jobName: name });
    } catch (error) {
      logger.error('Failed to stop job', error as Error, { jobName: name });
    }
  }

  scheduledJobs.clear();

  logger.info('All scheduled jobs stopped');
}

/**
 * Health check for scheduler
 */
export function healthCheck(): {
  healthy: boolean;
  totalJobs: number;
  runningJobs: number;
  errors: string[];
} {
  const errors: string[] = [];
  let running = 0;

  for (const [name, job] of scheduledJobs.entries()) {
    if (job.running) {
      running++;
    } else {
      errors.push(`Job ${name} is not running`);
    }
  }

  return {
    healthy: errors.length === 0,
    totalJobs: scheduledJobs.size,
    runningJobs: running,
    errors,
  };
}

/**
 * Validate cron expression
 */
export function validateCronExpression(expression: string): boolean {
  try {
    // Try to create a temporary job to validate the expression
    const testJob = new CronJob(expression, () => {}, null, false);
    testJob.stop();
    return true;
  } catch (error) {
    logger.warn('Invalid cron expression', { expression, error: (error as Error).message });
    return false;
  }
}

/**
 * Get next execution times for a cron expression
 */
export function getNextExecutions(
  cronExpression: string,
  count: number = 5,
): { valid: boolean; nextRuns?: string[]; error?: string } {
  try {
    const job = new CronJob(cronExpression, () => {}, null, false);
    const nextRuns: string[] = [];

    // Get next N execution times
    let currentDate = job.nextDate();
    for (let i = 0; i < count && currentDate; i++) {
      nextRuns.push(currentDate.toISO());
      currentDate = job.nextDate();
    }

    job.stop();

    return { valid: true, nextRuns };
  } catch (error) {
    return {
      valid: false,
      error: (error as Error).message,
    };
  }
}

/**
 * Common cron expressions
 */
export const CRON_EXPRESSIONS = {
  EVERY_MINUTE: '* * * * *',
  EVERY_5_MINUTES: '*/5 * * * *',
  EVERY_15_MINUTES: '*/15 * * * *',
  EVERY_30_MINUTES: '*/30 * * * *',
  EVERY_HOUR: '0 * * * *',
  EVERY_2_HOURS: '0 */2 * * *',
  EVERY_6_HOURS: '0 */6 * * *',
  EVERY_12_HOURS: '0 */12 * * *',
  DAILY_MIDNIGHT: '0 0 * * *',
  DAILY_NOON: '0 12 * * *',
  DAILY_3AM: '0 3 * * *',
  WEEKLY_MONDAY: '0 0 * * 1',
  WEEKLY_SUNDAY: '0 0 * * 0',
  MONTHLY_FIRST: '0 0 1 * *',
  MONTHLY_LAST: '0 0 L * *',
};
