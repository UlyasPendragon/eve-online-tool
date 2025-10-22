# Background Job Processing System Documentation

## Overview

EVE Nomad Backend uses a production-grade background job processing system built on:
- **BullMQ** - Redis-based job queue with advanced features
- **Cron** - Reliable job scheduling with cron expressions
- **Custom middleware** - Metrics, monitoring, and centralized management

## Table of Contents

- [Architecture](#architecture)
- [Queue Service](#queue-service)
- [Job Types](#job-types)
- [Scheduler Service](#scheduler-service)
- [Job Metrics](#job-metrics)
- [Admin API](#admin-api)
- [Best Practices](#best-practices)
- [Configuration](#configuration)
- [Examples](#examples)

## Architecture

### Job Processing Flow

```
Scheduler → Queue → Worker → Process → Complete/Fail
                                ↓
                          Metrics & Logging
                                ↓
                          Sentry (if error)
```

### Key Components

1. **Queue Service** (`src/services/queue.service.ts`)
   - Centralized queue management
   - Shared Redis connection pool
   - Automatic retry with exponential backoff
   - Job priority system

2. **Worker Processes**
   - Token Refresh Worker
   - ESI Data Refresh Worker
   - Historical Data Collection Worker
   - Cache Cleanup Worker

3. **Scheduler Service** (`src/services/scheduler.service.ts`)
   - Cron-based job scheduling
   - Automatic job triggering
   - Health monitoring

4. **Job Metrics** (`src/services/job-metrics.service.ts`)
   - Real-time queue metrics
   - Job performance tracking
   - Health checks

5. **Admin API** (`src/controllers/admin/jobs.routes.ts`)
   - Job monitoring endpoints
   - Queue management controls
   - Failed job recovery

## Queue Service

### Creating Queues

```typescript
import { getQueue, addJob } from '../services/queue.service';
import { JobType, JobPriority, MyJobData } from '../types/jobs';

// Get or create a queue
const queue = getQueue('my-queue');

// Add a job to the queue
await addJob<MyJobData>(
  'my-queue',
  JobType.MY_JOB_TYPE,
  { /* job data */ },
  {
    priority: JobPriority.HIGH,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
);
```

### Creating Workers

```typescript
import { createWorker } from '../services/queue.service';
import { Job } from 'bullmq';

// Define job processor
async function processMyJob(job: Job<MyJobData>): Promise<MyJobResult> {
  const { data } = job;

  // Process the job
  const result = await doWork(data);

  return result;
}

// Create worker
const worker = createWorker<MyJobData, MyJobResult>(
  'my-queue',
  processMyJob,
  {
    concurrency: 5, // Process 5 jobs concurrently
  },
);
```

### Job Priorities

Jobs are processed based on priority:

| Priority | Value | Use Case | Example |
|----------|-------|----------|---------|
| CRITICAL | 1 | Immediate execution | Expired tokens |
| HIGH | 2 | Important but not urgent | User-requested refresh |
| NORMAL | 3 | Standard operations | Scheduled tasks |
| LOW | 4 | Background maintenance | Cache cleanup |
| BATCH | 5 | Large batch operations | Historical data |

### Queue Operations

```typescript
import * as queueService from '../services/queue.service';

// Get queue metrics
const metrics = await queueService.getQueueCounts('my-queue');
console.log(metrics); // { waiting: 5, active: 2, completed: 100, failed: 3, ... }

// Get jobs by status
const waitingJobs = await queueService.getJobs('my-queue', 'waiting', 0, 10);

// Retry a failed job
await queueService.retryJob('my-queue', jobId);

// Remove a job
await queueService.removeJob('my-queue', jobId);

// Clean old jobs
await queueService.cleanQueue('my-queue', 3600000, 'completed', 1000);

// Pause/resume queue
await queueService.pauseQueue('my-queue');
await queueService.resumeQueue('my-queue');
```

## Job Types

### Token Refresh Job

Automatically refreshes expiring OAuth tokens.

```typescript
import { refreshCharacterToken } from '../jobs/token-refresh.job';
import { JobPriority } from '../types/jobs';

// Manually trigger token refresh
await refreshCharacterToken(characterId, userId, JobPriority.CRITICAL);
```

**Schedule**: Every 2 hours
**Priority**: HIGH
**Retries**: 3 with exponential backoff

### ESI Data Refresh Job

Fetches fresh data from ESI endpoints.

```typescript
import { refreshESIData, refreshCharacterData } from '../jobs/esi-refresh.job';

// Refresh single endpoint
await refreshESIData(characterId, userId, '/latest/characters/{character_id}/wallet/', {
  skipCache: true,
  priority: JobPriority.HIGH,
  requestedBy: 'user',
});

// Refresh multiple endpoints
await refreshCharacterData(characterId, userId, ['CHARACTER_WALLET', 'CHARACTER_SKILLS'], {
  skipCache: false,
  priority: JobPriority.NORMAL,
});
```

**Endpoint Groups**:
- `CHARACTER_OVERVIEW` - Basic character info, location, ship
- `CHARACTER_WALLET` - Wallet, journal, transactions
- `CHARACTER_SKILLS` - Skills, queue, attributes
- `CHARACTER_ASSETS` - Assets, blueprints
- `CHARACTER_INDUSTRY` - Industry jobs, mining
- `CHARACTER_MARKET` - Market orders
- `CHARACTER_MAIL` - Mail, labels
- `CHARACTER_NOTIFICATIONS` - Notifications

### Historical Data Collection Job

Collects and stores historical data for analytics.

```typescript
import { collectHistoricalData, collectAllHistoricalData } from '../jobs/historical-data.job';

// Collect specific data type
await collectHistoricalData(characterId, userId, 'wallet_journal', {
  fromDate: new Date('2025-01-01'),
  toDate: new Date('2025-10-18'),
  priority: JobPriority.LOW,
});

// Collect all historical data
await collectAllHistoricalData(characterId, userId, {
  fromDate: new Date('2025-01-01'),
  priority: JobPriority.BATCH,
});
```

**Data Types**:
- `wallet_journal` - Wallet journal entries
- `wallet_transactions` - Wallet transactions
- `market_orders` - Market order history
- `industry_jobs` - Industry job history
- `skill_history` - Skill training history

### Cache Cleanup Job

Removes expired or stale cache entries.

```typescript
import { cleanupCache } from '../jobs/cache-cleanup.job';

// Clean expired entries
await cleanupCache('expired');

// Clean by pattern
await cleanupCache('pattern', { pattern: 'esi:characters:*' });

// LRU cleanup
await cleanupCache('lru', { maxSize: 10000 });

// Dry run
await cleanupCache('expired', { dryRun: true });
```

**Schedule**: Daily at 3 AM UTC
**Types**: expired, lru, pattern, all

## Scheduler Service

### Scheduling Jobs

```typescript
import { scheduleJob, CRON_EXPRESSIONS } from '../services/scheduler.service';

// Schedule a recurring job
scheduleJob(
  'my-scheduled-job',
  CRON_EXPRESSIONS.EVERY_HOUR,
  async () => {
    // Job logic here
    await performTask();
  },
  {
    timezone: 'UTC',
    runOnInit: false,
    enabled: true,
  },
);
```

### Common Cron Expressions

```typescript
import { CRON_EXPRESSIONS } from '../services/scheduler.service';

CRON_EXPRESSIONS.EVERY_MINUTE      // * * * * *
CRON_EXPRESSIONS.EVERY_5_MINUTES   // */5 * * * *
CRON_EXPRESSIONS.EVERY_15_MINUTES  // */15 * * * *
CRON_EXPRESSIONS.EVERY_30_MINUTES  // */30 * * * *
CRON_EXPRESSIONS.EVERY_HOUR        // 0 * * * *
CRON_EXPRESSIONS.EVERY_2_HOURS     // 0 */2 * * *
CRON_EXPRESSIONS.EVERY_6_HOURS     // 0 */6 * * *
CRON_EXPRESSIONS.DAILY_MIDNIGHT    // 0 0 * * *
CRON_EXPRESSIONS.DAILY_3AM         // 0 3 * * *
CRON_EXPRESSIONS.WEEKLY_MONDAY     // 0 0 * * 1
CRON_EXPRESSIONS.MONTHLY_FIRST     // 0 0 1 * *
```

### Scheduler Operations

```typescript
import * as schedulerService from '../services/scheduler.service';

// Get job status
const status = schedulerService.getJobStatus('my-job');
console.log(status); // { exists: true, running: true, nextRun: '...', lastRun: '...' }

// Start/stop jobs
schedulerService.startJob('my-job');
schedulerService.stopJob('my-job');

// Get summary
const summary = schedulerService.getSchedulerSummary();
console.log(summary); // { total: 5, running: 4, stopped: 1, jobs: [...] }

// Validate cron expression
const isValid = schedulerService.validateCronExpression('0 */2 * * *');

// Get next execution times
const nextRuns = schedulerService.getNextExecutions('0 */2 * * *', 5);
```

## Job Metrics

### Queue Metrics

```typescript
import * as metricsService from '../services/job-metrics.service';

// Get all queue metrics
const allMetrics = await metricsService.getAllQueueMetrics();

// Get specific queue metrics
const queueMetrics = await metricsService.getQueueMetrics('token-refresh');
console.log(queueMetrics);
// {
//   queueName: 'token-refresh',
//   waiting: 5,
//   active: 2,
//   completed: 1000,
//   failed: 10,
//   total: 1017,
//   completionRate: 98.33,
//   failureRate: 0.98,
//   avgProcessingTime: 1250,
// }
```

### Job Activity Summary

```typescript
const summary = await metricsService.getJobActivitySummary();
console.log(summary);
// {
//   queues: [...],
//   totalJobs: 5000,
//   activeJobs: 15,
//   completedJobs: 4850,
//   failedJobs: 50,
//   waitingJobs: 85,
//   overallCompletionRate: 97.0,
//   overallFailureRate: 1.0,
// }
```

### Failed Jobs

```typescript
// Get failed jobs across all queues
const failedJobs = await metricsService.getFailedJobs(50);

for (const job of failedJobs) {
  console.log({
    queueName: job.queueName,
    jobId: job.jobId,
    failedReason: job.failedReason,
    attemptsMade: job.attemptsMade,
  });
}
```

### Health Checks

```typescript
const health = await metricsService.getJobSystemHealth();
console.log(health);
// {
//   healthy: true,
//   queues: { total: 4, healthy: 4, unhealthy: 0, issues: [] },
//   scheduledJobs: { total: 2, running: 2, stopped: 0, issues: [] },
//   workers: { total: 4, active: 4, issues: [] },
// }
```

## Admin API

### Endpoints

#### Health Check
```http
GET /admin/jobs/health
```

Returns health status of all job queues, workers, and scheduled jobs.

#### Job Metrics
```http
GET /admin/jobs/metrics
```

Returns comprehensive metrics for all job queues.

#### Queue List
```http
GET /admin/jobs/queues
```

Returns metrics for all queues.

#### Specific Queue
```http
GET /admin/jobs/queues/:queueName
```

Returns detailed metrics for a specific queue.

#### Queue Jobs
```http
GET /admin/jobs/queues/:queueName/jobs?status=waiting&limit=10
```

Query parameters:
- `status`: waiting|active|completed|failed|delayed|paused
- `limit`: Number of jobs to return (default: 10)

#### Failed Jobs
```http
GET /admin/jobs/failed?limit=50
```

Returns failed jobs across all queues.

#### Active Jobs
```http
GET /admin/jobs/active?limit=50
```

Returns currently active jobs.

#### Retry Job
```http
POST /admin/jobs/queues/:queueName/jobs/:jobId/retry
```

Retries a failed job.

#### Remove Job
```http
DELETE /admin/jobs/queues/:queueName/jobs/:jobId
```

Removes a job from the queue.

#### Pause Queue
```http
POST /admin/jobs/queues/:queueName/pause
```

Pauses job processing for a queue.

#### Resume Queue
```http
POST /admin/jobs/queues/:queueName/resume
```

Resumes a paused queue.

#### Clean Queue
```http
POST /admin/jobs/queues/:queueName/clean
Content-Type: application/json

{
  "grace": 3600000,
  "status": "completed",
  "limit": 1000
}
```

Removes old jobs from a queue.

#### Scheduler Status
```http
GET /admin/jobs/scheduler
```

Returns status of all scheduled jobs.

#### Start Scheduled Job
```http
POST /admin/jobs/scheduler/:jobName/start
```

Starts a stopped scheduled job.

#### Stop Scheduled Job
```http
POST /admin/jobs/scheduler/:jobName/stop
```

Stops a running scheduled job.

## Best Practices

### 1. Choose Appropriate Priority

```typescript
// ✅ Good
await addJob('token-refresh', JobType.TOKEN_REFRESH, data, {
  priority: JobPriority.CRITICAL, // User's token expired, needs immediate refresh
});

await addJob('cache-cleanup', JobType.CACHE_CLEANUP, data, {
  priority: JobPriority.LOW, // Background maintenance
});

// ❌ Bad
await addJob('cache-cleanup', JobType.CACHE_CLEANUP, data, {
  priority: JobPriority.CRITICAL, // Not urgent!
});
```

### 2. Handle Errors Properly

```typescript
// ✅ Good
async function processJob(job: Job<MyJobData>): Promise<MyJobResult> {
  try {
    const result = await doWork(job.data);
    return { success: true, result };
  } catch (error) {
    if (isRetryableError(error)) {
      throw error; // Will trigger retry
    }

    logger.error('Non-retryable error', error);
    return { success: false, error: error.message };
  }
}

// ❌ Bad
async function processJob(job: Job<MyJobData>): Promise<MyJobResult> {
  const result = await doWork(job.data); // Unhandled errors
  return result;
}
```

### 3. Set Appropriate Timeouts

```typescript
// ✅ Good - different timeouts for different job types
await addJob('quick-task', JobType.ESI_DATA_REFRESH, data, {
  attempts: 3,
  backoff: { type: 'exponential', delay: 1000 },
});

await addJob('long-task', JobType.HISTORICAL_DATA_COLLECTION, data, {
  attempts: 2,
  backoff: { type: 'exponential', delay: 5000 },
});

// ❌ Bad - same config for all jobs
await addJob('any-task', JobType.ANY, data, {
  attempts: 10, // Too many retries
  backoff: { type: 'fixed', delay: 100 }, // Too short
});
```

### 4. Monitor Job Performance

```typescript
// ✅ Good
async function processJob(job: Job<MyJobData>): Promise<MyJobResult> {
  const timer = logger.createTimer('process_my_job');

  const result = await doWork(job.data);

  timer.end({ jobId: job.id, success: true });

  await recordJobMetric(JobType.MY_JOB, timer.duration, true);

  return result;
}

// ❌ Bad - no monitoring
async function processJob(job: Job<MyJobData>): Promise<MyJobResult> {
  return await doWork(job.data);
}
```

### 5. Clean Up Old Jobs

```typescript
// ✅ Good - regular cleanup
scheduleJob('cleanup-jobs', CRON_EXPRESSIONS.DAILY_3AM, async () => {
  await cleanQueue('my-queue', 24 * 60 * 60 * 1000, 'completed', 1000);
  await cleanQueue('my-queue', 7 * 24 * 60 * 60 * 1000, 'failed', 1000);
});

// ❌ Bad - never cleaning up
// Jobs accumulate indefinitely
```

### 6. Use Job Data Types

```typescript
// ✅ Good - strongly typed
interface MyJobData {
  userId: number;
  action: 'create' | 'update' | 'delete';
  metadata: Record<string, unknown>;
}

await addJob<MyJobData>('my-queue', JobType.MY_JOB, {
  userId: 123,
  action: 'create',
  metadata: { foo: 'bar' },
});

// ❌ Bad - untyped
await addJob('my-queue', JobType.MY_JOB, {
  usr: 123, // Typo!
  act: 'crate', // Typo!
  meta: { foo: 'bar' },
});
```

## Configuration

### Environment Variables

```env
# Redis (required for BullMQ)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# BullMQ Configuration
BULLMQ_CONCURRENCY=5
BULLMQ_MAX_RETRIES=3
BULLMQ_RETRY_DELAY=2000
```

### Job Concurrency

| Job Type | Recommended Concurrency | Reason |
|----------|------------------------|--------|
| Token Refresh | 5 | Moderate I/O, token rate limits |
| ESI Data Refresh | 10 | High I/O, ESI rate limits apply |
| Historical Data | 3 | Database intensive |
| Cache Cleanup | 1 | Single-threaded cleanup |

### Retry Strategies

| Job Type | Attempts | Backoff | Reason |
|----------|----------|---------|--------|
| Token Refresh | 3 | Exponential (2s) | OAuth may be temporarily unavailable |
| ESI Data Refresh | 3 | Exponential (2s) | ESI rate limits |
| Historical Data | 2 | Exponential (5s) | Large operations, expensive retries |
| Cache Cleanup | 1 | N/A | Idempotent, no retry needed |

## Examples

### Creating a New Job Type

1. **Define Job Data Type** (`src/types/jobs.ts`):

```typescript
export interface MyCustomJobData {
  userId: number;
  action: string;
  params: Record<string, unknown>;
}

export interface MyCustomJobResult {
  success: boolean;
  message: string;
  duration: number;
}

export enum JobType {
  // ...existing types
  MY_CUSTOM_JOB = 'my-custom-job',
}
```

2. **Create Job Processor** (`src/jobs/my-custom.job.ts`):

```typescript
import { Job } from 'bullmq';
import { createLogger } from '../services/logger.service';
import { captureException } from '../config/sentry.config';
import { addJob, createWorker } from '../services/queue.service';
import { JobType, JobPriority, MyCustomJobData, MyCustomJobResult } from '../types/jobs';

const logger = createLogger({ module: 'my-custom-job' });
const QUEUE_NAME = 'my-custom-queue';

async function processMyCustomJob(job: Job<MyCustomJobData>): Promise<MyCustomJobResult> {
  const startTime = Date.now();
  const { userId, action, params } = job.data;

  logger.info('Processing custom job', { userId, action, jobId: job.id });

  try {
    // Your job logic here
    await performAction(action, params);

    const duration = Date.now() - startTime;

    logger.info('Custom job completed', { userId, action, duration, jobId: job.id });

    return { success: true, message: 'Job completed', duration };
  } catch (error) {
    const duration = Date.now() - startTime;

    logger.error('Custom job failed', error as Error, { userId, action, duration });

    captureException(error as Error, {
      userId,
      tags: { job_type: JobType.MY_CUSTOM_JOB, action },
      extra: { params, duration },
    });

    return { success: false, message: (error as Error).message, duration };
  }
}

export function startMyCustomJobWorker() {
  const worker = createWorker<MyCustomJobData, MyCustomJobResult>(
    QUEUE_NAME,
    processMyCustomJob,
    { concurrency: 5 }
  );

  logger.info('My custom job worker started');
  return worker;
}

export async function queueMyCustomJob(
  userId: number,
  action: string,
  params: Record<string, unknown>,
  priority: JobPriority = JobPriority.NORMAL,
): Promise<void> {
  await addJob<MyCustomJobData>(
    QUEUE_NAME,
    JobType.MY_CUSTOM_JOB,
    { userId, action, params },
    {
      priority,
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
    },
  );

  logger.info('Custom job queued', { userId, action });
}

export { QUEUE_NAME as myCustomQueueName };
```

3. **Initialize Worker** (`src/index.ts`):

```typescript
import { startMyCustomJobWorker } from './jobs/my-custom.job';

// In start() function
startMyCustomJobWorker();
```

4. **Use the Job**:

```typescript
import { queueMyCustomJob } from './jobs/my-custom.job';
import { JobPriority } from './types/jobs';

// Queue the job
await queueMyCustomJob(userId, 'process_data', { foo: 'bar' }, JobPriority.HIGH);
```

### Scheduled Job Example

Add to `src/config/job-schedules.ts`:

```typescript
import { CRON_EXPRESSIONS } from '../services/scheduler.service';

export const JOB_SCHEDULES: JobSchedule[] = [
  // ...existing schedules
  {
    jobType: JobType.MY_CUSTOM_JOB,
    cronExpression: CRON_EXPRESSIONS.DAILY_MIDNIGHT,
    enabled: true,
    timezone: 'UTC',
    description: 'Run my custom job daily at midnight',
  },
];
```

Add handler in `initializeScheduledJobs()`:

```typescript
case JobType.MY_CUSTOM_JOB:
  handler = async () => {
    logger.info('Running scheduled custom job');
    await queueMyCustomJob(0, 'scheduled_action', {});
  };
  break;
```

## Monitoring & Alerts

### Key Metrics to Monitor

- **Queue depth**: Waiting jobs should not grow indefinitely
- **Failure rate**: Should be < 5% for most job types
- **Processing time**: Sudden increases indicate problems
- **Worker health**: All workers should be running

### Recommended Alerts

1. **High failure rate** (>10% failed jobs in 1 hour)
2. **Queue backup** (>1000 waiting jobs)
3. **Slow processing** (avg processing time >2x normal)
4. **Worker down** (worker not running)
5. **Scheduled job missed** (scheduled job didn't run)

### Accessing Metrics

```bash
# Via API
curl http://localhost:3000/admin/jobs/health
curl http://localhost:3000/admin/jobs/metrics
curl http://localhost:3000/admin/jobs/failed

# Via logs
# Search for: level=error module=*-job
# Search for: category=job_metrics
```

## Troubleshooting

### Jobs Not Processing

1. Check Redis connection
2. Verify workers are running
3. Check queue is not paused
4. Review worker concurrency limits

### High Failure Rate

1. Check failed job reasons in admin API
2. Review Sentry errors
3. Verify external dependencies (ESI, database)
4. Check rate limiting

### Jobs Stuck in Active

1. Check worker health
2. Review job timeouts
3. Check for deadlocks in job code
4. Restart workers if needed

### Memory Issues

1. Reduce worker concurrency
2. Clean up old completed jobs
3. Check for memory leaks in job processors
4. Monitor Redis memory usage

---

**Last Updated**: 2025-10-18
**Version**: 1.0.0
**Status**: Production Ready ✅
