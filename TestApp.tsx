import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

const TestScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Test Screen - Navigation Working!</Text>
  </View>
);

const TestNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name="Test" component={TestScreen} />
  </Stack.Navigator>
);

export default function TestApp() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <TestNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}