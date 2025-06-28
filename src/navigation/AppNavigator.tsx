import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../state/authStore';
import SimpleRegisterScreen from '../screens/SimpleRegisterScreen';
import AddTransactionScreen from '../screens/AddTransactionScreen';
import EditTransactionScreen from '../screens/EditTransactionScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ReportsScreen from '../screens/ReportsScreen';
import NotificationSettingsScreen from '../screens/NotificationSettingsScreen';
import AccountsScreen from '../screens/AccountsScreen';
import BankConnectionScreen from '../screens/BankConnectionScreen';
import StartingBalanceSelectionScreen from '../screens/StartingBalanceSelectionScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import { Transaction } from '../types';

export type RootStackParamList = {
  // Auth screens
  Login: undefined;
  Signup: undefined;
  Welcome: undefined;
  // App screens
  Register: undefined;
  AddTransaction: undefined;
  EditTransaction: { transaction: Transaction };
  Settings: undefined;
  Reports: undefined;
  NotificationSettings: undefined;
  Accounts: undefined;
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
  
  // Determine initial route based on auth state
  const getInitialRoute = () => {
    // Always start with Welcome screen for new users
    if (!isAuthenticated) return "Welcome";
    // Go directly to the main register screen for authenticated users  
    return "Register";
  };
  
  console.log('AppNavigator rendering... isAuthenticated:', isAuthenticated);
  
  return (
    <Stack.Navigator
      initialRouteName={getInitialRoute()}
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
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
        // App Stack
        <>
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
            name="Accounts" 
            component={AccountsScreen}
          />
          <Stack.Screen 
            name="BankConnection" 
            component={BankConnectionScreen}
          />
          <Stack.Screen 
            name="StartingBalanceSelection" 
            component={StartingBalanceSelectionScreen}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;