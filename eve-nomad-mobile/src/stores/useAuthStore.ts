import { create } from 'zustand';

/**
 * User object stored in auth state
 */
export interface User {
  id: string;
  email: string;
}

/**
 * Auth store state and actions
 */
interface AuthState {
  // State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;

  // Actions
  login: (token: string, user: User) => void;
  logout: () => void;
  updateToken: (token: string) => void;
}

/**
 * Auth store for managing user authentication state
 *
 * @example
 * ```tsx
 * const { isAuthenticated, user, login, logout } = useAuthStore();
 *
 * // Login
 * login('jwt-token', { id: '123', email: 'user@example.com' });
 *
 * // Logout
 * logout();
 * ```
 */
export const useAuthStore = create<AuthState>((set) => ({
  // Initial state
  user: null,
  token: null,
  isAuthenticated: false,

  // Actions
  login: (token: string, user: User) =>
    set({
      token,
      user,
      isAuthenticated: true,
    }),

  logout: () =>
    set({
      token: null,
      user: null,
      isAuthenticated: false,
    }),

  updateToken: (token: string) =>
    set((state) => ({
      ...state,
      token,
    })),
}));
