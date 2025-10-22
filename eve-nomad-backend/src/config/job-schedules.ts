import { JobSchedule, JobType } from '../types/jobs';
import { CRON_EXPRESSIONS } from '../services/scheduler.service';
import { scheduleTokenRefresh } from '../jobs/token-refresh.job';
import { scheduleDailyCacheCleanup } from '../jobs/cache-cleanup.job';

/**
 * Job Schedules Configuration
 * Defines all scheduled jobs and their cron expressions
 */

/**
 * Default job schedules
 * These jobs run on a fixed schedule
 */
export const JOB_SCHEDULES: JobSchedule[] = [
  {
    jobType: JobType.TOKEN_REFRESH,
    cronExpression: CRON_EXPRESSIONS.EVERY_2_HOURS,
    enabled: true,
    timezone: 'UTC',
    description: 'Check for expiring tokens and queue refresh jobs every 2 hours',
  },
  {
    jobType: JobType.CACHE_CLEANUP,
    cronExpression: CRON_EXPRESSIONS.DAILY_3AM,
    enabled: true,
    timezone: 'UTC',
    description: 'Clean expired cache entries daily at 3 AM UTC',
  },
];

/**
 * Initialize all scheduled jobs
 */
export async function initializeScheduledJobs(): Promise<void> {
  const { scheduleJob } = await import('../services/scheduler.service');
  const { createLogger } = await import('../services/logger.service');

  const logger = createLogger({ module: 'job-schedules' });

  logger.info('Initializing scheduled jobs', { count: JOB_SCHEDULES.length });

  for (const schedule of JOB_SCHEDULES) {
    if (!schedule.enabled) {
      logger.info('Skipping disabled job', { jobType: schedule.jobType });
      continue;
    }

    let handler: () => void | Promise<void>;

    switch (schedule.jobType) {
      case JobType.TOKEN_REFRESH:
        handler = async () => {
          logger.info('Running scheduled token refresh');
          await scheduleTokenRefresh();
        };
        break;

      case JobType.CACHE_CLEANUP:
        handler = async () => {
          logger.info('Running scheduled cache cleanup');
          await scheduleDailyCacheCleanup();
        };
        break;

      default:
        logger.warn('No handler defined for job type', { jobType: schedule.jobType });
        continue;
    }

    scheduleJob(String(schedule.jobType), schedule.cronExpression, handler, {
      timezone: schedule.timezone,
      runOnInit: false, // Don't run immediately on startup
      enabled: schedule.enabled,
    });

    logger.info('Scheduled job registered', {
      jobType: schedule.jobType,
      cronExpression: schedule.cronExpression,
      description: schedule.description,
    });
  }

  logger.info('All scheduled jobs initialized');
}

/**
 * Optional: Additional schedules that can be enabled via environment variables
 */
export const OPTIONAL_JOB_SCHEDULES: JobSchedule[] = [
  {
    jobType: JobType.HISTORICAL_DATA_COLLECTION,
    cronExpression: CRON_EXPRESSIONS.WEEKLY_SUNDAY,
    enabled: false,
    timezone: 'UTC',
    description: 'Collect historical data for all characters weekly',
  },
  {
    jobType: JobType.ANALYTICS_PROCESSING,
    cronExpression: CRON_EXPRESSIONS.DAILY_MIDNIGHT,
    enabled: false,
    timezone: 'UTC',
    description: 'Process analytics data daily at midnight',
  },
];
