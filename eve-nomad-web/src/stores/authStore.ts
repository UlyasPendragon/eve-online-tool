/**
 * EVE Nomad Web - Authentication Store
 *
 * Zustand store for managing authentication state on web platform.
 * Provides centralized auth state management with localStorage persistence.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getToken, removeToken } from '../services/storage';

/**
 * User data structure
 */
export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  subscriptionTier: 'free' | 'premium';
  createdAt?: string;
}

/**
 * Authentication state
 */
interface AuthState {
  /** Current authenticated user (null if not logged in) */
  user: User | null;
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  /** Whether auth state has been initialized from storage */
  isInitialized: boolean;
}

/**
 * Authentication actions
 */
interface AuthActions {
  /** Set user data after successful login */
  setUser: (user: User | null) => void;
  /** Clear user data and logout */
  logout: () => void;
  /** Initialize auth state from storage */
  initialize: () => void;
  /** Update user data (e.g., after profile update) */
  updateUser: (updates: Partial<User>) => void;
}

/**
 * Combined auth store type
 */
export type AuthStore = AuthState & AuthActions;

/**
 * Default initial state
 */
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isInitialized: false,
};

/**
 * Authentication Store
 *
 * Manages user authentication state with persistence.
 * Automatically syncs with localStorage for persistence across sessions.
 *
 * @example
 * ```tsx
 * import { useAuthStore } from '@/stores/authStore';
 *
 * function ProfileButton() {
 *   const { user, logout } = useAuthStore();
 *
 *   if (!user) return <LoginButton />;
 *
 *   return (
 *     <div>
 *       <span>{user.email}</span>
 *       <button onClick={logout}>Logout</button>
 *     </div>
 *   );
 * }
 * ```
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      ...initialState,

      // Actions
      setUser: (user) => {
        set({
          user,
          isAuthenticated: !!user,
          isInitialized: true,
        });
      },

      logout: () => {
        // Clear tokens from storage
        removeToken();

        // Reset state
        set({
          user: null,
          isAuthenticated: false,
          isInitialized: true,
        });

        console.log('[AuthStore] User logged out, state cleared');
      },

      initialize: () => {
        // Check if user has valid token
        const token = getToken();

        if (!token) {
          // No token, mark as initialized with no user
          set({
            user: null,
            isAuthenticated: false,
            isInitialized: true,
          });
        } else {
          // Token exists, but we need to verify it with backend
          // For now, just mark as initialized
          // The AuthGuard component will handle token validation
          set({ isInitialized: true });
        }
      },

      updateUser: (updates) => {
        const currentUser = get().user;
        if (!currentUser) {
          console.warn('[AuthStore] Cannot update user: no user logged in');
          return;
        }

        set({
          user: {
            ...currentUser,
            ...updates,
          },
        });

        console.log('[AuthStore] User data updated:', updates);
      },
    }),
    {
      name: 'eve-nomad-auth', // localStorage key
      storage: createJSONStorage(() => localStorage),
      // Only persist user data, not initialization state
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

/**
 * Selector hooks for common auth queries
 */

/**
 * Get current user
 */
export const useUser = () => useAuthStore((state) => state.user);

/**
 * Get authentication status
 */
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);

/**
 * Get initialization status
 */
export const useIsInitialized = () => useAuthStore((state) => state.isInitialized);

/**
 * Get auth actions
 */
export const useAuthActions = () =>
  useAuthStore((state) => ({
    setUser: state.setUser,
    logout: state.logout,
    initialize: state.initialize,
    updateUser: state.updateUser,
  }));
