import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RegisterScreen from '../screens/RegisterScreen';
import AddTransactionScreen from '../screens/AddTransactionScreen';
import EditTransactionScreen from '../screens/EditTransactionScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { Transaction } from '../types';

export type RootStackParamList = {
  Register: undefined;
  AddTransaction: undefined;
  EditTransaction: { transaction: Transaction };
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Register"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen 
        name="Register" 
        component={RegisterScreen} 
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
    </Stack.Navigator>
  );
};

export default AppNavigator;