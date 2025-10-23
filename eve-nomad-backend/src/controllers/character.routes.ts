import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { authMiddleware } from '../middleware/auth.middleware';
import * as authService from '../services/auth.service';

/**
 * Character management routes
 * Handles multi-character support and character operations
 */
export async function characterRoutes(fastify: FastifyInstance) {
  // Get all characters for the authenticated user
  fastify.get(
    '/api/characters',
    {
      preHandler: [authMiddleware],
      schema: {
        tags: ['characters'],
        summary: 'List user characters',
        description: 'Returns all authorized EVE characters for the current user',
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
              characters: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    characterId: { type: 'number' },
                    characterName: { type: 'string' },
                    corporationId: { type: 'number' },
                    allianceId: { type: 'number', nullable: true },
                    scopes: { type: 'array', items: { type: 'string' } },
                    createdAt: { type: 'string' },
                    lastSyncAt: { type: 'string', nullable: true },
                  },
                },
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const characters = await authService.getUserCharacters(request.user!.id);

        return reply.send({
          success: true,
          characters: characters.map((char) => ({
            id: char.id,
            characterId: char.characterId,
            characterName: char.characterName,
            corporationId: char.corporationId,
            allianceId: char.allianceId,
            scopes: char.scopes,
            createdAt: char.createdAt,
            lastSyncAt: char.lastSyncAt,
          })),
        });
      } catch (error) {
        console.error('[CharacterRoutes] Error fetching characters:', error);
        return reply.status(500).send({
          error: 'Server error',
          message: 'Failed to fetch characters',
        });
      }
    },
  );

  // Add new character (redirect to OAuth)
  fastify.get(
    '/api/characters/add',
    {
      preHandler: [authMiddleware],
      schema: {
        tags: ['characters'],
        summary: 'Add new character',
        description: 'Redirects to EVE SSO to authorize a new character',
        headers: {
          type: 'object',
          properties: {
            authorization: { type: 'string', description: 'Bearer <token>' },
          },
          required: ['authorization'],
        },
      },
    },
    async (_request: FastifyRequest, reply: FastifyReply) => {
      // Redirect to /auth/login to start OAuth flow
      // The existing user will be updated with the new character
      return reply.redirect('/auth/login');
    },
  );

  // Remove character authorization
  fastify.delete(
    '/api/characters/:characterId',
    {
      preHandler: [authMiddleware],
      schema: {
        tags: ['characters'],
        summary: 'Remove character',
        description: 'Removes authorization for a specific character',
        headers: {
          type: 'object',
          properties: {
            authorization: { type: 'string', description: 'Bearer <token>' },
          },
          required: ['authorization'],
        },
        params: {
          type: 'object',
          properties: {
            characterId: { type: 'string' },
          },
          required: ['characterId'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
            },
          },
          403: {
            type: 'object',
            properties: {
              error: { type: 'string' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (request: any, reply: any) => {
      try {
        const characterId = parseInt(request.params.characterId, 10);

        if (isNaN(characterId)) {
          return reply.status(400).send({
            error: 'Bad request',
            message: 'Invalid character ID',
          });
        }

        // Prevent deleting the currently logged-in character
        if (characterId === request.user!.characterId) {
          return reply.status(403).send({
            error: 'Forbidden',
            message: 'Cannot remove currently active character',
            suggestion: 'Switch to another character first',
          });
        }

        await authService.removeCharacter(characterId, request.user!.id);

        return reply.send({
          success: true,
          message: 'Character removed successfully',
        });
      } catch (error) {
        console.error('[CharacterRoutes] Error removing character:', error);

        if (error instanceof Error && error.message === 'Character not found or unauthorized') {
          return reply.status(404).send({
            error: 'Not found',
            message: 'Character not found',
          });
        }

        return reply.status(500).send({
          error: 'Server error',
          message: 'Failed to remove character',
        });
      }
    },
  );
}
