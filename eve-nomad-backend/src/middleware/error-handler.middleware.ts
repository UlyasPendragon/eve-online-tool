import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { captureException } from '../config/sentry.config';
import { createLogger } from '../services/logger.service';

const logger = createLogger({ module: 'error-handler' });

/**
 * Error Handler Middleware
 * Centralized error handling with Sentry integration
 */

export async function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const correlationId = request.correlationId || 'unknown';

  // Create error context
  const errorContext = {
    correlationId,
    method: request.method,
    url: request.url,
    statusCode: error.statusCode || 500,
    headers: request.headers,
    params: request.params,
    query: request.query,
  };

  // Determine error severity
  const isClientError = error.statusCode && error.statusCode >= 400 && error.statusCode < 500;
  const isServerError = !error.statusCode || error.statusCode >= 500;

  // Log the error
  if (isServerError) {
    logger.error(`Server error: ${error.message}`, error, errorContext);

    // Send to Sentry for server errors
    captureException(error, {
      endpoint: request.url,
      tags: {
        method: request.method,
        statusCode: String(error.statusCode || 500),
        correlationId,
      },
      extra: errorContext,
    });
  } else {
    // Client errors are logged but not sent to Sentry
    logger.warn(`Client error: ${error.message}`, errorContext);
  }

  // Determine response status code
  const statusCode = error.statusCode || 500;

  // Prepare error response
  const errorResponse: {
    error: string;
    message: string;
    statusCode: number;
    correlationId: string;
    timestamp: string;
    path?: string;
    validation?: unknown;
  } = {
    error: getErrorName(statusCode),
    message: getErrorMessage(error, statusCode),
    statusCode,
    correlationId,
    timestamp: new Date().toISOString(),
  };

  // Add path for client errors
  if (isClientError) {
    errorResponse.path = request.url;
  }

  // Add validation errors if present
  if (error.validation) {
    errorResponse.validation = error.validation;
  }

  // Send error response
  reply.status(statusCode).send(errorResponse);
}

/**
 * Get error name from status code
 */
function getErrorName(statusCode: number): string {
  const errorNames: Record<number, string> = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    405: 'Method Not Allowed',
    409: 'Conflict',
    422: 'Unprocessable Entity',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
    504: 'Gateway Timeout',
  };

  return errorNames[statusCode] || 'Error';
}

/**
 * Get user-friendly error message
 */
function getErrorMessage(error: FastifyError, statusCode: number): string {
  // Don't expose internal error details in production
  const isProduction = process.env['NODE_ENV'] === 'production';

  // Client errors: return original message
  if (statusCode >= 400 && statusCode < 500) {
    return error.message;
  }

  // Server errors: sanitize in production
  if (isProduction) {
    return 'An internal server error occurred. Please try again later.';
  }

  return error.message;
}

/**
 * Not Found Handler
 */
export async function notFoundHandler(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const correlationId = request.correlationId || 'unknown';

  logger.warn(`Route not found: ${request.method} ${request.url}`, {
    correlationId,
    method: request.method,
    url: request.url,
  });

  reply.status(404).send({
    error: 'Not Found',
    message: `Route ${request.method} ${request.url} not found`,
    statusCode: 404,
    correlationId,
    timestamp: new Date().toISOString(),
    path: request.url,
  });
}
