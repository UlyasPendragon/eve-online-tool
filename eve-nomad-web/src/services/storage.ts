/**
 * EVE Nomad Web - Storage Service
 *
 * Browser localStorage wrapper for persisting data.
 * Maintains same API as mobile MMKV storage for compatibility.
 */

/**
 * Save a string value to storage
 */
export const setSecureItem = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    // Handle quota exceeded or private browsing mode
    console.error(`Failed to save item to storage: ${key}`, error);
    throw error;
  }
};

/**
 * Retrieve a string value from storage
 */
export const getSecureItem = (key: string): string | undefined => {
  try {
    const value = localStorage.getItem(key);
    return value ?? undefined;
  } catch (error) {
    console.error(`Failed to retrieve item from storage: ${key}`, error);
    return undefined;
  }
};

/**
 * Remove an item from storage
 */
export const removeSecureItem = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Failed to remove item from storage: ${key}`, error);
    throw error;
  }
};

/**
 * Clear all items from storage
 */
export const clearStorage = (): void => {
  try {
    localStorage.clear();
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
    return localStorage.getItem(key) !== null;
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
    localStorage.setItem(key, jsonValue);
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
    const jsonValue = localStorage.getItem(key);
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
