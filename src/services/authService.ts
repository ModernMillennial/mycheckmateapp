import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Crypto from 'expo-crypto';

export interface AuthState {
  isAuthenticated: boolean;
  biometricEnabled: boolean;
  passcodeEnabled: boolean;
  user: {
    id: string;
    email?: string;
    lastLogin: string;
  } | null;
}

export interface AuthError {
  code: string;
  message: string;
}

class AuthService {
  private static instance: AuthService;
  private authState: AuthState = {
    isAuthenticated: false,
    biometricEnabled: false,
    passcodeEnabled: false,
    user: null,
  };

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Initialize authentication system
  async initialize(): Promise<AuthState> {
    try {
      const storedAuth = await AsyncStorage.getItem('@auth_state');
      if (storedAuth) {
        const parsedAuth = JSON.parse(storedAuth);
        this.authState = { ...this.authState, ...parsedAuth, isAuthenticated: false };
      }
      
      // Check biometric availability
      const biometricAvailable = await LocalAuthentication.hasHardwareAsync();
      const biometricEnrolled = await LocalAuthentication.isEnrolledAsync();
      
      if (biometricAvailable && biometricEnrolled && this.authState.biometricEnabled) {
        // Biometric is available and user has it enabled
      }
      
      return this.authState;
    } catch (error) {
      console.error('Auth initialization error:', error);
      return this.authState;
    }
  }

  // Set up user authentication
  async setupAuthentication(email: string, passcode: string, enableBiometric: boolean = true): Promise<{ success: boolean; error?: AuthError }> {
    try {
      // Hash the passcode for security
      const hashedPasscode = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        passcode + 'checkmate_salt'
      );

      const userId = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        email + Date.now().toString()
      );

      // Check biometric availability
      let biometricEnabled = false;
      if (enableBiometric) {
        const biometricAvailable = await LocalAuthentication.hasHardwareAsync();
        const biometricEnrolled = await LocalAuthentication.isEnrolledAsync();
        biometricEnabled = biometricAvailable && biometricEnrolled;
      }

      this.authState = {
        isAuthenticated: true,
        biometricEnabled,
        passcodeEnabled: true,
        user: {
          id: userId,
          email,
          lastLogin: new Date().toISOString(),
        },
      };

      // Store authentication data
      await AsyncStorage.setItem('@auth_state', JSON.stringify({
        biometricEnabled: this.authState.biometricEnabled,
        passcodeEnabled: this.authState.passcodeEnabled,
        user: this.authState.user,
      }));

      await AsyncStorage.setItem('@user_passcode', hashedPasscode);

      return { success: true };
    } catch (error) {
      console.error('Setup authentication error:', error);
      return {
        success: false,
        error: {
          code: 'SETUP_FAILED',
          message: 'Failed to set up authentication. Please try again.',
        },
      };
    }
  }

  // Authenticate with biometric
  async authenticateWithBiometric(): Promise<{ success: boolean; error?: AuthError }> {
    try {
      if (!this.authState.biometricEnabled) {
        return {
          success: false,
          error: {
            code: 'BIOMETRIC_NOT_ENABLED',
            message: 'Biometric authentication is not enabled.',
          },
        };
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access CheckMate',
        subtitle: 'Use your biometric to securely access your financial data',
        cancelLabel: 'Use Passcode',
        fallbackLabel: 'Use Passcode',
        disableDeviceFallback: false,
      });

      if (result.success) {
        this.authState.isAuthenticated = true;
        this.authState.user = {
          ...this.authState.user!,
          lastLogin: new Date().toISOString(),
        };
        
        await this.updateStoredAuthState();
        return { success: true };
      } else {
        return {
          success: false,
          error: {
            code: 'BIOMETRIC_FAILED',
            message: result.error || 'Biometric authentication failed',
          },
        };
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return {
        success: false,
        error: {
          code: 'BIOMETRIC_ERROR',
          message: 'An error occurred during biometric authentication.',
        },
      };
    }
  }

  // Authenticate with passcode
  async authenticateWithPasscode(passcode: string): Promise<{ success: boolean; error?: AuthError }> {
    try {
      const storedHashedPasscode = await AsyncStorage.getItem('@user_passcode');
      if (!storedHashedPasscode) {
        return {
          success: false,
          error: {
            code: 'NO_PASSCODE',
            message: 'No passcode found. Please set up authentication first.',
          },
        };
      }

      const hashedInputPasscode = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        passcode + 'checkmate_salt'
      );

      if (hashedInputPasscode === storedHashedPasscode) {
        this.authState.isAuthenticated = true;
        this.authState.user = {
          ...this.authState.user!,
          lastLogin: new Date().toISOString(),
        };
        
        await this.updateStoredAuthState();
        return { success: true };
      } else {
        return {
          success: false,
          error: {
            code: 'INVALID_PASSCODE',
            message: 'Invalid passcode. Please try again.',
          },
        };
      }
    } catch (error) {
      console.error('Passcode authentication error:', error);
      return {
        success: false,
        error: {
          code: 'PASSCODE_ERROR',
          message: 'An error occurred during passcode authentication.',
        },
      };
    }
  }

  // Check if user needs to authenticate
  async requiresAuthentication(): Promise<boolean> {
    const lastLogin = this.authState.user?.lastLogin;
    if (!lastLogin) return true;

    // Require re-authentication after 15 minutes of inactivity
    const sessionTimeout = 15 * 60 * 1000; // 15 minutes in milliseconds
    const timeSinceLastLogin = Date.now() - new Date(lastLogin).getTime();
    
    if (timeSinceLastLogin > sessionTimeout) {
      this.authState.isAuthenticated = false;
      return true;
    }

    return !this.authState.isAuthenticated;
  }

  // Update activity timestamp
  async updateActivity(): Promise<void> {
    if (this.authState.isAuthenticated && this.authState.user) {
      this.authState.user.lastLogin = new Date().toISOString();
      await this.updateStoredAuthState();
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    this.authState.isAuthenticated = false;
    // Keep user settings but clear authentication
    await this.updateStoredAuthState();
  }

  // Reset all authentication data
  async resetAuthentication(): Promise<void> {
    await AsyncStorage.removeItem('@auth_state');
    await AsyncStorage.removeItem('@user_passcode');
    this.authState = {
      isAuthenticated: false,
      biometricEnabled: false,
      passcodeEnabled: false,
      user: null,
    };
  }

  // Get current authentication state
  getAuthState(): AuthState {
    return { ...this.authState };
  }

  // Check if biometric is available
  async isBiometricAvailable(): Promise<boolean> {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    return hasHardware && isEnrolled;
  }

  // Get supported biometric types
  async getSupportedBiometricTypes(): Promise<LocalAuthentication.AuthenticationType[]> {
    return await LocalAuthentication.supportedAuthenticationTypesAsync();
  }

  // Toggle biometric authentication
  async toggleBiometric(enabled: boolean): Promise<{ success: boolean; error?: AuthError }> {
    try {
      if (enabled) {
        const isAvailable = await this.isBiometricAvailable();
        if (!isAvailable) {
          return {
            success: false,
            error: {
              code: 'BIOMETRIC_NOT_AVAILABLE',
              message: 'Biometric authentication is not available on this device.',
            },
          };
        }
      }

      this.authState.biometricEnabled = enabled;
      await this.updateStoredAuthState();
      return { success: true };
    } catch (error) {
      console.error('Toggle biometric error:', error);
      return {
        success: false,
        error: {
          code: 'TOGGLE_BIOMETRIC_ERROR',
          message: 'Failed to update biometric setting.',
        },
      };
    }
  }

  // Change passcode
  async changePasscode(oldPasscode: string, newPasscode: string): Promise<{ success: boolean; error?: AuthError }> {
    try {
      // Verify old passcode first
      const authResult = await this.authenticateWithPasscode(oldPasscode);
      if (!authResult.success) {
        return {
          success: false,
          error: {
            code: 'INVALID_OLD_PASSCODE',
            message: 'Current passcode is incorrect.',
          },
        };
      }

      // Hash new passcode
      const hashedNewPasscode = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        newPasscode + 'checkmate_salt'
      );

      await AsyncStorage.setItem('@user_passcode', hashedNewPasscode);
      return { success: true };
    } catch (error) {
      console.error('Change passcode error:', error);
      return {
        success: false,
        error: {
          code: 'CHANGE_PASSCODE_ERROR',
          message: 'Failed to change passcode.',
        },
      };
    }
  }

  private async updateStoredAuthState(): Promise<void> {
    await AsyncStorage.setItem('@auth_state', JSON.stringify({
      biometricEnabled: this.authState.biometricEnabled,
      passcodeEnabled: this.authState.passcodeEnabled,
      user: this.authState.user,
    }));
  }
}

export default AuthService.getInstance();