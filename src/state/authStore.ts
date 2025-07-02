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
  
  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<boolean>;
  logout: () => void;
  deleteAccount: () => void;
  setLoading: (loading: boolean) => void;
}

// Mock authentication service
const mockAuthService = {
  async login(email: string, password: string): Promise<User> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock validation
    if (email === 'demo@checkmate.com' && password === 'demo123') {
      return {
        id: 'user-demo',
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
      
      login: async (email: string, password: string) => {
        console.log('Login attempt started for:', email);
        set({ isLoading: true });
        
        try {
          const user = await mockAuthService.login(email, password);
          console.log('Login successful for user:', user.email);
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false 
          });
          console.log('Auth state updated - isAuthenticated: true');
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
        // Sign out user but keep their data
        set({ 
          user: null, 
          isAuthenticated: false, 
          isLoading: false 
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
    }),
    {
      name: 'checkmate-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);