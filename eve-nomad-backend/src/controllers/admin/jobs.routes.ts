import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { createLogger } from '../../services/logger.service';
import * as queueService from '../../services/queue.service';
import * as metricsService from '../../services/job-metrics.service';
import * as schedulerService from '../../services/scheduler.service';

/**
 * Admin Job Management Routes
 * Provides endpoints for monitoring and managing background jobs
 */

const logger = createLogger({ module: 'admin-jobs-routes' });

export async function adminJobRoutes(fastify: FastifyInstance) {
  /**
   * GET /admin/jobs/health
   * Get health status of job system
   */
  fastify.get(
    '/admin/jobs/health',
    {
      schema: {
        tags: ['admin', 'jobs'],
        summary: 'Job system health check',
        description: 'Returns health status of all job queues, workers, and scheduled jobs',
        response: {
          200: {
            type: 'object',
            properties: {
              healthy: { type: 'boolean' },
              queues: { type: 'object' },
              scheduledJobs: { type: 'object' },
              workers: { type: 'object' },
            },
          },
        },
      },
    },
    async (_request: FastifyRequest, reply: FastifyReply) => {
      try {
        const health = await metricsService.getJobSystemHealth();
        return reply.send(health);
      } catch (error) {
        logger.error('Failed to get job system health', error as Error);
        return reply.status(500).send({ error: 'Failed to get job system health' });
      }
    },
  );

  /**
   * GET /admin/jobs/metrics
   * Get job activity metrics
   */
  fastify.get(
    '/admin/jobs/metrics',
    {
      schema: {
        tags: ['admin', 'jobs'],
        summary: 'Get job activity metrics',
        description: 'Returns comprehensive metrics for all job queues',
      },
    },
    async (_request: FastifyRequest, reply: FastifyReply) => {
      try {
        const summary = await metricsService.getJobActivitySummary();
        return reply.send(summary);
      } catch (error) {
        logger.error('Failed to get job metrics', error as Error);
        return reply.status(500).send({ error: 'Failed to get job metrics' });
      }
    },
  );

  /**
   * GET /admin/jobs/queues
   * Get all queue metrics
   */
  fastify.get(
    '/admin/jobs/queues',
    {
      schema: {
        tags: ['admin', 'jobs'],
        summary: 'Get all queue metrics',
        description: 'Returns metrics for all job queues',
      },
    },
    async (_request: FastifyRequest, reply: FastifyReply) => {
      try {
        const metrics = await metricsService.getAllQueueMetrics();
        return reply.send({ queues: metrics });
      } catch (error) {
        logger.error('Failed to get queue metrics', error as Error);
        return reply.status(500).send({ error: 'Failed to get queue metrics' });
      }
    },
  );

  /**
   * GET /admin/jobs/queues/:queueName
   * Get specific queue metrics
   */
  fastify.get<{ Params: { queueName: string } }>(
    '/admin/jobs/queues/:queueName',
    {
      schema: {
        tags: ['admin', 'jobs'],
        summary: 'Get specific queue metrics',
        params: {
          type: 'object',
          properties: {
            queueName: { type: 'string' },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Params: { queueName: string } }>, reply: FastifyReply) => {
      try {
        const { queueName } = request.params;
        const metrics = await metricsService.getQueueMetrics(queueName);

        if (!metrics) {
          return reply.status(404).send({ error: 'Queue not found' });
        }

        return reply.send(metrics);
      } catch (error) {
        logger.error('Failed to get queue metrics', error as Error);
        return reply.status(500).send({ error: 'Failed to get queue metrics' });
      }
    },
  );

  /**
   * GET /admin/jobs/queues/:queueName/jobs
   * Get jobs from a specific queue
   */
  fastify.get<{
    Params: { queueName: string };
    Querystring: { status?: string; limit?: number };
  }>(
    '/admin/jobs/queues/:queueName/jobs',
    {
      schema: {
        tags: ['admin', 'jobs'],
        summary: 'Get jobs from a queue',
        params: {
          type: 'object',
          properties: {
            queueName: { type: 'string' },
          },
        },
        querystring: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['waiting', 'active', 'completed', 'failed', 'delayed', 'paused'],
            },
            limit: { type: 'number', default: 10 },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{
        Params: { queueName: string };
        Querystring: { status?: string; limit?: number };
      }>,
      reply: FastifyReply,
    ) => {
      try {
        const { queueName } = request.params;
        const { status = 'waiting', limit = 10 } = request.query;

        const jobs = await queueService.getJobs(
          queueName,
          status as 'waiting' | 'active' | 'completed' | 'failed' | 'delayed' | 'paused',
          0,
          limit,
        );

        return reply.send({ jobs });
      } catch (error) {
        logger.error('Failed to get jobs', error as Error);
        return reply.status(500).send({ error: 'Failed to get jobs' });
      }
    },
  );

  /**
   * GET /admin/jobs/failed
   * Get failed jobs across all queues
   */
  fastify.get<{ Querystring: { limit?: number } }>(
    '/admin/jobs/failed',
    {
      schema: {
        tags: ['admin', 'jobs'],
        summary: 'Get failed jobs',
        querystring: {
          type: 'object',
          properties: {
            limit: { type: 'number', default: 50 },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Querystring: { limit?: number } }>,
      reply: FastifyReply,
    ) => {
      try {
        const { limit = 50 } = request.query;
        const failedJobs = await metricsService.getFailedJobs(limit);
        return reply.send({ failed: failedJobs });
      } catch (error) {
        logger.error('Failed to get failed jobs', error as Error);
        return reply.status(500).send({ error: 'Failed to get failed jobs' });
      }
    },
  );

  /**
   * GET /admin/jobs/active
   * Get active jobs across all queues
   */
  fastify.get<{ Querystring: { limit?: number } }>(
    '/admin/jobs/active',
    {
      schema: {
        tags: ['admin', 'jobs'],
        summary: 'Get active jobs',
        querystring: {
          type: 'object',
          properties: {
            limit: { type: 'number', default: 50 },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Querystring: { limit?: number } }>,
      reply: FastifyReply,
    ) => {
      try {
        const { limit = 50 } = request.query;
        const activeJobs = await metricsService.getActiveJobs(limit);
        return reply.send({ active: activeJobs });
      } catch (error) {
        logger.error('Failed to get active jobs', error as Error);
        return reply.status(500).send({ error: 'Failed to get active jobs' });
      }
    },
  );

  /**
   * POST /admin/jobs/queues/:queueName/jobs/:jobId/retry
   * Retry a failed job
   */
  fastify.post<{ Params: { queueName: string; jobId: string } }>(
    '/admin/jobs/queues/:queueName/jobs/:jobId/retry',
    {
      schema: {
        tags: ['admin', 'jobs'],
        summary: 'Retry a failed job',
        params: {
          type: 'object',
          properties: {
            queueName: { type: 'string' },
            jobId: { type: 'string' },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Params: { queueName: string; jobId: string } }>,
      reply: FastifyReply,
    ) => {
      try {
        const { queueName, jobId } = request.params;

        await queueService.retryJob(queueName, jobId);

        logger.info('Job retried', { queueName, jobId });

        return reply.send({ success: true, message: 'Job retried successfully' });
      } catch (error) {
        logger.error('Failed to retry job', error as Error);
        return reply.status(500).send({ error: 'Failed to retry job' });
      }
    },
  );

  /**
   * DELETE /admin/jobs/queues/:queueName/jobs/:jobId
   * Remove a job from queue
   */
  fastify.delete<{ Params: { queueName: string; jobId: string } }>(
    '/admin/jobs/queues/:queueName/jobs/:jobId',
    {
      schema: {
        tags: ['admin', 'jobs'],
        summary: 'Remove a job from queue',
        params: {
          type: 'object',
          properties: {
            queueName: { type: 'string' },
            jobId: { type: 'string' },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Params: { queueName: string; jobId: string } }>,
      reply: FastifyReply,
    ) => {
      try {
        const { queueName, jobId } = request.params;

        await queueService.removeJob(queueName, jobId);

        logger.info('Job removed', { queueName, jobId });

        return reply.send({ success: true, message: 'Job removed successfully' });
      } catch (error) {
        logger.error('Failed to remove job', error as Error);
        return reply.status(500).send({ error: 'Failed to remove job' });
      }
    },
  );

  /**
   * POST /admin/jobs/queues/:queueName/pause
   * Pause a queue
   */
  fastify.post<{ Params: { queueName: string } }>(
    '/admin/jobs/queues/:queueName/pause',
    {
      schema: {
        tags: ['admin', 'jobs'],
        summary: 'Pause a queue',
        params: {
          type: 'object',
          properties: {
            queueName: { type: 'string' },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Params: { queueName: string } }>, reply: FastifyReply) => {
      try {
        const { queueName } = request.params;

        await queueService.pauseQueue(queueName);

        logger.info('Queue paused', { queueName });

        return reply.send({ success: true, message: 'Queue paused successfully' });
      } catch (error) {
        logger.error('Failed to pause queue', error as Error);
        return reply.status(500).send({ error: 'Failed to pause queue' });
      }
    },
  );

  /**
   * POST /admin/jobs/queues/:queueName/resume
   * Resume a paused queue
   */
  fastify.post<{ Params: { queueName: string } }>(
    '/admin/jobs/queues/:queueName/resume',
    {
      schema: {
        tags: ['admin', 'jobs'],
        summary: 'Resume a paused queue',
        params: {
          type: 'object',
          properties: {
            queueName: { type: 'string' },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Params: { queueName: string } }>, reply: FastifyReply) => {
      try {
        const { queueName } = request.params;

        await queueService.resumeQueue(queueName);

        logger.info('Queue resumed', { queueName });

        return reply.send({ success: true, message: 'Queue resumed successfully' });
      } catch (error) {
        logger.error('Failed to resume queue', error as Error);
        return reply.status(500).send({ error: 'Failed to resume queue' });
      }
    },
  );

  /**
   * POST /admin/jobs/queues/:queueName/clean
   * Clean old jobs from queue
   */
  fastify.post<{
    Params: { queueName: string };
    Body: { grace?: number; status?: 'completed' | 'failed'; limit?: number };
  }>(
    '/admin/jobs/queues/:queueName/clean',
    {
      schema: {
        tags: ['admin', 'jobs'],
        summary: 'Clean old jobs from queue',
        params: {
          type: 'object',
          properties: {
            queueName: { type: 'string' },
          },
        },
        body: {
          type: 'object',
          properties: {
            grace: { type: 'number', default: 3600000 }, // 1 hour default
            status: { type: 'string', enum: ['completed', 'failed'] },
            limit: { type: 'number', default: 1000 },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{
        Params: { queueName: string };
        Body: { grace?: number; status?: 'completed' | 'failed'; limit?: number };
      }>,
      reply: FastifyReply,
    ) => {
      try {
        const { queueName } = request.params;
        const { grace = 3600000, status, limit = 1000 } = request.body;

        const removed = await queueService.cleanQueue(queueName, grace, status, limit);

        logger.info('Queue cleaned', { queueName, removed: removed.length });

        return reply.send({
          success: true,
          message: 'Queue cleaned successfully',
          removed: removed.length,
        });
      } catch (error) {
        logger.error('Failed to clean queue', error as Error);
        return reply.status(500).send({ error: 'Failed to clean queue' });
      }
    },
  );

  /**
   * GET /admin/jobs/scheduler
   * Get scheduled jobs status
   */
  fastify.get(
    '/admin/jobs/scheduler',
    {
      schema: {
        tags: ['admin', 'jobs'],
        summary: 'Get scheduled jobs status',
      },
    },
    async (_request: FastifyRequest, reply: FastifyReply) => {
      try {
        const summary = schedulerService.getSchedulerSummary();
        return reply.send(summary);
      } catch (error) {
        logger.error('Failed to get scheduler summary', error as Error);
        return reply.status(500).send({ error: 'Failed to get scheduler summary' });
      }
    },
  );

  /**
   * POST /admin/jobs/scheduler/:jobName/start
   * Start a scheduled job
   */
  fastify.post<{ Params: { jobName: string } }>(
    '/admin/jobs/scheduler/:jobName/start',
    {
      schema: {
        tags: ['admin', 'jobs'],
        summary: 'Start a scheduled job',
        params: {
          type: 'object',
          properties: {
            jobName: { type: 'string' },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Params: { jobName: string } }>, reply: FastifyReply) => {
      try {
        const { jobName } = request.params;

        schedulerService.startJob(jobName);

        logger.info('Scheduled job started', { jobName });

        return reply.send({ success: true, message: 'Scheduled job started' });
      } catch (error) {
        logger.error('Failed to start scheduled job', error as Error);
        return reply.status(500).send({ error: 'Failed to start scheduled job' });
      }
    },
  );

  /**
   * POST /admin/jobs/scheduler/:jobName/stop
   * Stop a scheduled job
   */
  fastify.post<{ Params: { jobName: string } }>(
    '/admin/jobs/scheduler/:jobName/stop',
    {
      schema: {
        tags: ['admin', 'jobs'],
        summary: 'Stop a scheduled job',
        params: {
          type: 'object',
          properties: {
            jobName: { type: 'string' },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Params: { jobName: string } }>, reply: FastifyReply) => {
      try {
        const { jobName } = request.params;

        schedulerService.stopJob(jobName);

        logger.info('Scheduled job stopped', { jobName });

        return reply.send({ success: true, message: 'Scheduled job stopped' });
      } catch (error) {
        logger.error('Failed to stop scheduled job', error as Error);
        return reply.status(500).send({ error: 'Failed to stop scheduled job' });
      }
    },
  );

  logger.info('Admin job routes registered');
}
