/**
 * Email Service
 *
 * Handles sending emails for authentication and notifications
 * Currently logs to console in development (SMTP implementation pending)
 *
 * @module services/email
 */

import { createLogger } from './logger.service';

const logger = createLogger({ service: 'EmailService' });

/**
 * Email configuration
 */
const FROM_EMAIL = process.env['EMAIL_FROM'] || 'noreply@eve-nomad.com';
const APP_URL = process.env['APP_URL'] || 'http://localhost:3000';

/**
 * Send email verification email
 */
export async function sendEmailVerification(
  to: string,
  verificationToken: string,
): Promise<void> {
  const verificationUrl = `${APP_URL}/verify-email?token=${verificationToken}`;

  const emailContent = {
    from: FROM_EMAIL,
    to,
    subject: 'Verify your EVE Nomad account',
    html: `
      <h1>Welcome to EVE Nomad!</h1>
      <p>Please verify your email address by clicking the link below:</p>
      <p><a href="${verificationUrl}">Verify Email</a></p>
      <p>Or copy this link into your browser:</p>
      <p>${verificationUrl}</p>
      <p>This link will expire in 24 hours.</p>
      <p>If you did not create an account, please ignore this email.</p>
    `,
    text: `
      Welcome to EVE Nomad!

      Please verify your email address by visiting this link:
      ${verificationUrl}

      This link will expire in 24 hours.

      If you did not create an account, please ignore this email.
    `,
  };

  // TODO: Implement actual SMTP sending with nodemailer or similar
  // For now, log to console in development
  logger.info('EMAIL VERIFICATION (Development Mode)', {
    to,
    verificationUrl,
    email: emailContent,
  });

  // In production, this would send via SMTP:
  // await transporter.sendMail(emailContent);
}

/**
 * Send password reset email
 */
export async function sendPasswordReset(
  to: string,
  resetToken: string,
): Promise<void> {
  const resetUrl = `${APP_URL}/reset-password?token=${resetToken}`;

  const emailContent = {
    from: FROM_EMAIL,
    to,
    subject: 'Reset your EVE Nomad password',
    html: `
      <h1>Password Reset Request</h1>
      <p>We received a request to reset your password. Click the link below to set a new password:</p>
      <p><a href="${resetUrl}">Reset Password</a></p>
      <p>Or copy this link into your browser:</p>
      <p>${resetUrl}</p>
      <p>This link will expire in 1 hour.</p>
      <p>If you did not request a password reset, please ignore this email.</p>
    `,
    text: `
      Password Reset Request

      We received a request to reset your password. Visit this link to set a new password:
      ${resetUrl}

      This link will expire in 1 hour.

      If you did not request a password reset, please ignore this email.
    `,
  };

  // TODO: Implement actual SMTP sending
  // For now, log to console in development
  logger.info('PASSWORD RESET EMAIL (Development Mode)', {
    to,
    resetUrl,
    email: emailContent,
  });

  // In production, this would send via SMTP:
  // await transporter.sendMail(emailContent);
}

/**
 * Send welcome email (after email verification)
 */
export async function sendWelcomeEmail(to: string): Promise<void> {
  const emailContent = {
    from: FROM_EMAIL,
    to,
    subject: 'Welcome to EVE Nomad!',
    html: `
      <h1>Welcome to EVE Nomad!</h1>
      <p>Your email has been verified and your account is ready to use.</p>
      <p>Get started by linking your EVE Online characters:</p>
      <p><a href="${APP_URL}/auth/login">Connect EVE Characters</a></p>
      <p>Happy flying, Commander! o7</p>
    `,
    text: `
      Welcome to EVE Nomad!

      Your email has been verified and your account is ready to use.

      Get started by linking your EVE Online characters at:
      ${APP_URL}/auth/login

      Happy flying, Commander! o7
    `,
  };

  // TODO: Implement actual SMTP sending
  // For now, log to console in development
  logger.info('WELCOME EMAIL (Development Mode)', {
    to,
    email: emailContent,
  });

  // In production, this would send via SMTP:
  // await transporter.sendMail(emailContent);
}

/**
 * TODO: Implement SMTP configuration with nodemailer
 *
 * Example implementation:
 *
 * import nodemailer from 'nodemailer';
 *
 * const transporter = nodemailer.createTransport({
 *   host: process.env.SMTP_HOST,
 *   port: parseInt(process.env.SMTP_PORT || '587'),
 *   secure: process.env.SMTP_SECURE === 'true',
 *   auth: {
 *     user: process.env.SMTP_USER,
 *     pass: process.env.SMTP_PASSWORD,
 *   },
 * });
 *
 * Then replace logger.info calls with:
 * await transporter.sendMail(emailContent);
 */
