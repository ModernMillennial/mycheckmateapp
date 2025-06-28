import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import AuthSetupScreen from '../screens/AuthSetupScreen';
import AuthScreen from '../screens/AuthScreen';
import AuthService from '../services/authService';

interface Props {
  children: React.ReactNode;
}

const AuthWrapper: React.FC<Props> = ({ children }) => {
  const { authState, isLoading, requiresSetup, refreshAuthState, updateActivity } = useAuth();
  const [needsAuth, setNeedsAuth] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    checkAuthRequirement();
  }, [authState]);

  const checkAuthRequirement = async () => {
    if (requiresSetup || !authState.user) {
      setNeedsAuth(false);
      setCheckingAuth(false);
      return;
    }

    try {
      const requiresAuth = await AuthService.requiresAuthentication();
      setNeedsAuth(requiresAuth);
    } catch (error) {
      console.error('Error checking auth requirement:', error);
      setNeedsAuth(true);
    } finally {
      setCheckingAuth(false);
    }
  };

  const handleAuthSetupComplete = async () => {
    await refreshAuthState();
    setNeedsAuth(false);
  };

  const handleAuthSuccess = async () => {
    await updateActivity();
    setNeedsAuth(false);
  };

  // Show loading spinner while checking authentication
  if (isLoading || checkingAuth) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  // Show setup screen for first-time users
  if (requiresSetup) {
    return <AuthSetupScreen onAuthComplete={handleAuthSetupComplete} />;
  }

  // Show authentication screen if user needs to authenticate
  if (needsAuth) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  // User is authenticated, show the main app
  return <>{children}</>;
};

export default AuthWrapper;