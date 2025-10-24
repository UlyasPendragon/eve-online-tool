/**
 * EVE Nomad Mobile - API Service Functions
 *
 * High-level API functions for interacting with the backend.
 */

import { apiClient, getErrorMessage } from './client';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  CharacterListResponse,
  SkillQueueResponse,
  WalletBalanceResponse,
  WalletTransactionsResponse,
  MarketOrdersResponse,
  UserResponse,
} from '../../types/api';

// ==============================================
// System & Health
// ==============================================

export interface HealthCheckResponse {
  status: 'ok' | 'error';
  timestamp: string;
  service: string;
  version?: string;
  uptime?: number;
}

/**
 * Test backend API connectivity
 * @returns Health check response from backend
 */
export const testHealthEndpoint = async (): Promise<HealthCheckResponse> => {
  try {
    const response = await apiClient.get<HealthCheckResponse>('/health');
    return response.data;
  } catch (error) {
    throw new Error(`Health check failed: ${getErrorMessage(error)}`);
  }
};

/**
 * Get API server information
 * @returns Server status and version info
 */
export const getServerInfo = async (): Promise<HealthCheckResponse> => {
  return testHealthEndpoint();
};

// ==============================================
// Authentication
// ==============================================

/**
 * Login with email and password
 */
export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  try {
    const response = await apiClient.post<LoginResponse>('/api/auth/login', credentials);
    return response.data;
  } catch (error) {
    throw new Error(`Login failed: ${getErrorMessage(error)}`);
  }
};

/**
 * Register a new user account
 */
export const register = async (credentials: RegisterRequest): Promise<RegisterResponse> => {
  try {
    const response = await apiClient.post<RegisterResponse>('/api/auth/register', credentials);
    return response.data;
  } catch (error) {
    throw new Error(`Registration failed: ${getErrorMessage(error)}`);
  }
};

/**
 * Logout current user
 */
export const logout = async (): Promise<void> => {
  try {
    await apiClient.post('/api/auth/logout');
  } catch (error) {
    throw new Error(`Logout failed: ${getErrorMessage(error)}`);
  }
};

/**
 * Initiate EVE SSO OAuth flow
 * @returns Authorization URL to redirect user to
 */
export const initiateEveSsoAuth = async (): Promise<{ authorizationUrl: string }> => {
  try {
    const response = await apiClient.get<{ authorizationUrl: string }>('/api/auth/eve-sso/login');
    return response.data;
  } catch (error) {
    throw new Error(`EVE SSO initiation failed: ${getErrorMessage(error)}`);
  }
};

// ==============================================
// User Profile
// ==============================================

/**
 * Get current user profile
 */
export const getCurrentUser = async (): Promise<UserResponse> => {
  try {
    const response = await apiClient.get<UserResponse>('/api/user/profile');
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch user profile: ${getErrorMessage(error)}`);
  }
};

// ==============================================
// Characters
// ==============================================

/**
 * Get list of user's EVE characters
 */
export const getCharacters = async (): Promise<CharacterListResponse> => {
  try {
    const response = await apiClient.get<CharacterListResponse>('/api/characters');
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch characters: ${getErrorMessage(error)}`);
  }
};

/**
 * Remove a character from user's account
 */
export const removeCharacter = async (characterId: string): Promise<void> => {
  try {
    await apiClient.delete(`/api/characters/${characterId}`);
  } catch (error) {
    throw new Error(`Failed to remove character: ${getErrorMessage(error)}`);
  }
};

// ==============================================
// Character Data (Skill Queue, Wallet, Market)
// ==============================================

/**
 * Get skill queue for a character
 */
export const getSkillQueue = async (characterId: string): Promise<SkillQueueResponse> => {
  try {
    const response = await apiClient.get<SkillQueueResponse>(
      `/api/characters/${characterId}/skills/queue`,
    );
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch skill queue: ${getErrorMessage(error)}`);
  }
};

/**
 * Get wallet balance for a character
 */
export const getWalletBalance = async (characterId: string): Promise<WalletBalanceResponse> => {
  try {
    const response = await apiClient.get<WalletBalanceResponse>(
      `/api/characters/${characterId}/wallet`,
    );
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch wallet balance: ${getErrorMessage(error)}`);
  }
};

/**
 * Get wallet transactions for a character
 */
export const getWalletTransactions = async (
  characterId: string,
): Promise<WalletTransactionsResponse> => {
  try {
    const response = await apiClient.get<WalletTransactionsResponse>(
      `/api/characters/${characterId}/wallet/transactions`,
    );
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch wallet transactions: ${getErrorMessage(error)}`);
  }
};

/**
 * Get market orders for a character
 */
export const getMarketOrders = async (characterId: string): Promise<MarketOrdersResponse> => {
  try {
    const response = await apiClient.get<MarketOrdersResponse>(
      `/api/characters/${characterId}/market/orders`,
    );
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch market orders: ${getErrorMessage(error)}`);
  }
};

// Export everything from client for convenience
export { apiClient, getErrorMessage } from './client';
export type { ApiError } from './client';

// Export types from api types file
export type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  Character,
  CharacterListResponse,
  SkillQueueItem,
  SkillQueueResponse,
  WalletBalanceResponse,
  WalletTransaction,
  WalletTransactionsResponse,
  MarketOrder,
  MarketOrdersResponse,
  User,
  UserResponse,
} from '../../types/api';
