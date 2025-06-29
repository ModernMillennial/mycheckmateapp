import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../state/authStore';
import { useTransactionStore } from '../state/transactionStore';
import SimpleRegisterScreen from '../screens/SimpleRegisterScreen';
import AddTransactionScreen from '../screens/AddTransactionScreen';
import EditTransactionScreen from '../screens/EditTransactionScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ReportsScreen from '../screens/ReportsScreen';
import NotificationSettingsScreen from '../screens/NotificationSettingsScreen';

import BankConnectionScreen from '../screens/BankConnectionScreen';
import StartingBalanceSelectionScreen from '../screens/StartingBalanceSelectionScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import SplashScreen from '../screens/SplashScreen';
import TermsAndConditionsScreen from '../screens/TermsAndConditionsScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import { Transaction } from '../types';

export type RootStackParamList = {
  // Splash screen
  Splash: undefined;
  // Auth screens
  Login: undefined;
  Signup: undefined;
  Welcome: undefined;
  // Terms screens - two separate flows
  TermsAndConditions: { isFirstTime?: boolean };
  PrivacyPolicy: { isFirstTime?: boolean };
  // App screens
  Register: undefined;
  AddTransaction: undefined;
  EditTransaction: { transaction: Transaction };
  Settings: undefined;
  Reports: undefined;
  NotificationSettings: undefined;

  BankConnection: undefined;
  StartingBalanceSelection: {
    accessToken: string;
    accountData: any;
    institutionName: string;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();
  const { settings } = useTransactionStore();
  
  // Determine initial route based on auth state and terms acceptance
  const getInitialRoute = () => {
    // Always start with Splash screen first
    return "Splash";
  };
  
  console.log('AppNavigator rendering... isAuthenticated:', isAuthenticated, 'hasAcceptedTerms:', settings.hasAcceptedTerms);
  
  return (
    <Stack.Navigator
      initialRouteName={getInitialRoute()}
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      {/* Splash Screen - always shown first */}
      <Stack.Screen 
        name="Splash" 
        component={SplashScreen}
        options={{
          headerShown: false,
          animationTypeForReplace: 'push',
        }}
      />
      
      {!isAuthenticated ? (
        // Auth Stack
        <>
          <Stack.Screen 
            name="Welcome" 
            component={WelcomeScreen}
            options={{
              headerShown: false,
              animationTypeForReplace: 'push',
            }}
          />
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
            options={{
              headerShown: false,
              animationTypeForReplace: 'push',
            }}
          />
          <Stack.Screen 
            name="Signup" 
            component={SignupScreen}
            options={{
              headerShown: false,
            }}
          />
        </>
      ) : (
        // App Stack - include terms screen for authenticated users too
        <>
          {/* Terms Screen - shown for first-time users or when accessed from settings */}
          <Stack.Screen 
            name="TermsAndConditions" 
            component={TermsAndConditionsScreen}
            options={({ route }) => ({
              headerShown: false,
              gestureEnabled: !route.params?.isFirstTime, // Allow gesture when not first time
            })}
            initialParams={{ isFirstTime: !settings.hasAcceptedTerms }}
          />
          <Stack.Screen 
            name="Register" 
            component={SimpleRegisterScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name="AddTransaction" 
            component={AddTransactionScreen}
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen 
            name="EditTransaction" 
            component={EditTransactionScreen}
          />
          <Stack.Screen 
            name="Settings" 
            component={SettingsScreen}
          />
          <Stack.Screen 
            name="Reports" 
            component={ReportsScreen}
          />
          <Stack.Screen 
            name="NotificationSettings" 
            component={NotificationSettingsScreen}
          />

          <Stack.Screen 
            name="BankConnection" 
            component={BankConnectionScreen}
          />
          <Stack.Screen 
            name="StartingBalanceSelection" 
            component={StartingBalanceSelectionScreen}
          />
          <Stack.Screen 
            name="PrivacyPolicy" 
            component={PrivacyPolicyScreen}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;