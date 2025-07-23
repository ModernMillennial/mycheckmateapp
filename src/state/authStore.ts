import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  rememberMe: boolean;
  rememberedCredentials: { email: string; password: string } | null;
  _hasHydrated: boolean;
  biometricEnabled: boolean;
  loginWithBiometrics: () => Promise<boolean>;
  
  // Actions
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<boolean>;
  logout: () => void;
  deleteAccount: () => void;
  setLoading: (loading: boolean) => void;
  clearRememberedCredentials: () => void;
  setHasHydrated: (hasHydrated: boolean) => void;
  resetAuthState: () => void;
}

// Authentication service - Mock implementation for testing
const authService = {
  async login(email: string, password: string): Promise<User> {
    // Mock test credentials for development
    const testCredentials = [
      { email: 'test@example.com', password: 'password123' },
      { email: 'demo@test.com', password: 'demo123' },
      { email: 'user@app.com', password: 'user123' },
    ];
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Check if credentials match
    const validCredential = testCredentials.find(
      cred => cred.email === email.toLowerCase() && cred.password === password
    );
    
    if (validCredential) {
      return {
        id: `user_${Date.now()}`,
        email: validCredential.email,
        firstName: 'Test',
        lastName: 'User',
        createdAt: new Date().toISOString(),
      };
    } else {
      throw new Error('Invalid email or password');
    }
  },
  
  async signup(email: string, password: string, firstName: string, lastName: string): Promise<User> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Mock signup - always succeeds for testing
    return {
      id: `user_${Date.now()}`,
      email: email.toLowerCase(),
      firstName,
      lastName,
      createdAt: new Date().toISOString(),
    };
  }
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      rememberMe: false,
      rememberedCredentials: null,
      _hasHydrated: false,
      biometricEnabled: false,
      loginWithBiometrics: async () => {
        const { rememberedCredentials, login } = get();
        if (rememberedCredentials && rememberedCredentials.email && rememberedCredentials.password) {
          return await login(rememberedCredentials.email, rememberedCredentials.password, true);
        }
        return false;
      },
      
      login: async (email: string, password: string, rememberMe = false) => {
        console.log('Login attempt started for:', email);
        set({ isLoading: true });
        
        try {
          const user = await authService.login(email, password);
          console.log('Login successful for user:', user.email);
          
          const updateData: any = { 
            user, 
            isAuthenticated: true, 
            isLoading: false,
            rememberMe
          };
          
          if (rememberMe) {
            updateData.rememberedCredentials = { email, password };
          } else {
            updateData.rememberedCredentials = null;
          }
          
          set(updateData);
          console.log('Auth state updated - isAuthenticated: true, rememberMe:', rememberMe);
          return true;
        } catch (error) {
          console.log('Login failed:', error instanceof Error ? error.message : 'Unknown error');
          set({ isLoading: false });
          return false;
        }
      },
      
      signup: async (email: string, password: string, firstName: string, lastName: string) => {
        set({ isLoading: true });
        
        try {
          const user = await authService.signup(email, password, firstName, lastName);
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false 
          });
          return true;
        } catch (error) {
          set({ isLoading: false });
          return false;
        }
      },
      
      logout: () => {
        // Sign out user but keep their data and remembered credentials if rememberMe is true
        const currentState = get();
        set({ 
          user: null, 
          isAuthenticated: false, 
          isLoading: false,
          // Keep remembered credentials if rememberMe was true
          rememberedCredentials: currentState.rememberMe ? currentState.rememberedCredentials : null,
        });
      },
      
      deleteAccount: () => {
        // Delete user account and clear all data
        import('../state/transactionStore').then(({ useTransactionStore }) => {
          useTransactionStore.getState().clearUserData();
        });
        
        set({ 
          user: null, 
          isAuthenticated: false, 
          isLoading: false 
        });
      },
      
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
      
      clearRememberedCredentials: () => {
        set({ 
          rememberMe: false,
          rememberedCredentials: null 
        });
      },
      
      setHasHydrated: (hasHydrated: boolean) => {
        set({ _hasHydrated: hasHydrated });
      },
      
      // Helper method to reset authentication state (for development/testing)
      resetAuthState: () => {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          rememberMe: false,
          rememberedCredentials: null,
        });
      },

      // Development helper to clear all stored auth data
      clearAllAuthData: async () => {
        try {
          await AsyncStorage.multiRemove(['checkmate-auth', '@auth_state', '@user_passcode']);
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            rememberMe: false,
            rememberedCredentials: null,
          });
        } catch (error) {
          console.error('Error clearing auth data:', error);
        }
      },
    }),
    {
      name: 'checkmate-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        rememberMe: state.rememberMe,
        rememberedCredentials: state.rememberedCredentials,
      }),
      onRehydrateStorage: () => (state) => {
        console.log('Auth store hydration complete');
        if (state) {
          state.setHasHydrated(true);
          // Set biometricEnabled if remembered credentials exist
          state.biometricEnabled = !!(state.rememberedCredentials && state.rememberedCredentials.email && state.rememberedCredentials.password);
        } else {
          console.warn('Auth store state is null during hydration');
        }
      },
    }
  )
);