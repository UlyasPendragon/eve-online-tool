import { create } from 'zustand';

/**
 * Settings store state and actions
 */
interface SettingsState {
  // State
  theme: 'dark' | 'light';
  language: string;

  // Actions
  setTheme: (theme: 'dark' | 'light') => void;
  setLanguage: (language: string) => void;
}

/**
 * Settings store for managing app preferences
 *
 * @example
 * ```tsx
 * const { theme, language, setTheme, setLanguage } = useSettingsStore();
 *
 * // Change theme
 * setTheme('light');
 *
 * // Change language
 * setLanguage('en');
 * ```
 */
export const useSettingsStore = create<SettingsState>((set) => ({
  // Initial state
  theme: 'dark', // EVE Online dark theme by default
  language: 'en',

  // Actions
  setTheme: (theme: 'dark' | 'light') =>
    set({
      theme,
    }),

  setLanguage: (language: string) =>
    set({
      language,
    }),
}));
