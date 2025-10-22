# Logging and Error Tracking Documentation

## Overview

EVE Nomad Backend uses a production-grade logging and error tracking system built on:
- **Pino** - High-performance JSON structured logging
- **Sentry** - Error tracking and performance monitoring
- **Custom middleware** - Correlation IDs, error handlers, and context management

## Table of Contents

- [Architecture](#architecture)
- [Logger Service](#logger-service)
- [Sentry Integration](#sentry-integration)
- [Error Handling](#error-handling)
- [Best Practices](#best-practices)
- [Configuration](#configuration)
- [Examples](#examples)

## Architecture

### Logging Flow

```
Request → Correlation ID → Application Code → Logger → Pino
                                                          ↓
                                                      Console (dev)
                                                      JSON logs (prod)
```

### Error Tracking Flow

```
Error → Logger Service → Sentry Client → Sentry.io Dashboard
         ↓
    Structured Logs
```

### Key Components

1. **Logger Service** (`src/services/logger.service.ts`)
   - Structured logging with Pino
   - Automatic Sentry integration
   - Context-aware child loggers
   - Performance tracking

2. **Sentry Config** (`src/config/sentry.config.ts`)
   - Error capture and reporting
   - User context tracking
   - Breadcrumb collection
   - Data redaction

3. **Middleware**
   - Correlation ID (`src/middleware/correlation-id.middleware.ts`)
   - Error Handler (`src/middleware/error-handler.middleware.ts`)

4. **Custom Errors** (`src/types/errors.ts`)
   - Domain-specific error classes
   - Automatic status codes
   - Rich error context

## Logger Service

### Basic Usage

```typescript
import { logger } from '../services/logger.service';

// Info logging
logger.info('User logged in', { userId: 123 });

// Warning logging
logger.warn('Cache miss for key', { key: 'user:123' });

// Error logging
logger.error('Failed to fetch data', error, { endpoint: '/api/data' });

// Debug logging (not sent to Sentry)
logger.debug('Processing request', { requestId: 'abc123' });
```

### Child Loggers

Create child loggers with persistent context:

```typescript
import { createLogger } from '../services/logger.service';

const logger = createLogger({ module: 'auth', service: 'token-refresh' });

// All logs include module and service context
logger.info('Token refreshed', { characterId: 123 });
// Output: {"level":"info","module":"auth","service":"token-refresh","characterId":123,...}
```

### Specialized Logging Methods

#### ESI API Calls

```typescript
logger.esi(
  '/latest/characters/123/wallet/',
  200,
  150, // duration in ms
  { characterId: 123 }
);
```

#### Database Operations

```typescript
logger.database(
  'SELECT',
  'users',
  45, // duration in ms
  { query: 'find by email' }
);
```

#### Authentication Events

```typescript
logger.auth('login_success', userId, { method: 'eve_sso' });
```

#### Cache Operations

```typescript
logger.cache('hit', 'user:123:profile');
logger.cache('miss', 'user:456:wallet');
```

#### Performance Tracking

```typescript
// Manual tracking
logger.performance('data_processing', 1250, { recordsProcessed: 100 });

// Or use Timer utility
import { createTimer } from '../services/logger.service';

const timer = createTimer('expensive_operation');
// ... do work ...
const duration = timer.end({ result: 'success' });
```

### Log Levels

| Level | Method | Use Case | Sent to Sentry |
|-------|--------|----------|----------------|
| `fatal` | `logger.fatal()` | Critical failures requiring immediate attention | ✅ Yes |
| `error` | `logger.error()` | Errors that need investigation | ✅ Yes |
| `warn` | `logger.warn()` | Degraded performance, approaching limits | ❌ No (breadcrumb only) |
| `info` | `logger.info()` | Successful operations, state changes | ❌ No (breadcrumb only) |
| `debug` | `logger.debug()` | Detailed debugging information | ❌ No |
| `trace` | `logger.trace()` | Very detailed trace information | ❌ No |

### Sensitive Data Redaction

The logger automatically redacts sensitive fields:

```typescript
// These fields are automatically removed from logs
const REDACTED_FIELDS = [
  'password',
  'accessToken', 'access_token',
  'refreshToken', 'refresh_token',
  'token', 'authorization',
  'cookie', 'secret',
  'apiKey', 'api_key',
];

logger.info('User data', {
  email: 'user@example.com', // ✅ Logged
  accessToken: 'secret123',  // ❌ Redacted
});
```

## Sentry Integration

### Automatic Error Capture

Sentry automatically captures:
- Uncaught exceptions
- Unhandled promise rejections
- HTTP requests (via integration)
- Console errors

### Manual Error Capture

```typescript
import { captureException } from '../config/sentry.config';

try {
  // ... risky operation ...
} catch (error) {
  captureException(error as Error, {
    userId: 123,
    characterId: 456,
    endpoint: '/api/dangerous-operation',
    tags: {
      severity: 'high',
      category: 'payment',
    },
    extra: {
      customData: 'anything helpful',
    },
  });
}
```

### Breadcrumbs

Track user actions for debugging:

```typescript
import { addBreadcrumb } from '../config/sentry.config';

addBreadcrumb('User clicked button', 'ui', {
  buttonId: 'submit-payment',
  amount: 9.99,
});
```

### User Context

```typescript
import { setUser, clearUser } from '../config/sentry.config';

// Set user context
setUser(userId, 'user@example.com');

// Clear on logout
clearUser();
```

### Messages

```typescript
import { captureMessage } from '../config/sentry.config';

captureMessage('Unusual behavior detected', 'warning', {
  pattern: 'repeated_failed_logins',
  count: 5,
});
```

## Error Handling

### Custom Error Classes

Use domain-specific errors for better categorization:

```typescript
import {
  ESIError,
  ESIRateLimitError,
  AuthenticationError,
  DatabaseError,
  ValidationError,
} from '../types/errors';

// ESI errors
throw new ESIRateLimitError('/latest/characters/123/wallet/', 60);

// Authentication errors
throw new TokenExpiredError('access');

// Database errors
throw new RecordNotFoundError('users', userId);

// Validation errors
throw new InvalidInputError('email', 'valid email', inputValue);
```

### Error Handler Middleware

Automatically handles all errors and provides consistent responses:

```typescript
// Fastify automatically calls error handler
// No try/catch needed in routes!

fastify.get('/api/data', async (request, reply) => {
  // If this throws, error handler catches it
  const data = await fetchData();
  return { data };
});
```

Error responses:

```json
{
  "error": "Internal Server Error",
  "message": "An internal server error occurred",
  "statusCode": 500,
  "correlationId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "timestamp": "2025-10-18T07:00:00.000Z"
}
```

### Correlation IDs

Every request gets a unique correlation ID:

```typescript
// Automatic via middleware
request.correlationId // "a1b2c3d4-..."

// Available in error responses
// Helps track request across logs and Sentry
```

## Best Practices

### 1. Use Appropriate Log Levels

```typescript
// ✅ Good
logger.info('User registered', { userId });
logger.warn('Cache hit rate low', { hitRate: 0.3 });
logger.error('Payment failed', error, { paymentId });

// ❌ Bad
logger.error('User clicked button'); // Not an error
logger.info('Database connection failed'); // Should be error
```

### 2. Provide Context

```typescript
// ✅ Good
logger.error('Failed to fetch ESI data', error, {
  endpoint: '/latest/characters/123/wallet/',
  characterId: 123,
  statusCode: 500,
  retryAttempt: 3,
});

// ❌ Bad
logger.error('Fetch failed', error);
```

### 3. Use Child Loggers

```typescript
// ✅ Good - context carried through
const logger = createLogger({ module: 'payment', orderId: '123' });
logger.info('Processing payment'); // Includes orderId
logger.info('Payment complete'); // Also includes orderId

// ❌ Bad - repetitive
logger.info('Processing payment', { orderId: '123' });
logger.info('Payment complete', { orderId: '123' });
```

### 4. Don't Log Sensitive Data

```typescript
// ✅ Good
logger.info('User authenticated', { userId, method: 'eve_sso' });

// ❌ Bad
logger.info('User authenticated', { password, accessToken });
```

### 5. Use Custom Errors

```typescript
// ✅ Good
throw new ESIRateLimitError(endpoint, retryAfter);

// ❌ Bad
throw new Error('Rate limit exceeded');
```

### 6. Performance Tracking

```typescript
// ✅ Good
const timer = createTimer('complex_calculation');
const result = await complexCalculation();
timer.end({ recordsProcessed: result.length });

// ❌ Bad
const start = Date.now();
const result = await complexCalculation();
console.log('Took:', Date.now() - start);
```

## Configuration

### Environment Variables

```env
# Logging
LOG_LEVEL=info                    # trace|debug|info|warn|error|fatal
LOG_PRETTY=true                   # Pretty print in development
LOG_FORMAT=json                   # json|text

# Sentry
SENTRY_DSN=https://...@sentry.io/...
SENTRY_ENVIRONMENT=production     # development|staging|production
SENTRY_ENABLED=true               # Enable/disable Sentry
SENTRY_TRACES_SAMPLE_RATE=0.1     # Performance monitoring (10%)
SENTRY_PROFILES_SAMPLE_RATE=0.1   # Profiling (10%)
```

### Log Levels by Environment

| Environment | Recommended Level |
|-------------|-------------------|
| Development | `debug` |
| Staging | `info` |
| Production | `warn` |

### Sentry Sample Rates

| Environment | Traces | Profiles |
|-------------|--------|----------|
| Development | 1.0 | 0 |
| Staging | 0.5 | 0.1 |
| Production | 0.1 | 0.05 |

## Examples

### Service with Logging

```typescript
import { createLogger, createTimer } from '../services/logger.service';
import { ESIError } from '../types/errors';

const logger = createLogger({ module: 'wallet-service' });

export async function getWalletBalance(characterId: number): Promise<number> {
  const timer = createTimer('get_wallet_balance', logger);

  try {
    logger.info('Fetching wallet balance', { characterId });

    const balance = await esiClient.getCharacterWallet(characterId);

    timer.end({ characterId, balance });
    return balance;

  } catch (error) {
    logger.error('Failed to fetch wallet balance', error as Error, { characterId });
    throw new ESIError(
      'Failed to fetch wallet data',
      '/latest/characters/.../wallet/',
      (error as any).statusCode
    );
  }
}
```

### Controller with Error Handling

```typescript
import { FastifyRequest, FastifyReply } from 'fastify';
import { logger } from '../services/logger.service';

export async function getWallet(request: FastifyRequest, reply: FastifyReply) {
  const { characterId } = request.params as { characterId: string };

  logger.auth('wallet_access', parseInt(characterId), {
    correlationId: request.correlationId,
  });

  // No try/catch needed - error handler middleware catches errors
  const balance = await getWalletBalance(parseInt(characterId));

  return reply.send({ balance });
}
```

### Background Job with Logging

```typescript
import { createLogger } from '../services/logger.service';

const logger = createLogger({ module: 'token-refresh-job' });

export async function refreshTokens() {
  const timer = createTimer('token_refresh_batch', logger);

  logger.info('Starting token refresh batch');

  const characters = await findExpiringTokens();
  logger.info(`Found ${characters.length} characters needing refresh`);

  let successCount = 0;
  let errorCount = 0;

  for (const character of characters) {
    try {
      await refreshCharacterToken(character.id);
      successCount++;
    } catch (error) {
      logger.error('Token refresh failed', error as Error, {
        characterId: character.id,
      });
      errorCount++;
    }
  }

  timer.end({ total: characters.length, successCount, errorCount });

  if (errorCount > 0) {
    logger.warn(`Token refresh completed with errors`, {
      successCount,
      errorCount,
      successRate: (successCount / characters.length) * 100,
    });
  } else {
    logger.info('Token refresh completed successfully', { successCount });
  }
}
```

## Monitoring & Alerts

### Sentry Dashboard

Access your Sentry dashboard at: https://sentry.io/

**Key Metrics to Monitor:**
- Error rate trends
- Most common errors
- Affected users
- Performance bottlenecks

**Alert Configuration:**
- Error rate spike (>10 errors/minute)
- New error types
- Performance degradation
- Critical errors (5xx, database failures)

### Log Analysis

In production, use log aggregation services:
- AWS CloudWatch Logs
- Google Cloud Logging
- Datadog
- New Relic

**Query Examples:**

```json
// Find all errors for a specific user
{ "userId": 123, "level": 50 }

// Find slow database queries
{ "category": "database", "durationMs": { "$gt": 500 } }

// Track ESI rate limits
{ "category": "esi", "status": { "$in": [420, 429] } }
```

## Troubleshooting

### Logs Not Appearing

1. Check `LOG_LEVEL` environment variable
2. Verify logger is imported correctly
3. Check console for initialization errors

### Sentry Not Capturing Errors

1. Verify `SENTRY_ENABLED=true`
2. Check `SENTRY_DSN` is set correctly
3. Ensure Sentry is initialized before other imports in `index.ts`
4. Check Sentry project settings

### Sensitive Data in Logs

1. Add field to `REDACT_FIELDS` array in `logger.service.ts`
2. Use `beforeSend` hook in `sentry.config.ts`
3. Review log output regularly

### Performance Issues

1. Lower `LOG_LEVEL` in production (warn or error)
2. Reduce Sentry sample rates
3. Disable `LOG_PRETTY` in production
4. Use log sampling for high-volume endpoints

---

**Last Updated**: 2025-10-18
**Version**: 1.0.0
**Status**: Production Ready ✅
