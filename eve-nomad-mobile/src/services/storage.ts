/**
 * EVE Nomad Mobile - Secure Storage Service
 *
 * Encrypted storage wrapper using MMKV for persisting sensitive data.
 */

// Note: MMKV is a native module that requires prebuild
// For development, we'll use a lazy initialization pattern
// Run `npx expo prebuild` to generate native files before using MMKV

let storage: any;

// Lazy initialize MMKV only when app runs (not during typecheck)
const getStorage = () => {
  if (!storage) {
    try {
      const { MMKV } = require('react-native-mmkv');
      storage = new MMKV({
        id: 'eve-nomad-storage',
      });
    } catch (error) {
      console.warn('MMKV not available, using fallback storage');
      // Fallback to in-memory storage for development
      const memoryStorage = new Map<string, string>();
      storage = {
        set: (key: string, value: string) => memoryStorage.set(key, value),
        getString: (key: string) => memoryStorage.get(key),
        delete: (key: string) => memoryStorage.delete(key),
        clearAll: () => memoryStorage.clear(),
        contains: (key: string) => memoryStorage.has(key),
      };
    }
  }
  return storage;
};

/**
 * Save a string value to secure storage
 */
export const setSecureItem = (key: string, value: string): void => {
  try {
    getStorage().set(key, value);
  } catch (error) {
    console.error(`Failed to save item to storage: ${key}`, error);
    throw error;
  }
};

/**
 * Retrieve a string value from secure storage
 */
export const getSecureItem = (key: string): string | undefined => {
  try {
    return getStorage().getString(key);
  } catch (error) {
    console.error(`Failed to retrieve item from storage: ${key}`, error);
    return undefined;
  }
};

/**
 * Remove an item from secure storage
 */
export const removeSecureItem = (key: string): void => {
  try {
    getStorage().delete(key);
  } catch (error) {
    console.error(`Failed to remove item from storage: ${key}`, error);
    throw error;
  }
};

/**
 * Clear all items from secure storage
 */
export const clearStorage = (): void => {
  try {
    getStorage().clearAll();
  } catch (error) {
    console.error('Failed to clear storage', error);
    throw error;
  }
};

/**
 * Check if a key exists in storage
 */
export const hasItem = (key: string): boolean => {
  try {
    return getStorage().contains(key);
  } catch (error) {
    console.error(`Failed to check if item exists: ${key}`, error);
    return false;
  }
};

/**
 * Save an object to storage (JSON serialized)
 */
export const setSecureObject = <T>(key: string, value: T): void => {
  try {
    const jsonValue = JSON.stringify(value);
    getStorage().set(key, jsonValue);
  } catch (error) {
    console.error(`Failed to save object to storage: ${key}`, error);
    throw error;
  }
};

/**
 * Retrieve an object from storage (JSON deserialized)
 */
export const getSecureObject = <T>(key: string): T | undefined => {
  try {
    const jsonValue = getStorage().getString(key);
    if (!jsonValue) return undefined;
    return JSON.parse(jsonValue) as T;
  } catch (error) {
    console.error(`Failed to retrieve object from storage: ${key}`, error);
    return undefined;
  }
};

// Token management helpers
export const saveToken = (token: string): void => {
  setSecureItem('jwt_token', token);
};

export const getToken = (): string | undefined => {
  return getSecureItem('jwt_token');
};

export const removeToken = (): void => {
  removeSecureItem('jwt_token');
};

export const saveRefreshToken = (refreshToken: string): void => {
  setSecureItem('refresh_token', refreshToken);
};

export const getRefreshToken = (): string | undefined => {
  return getSecureItem('refresh_token');
};

export const removeRefreshToken = (): void => {
  removeSecureItem('refresh_token');
};
