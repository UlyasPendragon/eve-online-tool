/**
 * Custom Error Classes
 * Domain-specific errors with additional context
 */

/**
 * Base Application Error
 */
export class ApplicationError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'APPLICATION_ERROR',
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * ESI API Errors
 */
export class ESIError extends ApplicationError {
  public readonly endpoint: string;
  public readonly esiStatus?: number;

  constructor(
    message: string,
    endpoint: string,
    esiStatus?: number,
    details?: Record<string, unknown>,
  ) {
    super(message, 502, 'ESI_ERROR', { ...details, endpoint, esiStatus });
    this.endpoint = endpoint;
    this.esiStatus = esiStatus;
  }
}

export class ESIRateLimitError extends ESIError {
  public readonly retryAfter: number;

  constructor(endpoint: string, retryAfter: number) {
    super(
      `ESI rate limit exceeded for ${endpoint}. Retry after ${retryAfter}s`,
      endpoint,
      429,
      { retryAfter },
    );
    this.code = 'ESI_RATE_LIMIT';
    this.statusCode = 429;
    this.retryAfter = retryAfter;
  }
}

export class ESIErrorLimitError extends ESIError {
  public readonly errorsRemaining: number;

  constructor(endpoint: string, errorsRemaining: number) {
    super(
      `ESI error limit approaching for ${endpoint}. ${errorsRemaining} errors remaining`,
      endpoint,
      420,
      { errorsRemaining },
    );
    this.code = 'ESI_ERROR_LIMIT';
    this.statusCode = 429;
    this.errorsRemaining = errorsRemaining;
  }
}

export class ESINotFoundError extends ESIError {
  constructor(endpoint: string, resourceId?: string | number) {
    super(
      `Resource not found: ${endpoint}${resourceId ? ` (ID: ${resourceId})` : ''}`,
      endpoint,
      404,
      { resourceId },
    );
    this.code = 'ESI_NOT_FOUND';
    this.statusCode = 404;
  }
}

/**
 * Authentication Errors
 */
export class AuthenticationError extends ApplicationError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 401, 'AUTHENTICATION_ERROR', details);
  }
}

export class TokenExpiredError extends AuthenticationError {
  constructor(tokenType: string = 'access') {
    super(`${tokenType} token has expired`, { tokenType });
    this.code = 'TOKEN_EXPIRED';
  }
}

export class InvalidTokenError extends AuthenticationError {
  constructor(reason?: string) {
    super('Invalid or malformed token', { reason });
    this.code = 'INVALID_TOKEN';
  }
}

export class ReauthRequiredError extends AuthenticationError {
  public readonly characterId: number;

  constructor(characterId: number) {
    super(`Re-authentication required for character ${characterId}`, { characterId });
    this.code = 'REAUTH_REQUIRED';
    this.characterId = characterId;
  }
}

/**
 * Authorization Errors
 */
export class AuthorizationError extends ApplicationError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 403, 'AUTHORIZATION_ERROR', details);
  }
}

export class InsufficientPermissionsError extends AuthorizationError {
  public readonly requiredScope: string;

  constructor(requiredScope: string) {
    super(`Missing required scope: ${requiredScope}`, { requiredScope });
    this.code = 'INSUFFICIENT_PERMISSIONS';
    this.requiredScope = requiredScope;
  }
}

/**
 * Database Errors
 */
export class DatabaseError extends ApplicationError {
  public readonly operation: string;
  public readonly table?: string;

  constructor(
    message: string,
    operation: string,
    table?: string,
    details?: Record<string, unknown>,
  ) {
    super(message, 500, 'DATABASE_ERROR', { ...details, operation, table });
    this.operation = operation;
    this.table = table;
  }
}

export class RecordNotFoundError extends DatabaseError {
  public readonly recordId: string | number;

  constructor(table: string, recordId: string | number) {
    super(`Record not found in ${table}: ${recordId}`, 'find', table, { recordId });
    this.code = 'RECORD_NOT_FOUND';
    this.statusCode = 404;
    this.recordId = recordId;
  }
}

export class DuplicateRecordError extends DatabaseError {
  public readonly field: string;
  public readonly value: unknown;

  constructor(table: string, field: string, value: unknown) {
    super(`Duplicate ${field} in ${table}: ${value}`, 'create', table, { field, value });
    this.code = 'DUPLICATE_RECORD';
    this.statusCode = 409;
    this.field = field;
    this.value = value;
  }
}

/**
 * Validation Errors
 */
export class ValidationError extends ApplicationError {
  public readonly field?: string;
  public readonly value?: unknown;

  constructor(message: string, field?: string, value?: unknown, details?: Record<string, unknown>) {
    super(message, 422, 'VALIDATION_ERROR', { ...details, field, value });
    this.field = field;
    this.value = value;
  }
}

export class InvalidInputError extends ValidationError {
  constructor(field: string, expected: string, received: unknown) {
    super(
      `Invalid input for ${field}. Expected ${expected}, received ${typeof received}`,
      field,
      received,
      { expected },
    );
    this.code = 'INVALID_INPUT';
  }
}

export class MissingFieldError extends ValidationError {
  constructor(field: string) {
    super(`Required field missing: ${field}`, field);
    this.code = 'MISSING_FIELD';
    this.statusCode = 400;
  }
}

/**
 * Cache Errors
 */
export class CacheError extends ApplicationError {
  public readonly cacheKey: string;

  constructor(message: string, cacheKey: string, details?: Record<string, unknown>) {
    super(message, 500, 'CACHE_ERROR', { ...details, cacheKey });
    this.cacheKey = cacheKey;
  }
}

/**
 * Payment Errors
 */
export class PaymentError extends ApplicationError {
  public readonly paymentId?: string;

  constructor(message: string, paymentId?: string, details?: Record<string, unknown>) {
    super(message, 402, 'PAYMENT_ERROR', { ...details, paymentId });
    this.paymentId = paymentId;
  }
}

export class PaymentFailedError extends PaymentError {
  constructor(reason: string, paymentId?: string) {
    super(`Payment failed: ${reason}`, paymentId, { reason });
    this.code = 'PAYMENT_FAILED';
  }
}

/**
 * Rate Limit Errors
 */
export class RateLimitError extends ApplicationError {
  public readonly retryAfter: number;

  constructor(retryAfter: number, details?: Record<string, unknown>) {
    super('Too many requests. Please try again later.', 429, 'RATE_LIMIT_EXCEEDED', {
      ...details,
      retryAfter,
    });
    this.retryAfter = retryAfter;
  }
}

/**
 * Service Unavailable Errors
 */
export class ServiceUnavailableError extends ApplicationError {
  public readonly service: string;

  constructor(service: string, details?: Record<string, unknown>) {
    super(`Service temporarily unavailable: ${service}`, 503, 'SERVICE_UNAVAILABLE', {
      ...details,
      service,
    });
    this.service = service;
  }
}

/**
 * Configuration Errors
 */
export class ConfigurationError extends ApplicationError {
  public readonly configKey: string;

  constructor(configKey: string, message?: string) {
    super(
      message || `Missing or invalid configuration: ${configKey}`,
      500,
      'CONFIGURATION_ERROR',
      { configKey },
    );
    this.configKey = configKey;
  }
}
