import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import React, { useEffect, useState, useRef } from "react";
import { View, Text, Image, Alert } from "react-native";
import AppNavigator from "./src/navigation/AppNavigator";
import { setupNotificationListeners } from "./src/utils/notifications";
import * as Linking from 'expo-linking';
import { plaidService } from "./src/services/plaidService";
import NetworkStatusBar from "./src/components/NetworkStatusBar";
import errorHandler from "./src/utils/errorHandler";
import analytics from "./src/utils/analytics";
import crashReporting from "./src/utils/crashReporting";
// Authentication temporarily disabled for development
// import { AuthProvider } from "./src/context/AuthContext";
// import AuthWrapper from "./src/components/AuthWrapper";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
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
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Error logging could be sent to crash reporting service here
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
    
    // Use our error handler to process the error
    errorHandler.handleError(error, true);
    
    // Report to crash reporting service
    if (crashReporting) {
      crashReporting.reportError(error, { 
        source: 'ErrorBoundary',
        componentStack: errorInfo.componentStack
      });
    }
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

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const
