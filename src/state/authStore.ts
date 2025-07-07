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

// Authentication service - Replace with your actual backend API calls
const authService = {
  async login(email: string, password: string): Promise<User> {
    // TODO: Replace with actual API call to your backend
    throw new Error('Authentication service not implemented. Please implement login with your backend API.');
  },
  
  async signup(email: string, password: string, firstName: string, lastName: string): Promise<User> {
    // TODO: Replace with actual API call to your backend
    throw new Error('Authentication service not implemented. Please implement signup with your backend API.');
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
        } else {
          console.warn('Auth store state is null during hydration');
        }
      },
    }
  )
);