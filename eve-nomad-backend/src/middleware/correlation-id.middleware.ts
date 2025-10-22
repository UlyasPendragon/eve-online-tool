import { FastifyRequest, FastifyReply } from 'fastify';
import { randomUUID } from 'crypto';

/**
 * Correlation ID Middleware
 * Adds unique correlation ID to each request for distributed tracing
 */

declare module 'fastify' {
  interface FastifyRequest {
    correlationId: string;
  }
}

/**
 * Plugin to add correlation ID to all requests
 */
export async function correlationIdMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  // Check if correlation ID already exists in headers
  const existingId = request.headers['x-correlation-id'] as string | undefined;

  // Use existing ID or generate new one
  const correlationId = existingId || randomUUID();

  // Attach to request object
  request.correlationId = correlationId;

  // Add to response headers
  reply.header('x-correlation-id', correlationId);
}
