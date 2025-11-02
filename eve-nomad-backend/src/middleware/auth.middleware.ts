import { FastifyRequest, FastifyReply } from 'fastify';
import * as jwtService from '../services/jwt.service';
import * as authService from '../services/auth.service';

// Extend Fastify request to include user info
declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string;
      characterId: number;
      characterName: string;
      subscriptionTier: string;
    };
  }
}

/**
 * JWT Authentication Middleware
 * Protects routes by verifying JWT token and loading user
 */
export async function authMiddleware(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    // Extract JWT from Authorization header
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Missing or invalid Authorization header',
        help: 'Include Authorization: Bearer <token> header',
      });
    }

    const token = authHeader.substring(7);

    // Verify JWT token
    const decoded = jwtService.verifyToken(token);

    // Check if session is still valid
    const isValid = await jwtService.isSessionValid(token);

    if (!isValid) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Session expired or revoked',
        suggestion: 'Please log in again',
      });
    }

    // Load user from database
    const user = await authService.getUserById(decoded.userId);

    if (!user) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'User not found',
      });
    }

    // Attach user info to request object
    request.user = {
      id: user.id,
      characterId: decoded.characterId,
      characterName: decoded.characterName,
      subscriptionTier: user.subscriptionTier,
    };

    // Continue to route handler
  } catch (error) {
    console.error('[AuthMiddleware] Authentication error:', error);

    if (error instanceof Error) {
      if (error.message === 'TOKEN_EXPIRED') {
        return reply.status(401).send({
          error: 'Unauthorized',
          message: 'Token expired',
          suggestion: 'Please log in again',
        });
      }

      if (error.message === 'TOKEN_INVALID') {
        return reply.status(401).send({
          error: 'Unauthorized',
          message: 'Invalid token',
        });
      }
    }

    return reply.status(500).send({
      error: 'Authentication failed',
      message: 'Failed to authenticate request',
    });
  }
}

/**
 * Optional Authentication Middleware
 * Loads user if token provided, but doesn't require it
 */
export async function optionalAuthMiddleware(
  request: FastifyRequest,
  _reply: FastifyReply,
): Promise<void> {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without user
      return;
    }

    const token = authHeader.substring(7);

    // Verify JWT token
    const decoded = jwtService.verifyToken(token);

    // Check if session is valid
    const isValid = await jwtService.isSessionValid(token);

    if (!isValid) {
      // Invalid session, continue without user
      return;
    }

    // Load user from database
    const user = await authService.getUserById(decoded.userId);

    if (user) {
      request.user = {
        id: user.id,
        characterId: decoded.characterId,
        characterName: decoded.characterName,
        subscriptionTier: user.subscriptionTier,
      };
    }

    // Continue to route handler
  } catch (error) {
    // Errors in optional auth are logged but don't block the request
    console.warn('[AuthMiddleware] Optional auth failed:', error);
    // Continue without user
  }
}

/**
 * Subscription Tier Middleware
 * Requires user to have specific subscription tier
 */
export function requireSubscription(requiredTier: 'free' | 'premium') {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    if (!request.user) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    const tierPriority = { free: 0, premium: 1 };
    const userTierPriority =
      tierPriority[request.user.subscriptionTier as keyof typeof tierPriority] ?? 0;
    const requiredTierPriority = tierPriority[requiredTier];

    if (userTierPriority < requiredTierPriority) {
      return reply.status(403).send({
        error: 'Forbidden',
        message: `This feature requires ${requiredTier} subscription`,
        userTier: request.user.subscriptionTier,
        requiredTier,
      });
    }

    // Continue to route handler
  };
}
