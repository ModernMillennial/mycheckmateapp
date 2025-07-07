import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import EmailService from './emailService';

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

interface PasswordResetToken {
  token: string;
  email: string;
  expiresAt: number;
  createdAt: number;
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
      
      // Clean up expired reset tokens on initialization
      await this.cleanupExpiredTokens();
      
      // Biometric authentication is not available in this build
      // For production apps, you would install expo-local-authentication package
      
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

      // Biometric authentication is not available in this build
      let biometricEnabled = false;
      // For production apps, you would install expo-local-authentication package

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

      // Biometric authentication is not available in this build
      return {
        success: false,
        error: {
          code: 'BIOMETRIC_NOT_AVAILABLE',
          message: 'Biometric authentication is not available in this version.',
        },
      };
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
    // Biometric authentication is not available in this build
    return false;
  }

  // Get supported biometric types
  async getSupportedBiometricTypes(): Promise<string[]> {
    // Biometric authentication is not available in this build
    return [];
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

  // Request password reset
  async requestPasswordReset(email: string): Promise<{ success: boolean; error?: AuthError }> {
    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return {
          success: false,
          error: {
            code: 'INVALID_EMAIL',
            message: 'Please enter a valid email address.',
          },
        };
      }

      // Check if email service is available
      const emailServiceAvailable = await EmailService.isAvailable();
      if (!emailServiceAvailable) {
        return {
          success: false,
          error: {
            code: 'EMAIL_NOT_AVAILABLE',
            message: 'Email service is not available. Please check your device email configuration.',
          },
        };
      }

      // Send password reset email
      const emailResult = await EmailService.sendPasswordResetEmail(email);
      
      if (!emailResult.success) {
        return {
          success: false,
          error: emailResult.error || {
            code: 'EMAIL_SEND_FAILED',
            message: 'Failed to send password reset email.',
          },
        };
      }

      // Store the reset token with expiration (1 hour)
      if (emailResult.resetToken) {
        const resetTokenData: PasswordResetToken = {
          token: emailResult.resetToken,
          email: email.toLowerCase(),
          expiresAt: Date.now() + (60 * 60 * 1000), // 1 hour from now
          createdAt: Date.now(),
        };

        await AsyncStorage.setItem(`@reset_token_${emailResult.resetToken}`, JSON.stringify(resetTokenData));
        
        // Also store a mapping from email to token for validation
        await AsyncStorage.setItem(`@reset_email_${email.toLowerCase()}`, emailResult.resetToken);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Password reset request error:', error);
      return {
        success: false,
        error: {
          code: 'RESET_REQUEST_ERROR',
          message: 'Failed to send password reset email. Please try again.',
        },
      };
    }
  }

  // Validate reset token
  async validateResetToken(token: string): Promise<{ valid: boolean; email?: string; error?: AuthError }> {
    try {
      const resetTokenData = await AsyncStorage.getItem(`@reset_token_${token}`);
      
      if (!resetTokenData) {
        return {
          valid: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'Invalid or expired reset token.',
          },
        };
      }

      const tokenData: PasswordResetToken = JSON.parse(resetTokenData);
      
      // Check if token is expired
      if (Date.now() > tokenData.expiresAt) {
        // Clean up expired token
        await AsyncStorage.removeItem(`@reset_token_${token}`);
        await AsyncStorage.removeItem(`@reset_email_${tokenData.email}`);
        
        return {
          valid: false,
          error: {
            code: 'TOKEN_EXPIRED',
            message: 'Reset token has expired. Please request a new password reset.',
          },
        };
      }

      return {
        valid: true,
        email: tokenData.email,
      };
    } catch (error) {
      console.error('Token validation error:', error);
      return {
        valid: false,
        error: {
          code: 'TOKEN_VALIDATION_ERROR',
          message: 'Error validating reset token.',
        },
      };
    }
  }

  // Reset password with token
  async resetPasswordWithToken(token: string, newPassword: string): Promise<{ success: boolean; error?: AuthError }> {
    try {
      // Validate the token first
      const tokenValidation = await this.validateResetToken(token);
      
      if (!tokenValidation.valid) {
        return {
          success: false,
          error: tokenValidation.error,
        };
      }

      const email = tokenValidation.email!;

      // Hash the new password
      const hashedNewPassword = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        newPassword + 'checkmate_salt'
      );

      // Update the stored password
      await AsyncStorage.setItem('@user_passcode', hashedNewPassword);

      // Update user email in auth state if it matches
      if (this.authState.user && this.authState.user.email === email) {
        this.authState.user.lastLogin = new Date().toISOString();
        await this.updateStoredAuthState();
      } else {
        // Create/update user record for this email
        const userId = await Crypto.digestStringAsync(
          Crypto.CryptoDigestAlgorithm.SHA256,
          email + Date.now().toString()
        );

        this.authState.user = {
          id: userId,
          email: email,
          lastLogin: new Date().toISOString(),
        };
        
        this.authState.passcodeEnabled = true;
        await this.updateStoredAuthState();
      }

      // Clean up the used token
      await AsyncStorage.removeItem(`@reset_token_${token}`);
      await AsyncStorage.removeItem(`@reset_email_${email}`);

      return { success: true };
    } catch (error) {
      console.error('Password reset error:', error);
      return {
        success: false,
        error: {
          code: 'RESET_PASSWORD_ERROR',
          message: 'Failed to reset password. Please try again.',
        },
      };
    }
  }

  // Check if there's a pending reset token for an email
  async hasPendingResetToken(email: string): Promise<boolean> {
    try {
      const tokenId = await AsyncStorage.getItem(`@reset_email_${email.toLowerCase()}`);
      if (!tokenId) return false;

      const tokenData = await AsyncStorage.getItem(`@reset_token_${tokenId}`);
      if (!tokenData) return false;

      const resetToken: PasswordResetToken = JSON.parse(tokenData);
      return Date.now() < resetToken.expiresAt;
    } catch (error) {
      console.error('Error checking pending reset token:', error);
      return false;
    }
  }

  // Clean up expired tokens (call this periodically)
  async cleanupExpiredTokens(): Promise<void> {
    try {
      // This is a simplified cleanup - in production you'd want a more efficient approach
      const allKeys = await AsyncStorage.getAllKeys();
      const tokenKeys = allKeys.filter(key => key.startsWith('@reset_token_'));

      for (const key of tokenKeys) {
        const tokenData = await AsyncStorage.getItem(key);
        if (tokenData) {
          const resetToken: PasswordResetToken = JSON.parse(tokenData);
          if (Date.now() > resetToken.expiresAt) {
            await AsyncStorage.removeItem(key);
            await AsyncStorage.removeItem(`@reset_email_${resetToken.email}`);
          }
        }
      }
    } catch (error) {
      console.error('Error cleaning up expired tokens:', error);
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