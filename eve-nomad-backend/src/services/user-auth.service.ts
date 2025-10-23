/**
 * User Authentication Service
 *
 * Handles email/password authentication (complementing EVE SSO OAuth)
 * Uses Argon2 for password hashing and provides secure token generation
 *
 * @module services/user-auth
 */

import { User } from '@prisma/client';
import * as argon2 from 'argon2';
import { randomBytes } from 'crypto';
import { getPrisma } from '../utils/prisma';
import { createLogger } from './logger.service';
import * as emailService from './email.service';
import {
  RecordNotFoundError,
  AuthorizationError,
  ValidationError,
  DatabaseError,
} from '../types/errors';

const prisma = getPrisma();
const logger = createLogger({ service: 'UserAuthService' });

/**
 * Password hashing configuration (Argon2id)
 * Argon2id is more secure than bcrypt and resistant to GPU attacks
 */
const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 65536, // 64 MB
  timeCost: 3, // 3 iterations
  parallelism: 4, // 4 threads
};

/**
 * Email validation regex (RFC 5322 simplified)
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Password strength requirements
 */
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;

/**
 * Token expiration times
 */
// const EMAIL_VERIFICATION_TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours (reserved for future use)
const PASSWORD_RESET_TOKEN_EXPIRY = 1 * 60 * 60 * 1000; // 1 hour

/**
 * Register a new user with email and password
 */
export async function registerUser(
  email: string,
  password: string,
): Promise<User> {
  // Validate email format
  if (!EMAIL_REGEX.test(email)) {
    throw new ValidationError('Invalid email format');
  }

  // Validate password strength
  if (password.length < PASSWORD_MIN_LENGTH) {
    throw new ValidationError(
      `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
    );
  }

  if (password.length > PASSWORD_MAX_LENGTH) {
    throw new ValidationError(
      `Password must be less than ${PASSWORD_MAX_LENGTH} characters`,
    );
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    // Don't reveal that user exists (prevent user enumeration)
    throw new ValidationError('Registration failed. Please try again.');
  }

  // Hash password with Argon2
  let passwordHash: string;
  try {
    passwordHash = await argon2.hash(password, ARGON2_OPTIONS);
  } catch (error) {
    logger.error('Password hashing failed', error as Error, { email });
    throw new DatabaseError('User registration failed', 'create', 'User');
  }

  // Generate email verification token
  const emailVerificationToken = randomBytes(32).toString('hex');

  // Create user
  try {
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        emailVerificationToken,
        emailVerified: false,
      },
    });

    logger.info('User registered successfully', {
      userId: user.id,
      email: user.email,
    });

    // Send email verification email
    await emailService.sendEmailVerification(user.email!, emailVerificationToken);

    return user;
  } catch (error) {
    logger.error('User creation failed', error as Error, { email });
    throw new DatabaseError('User registration failed', 'create', 'User');
  }
}

/**
 * Authenticate user with email and password
 */
export async function loginUser(
  email: string,
  password: string,
): Promise<User> {
  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.passwordHash) {
    // Don't reveal whether user exists or has password (prevent user enumeration)
    logger.warn('Login attempt for non-existent or OAuth-only user', { email });
    throw new AuthorizationError('Invalid email or password');
  }

  // Verify password
  let isValidPassword: boolean;
  try {
    isValidPassword = await argon2.verify(user.passwordHash, password);
  } catch (error) {
    logger.error('Password verification failed', error as Error, {
      userId: user.id,
    });
    throw new AuthorizationError('Invalid email or password');
  }

  if (!isValidPassword) {
    logger.warn('Invalid password attempt', { userId: user.id, email });
    throw new AuthorizationError('Invalid email or password');
  }

  // Check if email is verified
  if (!user.emailVerified) {
    logger.warn('Login attempt with unverified email', {
      userId: user.id,
      email,
    });
    throw new AuthorizationError(
      'Email not verified. Please check your email for verification link.',
    );
  }

  logger.info('User logged in successfully', { userId: user.id, email });

  return user;
}

/**
 * Verify user's email with verification token
 */
export async function verifyEmail(token: string): Promise<User> {
  // Find user by verification token
  const user = await prisma.user.findUnique({
    where: { emailVerificationToken: token },
  });

  if (!user) {
    logger.warn('Invalid email verification token', { token });
    throw new RecordNotFoundError('Email verification token', token);
  }

  if (user.emailVerified) {
    logger.info('Email already verified', { userId: user.id });
    return user;
  }

  // Mark email as verified and clear token
  try {
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
      },
    });

    logger.info('Email verified successfully', { userId: updatedUser.id });

    return updatedUser;
  } catch (error) {
    logger.error('Email verification failed', error as Error, {
      userId: user.id,
    });
    throw new DatabaseError('Email verification failed', 'update', 'User');
  }
}

/**
 * Generate password reset token
 */
export async function generatePasswordResetToken(email: string): Promise<void> {
  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.passwordHash) {
    // Don't reveal whether user exists (prevent user enumeration)
    // Silently succeed to avoid leaking user existence
    logger.warn('Password reset requested for non-existent or OAuth-only user', {
      email,
    });
    return;
  }

  // Generate reset token
  const passwordResetToken = randomBytes(32).toString('hex');
  const passwordResetExpiresAt = new Date(
    Date.now() + PASSWORD_RESET_TOKEN_EXPIRY,
  );

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken,
        passwordResetExpiresAt,
      },
    });

    logger.info('Password reset token generated', {
      userId: user.id,
      expiresAt: passwordResetExpiresAt,
    });

    // Send password reset email
    await emailService.sendPasswordReset(user.email!, passwordResetToken);
  } catch (error) {
    logger.error('Password reset token generation failed', error as Error, {
      userId: user.id,
    });
    throw new DatabaseError(
      'Password reset request failed',
      'update',
      'User',
    );
  }
}

/**
 * Reset user's password with reset token
 */
export async function resetPassword(
  token: string,
  newPassword: string,
): Promise<void> {
  // Validate new password
  if (newPassword.length < PASSWORD_MIN_LENGTH) {
    throw new ValidationError(
      `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
    );
  }

  if (newPassword.length > PASSWORD_MAX_LENGTH) {
    throw new ValidationError(
      `Password must be less than ${PASSWORD_MAX_LENGTH} characters`,
    );
  }

  // Find user by reset token
  const user = await prisma.user.findUnique({
    where: { passwordResetToken: token },
  });

  if (!user) {
    logger.warn('Invalid password reset token', { token });
    throw new RecordNotFoundError('Password reset token', token);
  }

  // Check if token is expired
  if (
    !user.passwordResetExpiresAt ||
    user.passwordResetExpiresAt < new Date()
  ) {
    logger.warn('Expired password reset token', { userId: user.id });
    throw new AuthorizationError('Password reset token expired');
  }

  // Hash new password
  let passwordHash: string;
  try {
    passwordHash = await argon2.hash(newPassword, ARGON2_OPTIONS);
  } catch (error) {
    logger.error('Password hashing failed', error as Error, {
      userId: user.id,
    });
    throw new DatabaseError('Password reset failed', 'update', 'User');
  }

  // Update password and clear reset token
  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpiresAt: null,
      },
    });

    logger.info('Password reset successfully', { userId: user.id });
  } catch (error) {
    logger.error('Password reset failed', error as Error, { userId: user.id });
    throw new DatabaseError('Password reset failed', 'update', 'User');
  }
}

/**
 * Change user's password (when logged in)
 */
export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  // Get user
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || !user.passwordHash) {
    throw new RecordNotFoundError('User', userId);
  }

  // Verify current password
  let isValidPassword: boolean;
  try {
    isValidPassword = await argon2.verify(user.passwordHash, currentPassword);
  } catch (error) {
    logger.error('Password verification failed', error as Error, { userId });
    throw new AuthorizationError('Invalid current password');
  }

  if (!isValidPassword) {
    logger.warn('Invalid current password attempt', { userId });
    throw new AuthorizationError('Invalid current password');
  }

  // Validate new password
  if (newPassword.length < PASSWORD_MIN_LENGTH) {
    throw new ValidationError(
      `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
    );
  }

  if (newPassword.length > PASSWORD_MAX_LENGTH) {
    throw new ValidationError(
      `Password must be less than ${PASSWORD_MAX_LENGTH} characters`,
    );
  }

  // Hash new password
  let passwordHash: string;
  try {
    passwordHash = await argon2.hash(newPassword, ARGON2_OPTIONS);
  } catch (error) {
    logger.error('Password hashing failed', error as Error, { userId });
    throw new DatabaseError('Password change failed', 'update', 'User');
  }

  // Update password
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    logger.info('Password changed successfully', { userId });
  } catch (error) {
    logger.error('Password change failed', error as Error, { userId });
    throw new DatabaseError('Password change failed', 'update', 'User');
  }
}
