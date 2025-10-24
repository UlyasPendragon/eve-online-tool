/**
 * Authentication Mutation Hooks - EVE Nomad Mobile
 *
 * React Query mutation hooks for authentication operations.
 */

import { useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
import {
  login,
  register,
  logout,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from '../../services/api';
import { saveToken, removeToken } from '../../services/storage';
import { queryKeys } from './keys';

/**
 * Login mutation hook
 *
 * @returns Mutation result for login operation
 *
 * @example
 * ```tsx
 * function LoginForm() {
 *   const loginMutation = useLogin();
 *
 *   const handleLogin = () => {
 *     loginMutation.mutate(
 *       { email: 'user@example.com', password: 'password' },
 *       {
 *         onSuccess: (data) => {
 *           console.log('Logged in:', data.user);
 *           // Navigate to app
 *         },
 *         onError: (error) => {
 *           console.error('Login failed:', error.message);
 *         },
 *       }
 *     );
 *   };
 *
 *   return (
 *     <Button
 *       title="Login"
 *       onPress={handleLogin}
 *       loading={loginMutation.isPending}
 *     />
 *   );
 * }
 * ```
 */
export function useLogin(): UseMutationResult<LoginResponse, Error, LoginRequest, unknown> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginRequest) => login(credentials),
    onSuccess: (data) => {
      // Save JWT token to secure storage
      saveToken(data.token);

      // Invalidate and refetch user data
      queryClient.invalidateQueries({
        queryKey: queryKeys.auth.all,
      });
    },
  });
}

/**
 * Register mutation hook
 *
 * @returns Mutation result for registration operation
 *
 * @example
 * ```tsx
 * function RegisterForm() {
 *   const registerMutation = useRegister();
 *
 *   const handleRegister = () => {
 *     registerMutation.mutate(
 *       { email: 'user@example.com', password: 'password' },
 *       {
 *         onSuccess: (data) => {
 *           console.log('Registered:', data.userId);
 *           if (data.emailVerificationRequired) {
 *             // Show email verification message
 *           }
 *         },
 *         onError: (error) => {
 *           console.error('Registration failed:', error.message);
 *         },
 *       }
 *     );
 *   };
 *
 *   return (
 *     <Button
 *       title="Register"
 *       onPress={handleRegister}
 *       loading={registerMutation.isPending}
 *     />
 *   );
 * }
 * ```
 */
export function useRegister(): UseMutationResult<
  RegisterResponse,
  Error,
  RegisterRequest,
  unknown
> {
  return useMutation({
    mutationFn: (credentials: RegisterRequest) => register(credentials),
  });
}

/**
 * Logout mutation hook
 *
 * Performs complete logout with backend session invalidation,
 * token cleanup, cache clearing, and navigation to login screen.
 *
 * @returns Mutation result for logout operation
 *
 * @example
 * ```tsx
 * function LogoutButton() {
 *   const logoutMutation = useLogout();
 *
 *   const handleLogout = () => {
 *     logoutMutation.mutate(undefined, {
 *       onSuccess: () => {
 *         console.log('Logged out successfully');
 *       },
 *     });
 *   };
 *
 *   return (
 *     <Button
 *       title="Logout"
 *       onPress={handleLogout}
 *       loading={logoutMutation.isPending}
 *     />
 *   );
 * }
 * ```
 */
export function useLogout(): UseMutationResult<void, Error, void, unknown> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      console.log('[useLogout] Backend logout successful');

      // Remove tokens from storage
      removeToken();
      console.log('[useLogout] Tokens cleared from storage');

      // Clear all cached data
      queryClient.clear();
      console.log('[useLogout] React Query cache cleared');

      // Note: Navigation to login screen should be handled by the component
      // using this hook, typically with router.replace('/login') in onSuccess
    },
    onError: (error) => {
      console.error('[useLogout] Logout error:', error);

      // Even if backend logout fails, clear local data for security
      removeToken();
      queryClient.clear();
    },
  });
}
