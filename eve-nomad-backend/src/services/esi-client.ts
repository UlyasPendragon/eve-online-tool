import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import * as cache from './cache.service';
import * as rateLimit from './rate-limiter.service';
import * as authService from './auth.service';
import { retry } from '../utils/retry.util';
import { createLogger } from './logger.service';
import { RecordNotFoundError } from '../types/errors';
import type * as ESI from '../types/esi';

const logger = createLogger({ service: 'ESIClient' });

/**
 * Enhanced ESI Client
 * Production-ready client with caching, rate limiting, retry logic, and auto token management
 */

export class ESIClient {
  private client: AxiosInstance;
  private baseURL: string;
  private userAgent: string;

  constructor() {
    this.baseURL = process.env['ESI_BASE_URL'] || 'https://esi.evetech.net';
    this.userAgent = process.env['ESI_USER_AGENT'] || 'EVE Nomad (contact@evenomad.com)';

    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'User-Agent': this.userAgent,
        Accept: 'application/json',
      },
      timeout: 10000,
      validateStatus: () => true, // Don't throw on any status code
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.client.interceptors.request.use(async (config) => {
      const errorThrottle = await rateLimit.shouldThrottleErrors();
      if (errorThrottle.shouldWait) {
        await rateLimit.waitForReset(errorThrottle.waitSeconds, errorThrottle.reason);
      }

      logger.info('ESI request', { method: config.method?.toUpperCase(), url: config.url });
      return config;
    });

    this.client.interceptors.response.use((response) => {
      rateLimit.trackErrorLimit(response.headers as Record<string, string | string[]>);
      rateLimit.trackRateLimit(response.headers as Record<string, string | string[]>);

      const errorLimit = response.headers['x-esi-error-limit-remain'];
      logger.info('ESI response', {
        status: response.status,
        url: response.config.url,
        errorLimit: errorLimit || 'N/A',
      });

      return response;
    });
  }

  public async get<T>(
    endpoint: string,
    options?: {
      params?: Record<string, unknown>;
      characterId?: number;
      skipCache?: boolean;
      etag?: string;
    },
  ): Promise<T> {
    const cacheKey = cache.generateCacheKey(endpoint, options?.params);

    if (!options?.skipCache) {
      const cached = await cache.get(cacheKey);
      if (cached) {
        return cached.data as T;
      }
    }

    let accessToken: string | undefined;
    if (options?.characterId) {
      try {
        const result = await authService.getCharacterWithValidToken(options.characterId);
        accessToken = result.accessToken;
      } catch (error) {
        logger.error('Failed to get token for character', error as Error, {
          characterId: options.characterId,
        });
        throw new Error('REAUTH_REQUIRED');
      }
    }

    const response = await retry(
      async () => {
        const config: AxiosRequestConfig = {
          params: options?.params,
          headers: {},
        };

        if (accessToken) {
          config.headers!.Authorization = `Bearer ${accessToken}`;
        }

        if (options?.etag) {
          config.headers!['If-None-Match'] = options.etag;
        }

        return await this.client.get(endpoint, config);
      },
      {
        onRetry: (attempt, error, delayMs) => {
          logger.warn('ESI retry attempt', {
            attempt,
            endpoint,
            delayMs,
            error: error.message,
          });
        },
      },
    );

    return this.handleResponse<T>(response, cacheKey);
  }

  private async handleResponse<T>(response: AxiosResponse, cacheKey: string): Promise<T> {
    const { status, data, headers } = response;

    if (status === 200) {
      const expiresAt = cache.calculateExpiration(headers['cache-control'], headers['expires']);
      const etag = headers['etag'];

      await cache.set(cacheKey, data, expiresAt, etag);
      return data as T;
    }

    if (status === 304) {
      const cached = await cache.get(cacheKey);
      if (cached) {
        return cached.data as T;
      }
      throw new Error('304 Not Modified but no cached data found');
    }

    if (status === 401 || status === 403) {
      throw new Error('REAUTH_REQUIRED');
    }

    if (status === 404) {
      throw new RecordNotFoundError('ESI Resource', response.config.url || 'unknown');
    }

    if (status === 420) {
      const resetSeconds = rateLimit.parseRetryAfter(headers['retry-after']);
      await rateLimit.waitForReset(resetSeconds, 'Error limit exceeded (420)');
      throw new Error('ESI_ERROR_LIMIT_EXCEEDED');
    }

    if (status === 429) {
      const resetSeconds = rateLimit.parseRetryAfter(headers['retry-after']);
      await rateLimit.waitForReset(resetSeconds, 'Rate limit exceeded (429)');
      throw new Error('ESI_RATE_LIMIT_EXCEEDED');
    }

    if (status >= 500) {
      throw new Error(`ESI server error: ${status} - ${data?.error || 'Unknown'}`);
    }

    if (status >= 400) {
      throw new Error(`ESI client error: ${status} - ${data?.error || 'Unknown'}`);
    }

    return data as T;
  }

  // ===== PUBLIC ENDPOINTS (No Authentication) =====

  async getServerStatus(): Promise<ESI.ServerStatus> {
    return this.get<ESI.ServerStatus>('/latest/status/');
  }

  async getUniverseType(typeId: number): Promise<ESI.UniverseType> {
    return this.get<ESI.UniverseType>(`/latest/universe/types/${typeId}/`);
  }

  async getSolarSystem(systemId: number): Promise<ESI.SolarSystem> {
    return this.get<ESI.SolarSystem>(`/latest/universe/systems/${systemId}/`);
  }

  async getCharacterPublicInfo(characterId: number): Promise<ESI.CharacterPublicInfo> {
    return this.get<ESI.CharacterPublicInfo>(`/latest/characters/${characterId}/`);
  }

  async getMarketPrices(): Promise<ESI.MarketPrice[]> {
    return this.get<ESI.MarketPrice[]>('/latest/markets/prices/');
  }

  // ===== AUTHENTICATED ENDPOINTS (Require characterId) =====

  async getCharacterSkillQueue(characterId: number): Promise<ESI.SkillQueueItem[]> {
    return this.get<ESI.SkillQueueItem[]>(`/latest/characters/${characterId}/skillqueue/`, {
      characterId,
    });
  }

  async getCharacterSkills(characterId: number): Promise<ESI.CharacterSkills> {
    return this.get<ESI.CharacterSkills>(`/latest/characters/${characterId}/skills/`, {
      characterId,
    });
  }

  async getCharacterWallet(characterId: number): Promise<number> {
    return this.get<number>(`/latest/characters/${characterId}/wallet/`, { characterId });
  }

  async getCharacterAssets(characterId: number): Promise<ESI.Asset[]> {
    return this.get<ESI.Asset[]>(`/latest/characters/${characterId}/assets/`, { characterId });
  }

  async getCharacterMail(characterId: number): Promise<ESI.MailHeader[]> {
    return this.get<ESI.MailHeader[]>(`/latest/characters/${characterId}/mail/`, { characterId });
  }

  async getCharacterMailBody(
    characterId: number,
    mailId: number,
  ): Promise<{ body: string; subject: string; from: number }> {
    return this.get(`/latest/characters/${characterId}/mail/${mailId}/`, { characterId });
  }

  async getCharacterOrders(characterId: number): Promise<ESI.MarketOrder[]> {
    return this.get<ESI.MarketOrder[]>(`/latest/characters/${characterId}/orders/`, {
      characterId,
    });
  }

  async getCharacterIndustryJobs(characterId: number): Promise<ESI.IndustryJob[]> {
    return this.get<ESI.IndustryJob[]>(`/latest/characters/${characterId}/industry/jobs/`, {
      characterId,
    });
  }

  async getCharacterPlanets(characterId: number): Promise<ESI.PlanetaryColony[]> {
    return this.get<ESI.PlanetaryColony[]>(`/latest/characters/${characterId}/planets/`, {
      characterId,
    });
  }

  async getCharacterWalletJournal(characterId: number): Promise<ESI.WalletJournalEntry[]> {
    return this.get<ESI.WalletJournalEntry[]>(
      `/latest/characters/${characterId}/wallet/journal/`,
      { characterId },
    );
  }

  async getCharacterWalletTransactions(
    characterId: number,
  ): Promise<ESI.WalletTransaction[]> {
    return this.get<ESI.WalletTransaction[]>(
      `/latest/characters/${characterId}/wallet/transactions/`,
      { characterId },
    );
  }

  // ===== PAGINATION SUPPORT =====

  /**
   * Get all pages for a paginated ESI endpoint
   * @param endpoint The ESI endpoint URL
   * @param options Request options including characterId for auth
   * @returns Array of all items from all pages
   */
  public async getPaginated<T>(
    endpoint: string,
    options?: {
      params?: Record<string, unknown>;
      characterId?: number;
      skipCache?: boolean;
      maxPages?: number;
    },
  ): Promise<T[]> {
    const allResults: T[] = [];
    let currentPage = 1;
    const maxPages = options?.maxPages || 100; // Safety limit

    while (currentPage <= maxPages) {
      const pageParams = { ...options?.params, page: currentPage };

      try {
        const response = await this.client.get(endpoint, {
          params: pageParams,
          headers: options?.characterId
            ? {
                Authorization: `Bearer ${(await authService.getCharacterWithValidToken(options.characterId)).accessToken}`,
              }
            : {},
        });

        if (response.status !== 200) {
          break;
        }

        const pageData = response.data as T[];
        if (!Array.isArray(pageData) || pageData.length === 0) {
          break;
        }

        allResults.push(...pageData);

        // Check X-Pages header to see total pages
        const totalPages = parseInt(response.headers['x-pages'] || '1', 10);
        if (currentPage >= totalPages) {
          break;
        }

        currentPage++;
      } catch (error) {
        logger.error('Pagination error', error as Error, { endpoint, currentPage });
        break;
      }
    }

    logger.info('Paginated request completed', {
      endpoint,
      totalPages: currentPage - 1,
      totalResults: allResults.length,
    });

    return allResults;
  }

  // ===== CACHE MANAGEMENT =====

  async invalidateCache(endpoint: string, params?: Record<string, unknown>): Promise<void> {
    const cacheKey = cache.generateCacheKey(endpoint, params);
    await cache.del(cacheKey);
  }

  async invalidateCachePattern(pattern: string): Promise<void> {
    await cache.deletePattern(pattern);
  }
}

// Export singleton instance
export const esiClient = new ESIClient();
