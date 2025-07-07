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

// Mock authentication service
const mockAuthService = {
  async login(email: string, password: string): Promise<User> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock validation
    if (email === 'demo@checkmate.com' && password === 'demo123') {
      return {
        id: `user-${Date.now()}`,
        email: 'demo@checkmate.com',
        firstName: 'Demo',
        lastName: 'User',
        createdAt: new Date().toISOString(),
      };
    }
    
    // Check if user exists in "database" (AsyncStorage)
    const users = await AsyncStorage.getItem('registeredUsers');
    const userList = users ? JSON.parse(users) : [];
    
    const user = userList.find((u: any) => u.email === email && u.password === password);
    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    
    throw new Error('Invalid email or password');
  },
  
  async signup(email: string, password: string, firstName: string, lastName: string): Promise<User> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if user already exists
    const users = await AsyncStorage.getItem('registeredUsers');
    const userList = users ? JSON.parse(users) : [];
    
    if (userList.find((u: any) => u.email === email)) {
      throw new Error('User already exists with this email');
    }
    
    // Create new user
    const newUser = {
      id: `user-${Date.now()}`,
      email,
      password, // In real app, this would be hashed
      firstName,
      lastName,
      createdAt: new Date().toISOString(),
    };
    
    // Save to "database"
    userList.push(newUser);
    await AsyncStorage.setItem('registeredUsers', JSON.stringify(userList));
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
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
          const user = await mockAuthService.login(email, password);
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
          const user = await mockAuthService.signup(email, password, firstName, lastName);
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