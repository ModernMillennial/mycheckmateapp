import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AuthService from '../services/authService';

interface Props {
  onAuthSuccess: () => void;
}

const AuthScreen: React.FC<Props> = ({ onAuthSuccess }) => {
  const [passcode, setPasscode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authState, setAuthState] = useState(AuthService.getAuthState());
  const [biometricTypes, setBiometricTypes] = useState<string[]>([]);

  useEffect(() => {
    initializeAuth();
    getBiometricTypes();
  }, []);

  const initializeAuth = async () => {
    const state = await AuthService.initialize();
    setAuthState(state);
  };

  const getBiometricTypes = async () => {
    if (authState.biometricEnabled) {
      const types = await AuthService.getSupportedBiometricTypes();
      const typeNames = types.map(type => {
        switch (type) {
          case 'TOUCH_ID': return 'Touch ID';
          case 'FACE_ID': return 'Face ID';
          case 'FINGERPRINT': return 'Fingerprint';
          default: return 'Biometric';
        }
      });
      setBiometricTypes(typeNames);
    }
  };

  const handleBiometricAuth = async () => {
    setIsLoading(true);
    try {
      const result = await AuthService.authenticateWithBiometric();
      if (result.success) {
        onAuthSuccess();
      } else {
        if (result.error?.code !== 'BIOMETRIC_FAILED') {
          Alert.alert('Authentication Error', result.error?.message || 'Biometric authentication failed.');
        }
        // If biometric fails, user can still use passcode
      }
    } catch (error) {
      console.error('Biometric auth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasscodeAuth = async () => {
    if (!passcode.trim()) {
      Alert.alert('Error', 'Please enter your passcode.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await AuthService.authenticateWithPasscode(passcode);
      if (result.success) {
        onAuthSuccess();
      } else {
        Alert.alert('Authentication Failed', result.error?.message || 'Invalid passcode.');
        setPasscode('');
      }
    } catch (error) {
      console.error('Passcode auth error:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasscode = () => {
    Alert.alert(
      'Reset Authentication',
      'To reset your authentication, all app data including bank connections will be cleared. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset All Data',
          style: 'destructive',
          onPress: async () => {
            await AuthService.resetAuthentication();
            // This would trigger app restart or navigation to setup
            Alert.alert(
              'Data Reset',
              'All authentication and app data has been cleared. The app will restart.',
              [{ text: 'OK', onPress: () => {
                // In a real app, you'd restart or navigate to onboarding
                console.log('App should restart');
              } }]
            );
          },
        },
      ]
    );
  };

  // Auto-trigger biometric on load if enabled
  useEffect(() => {
    if (authState.biometricEnabled && !isLoading) {
      // Small delay to ensure UI is ready
      setTimeout(() => {
        handleBiometricAuth();
      }, 500);
    }
  }, [authState.biometricEnabled]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 py-8 justify-center">
        {/* Header */}
        <View className="items-center mb-12">
          {/* App Logo/Icon */}
          <View className="w-24 h-24 bg-blue-100 rounded-full items-center justify-center mb-6">
            <Ionicons name="shield-checkmark" size={48} color="#3B82F6" />
          </View>
          
          <Text className="text-3xl font-bold text-gray-900 mb-2">
            Checkmate
          </Text>
          <Text className="text-lg text-gray-600 text-center">
            Secure access to your financial data
          </Text>
        </View>

        {/* Authentication Methods */}
        <View className="space-y-6">
          {/* Biometric Authentication */}
          {authState.biometricEnabled && (
            <Pressable
              onPress={handleBiometricAuth}
              disabled={isLoading}
              className="bg-blue-600 active:bg-blue-700 py-4 px-6 rounded-lg flex-row items-center justify-center"
            >
              {isLoading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <Ionicons 
                    name={biometricTypes.includes('Face ID') ? 'scan' : 'finger-print'} 
                    size={24} 
                    color="white" 
                  />
                  <Text className="text-white text-base font-semibold ml-3">
                    Use {biometricTypes.join(' / ')}
                  </Text>
                </>
              )}
            </Pressable>
          )}

          {/* Divider */}
          {authState.biometricEnabled && (
            <View className="flex-row items-center">
              <View className="flex-1 h-px bg-gray-300" />
              <Text className="px-4 text-gray-500 text-sm">or</Text>
              <View className="flex-1 h-px bg-gray-300" />
            </View>
          )}

          {/* Passcode Input */}
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Enter Passcode
            </Text>
            <TextInput
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base"
              placeholder="Your secure passcode"
              value={passcode}
              onChangeText={setPasscode}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              onSubmitEditing={handlePasscodeAuth}
              returnKeyType="done"
            />
          </View>

          {/* Passcode Submit Button */}
          <Pressable
            onPress={handlePasscodeAuth}
            disabled={isLoading || !passcode.trim()}
            className={`py-4 px-6 rounded-lg ${
              isLoading || !passcode.trim() 
                ? 'bg-gray-400' 
                : 'bg-green-600 active:bg-green-700'
            }`}
          >
            <Text className="text-white text-center text-base font-semibold">
              {isLoading ? 'Authenticating...' : 'Unlock Checkmate'}
            </Text>
          </Pressable>
        </View>

        {/* Forgot Passcode */}
        <View className="mt-8 items-center">
          <Pressable
            onPress={handleForgotPasscode}
            className="py-2 px-4"
          >
            <Text className="text-blue-600 text-sm font-medium">
              Forgot Passcode?
            </Text>
          </Pressable>
        </View>

        {/* Security Notice */}
        <View className="mt-8 bg-gray-50 p-4 rounded-lg">
          <View className="flex-row items-start">
            <Ionicons name="lock-closed" size={16} color="#6B7280" />
            <Text className="ml-2 text-xs text-gray-600 flex-1">
              Your session will expire after 15 minutes of inactivity for security. 
              All banking data is encrypted and protected.
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AuthScreen;