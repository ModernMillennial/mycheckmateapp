import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  Alert,
  ScrollView,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AuthService from '../services/authService';

interface Props {
  onAuthComplete: () => void;
}

const AuthSetupScreen: React.FC<Props> = ({ onAuthComplete }) => {
  const [email, setEmail] = useState('');
  const [passcode, setPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [enableBiometric, setEnableBiometric] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricTypes, setBiometricTypes] = useState<string[]>([]);

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    const isAvailable = await AuthService.isBiometricAvailable();
    setBiometricAvailable(isAvailable);
    
    if (isAvailable) {
      const types = await AuthService.getSupportedBiometricTypes();
      const typeNames = types.map(type => {
        switch (type) {
          case 1: return 'Touch ID';
          case 2: return 'Face ID';
          case 3: return 'Fingerprint';
          default: return 'Biometric';
        }
      });
      setBiometricTypes(typeNames);
    }
  };

  const validateInputs = (): boolean => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return false;
    }

    if (passcode.length < 6) {
      Alert.alert('Error', 'Passcode must be at least 6 characters long.');
      return false;
    }

    if (passcode !== confirmPasscode) {
      Alert.alert('Error', 'Passcodes do not match.');
      return false;
    }

    return true;
  };

  const handleSetupAuth = async () => {
    if (!validateInputs()) return;

    setIsLoading(true);
    try {
      const result = await AuthService.setupAuthentication(email, passcode, enableBiometric);
      
      if (result.success) {
        Alert.alert(
          'Authentication Setup Complete! 🔐',
          `Your account is now secured with ${enableBiometric && biometricAvailable ? 'biometric authentication and ' : ''}passcode protection.`,
          [
            {
              text: 'Continue',
              onPress: onAuthComplete,
            },
          ]
        );
      } else {
        Alert.alert('Setup Failed', result.error?.message || 'Failed to set up authentication.');
      }
    } catch (error) {
      console.error('Auth setup error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-6 py-8">
        {/* Header */}
        <View className="items-center mb-8">
          <View className="w-20 h-20 bg-blue-100 rounded-full items-center justify-center mb-4">
            <Ionicons name="shield-checkmark" size={40} color="#3B82F6" />
          </View>
          <Text className="text-2xl font-bold text-gray-900 text-center mb-2">
            Secure Your Account
          </Text>
          <Text className="text-base text-gray-600 text-center">
            Protect your financial data with multi-factor authentication
          </Text>
        </View>

        {/* Form */}
        <View className="space-y-6">
          {/* Email Input */}
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Email Address
            </Text>
            <TextInput
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Passcode Input */}
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Create Passcode
            </Text>
            <TextInput
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base"
              placeholder="Enter 6+ character passcode"
              value={passcode}
              onChangeText={setPasscode}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Confirm Passcode */}
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Confirm Passcode
            </Text>
            <TextInput
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base"
              placeholder="Re-enter your passcode"
              value={confirmPasscode}
              onChangeText={setConfirmPasscode}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Biometric Toggle */}
          {biometricAvailable && (
            <View className="bg-gray-50 p-4 rounded-lg">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-base font-medium text-gray-900">
                  Enable {biometricTypes.join(' / ')}
                </Text>
                <Switch
                  value={enableBiometric}
                  onValueChange={setEnableBiometric}
                  trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
                  thumbColor="#FFFFFF"
                />
              </View>
              <Text className="text-sm text-gray-600">
                Use your {biometricTypes.join(' or ').toLowerCase()} for quick and secure access
              </Text>
            </View>
          )}

          {/* Security Notice */}
          <View className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <View className="flex-row items-start">
              <Ionicons name="information-circle" size={20} color="#3B82F6" />
              <View className="ml-3 flex-1">
                <Text className="text-sm font-medium text-blue-900 mb-1">
                  Your Security Matters
                </Text>
                <Text className="text-sm text-blue-800">
                  • Your passcode is encrypted and stored securely{'\n'}
                  • Biometric data never leaves your device{'\n'}
                  • Session expires after 15 minutes of inactivity{'\n'}
                  • All banking data is protected with this authentication
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Setup Button */}
        <Pressable
          onPress={handleSetupAuth}
          disabled={isLoading}
          className={`mt-8 py-4 px-6 rounded-lg ${
            isLoading ? 'bg-gray-400' : 'bg-blue-600 active:bg-blue-700'
          }`}
        >
          <Text className="text-white text-center text-base font-semibold">
            {isLoading ? 'Setting Up...' : 'Complete Setup'}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AuthSetupScreen;