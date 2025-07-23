import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  useEffect(() => {
    // Log critical environment variables
    console.log('EXPO_PUBLIC_PLAID_CLIENT_ID:', process.env.EXPO_PUBLIC_PLAID_CLIENT_ID);
    console.log('EXPO_PUBLIC_PLAID_SECRET:', process.env.EXPO_PUBLIC_PLAID_SECRET);
    console.log('EXPO_PUBLIC_PLAID_ENVIRONMENT:', process.env.EXPO_PUBLIC_PLAID_ENVIRONMENT);
    console.log('NODE_ENV:', process.env.NODE_ENV);
    // Add any other env vars you use here
  }, []);

  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}
