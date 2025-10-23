import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

/**
 * Sentry Configuration
 * Initialize Sentry for error tracking and performance monitoring
 */

export function initializeSentry(): void {
  const dsn = process.env['SENTRY_DSN'];
  const environment = process.env['SENTRY_ENVIRONMENT'] || process.env['NODE_ENV'] || 'development';
  const enabled = process.env['SENTRY_ENABLED'] === 'true';

  // Skip initialization if Sentry is disabled or DSN is missing
  if (!enabled || !dsn) {
    console.info('[Sentry] Disabled or DSN not configured');
    return;
  }

  Sentry.init({
    dsn,
    environment,

    // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: parseFloat(process.env['SENTRY_TRACES_SAMPLE_RATE'] || '0.1'),

    // Set sampling rate for profiling - this is relative to tracesSampleRate
    profilesSampleRate: parseFloat(process.env['SENTRY_PROFILES_SAMPLE_RATE'] || '0.1'),

    // Integrations
    integrations: [
      // Profiling integration
      nodeProfilingIntegration(),

      // HTTP integration for tracking HTTP requests
      Sentry.httpIntegration(),

      // Console integration for tracking console errors
      Sentry.consoleIntegration(),
    ],

    // Before send hook to filter/modify events
    beforeSend(event, hint) {
      // Filter out errors from development environment if needed
      if (environment === 'development') {
        console.info('[Sentry] Captured error:', hint.originalException);
      }

      // Scrub sensitive data
      if (event.request) {
        delete event.request.cookies;

        // Redact authorization headers
        if (event.request.headers?.['authorization']) {
          event.request.headers['authorization'] = '[REDACTED]';
        }
      }

      return event;
    },

    // Before breadcrumb hook to filter/modify breadcrumbs
    beforeBreadcrumb(breadcrumb) {
      // Redact sensitive data in breadcrumbs
      if (breadcrumb.category === 'http' && breadcrumb.data) {
        if (breadcrumb.data['authorization']) {
          breadcrumb.data['authorization'] = '[REDACTED]';
        }
      }

      return breadcrumb;
    },

    // Ignore certain errors
    ignoreErrors: [
      // Network errors
      'ECONNRESET',
      'ENOTFOUND',
      'ETIMEDOUT',
      'ECONNREFUSED',

      // Expected errors
      'REAUTH_REQUIRED',
      'Invalid token',
      'jwt expired',
    ],
  });

  console.info(`[Sentry] Initialized for environment: ${environment}`);
}

/**
 * Capture an exception in Sentry with additional context
 */
export function captureException(
  error: Error,
  context?: {
    userId?: number;
    characterId?: number;
    endpoint?: string;
    tags?: Record<string, string>;
    extra?: Record<string, unknown>;
  },
): void {
  Sentry.withScope((scope) => {
    // Add user context
    if (context?.userId) {
      scope.setUser({ id: String(context.userId) });
    }

    // Add character context
    if (context?.characterId) {
      scope.setContext('character', {
        characterId: context.characterId,
      });
    }

    // Add endpoint context
    if (context?.endpoint) {
      scope.setTag('endpoint', context.endpoint);
    }

    // Add custom tags
    if (context?.tags) {
      Object.entries(context.tags).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
    }

    // Add extra context
    if (context?.extra) {
      scope.setContext('extra', context.extra);
    }

    Sentry.captureException(error);
  });
}

/**
 * Capture a message in Sentry
 */
export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = 'info',
  context?: Record<string, unknown>,
): void {
  Sentry.withScope((scope) => {
    if (context) {
      scope.setContext('message_context', context);
    }

    Sentry.captureMessage(message, level);
  });
}

/**
 * Add breadcrumb for tracking user actions
 */
export function addBreadcrumb(
  message: string,
  category: string,
  data?: Record<string, unknown>,
): void {
  Sentry.addBreadcrumb({
    message,
    category,
    level: 'info',
    data,
  });
}

/**
 * Set user context for Sentry
 */
export function setUser(userId: number, email?: string): void {
  Sentry.setUser({
    id: String(userId),
    email,
  });
}

/**
 * Clear user context
 */
export function clearUser(): void {
  Sentry.setUser(null);
}

/**
 * Flush Sentry events (useful before shutdown)
 */
export async function flushSentry(timeout = 2000): Promise<boolean> {
  return await Sentry.close(timeout);
}
