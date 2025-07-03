import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  navigation: any;
}

const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handlePasswordReset = async () => {
    setEmailError('');
    
    if (!email.trim()) {
      setEmailError('Email is required');
      return;
    }
    
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demo purposes, we'll just show success state
      // In a real app, this would call your backend API
      setResetSent(true);
    } catch (error) {
      setEmailError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (resetSent) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 px-6 py-8">
          {/* Header */}
          <View className="flex-row items-center mb-8">
            <Pressable
              onPress={() => navigation.goBack()}
              className="mr-4"
            >
              <Ionicons name="arrow-back" size={24} color="#374151" />
            </Pressable>
            <Text className="text-xl font-semibold text-gray-900">
              Password Reset
            </Text>
          </View>

          {/* Success Content */}
          <View className="flex-1 justify-center items-center px-4">
            <View className="bg-green-100 w-20 h-20 rounded-full items-center justify-center mb-6">
              <Ionicons name="checkmark-circle" size={40} color="#059669" />
            </View>
            
            <Text className="text-2xl font-bold text-gray-900 mb-4 text-center">
              Reset Link Sent!
            </Text>
            
            <Text className="text-gray-600 text-center mb-8 leading-6">
              We've sent a password reset link to{'\n'}
              <Text className="font-medium text-gray-900">{email}</Text>
            </Text>
            
            <Text className="text-sm text-gray-500 text-center mb-8">
              Please check your email and follow the instructions to reset your password. 
              The link will expire in 24 hours.
            </Text>

            {/* Actions */}
            <View className="w-full space-y-3">
              <Pressable
                onPress={() => navigation.navigate('Login')}
                className="bg-blue-500 rounded-lg py-3 items-center justify-center"
              >
                <Text className="text-white text-base font-semibold">
                  Back to Login
                </Text>
              </Pressable>
              
              <Pressable
                onPress={() => {
                  setResetSent(false);
                  setEmail('');
                }}
                className="py-3 items-center justify-center"
              >
                <Text className="text-blue-500 text-base font-medium">
                  Send Another Link
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
                onPress={() => navigation.goBack()}
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
                <View className="bg-blue-100 w-16 h-16 rounded-2xl items-center justify-center mb-4">
                  <Ionicons name="key-outline" size={32} color="#3B82F6" />
                </View>
                <Text className="text-2xl font-bold text-gray-900 mb-2">
                  Forgot Password?
                </Text>
                <Text className="text-gray-600 text-center">
                  No worries! Enter your email address and we'll send you a link to reset your password.
                </Text>
              </View>

              {/* Email Input */}
              <View className="mb-6">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </Text>
                <View className="relative">
                  <TextInput
                    className={`border ${emailError ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 text-base`}
                    placeholder="Enter your email"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (emailError) setEmailError('');
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    editable={!isLoading}
                  />
                  <View className="absolute right-3 top-3">
                    <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
                  </View>
                </View>
                {emailError ? (
                  <Text className="text-red-500 text-sm mt-1">{emailError}</Text>
                ) : null}
              </View>

              {/* Reset Button */}
              <Pressable
                onPress={handlePasswordReset}
                disabled={isLoading}
                className={`${isLoading ? 'bg-blue-300' : 'bg-blue-500 active:bg-blue-600'} rounded-lg py-3 items-center justify-center mb-4`}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text className="text-white text-base font-semibold">
                    Send Reset Link
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

export default ForgotPasswordScreen;