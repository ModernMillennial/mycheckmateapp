import React, { useEffect, useState } from 'react';
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
import ChatScreen from '../screens/ChatScreen';

import BankConnectionScreen from '../screens/BankConnectionScreen';
import StartingBalanceSelectionScreen from '../screens/StartingBalanceSelectionScreen';
import ManualStartingBalanceScreen from '../screens/ManualStartingBalanceScreen';
import PlaidConnectionScreen from '../screens/PlaidConnectionScreen';
import AccountsScreen from '../screens/AccountsScreen';
import TransactionsScreen from '../screens/TransactionsScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import SplashScreen from '../screens/SplashScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
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
  ResetPassword: { token?: string; email?: string };
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
  Chat: undefined;

  BankConnection: undefined;
  StartingBalanceSelection: {
    accessToken: string;
    accountData: any;
    institutionName: string;
  };
  ManualStartingBalance: undefined;
  
  // Plaid screens
  PlaidConnection: undefined;
  Accounts: undefined;
  Transactions: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const { isAuthenticated, _hasHydrated: authHydrated } = useAuthStore();
  const { settings, isInitialized, initializeWithSeedData, _hasHydrated: transactionHydrated } = useTransactionStore();
  const [isStoreReady, setIsStoreReady] = useState(false);
  const [forceReady, setForceReady] = useState(false);
  
  // Initialize the store when the component mounts
  useEffect(() => {
    const initializeStores = async () => {
      try {
        // Initialize stores
        
        // Wait for both stores to hydrate
        if (!authHydrated || !transactionHydrated) {
          return; // Exit early, will retry when hydration completes
        }
        
        if (!isInitialized) {
          initializeWithSeedData();
        }
        
        // Give stores time to complete initialization
        await new Promise(resolve => setTimeout(resolve, 100));
        setIsStoreReady(true);
      } catch (error) {
        setIsStoreReady(true); // Continue anyway
      }
    };
    
    initializeStores();
  }, [isInitialized, initializeWithSeedData, authHydrated, transactionHydrated]);

  // Fallback timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      setForceReady(true);
      setIsStoreReady(true);
    }, 3000);
    
    return () => clearTimeout(timeout);
  }, []);

  // Component render logic
  
  // Show loading until stores are ready and hydrated, but with a timeout
  if (!forceReady && (!isStoreReady || !authHydrated || !transactionHydrated)) {
    return null; // This will show the App.tsx loading screen
  }
  
  // Render navigator
  
  return (
    <Stack.Navigator
      initialRouteName={isAuthenticated ? "Register" : "Welcome"}
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      {!isAuthenticated ? (
        // Auth screens - only show when not authenticated
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
          <Stack.Screen name="TermsAcceptance" component={TermsAcceptanceScreen} />
          <Stack.Screen name="TermsAndConditions" component={TermsAndConditionsScreen} />
          <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
        </>
      ) : (
        // App screens - only show when authenticated
        <>
          <Stack.Screen name="Register" component={SimpleRegisterScreen} />
          <Stack.Screen name="AddTransaction" component={AddTransactionScreen} />
          <Stack.Screen name="EditTransaction" component={EditTransactionScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="Reports" component={ReportsScreen} />
          <Stack.Screen name="Budget" component={BudgetScreen} />
          <Stack.Screen name="BankConnection" component={BankConnectionScreen} />
          <Stack.Screen name="StartingBalanceSelection" component={StartingBalanceSelectionScreen} />
          <Stack.Screen name="ManualStartingBalance" component={ManualStartingBalanceScreen} />
          <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
          <Stack.Screen name="About" component={AboutScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          
          {/* Plaid Screens */}
          <Stack.Screen name="PlaidConnection" component={PlaidConnectionScreen} />
          <Stack.Screen name="Accounts" component={AccountsScreen} />
          <Stack.Screen name="Transactions" component={TransactionsScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;