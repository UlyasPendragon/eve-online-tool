/**
 * EVE Nomad - Logout Service
 *
 * Handles complete logout flow with token cleanup and state reset.
 * Shared between mobile and web applications.
 */

import { apiClient } from '../api/client';
import { removeToken, removeRefreshToken, clearStorage, getToken } from '../storage';

/**
 * Perform complete logout
 *
 * Steps:
 * 1. Call backend logout endpoint to invalidate session
 * 2. Clear JWT token from storage
 * 3. Clear refresh token from storage
 * 4. Clear all other stored data
 *
 * @throws Error if logout fails
 */
export const logout = async (): Promise<void> => {
  try {
    console.log('[Logout Service] Starting logout process...');

    // Step 1: Call backend logout endpoint
    try {
      await apiClient.delete('/auth/logout');
      console.log('[Logout Service] Backend session invalidated');
    } catch (error) {
      // Even if backend call fails, continue with local cleanup
      console.warn('[Logout Service] Backend logout failed, continuing with local cleanup:', error);
    }

    // Step 2: Clear JWT token
    removeToken();
    console.log('[Logout Service] JWT token cleared');

    // Step 3: Clear refresh token
    removeRefreshToken();
    console.log('[Logout Service] Refresh token cleared');

    // Step 4: Clear all other stored data
    // Note: clearStorage() will remove ALL data from localStorage
    // If we want to preserve some data (like app settings), we should selectively remove items instead
    clearStorage();
    console.log('[Logout Service] All storage cleared');

    console.log('[Logout Service] Logout completed successfully');
  } catch (error) {
    console.error('[Logout Service] Error during logout:', error);
    throw error;
  }
};

/**
 * Check if user is currently authenticated
 *
 * @returns true if token exists (does NOT validate expiry)
 */
export const isAuthenticated = (): boolean => {
  const token = getToken();
  return !!token;
};
