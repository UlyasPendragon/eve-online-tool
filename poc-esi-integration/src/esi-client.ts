import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

/**
 * Simple ESI Client for proof-of-concept
 * Demonstrates unauthenticated ESI API calls
 */
export class ESIClient {
  private client: AxiosInstance;
  private baseURL: string;
  private userAgent: string;

  constructor(baseURL: string = 'https://esi.evetech.net', userAgent: string = 'EVE Nomad POC') {
    this.baseURL = baseURL;
    this.userAgent = userAgent;

    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'User-Agent': this.userAgent,
        'Accept': 'application/json',
      },
      timeout: 10000, // 10 second timeout
    });

    // Add request interceptor for logging
    this.client.interceptors.request.use((config) => {
      console.log(`[ESI] ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    });

    // Add response interceptor for cache header handling
    this.client.interceptors.response.use((response) => {
      const cacheControl = response.headers['cache-control'];
      const expires = response.headers['expires'];
      const errorLimit = response.headers['x-esi-error-limit-remain'];
      const errorReset = response.headers['x-esi-error-limit-reset'];

      console.log(`[ESI] Response Status: ${response.status}`);
      if (cacheControl) {
        console.log(`[ESI] Cache-Control: ${cacheControl}`);
      }
      if (errorLimit) {
        console.log(`[ESI] Error Limit Remaining: ${errorLimit}/${response.headers['x-esi-error-limit']}`);
      }

      return response;
    }, (error) => {
      if (error.response) {
        console.error(`[ESI] Error ${error.response.status}: ${error.response.statusText}`);
        console.error(`[ESI] URL: ${error.config.url}`);

        // Handle specific ESI errors
        if (error.response.status === 420) {
          console.error('[ESI] Rate limit exceeded! Error limit reached.');
        }
      } else {
        console.error(`[ESI] Network error: ${error.message}`);
      }
      throw error;
    });
  }

  /**
   * Get EVE server status
   * Endpoint: /status/
   * Returns: Server online status, player count, VIP mode
   */
  async getServerStatus() {
    const response = await this.client.get('/latest/status/');
    return response.data;
  }

  /**
   * Get information about a specific universe type (item)
   * Endpoint: /universe/types/{type_id}/
   * Returns: Type information including name, description, group
   */
  async getUniverseType(typeId: number) {
    const response = await this.client.get(`/latest/universe/types/${typeId}/`);
    return response.data;
  }

  /**
   * Get information about a specific universe group
   * Endpoint: /universe/groups/{group_id}/
   * Returns: Group information including category and types
   */
  async getUniverseGroup(groupId: number) {
    const response = await this.client.get(`/latest/universe/groups/${groupId}/`);
    return response.data;
  }

  /**
   * Get information about a specific universe category
   * Endpoint: /universe/categories/{category_id}/
   * Returns: Category information and related groups
   */
  async getUniverseCategory(categoryId: number) {
    const response = await this.client.get(`/latest/universe/categories/${categoryId}/`);
    return response.data;
  }

  /**
   * Get information about a solar system
   * Endpoint: /universe/systems/{system_id}/
   * Returns: System information including security, position, stations
   */
  async getSolarSystem(systemId: number) {
    const response = await this.client.get(`/latest/universe/systems/${systemId}/`);
    return response.data;
  }

  /**
   * Get market prices for all items
   * Endpoint: /markets/prices/
   * Returns: Average and adjusted prices for all tradable items
   */
  async getMarketPrices() {
    const response = await this.client.get('/latest/markets/prices/');
    return response.data;
  }

  /**
   * Get public information about a character
   * Endpoint: /characters/{character_id}/
   * Returns: Basic character information (name, corporation, etc.)
   */
  async getCharacterPublicInfo(characterId: number) {
    const response = await this.client.get(`/latest/characters/${characterId}/`);
    return response.data;
  }
}

// Example types based on ESI responses
export interface ServerStatus {
  players: number;
  server_version: string;
  start_time: string;
  vip?: boolean;
}

export interface UniverseType {
  type_id: number;
  name: string;
  description: string;
  published: boolean;
  group_id: number;
  mass?: number;
  volume?: number;
  capacity?: number;
  portion_size?: number;
  radius?: number;
}

export interface SolarSystem {
  system_id: number;
  name: string;
  constellation_id: number;
  security_status: number;
  star_id?: number;
  stargates?: number[];
  stations?: number[];
  planets?: Array<{
    planet_id: number;
    asteroid_belts?: number[];
    moons?: number[];
  }>;
  position: {
    x: number;
    y: number;
    z: number;
  };
}

export interface CharacterPublicInfo {
  name: string;
  corporation_id: number;
  birthday: string;
  gender: 'male' | 'female';
  race_id: number;
  bloodline_id: number;
  description?: string;
  alliance_id?: number;
  faction_id?: number;
  security_status?: number;
  title?: string;
}
