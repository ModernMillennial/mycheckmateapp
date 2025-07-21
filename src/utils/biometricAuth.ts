import * as LocalAuthentication from 'expo-local-authentication';
import secureStorage from './secureStorage';
import errorHandler from './errorHandler';

// Constants
const BIOMETRIC_ENABLED_KEY = 'biometric_auth_enabled';

/**
 * Biometric authentication utility
 */
class BiometricAuth {
  /**
   * Check if biometric authentication is available on the device
   * @returns True if biometric authentication is available
   */
  async isBiometricAvailable(): Promise<boolean> {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      if (!compatible) return false;
      
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      return enrolled;
    } catch (error) {
      errorHandler.handleError(error, false);
      return false;
    }
  }

  /**
   * Check if biometric authentication is enabled by the user
   * @returns True if biometric authentication is enabled
   */
  async isBiometricEnabled(): Promise<boolean> {
    try {
      const enabled = await secureStorage.getItem(BIOMETRIC_ENABLED_KEY);
      return enabled === 'true';
    } catch (error) {
      errorHandler.handleError(error, false);
      return false;
    }
  }

  /**
   * Enable or disable biometric authentication
   * @param enabled - Whether to enable biometric authentication
   */
  async setBiometricEnabled(enabled: boolean): Promise<void> {
    try {
      await secureStorage.setItem(BIOMETRIC_ENABLED_KEY, enabled ? 'true' : 'false');
    } catch (error) {
      errorHandler.handleError(error, false);
    }
  }

  /**
   * Authenticate the user using biometrics
   * @param promptMessage - Message to display to the user
   * @returns True if authentication was successful
   */
  async authenticate(promptMessage: string = 'Authenticate to continue'): Promise<boolean> {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        fallbackLabel: 'Use passcode',
      });
      
      return result.success;
    } catch (error) {
      errorHandler.handleError(error, false);
      return false;
    }
  }

  /**
   * Get the available biometric types
   * @returns Array of available biometric types
   */
  async getBiometricTypes(): Promise<LocalAuthentication.AuthenticationType[]> {
    try {
      return await LocalAuthentication.supportedAuthenticationTypesAsync();
    } catch (error) {
      errorHandler.handleError(error, false);
      return [];
    }
  }

  /**
   * Get a user-friendly name for the available biometric type
   * @returns String describing the biometric type (Face ID, Touch ID, Fingerprint, etc.)
   */
  async getBiometricName(): Promise<string> {
    try {
      const types = await this.getBiometricTypes();
      
      if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        return 'Face ID';
      } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        return 'Touch ID/Fingerprint';
      } else {
        return 'Biometric Authentication';
      }
    } catch (error) {
      errorHandler.handleError(error, false);
      return 'Biometric Authentication';
    }
  }
}

export default new BiometricAuth();
