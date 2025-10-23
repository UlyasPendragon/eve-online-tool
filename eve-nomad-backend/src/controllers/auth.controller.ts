import { FastifyRequest, FastifyReply } from 'fastify';
import crypto from 'crypto';

/**
 * Auth Controller
 * Handles EVE SSO OAuth 2.0 authentication flow
 */

// Store state tokens temporarily (in production, use Redis)
const stateStore = new Map<string, { timestamp: number; mobile?: boolean }>();

// Clean up old state tokens every 10 minutes
setInterval(
  () => {
    const now = Date.now();
    for (const [state, data] of stateStore.entries()) {
      if (now - data.timestamp > 10 * 60 * 1000) {
        stateStore.delete(state);
      }
    }
  },
  10 * 60 * 1000,
);

/**
 * GET /auth/login
 * Initiates OAuth flow by redirecting to EVE SSO
 *
 * Supports optional `mobile=true` query parameter for mobile app OAuth.
 * When mobile=true, state includes mobile flag for callback handling.
 */
export async function loginHandler(
  request: FastifyRequest<{
    Querystring: {
      mobile?: string;
    };
  }>,
  reply: FastifyReply,
) {
  // Generate random state for CSRF protection
  const state = crypto.randomBytes(32).toString('hex');
  const isMobile = request.query.mobile === 'true';

  // Store state with mobile flag
  stateStore.set(state, {
    timestamp: Date.now(),
    mobile: isMobile,
  });

  // Required OAuth parameters
  const clientId = process.env['EVE_SSO_CLIENT_ID'];
  const callbackUrl = process.env['EVE_SSO_CALLBACK_URL'];

  if (!clientId || !callbackUrl) {
    return reply.status(500).send({
      error: 'OAuth not configured',
      message: 'EVE_SSO_CLIENT_ID and EVE_SSO_CALLBACK_URL must be set in .env file',
      help: 'See EVE_SSO_SETUP.md for registration instructions',
    });
  }

  // EVE Nomad required scopes
  const scopes = [
    'esi-skills.read_skills.v1',
    'esi-skills.read_skillqueue.v1',
    'esi-mail.read_mail.v1',
    'esi-mail.send_mail.v1',
    'esi-mail.organize_mail.v1',
    'esi-markets.read_character_orders.v1',
    'esi-wallet.read_character_wallet.v1',
    'esi-assets.read_assets.v1',
    'esi-universe.read_structures.v1',
    'esi-industry.read_character_jobs.v1',
    'esi-planets.manage_planets.v1',
    'esi-characters.read_contacts.v1',
    'esi-characters.read_notifications.v1',
    'esi-location.read_location.v1',
    'esi-location.read_ship_type.v1',
  ].join(' ');

  // Build authorization URL
  const authUrl = new URL('https://login.eveonline.com/v2/oauth/authorize');
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', callbackUrl);
  authUrl.searchParams.set('scope', scopes);
  authUrl.searchParams.set('state', state);

  // Redirect user to EVE SSO
  return reply.redirect(authUrl.toString());
}

/**
 * GET /auth/callback
 * Handles OAuth callback from EVE SSO
 */
export async function callbackHandler(
  request: FastifyRequest<{
    Querystring: {
      code?: string;
      state?: string;
      error?: string;
      error_description?: string;
    };
  }>,
  reply: FastifyReply,
) {
  const { code, state, error, error_description } = request.query;

  // Handle user denial or errors
  if (error) {
    return reply.status(400).send({
      error: 'OAuth authorization failed',
      reason: error,
      description: error_description || 'User denied authorization or an error occurred',
    });
  }

  // Validate required parameters
  if (!code || !state) {
    return reply.status(400).send({
      error: 'Invalid callback',
      message: 'Missing code or state parameter',
    });
  }

  // Verify state token (CSRF protection)
  if (!stateStore.has(state)) {
    return reply.status(400).send({
      error: 'Invalid state',
      message: 'State token is invalid or expired. Please try logging in again.',
    });
  }

  // Remove used state token
  stateStore.delete(state);

  try {
    // Step 1: Exchange authorization code for access and refresh tokens
    const tokenService = await import('../services/token.service');
    const tokens = await tokenService.exchangeAuthorizationCode(code);

    // Step 2: Verify access token and get character information
    const characterInfo = await tokenService.verifyAccessToken(tokens.access_token);

    // Step 3: Calculate token expiry
    const tokenExpiresAt = tokenService.calculateTokenExpiry(tokens.expires_in);

    // Step 4: Find or create user
    const authService = await import('../services/auth.service');
    const user = await authService.findOrCreateUser(characterInfo.CharacterID);

    // Step 5: Create or update character record with encrypted tokens
    const character = await authService.createOrUpdateCharacter(
      user.id,
      {
        characterId: characterInfo.CharacterID,
        characterName: characterInfo.CharacterName,
        scopes: characterInfo.Scopes.split(' '),
      },
      {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: tokenExpiresAt,
      },
    );

    // Step 6: Generate JWT session token
    const jwtService = await import('../services/jwt.service');
    const jwtToken = jwtService.generateToken({
      userId: user.id,
      characterId: character.characterId,
      characterName: character.characterName,
      subscriptionTier: user.subscriptionTier,
    });

    // Step 7: Create session record
    await jwtService.createSession(user.id, jwtToken);

    // Step 8: Return JWT token to client
    return reply.send({
      success: true,
      message: 'Authentication successful',
      token: jwtToken,
      user: {
        id: user.id,
        subscriptionTier: user.subscriptionTier,
        subscriptionStatus: user.subscriptionStatus,
      },
      character: {
        id: character.id,
        characterId: character.characterId,
        characterName: character.characterName,
        corporationId: character.corporationId,
      },
    });
  } catch (error) {
    console.error('[AuthController] OAuth callback error:', error);

    if (error instanceof Error) {
      return reply.status(500).send({
        error: 'Authentication failed',
        message: error.message,
        suggestion: 'Please try logging in again',
      });
    }

    return reply.status(500).send({
      error: 'Authentication failed',
      message: 'An unexpected error occurred',
    });
  }
}

/**
 * POST /auth/logout
 * Logs out user by invalidating session
 */
export async function logoutHandler(request: FastifyRequest, reply: FastifyReply) {
  try {
    // Extract JWT from Authorization header
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Missing or invalid Authorization header',
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Invalidate session
    const jwtService = await import('../services/jwt.service');
    await jwtService.invalidateSession(token);

    return reply.send({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    console.error('[AuthController] Logout error:', error);

    return reply.status(500).send({
      error: 'Logout failed',
      message: 'Failed to invalidate session',
    });
  }
}

/**
 * GET /auth/verify
 * Verifies current JWT token and returns user information
 */
export async function verifyHandler(request: FastifyRequest, reply: FastifyReply) {
  try {
    // Extract JWT from Authorization header
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Missing or invalid Authorization header',
        help: 'Send Authorization: Bearer <token> header',
      });
    }

    const token = authHeader.substring(7);

    // Verify JWT token
    const jwtService = await import('../services/jwt.service');
    const decoded = jwtService.verifyToken(token);

    // Check if session is still valid
    const isValid = await jwtService.isSessionValid(token);

    if (!isValid) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Session expired or invalid',
      });
    }

    // Load user and characters from database
    const authService = await import('../services/auth.service');
    const user = await authService.getUserById(decoded.userId);

    if (!user) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'User not found',
      });
    }

    const characters = await authService.getUserCharacters(decoded.userId);

    return reply.send({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        subscriptionTier: user.subscriptionTier,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionEndsAt: user.subscriptionEndsAt,
        createdAt: user.createdAt,
      },
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
      currentCharacter: {
        characterId: decoded.characterId,
        characterName: decoded.characterName,
      },
    });
  } catch (error) {
    console.error('[AuthController] Verify error:', error);

    if (error instanceof Error) {
      if (error.message === 'TOKEN_EXPIRED') {
        return reply.status(401).send({
          error: 'Unauthorized',
          message: 'Token expired',
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
      error: 'Verification failed',
      message: 'Failed to verify token',
    });
  }
}
