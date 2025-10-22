import pino, { Logger as PinoLogger } from 'pino';
import { captureException, captureMessage, addBreadcrumb } from '../config/sentry.config';

/**
 * Enhanced Logger Service
 * Production-grade structured logging with Sentry integration
 */

// Sensitive fields to redact from logs
const REDACT_FIELDS = [
  'password',
  'accessToken',
  'access_token',
  'refreshToken',
  'refresh_token',
  'token',
  'authorization',
  'cookie',
  'secret',
  'apiKey',
  'api_key',
];

// Create base Pino logger
const baseLogger: PinoLogger = pino({
  level: process.env.LOG_LEVEL || 'info',

  // Redact sensitive fields
  redact: {
    paths: REDACT_FIELDS,
    remove: true,
  },

  // Pretty printing for development
  transport:
    process.env.NODE_ENV === 'development' && process.env.LOG_PRETTY !== 'false'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
            singleLine: false,
          },
        }
      : undefined,

  // Base fields
  base: {
    env: process.env.NODE_ENV || 'development',
    service: 'eve-nomad-backend',
  },

  // Timestamp format
  timestamp: pino.stdTimeFunctions.isoTime,

  // Serializers for common objects
  serializers: {
    err: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
  },
});

/**
 * Enhanced logger class with Sentry integration
 */
export class Logger {
  private logger: PinoLogger;
  private context: Record<string, unknown>;

  constructor(context: Record<string, unknown> = {}) {
    this.logger = baseLogger;
    this.context = context;
  }

  /**
   * Create a child logger with additional context
   */
  child(context: Record<string, unknown>): Logger {
    const childLogger = new Logger({ ...this.context, ...context });
    childLogger.logger = this.logger.child(context);
    return childLogger;
  }

  /**
   * Log info message
   */
  info(message: string, data?: Record<string, unknown>): void {
    const logData = { ...this.context, ...data };
    this.logger.info(logData, message);
    addBreadcrumb(message, 'info', logData);
  }

  /**
   * Log warning message
   */
  warn(message: string, data?: Record<string, unknown>): void {
    const logData = { ...this.context, ...data };
    this.logger.warn(logData, message);
    addBreadcrumb(message, 'warning', logData);
  }

  /**
   * Log error message and send to Sentry
   */
  error(message: string, error?: Error | unknown, data?: Record<string, unknown>): void {
    const logData = { ...this.context, ...data };

    if (error instanceof Error) {
      this.logger.error({ ...logData, err: error }, message);

      // Send to Sentry
      captureException(error, {
        tags: {
          logLevel: 'error',
          ...(logData.endpoint && { endpoint: String(logData.endpoint) }),
        },
        extra: logData,
      });
    } else if (error) {
      this.logger.error({ ...logData, error }, message);
    } else {
      this.logger.error(logData, message);
    }

    addBreadcrumb(message, 'error', { ...logData, error: String(error) });
  }

  /**
   * Log fatal error and send to Sentry
   */
  fatal(message: string, error?: Error | unknown, data?: Record<string, unknown>): void {
    const logData = { ...this.context, ...data };

    if (error instanceof Error) {
      this.logger.fatal({ ...logData, err: error }, message);

      // Send to Sentry with critical level
      captureException(error, {
        tags: {
          logLevel: 'fatal',
          ...(logData.endpoint && { endpoint: String(logData.endpoint) }),
        },
        extra: logData,
      });
    } else if (error) {
      this.logger.fatal({ ...logData, error }, message);
    } else {
      this.logger.fatal(logData, message);
    }
  }

  /**
   * Log debug message (not sent to Sentry)
   */
  debug(message: string, data?: Record<string, unknown>): void {
    const logData = { ...this.context, ...data };
    this.logger.debug(logData, message);
  }

  /**
   * Log trace message (not sent to Sentry)
   */
  trace(message: string, data?: Record<string, unknown>): void {
    const logData = { ...this.context, ...data };
    this.logger.trace(logData, message);
  }

  /**
   * Log performance metrics
   */
  performance(operation: string, durationMs: number, data?: Record<string, unknown>): void {
    const logData = {
      ...this.context,
      ...data,
      operation,
      durationMs,
      performance: true,
    };

    if (durationMs > 1000) {
      this.warn(`Slow operation: ${operation} took ${durationMs}ms`, logData);
    } else {
      this.debug(`Performance: ${operation} took ${durationMs}ms`, logData);
    }
  }

  /**
   * Log ESI API call
   */
  esi(
    endpoint: string,
    status: number,
    durationMs: number,
    data?: Record<string, unknown>,
  ): void {
    const logData = {
      ...this.context,
      ...data,
      endpoint,
      status,
      durationMs,
      category: 'esi',
    };

    if (status >= 500) {
      this.error(`ESI server error: ${endpoint} returned ${status}`, undefined, logData);
    } else if (status === 420 || status === 429) {
      this.warn(`ESI rate limit: ${endpoint} returned ${status}`, logData);
    } else if (status >= 400) {
      this.warn(`ESI client error: ${endpoint} returned ${status}`, logData);
    } else {
      this.debug(`ESI request: ${endpoint} returned ${status} in ${durationMs}ms`, logData);
    }
  }

  /**
   * Log database operation
   */
  database(
    operation: string,
    table: string,
    durationMs: number,
    data?: Record<string, unknown>,
  ): void {
    const logData = {
      ...this.context,
      ...data,
      operation,
      table,
      durationMs,
      category: 'database',
    };

    if (durationMs > 500) {
      this.warn(`Slow database query: ${operation} on ${table} took ${durationMs}ms`, logData);
    } else {
      this.debug(`Database: ${operation} on ${table} in ${durationMs}ms`, logData);
    }
  }

  /**
   * Log authentication event
   */
  auth(event: string, userId?: number, data?: Record<string, unknown>): void {
    const logData = {
      ...this.context,
      ...data,
      event,
      userId,
      category: 'auth',
    };

    this.info(`Auth: ${event}`, logData);
    addBreadcrumb(event, 'auth', { userId, ...data });
  }

  /**
   * Log cache operation
   */
  cache(operation: 'hit' | 'miss' | 'set' | 'delete', key: string, data?: Record<string, unknown>): void {
    const logData = {
      ...this.context,
      ...data,
      operation,
      key,
      category: 'cache',
    };

    this.debug(`Cache ${operation}: ${key}`, logData);
  }
}

/**
 * Create a logger instance with optional context
 */
export function createLogger(context?: Record<string, unknown>): Logger {
  return new Logger(context);
}

/**
 * Default logger instance
 */
export const logger = new Logger();

/**
 * Timer utility for measuring operation duration
 */
export class Timer {
  private startTime: number;
  private logger: Logger;
  private operation: string;

  constructor(operation: string, logger: Logger = new Logger()) {
    this.startTime = Date.now();
    this.logger = logger;
    this.operation = operation;
  }

  /**
   * End timer and log duration
   */
  end(data?: Record<string, unknown>): number {
    const durationMs = Date.now() - this.startTime;
    this.logger.performance(this.operation, durationMs, data);
    return durationMs;
  }

  /**
   * Get current duration without ending timer
   */
  getDuration(): number {
    return Date.now() - this.startTime;
  }
}

/**
 * Create a timer for measuring operation duration
 */
export function createTimer(operation: string, logger?: Logger): Timer {
  return new Timer(operation, logger);
}
