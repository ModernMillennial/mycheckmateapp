import React, { createContext, useContext, useState, useEffect } from 'react';
import AuthService, { AuthState } from '../services/authService';

interface AuthContextType {
  authState: AuthState;
  isLoading: boolean;
  requiresSetup: boolean;
  updateActivity: () => void;
  signOut: () => void;
  refreshAuthState: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    biometricEnabled: false,
    passcodeEnabled: false,
    user: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [requiresSetup, setRequiresSetup] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const state = await AuthService.initialize();
      setAuthState(state);
      
      // Check if user needs to set up authentication
      if (!state.user) {
        setRequiresSetup(true);
      } else {
        setRequiresSetup(false);
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      setRequiresSetup(true);
    } finally {
      setIsLoading(false);
    }
  };

  const updateActivity = async () => {
    await AuthService.updateActivity();
    const updatedState = AuthService.getAuthState();
    setAuthState(updatedState);
  };

  const signOut = async () => {
    await AuthService.signOut();
    const updatedState = AuthService.getAuthState();
    setAuthState(updatedState);
  };

  const refreshAuthState = async () => {
    const state = await AuthService.initialize();
    setAuthState(state);
  };

  const value: AuthContextType = {
    authState,
    isLoading,
    requiresSetup,
    updateActivity,
    signOut,
    refreshAuthState,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};