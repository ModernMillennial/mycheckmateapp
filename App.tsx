import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { View, Text, Image } from "react-native";
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
    // Error logging could be sent to crash reporting service here
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
              {"We apologize for the inconvenience. The app encountered an unexpected error and needs to restart."}
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
    let unsubscribe: (() => void) | undefined;
    
    try {
      unsubscribe = setupNotificationListeners();
    } catch (error) {
      unsubscribe = () => {}; // Empty cleanup function on error
    }
    
    // Initialize the app
    const initializeApp = async () => {
      try {
        // Add a delay to ensure stores are hydrated from AsyncStorage
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setIsReady(true);
      } catch (error) {
        setIsReady(true); // Continue anyway
      }
    };
    
    // Fallback timeout to ensure app doesn't get stuck loading
    const fallbackTimeout = setTimeout(() => {
      setIsReady(true);
    }, 5000);
    
    initializeApp();
    
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
      clearTimeout(fallbackTimeout);
    };
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
        <View style={{ width: 80, height: 80, borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <Image
            source={require('./assets/new-logo.png')}
            style={{ width: 72, height: 72 }}
            resizeMode="contain"
          />
        </View>
        <Text style={{ fontSize: 16, color: '#6B7280' }}>Loading...</Text>
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
