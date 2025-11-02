/**
 * Retry Utility
 * Provides exponential backoff retry logic for transient failures
 */

export interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
  retryableStatusCodes?: number[];
  onRetry?: (attempt: number, error: Error, delayMs: number) => void;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: parseInt(process.env['ESI_MAX_RETRIES'] || '3', 10),
  initialDelayMs: parseInt(process.env['ESI_RETRY_DELAY_MS'] || '1000', 10),
  maxDelayMs: 30000, // 30 seconds max
  backoffMultiplier: 2,
  retryableStatusCodes: [500, 502, 503, 504], // Server errors
  onRetry: () => {
    /* noop */
  },
};

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: unknown, retryableStatusCodes: number[]): boolean {
  // Network errors are always retryable
  if (error instanceof Error) {
    if (
      error.message.includes('ECONNRESET') ||
      error.message.includes('ETIMEDOUT') ||
      error.message.includes('ENOTFOUND') ||
      error.message.includes('ECONNREFUSED')
    ) {
      return true;
    }
  }

  // Axios errors with status codes
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const axiosError = error as { response?: { status?: number } };
    if (axiosError.response?.status) {
      return retryableStatusCodes.includes(axiosError.response.status);
    }
  }

  return false;
}

/**
 * Calculate delay for exponential backoff
 */
export function calculateDelay(
  attempt: number,
  initialDelayMs: number,
  maxDelayMs: number,
  backoffMultiplier: number,
): number {
  const exponentialDelay = initialDelayMs * Math.pow(backoffMultiplier, attempt);
  const jitter = Math.random() * 0.1 * exponentialDelay; // ±10% jitter
  return Math.min(exponentialDelay + jitter, maxDelayMs);
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry if max attempts reached
      if (attempt >= opts.maxRetries) {
        throw lastError;
      }

      // Don't retry if error is not retryable
      if (!isRetryableError(error, opts.retryableStatusCodes)) {
        throw lastError;
      }

      // Calculate delay for next attempt
      const delayMs = calculateDelay(
        attempt,
        opts.initialDelayMs,
        opts.maxDelayMs,
        opts.backoffMultiplier,
      );

      // Call retry callback
      opts.onRetry(attempt + 1, lastError, delayMs);

      // Wait before retrying
      await sleep(delayMs);
    }
  }

  throw lastError!;
}

/**
 * Retry with custom condition
 */
export async function retryWithCondition<T>(
  fn: () => Promise<T>,
  shouldRetry: (error: unknown, attempt: number) => boolean,
  options: Omit<RetryOptions, 'retryableStatusCodes'> = {},
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry if max attempts reached
      if (attempt >= opts.maxRetries) {
        throw lastError;
      }

      // Check custom retry condition
      if (!shouldRetry(error, attempt)) {
        throw lastError;
      }

      // Calculate delay for next attempt
      const delayMs = calculateDelay(
        attempt,
        opts.initialDelayMs,
        opts.maxDelayMs,
        opts.backoffMultiplier,
      );

      // Call retry callback
      opts.onRetry(attempt + 1, lastError, delayMs);

      // Wait before retrying
      await sleep(delayMs);
    }
  }

  throw lastError!;
}
