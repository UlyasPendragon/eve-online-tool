import jwt from 'jsonwebtoken';
import { PrismaClient, Session } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

interface JWTPayload {
  userId: string;
  characterId: number;
  characterName: string;
  subscriptionTier: string;
}

interface DecodedJWT extends JWTPayload {
  iat: number;
  exp: number;
}

/**
 * Generate JWT session token
 */
export function generateToken(payload: JWTPayload): string {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  if (!secret) {
    throw new Error('JWT_SECRET not configured');
  }

  const token = jwt.sign(payload, secret, {
    expiresIn,
    issuer: 'eve-nomad-api',
    audience: 'eve-nomad-app',
  });

  console.info('[JWTService] Generated JWT token for user:', payload.userId);
  return token;
}

/**
 * Verify JWT token and return decoded payload
 */
export function verifyToken(token: string): DecodedJWT {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET not configured');
  }

  try {
    const decoded = jwt.verify(token, secret, {
      issuer: 'eve-nomad-api',
      audience: 'eve-nomad-app',
    }) as DecodedJWT;

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('TOKEN_EXPIRED');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('TOKEN_INVALID');
    }
    throw error;
  }
}

/**
 * Create session record in database
 */
export async function createSession(
  userId: string,
  token: string,
  deviceInfo?: { deviceType: string; deviceToken: string },
): Promise<Session> {
  // Calculate expiry based on JWT expiry
  const decoded = verifyToken(token);
  const expiresAt = new Date(decoded.exp * 1000);

  // Hash the token for storage (don't store raw JWT)
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const session = await prisma.session.create({
    data: {
      userId,
      token: tokenHash,
      expiresAt,
      deviceType: deviceInfo?.deviceType,
      deviceToken: deviceInfo?.deviceToken,
    },
  });

  console.info('[JWTService] Created session:', session.id);
  return session;
}

/**
 * Invalidate session (logout)
 */
export async function invalidateSession(token: string): Promise<void> {
  // Hash the token to find in database
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const deleted = await prisma.session.deleteMany({
    where: { token: tokenHash },
  });

  if (deleted.count > 0) {
    console.info('[JWTService] Invalidated session');
  }
}

/**
 * Check if session exists and is valid
 */
export async function isSessionValid(token: string): Promise<boolean> {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const session = await prisma.session.findUnique({
    where: { token: tokenHash },
  });

  if (!session) {
    return false;
  }

  // Check if expired
  if (session.expiresAt < new Date()) {
    // Clean up expired session
    await prisma.session.delete({
      where: { id: session.id },
    });
    return false;
  }

  return true;
}

/**
 * Clean up expired sessions (run periodically)
 */
export async function cleanupExpiredSessions(): Promise<number> {
  const result = await prisma.session.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });

  if (result.count > 0) {
    console.info('[JWTService] Cleaned up expired sessions:', result.count);
  }

  return result.count;
}

/**
 * Get all active sessions for a user
 */
export async function getUserSessions(userId: string): Promise<Session[]> {
  return prisma.session.findMany({
    where: {
      userId,
      expiresAt: {
        gt: new Date(),
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Revoke all sessions for a user (force logout everywhere)
 */
export async function revokeAllUserSessions(userId: string): Promise<number> {
  const result = await prisma.session.deleteMany({
    where: { userId },
  });

  console.info('[JWTService] Revoked all sessions for user:', userId);
  return result.count;
}
