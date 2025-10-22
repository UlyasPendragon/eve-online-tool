import { FastifyInstance } from 'fastify';
import {
  loginHandler,
  callbackHandler,
  logoutHandler,
  verifyHandler,
} from './auth.controller';

/**
 * Authentication routes
 * Handles EVE SSO OAuth 2.0 flow
 */
export async function authRoutes(fastify: FastifyInstance) {
  // Initiate OAuth login
  fastify.get(
    '/auth/login',
    {
      schema: {
        tags: ['auth'],
        summary: 'Initiate OAuth login',
        description: 'Redirects user to EVE SSO authorization page',
        response: {
          302: {
            description: 'Redirect to EVE SSO',
            type: 'null',
          },
          500: {
            type: 'object',
            properties: {
              error: { type: 'string' },
              message: { type: 'string' },
              help: { type: 'string' },
            },
          },
        },
      },
    },
    loginHandler,
  );

  // OAuth callback
  fastify.get(
    '/auth/callback',
    {
      schema: {
        tags: ['auth'],
        summary: 'OAuth callback',
        description: 'Handles callback from EVE SSO after user authorization',
        querystring: {
          type: 'object',
          properties: {
            code: { type: 'string' },
            state: { type: 'string' },
            error: { type: 'string' },
            error_description: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              message: { type: 'string' },
              token: { type: 'string' },
            },
          },
          400: {
            type: 'object',
            properties: {
              error: { type: 'string' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    callbackHandler,
  );

  // Logout
  fastify.post(
    '/auth/logout',
    {
      schema: {
        tags: ['auth'],
        summary: 'Logout',
        description: 'Invalidates user session and JWT token',
        headers: {
          type: 'object',
          properties: {
            authorization: { type: 'string', description: 'Bearer <token>' },
          },
          required: ['authorization'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
            },
          },
          401: {
            type: 'object',
            properties: {
              error: { type: 'string' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    logoutHandler,
  );

  // Verify token
  fastify.get(
    '/auth/verify',
    {
      schema: {
        tags: ['auth'],
        summary: 'Verify token',
        description: 'Verifies JWT token and returns user information',
        headers: {
          type: 'object',
          properties: {
            authorization: { type: 'string', description: 'Bearer <token>' },
          },
          required: ['authorization'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              user: { type: 'object' },
              character: { type: 'object' },
            },
          },
          401: {
            type: 'object',
            properties: {
              error: { type: 'string' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    verifyHandler,
  );
}
