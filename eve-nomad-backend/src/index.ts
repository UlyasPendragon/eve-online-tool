// IMPORTANT: Sentry must be imported FIRST before any other modules
import './config/sentry.config';
import { initializeSentry } from './config/sentry.config';

// Initialize Sentry before everything else
initializeSentry();

import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { authRoutes } from './controllers/auth.routes';
import { characterRoutes } from './controllers/character.routes';
import { startTokenRefreshWorker } from './jobs/token-refresh.job';
import { startESIDataRefreshWorker } from './jobs/esi-refresh.job';
import { startHistoricalDataCollectionWorker } from './jobs/historical-data.job';
import { startCacheCleanupWorker } from './jobs/cache-cleanup.job';
import { initializeScheduledJobs } from './config/job-schedules';
import { closeAll as closeAllQueues } from './services/queue.service';
import { stopAll as stopAllScheduledJobs } from './services/scheduler.service';
import { adminJobRoutes } from './controllers/admin/jobs.routes';
import * as jwtService from './services/jwt.service';
import { correlationIdMiddleware } from './middleware/correlation-id.middleware';
import { errorHandler, notFoundHandler } from './middleware/error-handler.middleware';
import { logger } from './services/logger.service';
import { disconnectPrisma } from './utils/prisma';
import { validateRequiredConfig } from './utils/config-validator';

// Validate configuration before starting server
validateRequiredConfig();

// Initialize Fastify instance
const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    transport:
      process.env.NODE_ENV === 'development'
        ? {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'HH:MM:ss Z',
              ignore: 'pid,hostname',
            },
          }
        : undefined,
  },
});

// Register plugins
async function registerPlugins() {
  // Correlation ID middleware (must be first)
  fastify.addHook('onRequest', correlationIdMiddleware);

  // Security headers
  await fastify.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
  });

  // CORS
  await fastify.register(cors, {
    origin: process.env.CORS_ORIGIN?.split(',') || true,
    credentials: process.env.CORS_CREDENTIALS === 'true',
  });

  // Swagger API documentation
  await fastify.register(swagger, {
    openapi: {
      info: {
        title: 'EVE Nomad API',
        description: 'Backend API for EVE Nomad mobile companion app',
        version: '0.1.0',
      },
      servers: [
        {
          url: `http://localhost:${process.env.PORT || 3000}`,
          description: 'Development server',
        },
      ],
      tags: [
        { name: 'health', description: 'Health check endpoints' },
        { name: 'auth', description: 'Authentication endpoints' },
        { name: 'characters', description: 'Character management' },
        { name: 'esi', description: 'ESI proxy endpoints' },
      ],
    },
  });

  await fastify.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
    },
  });
}

// Register routes
async function registerRoutes() {
  // Error handlers
  fastify.setErrorHandler(errorHandler);
  fastify.setNotFoundHandler(notFoundHandler);

  // Authentication routes
  await fastify.register(authRoutes);

  // Character management routes
  await fastify.register(characterRoutes);

  // Admin routes
  await fastify.register(adminJobRoutes);

  // Health check endpoint
  fastify.get(
    '/health',
    {
      schema: {
        tags: ['health'],
        summary: 'Health check',
        description: 'Returns the health status of the API server',
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              timestamp: { type: 'string' },
              uptime: { type: 'number' },
              environment: { type: 'string' },
              version: { type: 'string' },
            },
          },
        },
      },
    },
    async (_request, reply) => {
      return reply.send({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: '0.1.0',
      });
    },
  );

  // Root endpoint
  fastify.get('/', async (_request, reply) => {
    return reply.send({
      message: 'EVE Nomad API',
      version: '0.1.0',
      docs: '/docs',
      auth: {
        login: '/auth/login',
        callback: '/auth/callback',
        logout: '/auth/logout',
        verify: '/auth/verify',
      },
    });
  });
}

// Start server
async function start() {
  try {
    await registerPlugins();
    await registerRoutes();

    const port = parseInt(process.env.PORT || '3000', 10);
    const host = process.env.HOST || '0.0.0.0';

    await fastify.listen({ port, host });

    // Start background job workers
    logger.info('Starting background job workers');
    startTokenRefreshWorker();
    startESIDataRefreshWorker();
    startHistoricalDataCollectionWorker();
    startCacheCleanupWorker();

    // Initialize scheduled jobs
    logger.info('Initializing scheduled jobs');
    await initializeScheduledJobs();

    // Start periodic session cleanup (runs every hour)
    setInterval(async () => {
      try {
        const cleaned = await jwtService.cleanupExpiredSessions();
        if (cleaned > 0) {
          logger.info(`Cleaned up ${cleaned} expired sessions`);
        }
      } catch (error) {
        logger.error('Session cleanup failed', error as Error);
      }
    }, 60 * 60 * 1000); // 1 hour

    logger.info('EVE Nomad Backend API Server started', {
      port,
      host,
      environment: process.env.NODE_ENV || 'development',
      nodeVersion: process.version,
      endpoints: {
        root: `http://localhost:${port}`,
        docs: `http://localhost:${port}/docs`,
        health: `http://localhost:${port}/health`,
      },
    });

    console.info(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🚀  EVE Nomad Backend API Server                         ║
║                                                            ║
║   📍  http://localhost:${port}                              ║
║   📚  Docs: http://localhost:${port}/docs                   ║
║   🏥  Health: http://localhost:${port}/health               ║
║                                                            ║
║   Environment: ${process.env.NODE_ENV || 'development'}                                   ║
║   Node.js: ${process.version}                                  ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
    `);
  } catch (err) {
    logger.fatal('Failed to start server', err as Error);
    process.exit(1);
  }
}

// Graceful shutdown
const signals = ['SIGINT', 'SIGTERM'];
signals.forEach((signal) => {
  process.on(signal, async () => {
    logger.info(`Received ${signal}, shutting down gracefully`);

    // Close all job queues and workers
    logger.info('Closing job queues and workers');
    await closeAllQueues();

    // Stop all scheduled jobs
    logger.info('Stopping scheduled jobs');
    stopAllScheduledJobs();

    // Close Fastify server
    await fastify.close();

    // Disconnect Prisma client
    logger.info('Disconnecting Prisma client');
    await disconnectPrisma();

    process.exit(0);
  });
});

// Handle uncaught errors
process.on('uncaughtException', (err) => {
  logger.fatal('Uncaught exception', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.fatal('Unhandled rejection', reason as Error, { promise });
  process.exit(1);
});

// Start the server
start();
