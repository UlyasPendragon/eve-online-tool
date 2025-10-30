/**
 * EVE Nomad Mobile - useLogout Hook
 *
 * React Query hook for logout with cache invalidation.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { logout as logoutService } from '../../services/auth/logout.service';
import { useAuthStore } from '../../stores';

interface UseLogoutResult {
  logout: () => Promise<void>;
  isLoggingOut: boolean;
  error: Error | null;
}

/**
 * Hook for logging out user
 *
 * Performs complete logout:
 * - Calls backend logout endpoint
 * - Clears all tokens from storage
 * - Clears React Query cache
 * - Navigates to login screen
 *
 * @example
 * ```tsx
 * const { logout, isLoggingOut } = useLogout();
 *
 * const handleLogout = async () => {
 *   await logout();
 * };
 * ```
 */
export const useLogout = (): UseLogoutResult => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const authStore = useAuthStore();

  const mutation = useMutation({
    mutationFn: async () => {
      // Call logout service
      await logoutService();

      // Clear Zustand auth store
      authStore.logout();
      console.log('[useLogout] Auth store cleared');

      // Clear all React Query cache
      queryClient.clear();
      console.log('[useLogout] React Query cache cleared');
    },
    onSuccess: () => {
      console.log('[useLogout] Logout successful, navigating to login');
      // Navigate to login screen
      router.replace('/login');
    },
    onError: (error) => {
      console.error('[useLogout] Logout failed:', error);
      // Clear store even if backend logout fails (for security)
      authStore.logout();
      // Even if logout fails, navigate to login for security
      router.replace('/login');
    },
  });

  return {
    logout: mutation.mutateAsync,
    isLoggingOut: mutation.isPending,
    error: mutation.error,
  };
};
