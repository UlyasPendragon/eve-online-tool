import Redis from 'ioredis';
import { createLogger } from './logger.service';

/**
 * Redis Service
 * Provides a singleton Redis client for caching and rate limiting
 */

const logger = createLogger({ module: 'redis' });
let redisClient: Redis | null = null;

/**
 * Get or create Redis client instance
 */
export function getRedisClient(): Redis {
  if (redisClient) {
    return redisClient;
  }

  const host = process.env.REDIS_HOST || 'localhost';
  const port = parseInt(process.env.REDIS_PORT || '6379', 10);
  const password = process.env.REDIS_PASSWORD;
  const db = parseInt(process.env.REDIS_DB || '0', 10);

  redisClient = new Redis({
    host,
    port,
    password,
    db,
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      logger.warn(`Retrying connection (attempt ${times}) in ${delay}ms`);
      return delay;
    },
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: false,
  });

  // Connection event handlers
  redisClient.on('connect', () => {
    logger.info('Connected successfully', { host, port, db });
  });

  redisClient.on('ready', () => {
    logger.info('Ready to accept commands');
  });

  redisClient.on('error', (err) => {
    logger.error('Connection error', err);
  });

  redisClient.on('close', () => {
    logger.warn('Connection closed');
  });

  redisClient.on('reconnecting', () => {
    logger.info('Reconnecting...');
  });

  return redisClient;
}

/**
 * Set a key with optional TTL (in seconds)
 */
export async function set(
  key: string,
  value: string,
  ttlSeconds?: number,
): Promise<void> {
  const client = getRedisClient();

  try {
    if (ttlSeconds) {
      await client.setex(key, ttlSeconds, value);
    } else {
      await client.set(key, value);
    }
  } catch (error) {
    logger.error(`Error setting key "${key}"`, error as Error);
    throw error;
  }
}

/**
 * Get a value by key
 */
export async function get(key: string): Promise<string | null> {
  const client = getRedisClient();

  try {
    return await client.get(key);
  } catch (error) {
    logger.error(`Error getting key "${key}"`, error as Error);
    return null;
  }
}

/**
 * Delete a key
 */
export async function del(key: string): Promise<void> {
  const client = getRedisClient();

  try {
    await client.del(key);
  } catch (error) {
    logger.error(`Error deleting key "${key}"`, error as Error);
  }
}

/**
 * Check if a key exists
 */
export async function exists(key: string): Promise<boolean> {
  const client = getRedisClient();

  try {
    const result = await client.exists(key);
    return result === 1;
  } catch (error) {
    logger.error(`Error checking key "${key}"`, error as Error);
    return false;
  }
}

/**
 * Get time-to-live for a key (in seconds)
 */
export async function ttl(key: string): Promise<number> {
  const client = getRedisClient();

  try {
    return await client.ttl(key);
  } catch (error) {
    logger.error(`Error getting TTL for key "${key}"`, error as Error);
    return -1;
  }
}

/**
 * Increment a counter
 */
export async function incr(key: string): Promise<number> {
  const client = getRedisClient();

  try {
    return await client.incr(key);
  } catch (error) {
    logger.error(`Error incrementing key "${key}"`, error as Error);
    throw error;
  }
}

/**
 * Decrement a counter
 */
export async function decr(key: string): Promise<number> {
  const client = getRedisClient();

  try {
    return await client.decr(key);
  } catch (error) {
    logger.error(`Error decrementing key "${key}"`, error as Error);
    throw error;
  }
}

/**
 * Set expiration on a key (in seconds)
 */
export async function expire(key: string, seconds: number): Promise<void> {
  const client = getRedisClient();

  try {
    await client.expire(key, seconds);
  } catch (error) {
    logger.error(`Error setting expiration on key "${key}"`, error as Error);
  }
}

/**
 * Get all keys matching a pattern
 */
export async function keys(pattern: string): Promise<string[]> {
  const client = getRedisClient();

  try {
    return await client.keys(pattern);
  } catch (error) {
    logger.error(`Error finding keys with pattern "${pattern}"`, error as Error);
    return [];
  }
}

/**
 * Delete all keys matching a pattern
 */
export async function deletePattern(pattern: string): Promise<number> {
  const client = getRedisClient();

  try {
    const matchingKeys = await keys(pattern);
    if (matchingKeys.length === 0) {
      return 0;
    }
    return await client.del(...matchingKeys);
  } catch (error) {
    logger.error(`Error deleting keys with pattern "${pattern}"`, error as Error);
    return 0;
  }
}

/**
 * Gracefully disconnect Redis client
 */
export async function disconnect(): Promise<void> {
  if (redisClient) {
    logger.info('Disconnecting...');
    await redisClient.quit();
    redisClient = null;
  }
}

/**
 * Check if Redis is connected
 */
export function isConnected(): boolean {
  return redisClient !== null && redisClient.status === 'ready';
}
