import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../state/authStore';
import { useTransactionStore } from '../state/transactionStore';
import SimpleRegisterScreen from '../screens/SimpleRegisterScreen';

import DashboardScreen from '../screens/DashboardScreen';
import BudgetScreen from '../screens/BudgetScreen';
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
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import TermsAndConditionsScreen from '../screens/TermsAndConditionsScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import TermsAcceptanceScreen from '../screens/TermsAcceptanceScreen';
import AboutScreen from '../screens/AboutScreen';
import { Transaction } from '../types';

export type RootStackParamList = {
  // Splash screen
  Splash: undefined;
  // Auth screens
  Login: undefined;
  Signup: undefined;
  Welcome: undefined;
  ForgotPassword: undefined;
  // Terms screens - two separate flows
  TermsAcceptance: undefined;
  TermsAndConditions: { isFirstTime?: boolean; isReadOnly?: boolean };
  PrivacyPolicy: { isFirstTime?: boolean; isReadOnly?: boolean };
  // App screens
  Register: undefined;
  Dashboard: undefined;
  Budget: undefined;
  AddTransaction: undefined;
  EditTransaction: { transaction: Transaction };
  Settings: undefined;
  Reports: undefined;
  NotificationSettings: undefined;
  About: undefined;

  BankConnection: undefined;
  StartingBalanceSelection: {
    accessToken: string;
    accountData: any;
    institutionName: string;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const { settings, isInitialized, initializeWithSeedData } = useTransactionStore();
  
  // Initialize the store when the component mounts
  useEffect(() => {
    if (!isInitialized) {
      initializeWithSeedData();
    }
  }, [isInitialized, initializeWithSeedData]);
  
  // Determine initial route based on auth state and terms acceptance
  const getInitialRoute = (): keyof RootStackParamList => {
    // Load the checkbook register app directly
    return "Register";
  };
  

  
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
      
      {/* Budget Tracker App - Direct Access */}
      <Stack.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="Budget" 
        component={BudgetScreen}
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
      
      {/* Auth Stack - Optional */}
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
      <Stack.Screen 
        name="ForgotPassword" 
        component={ForgotPasswordScreen}
        options={{
          headerShown: false,
        }}
      />
      
      {/* Other Screens */}
      <Stack.Screen 
        name="TermsAcceptance" 
        component={TermsAcceptanceScreen}
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen 
        name="TermsAndConditions" 
        component={TermsAndConditionsScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="Register" 
        component={SimpleRegisterScreen}
        options={{
          headerShown: false,
        }}
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
      <Stack.Screen 
        name="About" 
        component={AboutScreen}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;