import * as SecureStore from 'expo-secure-store';
import errorHandler from './errorHandler';

/**
 * Secure storage utility for sensitive data
 */
class SecureStorage {
  /**
   * Store a value securely
   * @param key - The key to store the value under
   * @param value - The value to store
   */
  async setItem(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      errorHandler.handleError(error, false);
      throw new Error(`Failed to store item securely: ${key}`);
    }
  }

  /**
   * Retrieve a value from secure storage
   * @param key - The key to retrieve
   * @returns The stored value, or null if not found
   */
  async getItem(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      errorHandler.handleError(error, false);
      return null;
    }
  }

  /**
   * Delete a value from secure storage
   * @param key - The key to delete
   */
  async removeItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      errorHandler.handleError(error, false);
    }
  }

  /**
   * Store an object securely (JSON serialized)
   * @param key - The key to store the object under
   * @param value - The object to store
   */
  async setObject<T>(key: string, value: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await this.setItem(key, jsonValue);
    } catch (error) {
      errorHandler.handleError(error, false);
      throw new Error(`Failed to store object securely: ${key}`);
    }
  }

  /**
   * Retrieve an object from secure storage
   * @param key - The key to retrieve
   * @returns The stored object, or null if not found
   */
  async getObject<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await this.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) as T : null;
    } catch (error) {
      errorHandler.handleError(error, false);
      return null;
    }
  }
}

export default new SecureStorage();
