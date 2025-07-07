import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AuthService from '../services/authService';

interface Props {
  navigation: any;
  route: {
    params?: {
      token?: string;
      email?: string;
    };
  };
}

const ResetPasswordScreen: React.FC<Props> = ({ navigation, route }) => {
  const [token, setToken] = useState(route?.params?.token || '');
  const [email, setEmail] = useState(route?.params?.email || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [tokenError, setTokenError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tokenValidated, setTokenValidated] = useState(false);
  const [isValidatingToken, setIsValidatingToken] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (token) {
      validateToken();
    } else {
      setIsValidatingToken(false);
    }
  }, [token]);

  const validateToken = async () => {
    setIsValidatingToken(true);
    try {
      const result = await AuthService.validateResetToken(token);
      if (result.valid) {
        setTokenValidated(true);
        if (result.email && !email) {
          setEmail(result.email);
        }
      } else {
        setTokenError(result.error?.message || 'Invalid or expired reset token');
      }
    } catch (error) {
      setTokenError('Error validating reset token');
    } finally {
      setIsValidatingToken(false);
    }
  };

  const validatePassword = (password: string) => {
    if (password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    if (!/(?=.*[0-9])/.test(password)) {
      return 'Password must contain at least one number';
    }
    return '';
  };

  const handleResetPassword = async () => {
    setPasswordError('');
    setConfirmPasswordError('');
    setTokenError('');

    // Validate inputs
    if (!token.trim()) {
      setTokenError('Reset token is required');
      return;
    }

    if (!newPassword) {
      setPasswordError('New password is required');
      return;
    }

    const passwordValidation = validatePassword(newPassword);
    if (passwordValidation) {
      setPasswordError(passwordValidation);
      return;
    }

    if (newPassword !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const result = await AuthService.resetPasswordWithToken(token, newPassword);
      
      if (result.success) {
        Alert.alert(
          'Password Reset Successful',
          'Your password has been reset successfully. You can now sign in with your new password.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login'),
            },
          ]
        );
      } else {
        setTokenError(result.error?.message || 'Failed to reset password. Please try again.');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      setTokenError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidatingToken) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-600 mt-4">Validating reset token...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!tokenValidated && tokenError) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 px-6 py-8">
          {/* Header */}
          <View className="flex-row items-center mb-8">
            <Pressable
              onPress={() => navigation.navigate('Login')}
              className="mr-4"
            >
              <Ionicons name="arrow-back" size={24} color="#374151" />
            </Pressable>
            <Text className="text-xl font-semibold text-gray-900">
              Reset Password
            </Text>
          </View>

          {/* Error Content */}
          <View className="flex-1 justify-center items-center px-4">
            <View className="bg-red-100 w-20 h-20 rounded-full items-center justify-center mb-6">
              <Ionicons name="close-circle" size={40} color="#DC2626" />
            </View>
            
            <Text className="text-2xl font-bold text-gray-900 mb-4 text-center">
              Invalid Reset Link
            </Text>
            
            <Text className="text-gray-600 text-center mb-8 leading-6">
              {tokenError}
            </Text>

            {/* Actions */}
            <View className="w-full space-y-3">
              <Pressable
                onPress={() => navigation.navigate('ForgotPassword')}
                className="bg-blue-500 rounded-lg py-3 items-center justify-center"
              >
                <Text className="text-white text-base font-semibold">
                  Request New Reset Link
                </Text>
              </Pressable>
              
              <Pressable
                onPress={() => navigation.navigate('Login')}
                className="py-3 items-center justify-center"
              >
                <Text className="text-blue-500 text-base font-medium">
                  Back to Login
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView 
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 px-6 py-8">
            {/* Header */}
            <View className="flex-row items-center mb-8">
              <Pressable
                onPress={() => navigation.navigate('Login')}
                className="mr-4"
                disabled={isLoading}
              >
                <Ionicons name="arrow-back" size={24} color="#374151" />
              </Pressable>
              <Text className="text-xl font-semibold text-gray-900">
                Reset Password
              </Text>
            </View>

            {/* Content */}
            <View className="mb-8">
              <View className="items-center mb-8">
                <View className="bg-green-100 w-16 h-16 rounded-2xl items-center justify-center mb-4">
                  <Ionicons name="shield-checkmark" size={32} color="#059669" />
                </View>
                <Text className="text-2xl font-bold text-gray-900 mb-2">
                  Create New Password
                </Text>
                <Text className="text-gray-600 text-center">
                  {email ? `For ${email}` : 'Enter your new password below'}
                </Text>
              </View>

              {/* Token Input or Display */}
              <View className="mb-6">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Reset Token
                </Text>
                {route?.params?.token ? (
                  <View className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3">
                    <Text className="text-sm text-gray-600 mb-1">Token (from email link):</Text>
                    <Text className="text-xs font-mono text-gray-800 break-all">{token}</Text>
                  </View>
                ) : (
                  <TextInput
                    className={`border ${tokenError ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 text-base`}
                    placeholder="Enter the token from your email"
                    value={token}
                    onChangeText={(text) => {
                      setToken(text);
                      if (tokenError) setTokenError('');
                    }}
                    autoCapitalize="none"
                    editable={!isLoading}
                  />
                )}
                {tokenError ? (
                  <Text className="text-red-500 text-sm mt-1">{tokenError}</Text>
                ) : null}
              </View>

              {/* New Password Input */}
              <View className="mb-6">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  New Password
                </Text>
                <View className="relative">
                  <TextInput
                    className={`border ${passwordError ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 pr-12 text-base`}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChangeText={(text) => {
                      setNewPassword(text);
                      if (passwordError) setPasswordError('');
                    }}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    editable={!isLoading}
                  />
                  <Pressable
                    onPress={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3"
                  >
                    <Ionicons 
                      name={showPassword ? 'eye-off' : 'eye'} 
                      size={20} 
                      color="#9CA3AF" 
                    />
                  </Pressable>
                </View>
                {passwordError ? (
                  <Text className="text-red-500 text-sm mt-1">{passwordError}</Text>
                ) : null}
                <Text className="text-gray-500 text-xs mt-1">
                  Must be at least 6 characters with one number
                </Text>
              </View>

              {/* Confirm Password Input */}
              <View className="mb-6">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </Text>
                <View className="relative">
                  <TextInput
                    className={`border ${confirmPasswordError ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 pr-12 text-base`}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      if (confirmPasswordError) setConfirmPasswordError('');
                    }}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    editable={!isLoading}
                  />
                  <Pressable
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3"
                  >
                    <Ionicons 
                      name={showConfirmPassword ? 'eye-off' : 'eye'} 
                      size={20} 
                      color="#9CA3AF" 
                    />
                  </Pressable>
                </View>
                {confirmPasswordError ? (
                  <Text className="text-red-500 text-sm mt-1">{confirmPasswordError}</Text>
                ) : null}
              </View>

              {/* Reset Button */}
              <Pressable
                onPress={handleResetPassword}
                disabled={isLoading}
                className={`${isLoading ? 'bg-blue-300' : 'bg-blue-500 active:bg-blue-600'} rounded-lg py-3 items-center justify-center mb-4`}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text className="text-white text-base font-semibold">
                    Reset Password
                  </Text>
                )}
              </Pressable>
            </View>

            {/* Back to Login */}
            <View className="flex-row justify-center items-center">
              <Text className="text-gray-600 text-sm">
                Remember your password? 
              </Text>
              <Pressable
                onPress={() => navigation.navigate('Login')}
                disabled={isLoading}
              >
                <Text className="text-blue-500 text-sm font-medium ml-1">
                  Sign In
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ResetPasswordScreen;