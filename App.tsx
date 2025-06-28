import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import AppNavigator from "./src/navigation/AppNavigator";
import { setupNotificationListeners } from "./src/utils/notifications";
// Authentication temporarily disabled for development
// import { AuthProvider } from "./src/context/AuthContext";
// import AuthWrapper from "./src/components/AuthWrapper";

interface ErrorBoundaryState {
  hasError: boolean;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error);
    console.error('Error info:', errorInfo);
    console.error('Error stack:', error.stack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaProvider>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white', padding: 20 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#EF4444', marginBottom: 16 }}>
              Oops! Something went wrong
            </Text>
            <Text style={{ fontSize: 16, textAlign: 'center', color: '#6B7280', marginBottom: 24, lineHeight: 24 }}>
              We apologize for the inconvenience. The app encountered an unexpected error and needs to restart.
            </Text>
            <Text style={{ fontSize: 14, textAlign: 'center', color: '#9CA3AF', marginBottom: 8 }}>
              If this problem persists, please contact support.
            </Text>
          </View>
        </SafeAreaProvider>
      );
    }

    return this.props.children;
  }
}

/*
IMPORTANT NOTICE: DO NOT REMOVE
There are already environment keys in the project. 
Before telling the user to add them, check if you already have access to the required keys through bash.
Directly access them with process.env.${key}

Correct usage:
process.env.EXPO_PUBLIC_VIBECODE_{key}
//directly access the key

Incorrect usage:
import { OPENAI_API_KEY } from '@env';
//don't use @env, its depreicated

Incorrect usage:
import Constants from 'expo-constants';
const openai_api_key = Constants.expoConfig.extra.apikey;
//don't use expo-constants, its depreicated

*/

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Setup notification listeners
    const unsubscribe = setupNotificationListeners();
    
    // Add a small delay to ensure everything is ready
    setTimeout(() => {
      setIsReady(true);
    }, 100);
    
    return unsubscribe;
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
        <Text>Initializing...</Text>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <NavigationContainer>
          <AppNavigator />
          <StatusBar style="auto" />
        </NavigationContainer>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
