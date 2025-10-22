import * as Sentry from '@sentry/node';
import { logger } from '../services/logger.service';

export function validateRequiredConfig(): void {
  const required = [
    'DATABASE_URL',
    'JWT_SECRET',
    'ENCRYPTION_KEY',
    'ESI_CLIENT_ID',
    'ESI_CLIENT_SECRET',
  ];

  const missing: string[] = [];

  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    const error = new Error(`Missing required environment variables: ${missing.join(', ')}`);
    logger.fatal('Configuration validation failed', { missing });
    Sentry.captureException(error);
    process.exit(1); // Fail fast
  }

  // Validate ENCRYPTION_KEY length (must be 32 bytes for AES-256)
  const encryptionKey = process.env.ENCRYPTION_KEY;
  if (encryptionKey && encryptionKey.length !== 64) {
    // 32 bytes = 64 hex chars
    const error = new Error('ENCRYPTION_KEY must be 32 bytes (64 hex characters)');
    logger.fatal('Invalid ENCRYPTION_KEY length', {
      actual: encryptionKey.length,
      expected: 64,
    });
    Sentry.captureException(error);
    process.exit(1);
  }

  logger.info('Configuration validation passed');
}
