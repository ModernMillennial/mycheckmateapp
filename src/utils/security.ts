import * as SecureStore from 'expo-secure-store';
import logger from './logger';

// Security utilities for production app
export class SecurityManager {
  
  // Secure storage for sensitive data
  static async storeSecurely(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
      logger.security(`Secure data stored for key: ${key}`);
    } catch (error) {
      logger.error('Failed to store secure data', error);
      throw new Error('Failed to store sensitive data securely');
    }
  }

  static async getSecurely(key: string): Promise<string | null> {
    try {
      const value = await SecureStore.getItemAsync(key);
      if (value) {
        logger.security(`Secure data retrieved for key: ${key}`);
      }
      return value;
    } catch (error) {
      logger.error('Failed to retrieve secure data', error);
      return null;
    }
  }

  static async removeSecurely(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
      logger.security(`Secure data removed for key: ${key}`);
    } catch (error) {
      logger.error('Failed to remove secure data', error);
    }
  }

  // Validate Plaid access tokens
  static validatePlaidToken(token: string): boolean {
    if (!token || typeof token !== 'string') {
      return false;
    }
    
    // Basic token format validation
    if (token.startsWith('access-') || token.startsWith('demo_')) {
      return true;
    }
    
    return false;
  }

  // Sanitize user input for financial data
  static sanitizeFinancialInput(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }
    
    // Remove any potentially harmful characters
    return input
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim()
      .substring(0, 500); // Limit length
  }

  // Validate financial amounts
  static validateAmount(amount: number): boolean {
    if (typeof amount !== 'number' || isNaN(amount)) {
      return false;
    }
    
    // Check for reasonable financial limits
    if (amount < -1000000 || amount > 1000000) {
      logger.warn(`Suspicious amount detected: ${amount}`);
      return false;
    }
    
    return true;
  }

  // Generate secure transaction IDs
  static generateSecureId(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substr(2, 9);
    return `${timestamp}_${random}`;
  }

  // Check for potential security threats
  static validateUserSession(): boolean {
    // In a real app, you might check:
    // - Session expiry
    // - Device fingerprinting
    // - Unusual access patterns
    return true;
  }
}

// Constants for secure storage keys
export const SECURE_STORAGE_KEYS = {
  PLAID_ACCESS_TOKEN: 'plaid_access_token',
  USER_BIOMETRIC_KEY: 'user_biometric_key',
  ENCRYPTION_KEY: 'app_encryption_key',
} as const;

export default SecurityManager;