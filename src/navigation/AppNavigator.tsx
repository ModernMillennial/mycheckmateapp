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

  console.log('AppNavigator - isAuthenticated:', isAuthenticated);
  
  // If authenticated, show the main app screens first
  if (isAuthenticated) {
    return (
      <Stack.Navigator
        initialRouteName="Dashboard"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Budget" component={BudgetScreen} />
        <Stack.Screen name="AddTransaction" component={AddTransactionScreen} />
        <Stack.Screen name="EditTransaction" component={EditTransactionScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Reports" component={ReportsScreen} />
        <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
        <Stack.Screen name="BankConnection" component={BankConnectionScreen} />
        <Stack.Screen name="StartingBalanceSelection" component={StartingBalanceSelectionScreen} />
        <Stack.Screen name="About" component={AboutScreen} />
      </Stack.Navigator>
    );
  }

  // If not authenticated, show auth flow
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="TermsAcceptance" component={TermsAcceptanceScreen} />
      <Stack.Screen name="TermsAndConditions" component={TermsAndConditionsScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;