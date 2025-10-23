/**
 * User Authentication Routes
 *
 * Email/password authentication endpoints (complementing EVE SSO OAuth)
 *
 * @module controllers/user-auth
 */

import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import * as userAuthService from '../services/user-auth.service';
import * as jwtService from '../services/jwt.service';
import { createLogger } from '../services/logger.service';
import {
  authRateLimitConfig,
} from '../middleware/rate-limit.middleware';
import {
  ValidationError,
  AuthorizationError,
  RecordNotFoundError,
} from '../types/errors';

const logger = createLogger({ service: 'UserAuthRoutes' });

/**
 * Register routes for user authentication
 */
export async function registerUserAuthRoutes(
  fastify: FastifyInstance,
): Promise<void> {
  /**
   * POST /api/auth/register
   * Register a new user with email and password
   */
  fastify.post(
    '/api/auth/register',
    {
      schema: {
        tags: ['authentication'],
        summary: 'Register new user',
        description: 'Create a new user account with email and password',
        body: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
            },
            password: {
              type: 'string',
              minLength: 8,
              maxLength: 128,
              description: 'User password (8-128 characters)',
            },
          },
        },
        response: {
          201: {
            description: 'User registered successfully',
            type: 'object',
            properties: {
              message: { type: 'string' },
              userId: { type: 'string' },
              emailVerificationRequired: { type: 'boolean' },
            },
          },
          400: {
            description: 'Invalid input',
            type: 'object',
            properties: {
              error: { type: 'string' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{
        Body: { email: string; password: string };
      }>,
      reply: FastifyReply,
    ) => {
      const { email, password } = request.body;

      try {
        const user = await userAuthService.registerUser(email, password);

        // TODO: Send email verification email

        return reply.code(201).send({
          message: 'User registered successfully. Please check your email to verify your account.',
          userId: user.id,
          emailVerificationRequired: true,
        });
      } catch (error) {
        if (error instanceof ValidationError) {
          return reply.code(400).send({
            error: 'Validation Error',
            message: error.message,
          });
        }

        logger.error('User registration failed', error as Error, { email });
        throw error;
      }
    },
  );

  /**
   * POST /api/auth/login
   * Login with email and password
   */
  fastify.post(
    '/api/auth/login',
    {
      config: {
        rateLimit: authRateLimitConfig,
      },
      schema: {
        tags: ['authentication'],
        summary: 'Login with email/password',
        description: 'Authenticate user and create session',
        body: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string' },
          },
        },
        response: {
          200: {
            description: 'Login successful',
            type: 'object',
            properties: {
              message: { type: 'string' },
              token: { type: 'string' },
              expiresAt: { type: 'string', format: 'date-time' },
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  email: { type: 'string' },
                  emailVerified: { type: 'boolean' },
                  subscriptionTier: { type: 'string' },
                },
              },
            },
          },
          401: {
            description: 'Invalid credentials',
            type: 'object',
            properties: {
              error: { type: 'string' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{
        Body: { email: string; password: string };
      }>,
      reply: FastifyReply,
    ) => {
      const { email, password } = request.body;

      try {
        const user = await userAuthService.loginUser(email, password);

        // Create JWT session
        const { token, expiresAt } = await jwtService.createUserSession(user.id);

        return reply.send({
          message: 'Login successful',
          token,
          expiresAt: expiresAt.toISOString(),
          user: {
            id: user.id,
            email: user.email,
            emailVerified: user.emailVerified,
            subscriptionTier: user.subscriptionTier,
          },
        });
      } catch (error) {
        if (error instanceof AuthorizationError) {
          return reply.code(401).send({
            error: 'Authentication Failed',
            message: error.message,
          });
        }

        logger.error('User login failed', error as Error, { email });
        throw error;
      }
    },
  );

  /**
   * POST /api/auth/logout
   * Logout and invalidate session
   */
  fastify.post(
    '/api/auth/logout',
    {
      schema: {
        tags: ['authentication'],
        summary: 'Logout',
        description: 'Invalidate current session',
        headers: {
          type: 'object',
          required: ['authorization'],
          properties: {
            authorization: {
              type: 'string',
              description: 'Bearer token',
            },
          },
        },
        response: {
          200: {
            description: 'Logout successful',
            type: 'object',
            properties: {
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const authHeader = request.headers['authorization'];

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return reply.code(401).send({
          error: 'Authentication Required',
          message: 'No token provided',
        });
      }

      const token = authHeader.substring(7);

      try {
        await jwtService.deleteSession(token);

        return reply.send({
          message: 'Logout successful',
        });
      } catch (error) {
        logger.error('Logout failed', error as Error);
        throw error;
      }
    },
  );

  /**
   * POST /api/auth/verify-email
   * Verify email with token
   */
  fastify.post(
    '/api/auth/verify-email',
    {
      schema: {
        tags: ['authentication'],
        summary: 'Verify email',
        description: 'Verify user email with verification token',
        body: {
          type: 'object',
          required: ['token'],
          properties: {
            token: {
              type: 'string',
              description: 'Email verification token from email',
            },
          },
        },
        response: {
          200: {
            description: 'Email verified successfully',
            type: 'object',
            properties: {
              message: { type: 'string' },
              userId: { type: 'string' },
            },
          },
          404: {
            description: 'Invalid token',
            type: 'object',
            properties: {
              error: { type: 'string' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Body: { token: string } }>,
      reply: FastifyReply,
    ) => {
      const { token } = request.body;

      try {
        const user = await userAuthService.verifyEmail(token);

        return reply.send({
          message: 'Email verified successfully',
          userId: user.id,
        });
      } catch (error) {
        if (error instanceof RecordNotFoundError) {
          return reply.code(404).send({
            error: 'Invalid Token',
            message: 'Email verification token not found or expired',
          });
        }

        logger.error('Email verification failed', error as Error, { token });
        throw error;
      }
    },
  );

  /**
   * POST /api/auth/forgot-password
   * Request password reset
   */
  fastify.post(
    '/api/auth/forgot-password',
    {
      schema: {
        tags: ['authentication'],
        summary: 'Request password reset',
        description: 'Generate and send password reset token via email',
        body: {
          type: 'object',
          required: ['email'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
            },
          },
        },
        response: {
          200: {
            description: 'Password reset email sent',
            type: 'object',
            properties: {
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Body: { email: string } }>,
      reply: FastifyReply,
    ) => {
      const { email } = request.body;

      try {
        await userAuthService.generatePasswordResetToken(email);

        // TODO: Send password reset email

        // Always return success to prevent user enumeration
        return reply.send({
          message:
            'If an account exists with this email, a password reset link will be sent.',
        });
      } catch (error) {
        logger.error('Password reset request failed', error as Error, {
          email,
        });

        // Still return success to prevent user enumeration
        return reply.send({
          message:
            'If an account exists with this email, a password reset link will be sent.',
        });
      }
    },
  );

  /**
   * POST /api/auth/reset-password
   * Reset password with token
   */
  fastify.post(
    '/api/auth/reset-password',
    {
      schema: {
        tags: ['authentication'],
        summary: 'Reset password',
        description: 'Reset password using reset token',
        body: {
          type: 'object',
          required: ['token', 'newPassword'],
          properties: {
            token: {
              type: 'string',
              description: 'Password reset token from email',
            },
            newPassword: {
              type: 'string',
              minLength: 8,
              maxLength: 128,
              description: 'New password (8-128 characters)',
            },
          },
        },
        response: {
          200: {
            description: 'Password reset successful',
            type: 'object',
            properties: {
              message: { type: 'string' },
            },
          },
          400: {
            description: 'Invalid input or expired token',
            type: 'object',
            properties: {
              error: { type: 'string' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{
        Body: { token: string; newPassword: string };
      }>,
      reply: FastifyReply,
    ) => {
      const { token, newPassword } = request.body;

      try {
        await userAuthService.resetPassword(token, newPassword);

        return reply.send({
          message: 'Password reset successful. You can now login with your new password.',
        });
      } catch (error) {
        if (
          error instanceof ValidationError ||
          error instanceof RecordNotFoundError ||
          error instanceof AuthorizationError
        ) {
          return reply.code(400).send({
            error: 'Password Reset Failed',
            message: error.message,
          });
        }

        logger.error('Password reset failed', error as Error, { token });
        throw error;
      }
    },
  );

  /**
   * POST /api/auth/change-password
   * Change password (requires authentication)
   */
  fastify.post(
    '/api/auth/change-password',
    {
      schema: {
        tags: ['authentication'],
        summary: 'Change password',
        description: 'Change password for authenticated user',
        headers: {
          type: 'object',
          required: ['authorization'],
          properties: {
            authorization: {
              type: 'string',
              description: 'Bearer token',
            },
          },
        },
        body: {
          type: 'object',
          required: ['currentPassword', 'newPassword'],
          properties: {
            currentPassword: {
              type: 'string',
              description: 'Current password',
            },
            newPassword: {
              type: 'string',
              minLength: 8,
              maxLength: 128,
              description: 'New password (8-128 characters)',
            },
          },
        },
        response: {
          200: {
            description: 'Password changed successfully',
            type: 'object',
            properties: {
              message: { type: 'string' },
            },
          },
          401: {
            description: 'Invalid current password',
            type: 'object',
            properties: {
              error: { type: 'string' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{
        Body: { currentPassword: string; newPassword: string };
      }>,
      reply: FastifyReply,
    ) => {
      const authHeader = request.headers['authorization'];

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return reply.code(401).send({
          error: 'Authentication Required',
          message: 'No token provided',
        });
      }

      const token = authHeader.substring(7);

      try {
        // Verify session and get user ID
        const session = await jwtService.verifySession(token);

        if (!session) {
          return reply.code(401).send({
            error: 'Unauthorized',
            message: 'Session expired or invalid',
          });
        }

        const { currentPassword, newPassword } = request.body;

        await userAuthService.changePassword(
          session.userId,
          currentPassword,
          newPassword,
        );

        return reply.send({
          message: 'Password changed successfully',
        });
      } catch (error) {
        if (
          error instanceof ValidationError ||
          error instanceof AuthorizationError
        ) {
          return reply.code(401).send({
            error: 'Password Change Failed',
            message: error.message,
          });
        }

        logger.error('Password change failed', error as Error);
        throw error;
      }
    },
  );

  logger.info('User authentication routes registered');
}
