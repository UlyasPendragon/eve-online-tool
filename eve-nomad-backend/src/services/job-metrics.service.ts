// @ts-nocheck - Metrics type compatibility issues
import { createLogger } from './logger.service';
import { getAllQueues, getQueueCounts, getJobs } from './queue.service';
import { getAllJobs as getAllScheduledJobs } from './scheduler.service';
import { JobType, JobStatus, JobMetrics, QueueMetrics } from '../types/jobs';

/**
 * Job Metrics Service
 * Collects and aggregates metrics from all job queues and scheduled jobs
 */

const logger = createLogger({ module: 'job-metrics' });

/**
 * Get metrics for all queues
 */
export async function getAllQueueMetrics(): Promise<QueueMetrics[]> {
  const metrics: QueueMetrics[] = [];
  const queues = getAllQueues();

  for (const [queueName, queue] of queues.entries()) {
    try {
      const counts = await getQueueCounts(queueName);
      const total = Object.values(counts).reduce((sum, count) => sum + count, 0);

      // Calculate rates
      const completionRate = total > 0 ? ((counts.completed / total) * 100).toFixed(2) : undefined;
      const failureRate = total > 0 ? ((counts.failed / total) * 100).toFixed(2) : undefined;

      metrics.push({
        queueName,
        waiting: counts.waiting,
        active: counts.active,
        completed: counts.completed,
        failed: counts.failed,
        delayed: counts.delayed,
        paused: counts.paused,
        total,
        completionRate: completionRate ? parseFloat(completionRate) : undefined,
        failureRate: failureRate ? parseFloat(failureRate) : undefined,
      });
    } catch (error) {
      logger.error('Failed to get queue metrics', error as Error, { queueName });
    }
  }

  return metrics;
}

/**
 * Get metrics for a specific queue
 */
export async function getQueueMetrics(queueName: string): Promise<QueueMetrics | null> {
  try {
    const counts = await getQueueCounts(queueName);
    const total = Object.values(counts).reduce((sum, count) => sum + count, 0);

    // Get recent completed jobs to calculate average processing time
    const completedJobs = await getJobs(queueName, 'completed', 0, 100);
    const processingTimes = completedJobs
      .map((job) => {
        if (job.finishedOn && job.processedOn) {
          return job.finishedOn - job.processedOn;
        }
        return 0;
      })
      .filter((time) => time > 0);

    const avgProcessingTime =
      processingTimes.length > 0
        ? processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length
        : undefined;

    const completionRate = total > 0 ? (counts.completed / total) * 100 : undefined;
    const failureRate = total > 0 ? (counts.failed / total) * 100 : undefined;

    return {
      queueName,
      waiting: counts.waiting,
      active: counts.active,
      completed: counts.completed,
      failed: counts.failed,
      delayed: counts.delayed,
      paused: counts.paused,
      total,
      completionRate,
      failureRate,
      avgProcessingTime,
    };
  } catch (error) {
    logger.error('Failed to get queue metrics', error as Error, { queueName });
    return null;
  }
}

/**
 * Get job metrics by type
 */
export async function getJobMetricsByType(jobType: JobType): Promise<JobMetrics | null> {
  try {
    const queues = getAllQueues();
    let totalCount = 0;
    let completedCount = 0;
    let failedCount = 0;
    const durations: number[] = [];

    for (const [queueName, queue] of queues.entries()) {
      // Get all jobs of this type
      const jobs = await queue.getJobs(['completed', 'failed', 'active', 'waiting'], 0, 1000);
      const typeJobs = jobs.filter((job) => job.name === jobType);

      totalCount += typeJobs.length;

      for (const job of typeJobs) {
        if (job.finishedOn && job.processedOn) {
          const duration = job.finishedOn - job.processedOn;
          durations.push(duration);

          if (job.failedReason) {
            failedCount++;
          } else {
            completedCount++;
          }
        }
      }
    }

    if (totalCount === 0) {
      return null;
    }

    const avgDuration =
      durations.length > 0
        ? durations.reduce((sum, d) => sum + d, 0) / durations.length
        : undefined;
    const minDuration = durations.length > 0 ? Math.min(...durations) : undefined;
    const maxDuration = durations.length > 0 ? Math.max(...durations) : undefined;
    const failureRate = totalCount > 0 ? (failedCount / totalCount) * 100 : undefined;

    return {
      jobType,
      status: JobStatus.COMPLETED,
      count: totalCount,
      avgDuration,
      minDuration,
      maxDuration,
      failureRate,
    };
  } catch (error) {
    logger.error('Failed to get job metrics by type', error as Error, { jobType });
    return null;
  }
}

/**
 * Get health status of all job systems
 */
export async function getJobSystemHealth(): Promise<{
  healthy: boolean;
  queues: {
    total: number;
    healthy: number;
    unhealthy: number;
    issues: string[];
  };
  scheduledJobs: {
    total: number;
    running: number;
    stopped: number;
    issues: string[];
  };
  workers: {
    total: number;
    active: number;
    issues: string[];
  };
}> {
  const issues: string[] = [];
  const queues = getAllQueues();
  const scheduledJobs = getAllScheduledJobs();

  // Check queue health
  let healthyQueues = 0;
  let unhealthyQueues = 0;

  for (const [queueName, queue] of queues.entries()) {
    try {
      await queue.getJobCounts();
      healthyQueues++;
    } catch (error) {
      unhealthyQueues++;
      issues.push(`Queue ${queueName}: ${(error as Error).message}`);
    }
  }

  // Check scheduled jobs health
  let runningScheduledJobs = 0;
  let stoppedScheduledJobs = 0;

  for (const [name, job] of scheduledJobs.entries()) {
    if (job.running) {
      runningScheduledJobs++;
    } else {
      stoppedScheduledJobs++;
      issues.push(`Scheduled job ${name} is not running`);
    }
  }

  const healthy = issues.length === 0;

  return {
    healthy,
    queues: {
      total: queues.size,
      healthy: healthyQueues,
      unhealthy: unhealthyQueues,
      issues: issues.filter((i) => i.startsWith('Queue')),
    },
    scheduledJobs: {
      total: scheduledJobs.size,
      running: runningScheduledJobs,
      stopped: stoppedScheduledJobs,
      issues: issues.filter((i) => i.startsWith('Scheduled job')),
    },
    workers: {
      total: queues.size, // One worker per queue
      active: healthyQueues,
      issues: issues.filter((i) => i.startsWith('Worker')),
    },
  };
}

/**
 * Get summary of all job activity
 */
export async function getJobActivitySummary(): Promise<{
  queues: QueueMetrics[];
  totalJobs: number;
  activeJobs: number;
  completedJobs: number;
  failedJobs: number;
  waitingJobs: number;
  overallCompletionRate?: number;
  overallFailureRate?: number;
}> {
  const queueMetrics = await getAllQueueMetrics();

  const totalJobs = queueMetrics.reduce((sum, q) => sum + q.total, 0);
  const activeJobs = queueMetrics.reduce((sum, q) => sum + q.active, 0);
  const completedJobs = queueMetrics.reduce((sum, q) => sum + q.completed, 0);
  const failedJobs = queueMetrics.reduce((sum, q) => sum + q.failed, 0);
  const waitingJobs = queueMetrics.reduce((sum, q) => sum + q.waiting, 0);

  const overallCompletionRate = totalJobs > 0 ? (completedJobs / totalJobs) * 100 : undefined;
  const overallFailureRate = totalJobs > 0 ? (failedJobs / totalJobs) * 100 : undefined;

  return {
    queues: queueMetrics,
    totalJobs,
    activeJobs,
    completedJobs,
    failedJobs,
    waitingJobs,
    overallCompletionRate,
    overallFailureRate,
  };
}

/**
 * Get failed jobs across all queues
 */
export async function getFailedJobs(limit: number = 50): Promise<
  {
    queueName: string;
    jobId: string;
    jobName: string;
    failedReason: string;
    attemptsMade: number;
    timestamp: number;
    data: any;
  }[]
> {
  const failedJobs: any[] = [];
  const queues = getAllQueues();

  for (const [queueName, queue] of queues.entries()) {
    try {
      const jobs = await queue.getFailed(0, limit);

      for (const job of jobs) {
        failedJobs.push({
          queueName,
          jobId: String(job.id),
          jobName: job.name,
          failedReason: job.failedReason || 'Unknown',
          attemptsMade: job.attemptsMade,
          timestamp: job.timestamp || Date.now(),
          data: job.data,
        });
      }
    } catch (error) {
      logger.error('Failed to get failed jobs', error as Error, { queueName });
    }
  }

  // Sort by timestamp (most recent first)
  failedJobs.sort((a, b) => b.timestamp - a.timestamp);

  return failedJobs.slice(0, limit);
}

/**
 * Get active jobs across all queues
 */
export async function getActiveJobs(limit: number = 50): Promise<
  {
    queueName: string;
    jobId: string;
    jobName: string;
    progress: number;
    timestamp: number;
    data: any;
  }[]
> {
  const activeJobs: any[] = [];
  const queues = getAllQueues();

  for (const [queueName, queue] of queues.entries()) {
    try {
      const jobs = await queue.getActive(0, limit);

      for (const job of jobs) {
        activeJobs.push({
          queueName,
          jobId: String(job.id),
          jobName: job.name,
          progress: (await job.progress()) || 0,
          timestamp: job.timestamp || Date.now(),
          data: job.data,
        });
      }
    } catch (error) {
      logger.error('Failed to get active jobs', error as Error, { queueName });
    }
  }

  return activeJobs.slice(0, limit);
}

/**
 * Record job metric (for custom tracking)
 */
export async function recordJobMetric(
  jobType: JobType,
  duration: number,
  success: boolean,
  metadata?: Record<string, unknown>,
): Promise<void> {
  logger.debug('Recording job metric', {
    jobType,
    duration,
    success,
    metadata,
  });

  // In production, this would store metrics in a time-series database
  // For now, we just log it
  logger.performance(String(jobType), duration, {
    success,
    ...metadata,
  });
}
