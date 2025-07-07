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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AuthService from '../services/authService';
import EmailPreviewModal from '../components/EmailPreviewModal';

interface Props {
  navigation: any;
}

const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [resetToken, setResetToken] = useState('');

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
      // Check if there's already a pending reset token
      const hasPendingToken = await AuthService.hasPendingResetToken(email);
      if (hasPendingToken) {
        setEmailError('A password reset email was already sent recently. Please check your email or wait before requesting another.');
        setIsLoading(false);
        return;
      }

      // Request password reset through AuthService
      const result = await AuthService.requestPasswordReset(email);
      
      if (result.success) {
        setResetSent(true);
        // Store the reset token for demo purposes
        if (result.resetToken) {
          setResetToken(result.resetToken);
        }
      } else {
        setEmailError(result.error?.message || 'Failed to send password reset email. Please try again.');
      }
    } catch (error) {
      console.error('Password reset error:', error);
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
            
            <Text className="text-sm text-gray-500 text-center mb-4">
              Please check your email and follow the instructions to reset your password. 
              The link will expire in 1 hour for security.
            </Text>
            
            <View className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
              <View className="flex-row items-center mb-2">
                <Ionicons name="checkmark-circle" size={16} color="#059669" />
                <Text className="ml-2 text-sm font-medium text-green-800">
                  Demo Mode Active
                </Text>
              </View>
              <Text className="text-sm text-green-700 mb-3">
                In production, the email would be automatically sent. For demo purposes, you can:
              </Text>
              <Text className="text-sm text-green-700">
                • View the email preview{'\n'}
                • Use the reset token directly{'\n'}
                • Test the complete flow
              </Text>
            </View>

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
                className="py-3 items-center justify-center mb-2"
              >
                <Text className="text-blue-500 text-base font-medium">
                  Send Another Link
                </Text>
              </Pressable>
              
              <Pressable
                onPress={() => setShowEmailPreview(true)}
                className="py-3 items-center justify-center mb-2"
              >
                <Text className="text-green-600 text-base font-medium">
                  📧 View Email Preview
                </Text>
              </Pressable>
              
              <Pressable
                onPress={() => navigation.navigate('ResetPassword', { email, token: resetToken })}
                className="py-3 items-center justify-center"
              >
                <Text className="text-gray-500 text-base font-medium">
                  Already have a reset token?
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
        
        <EmailPreviewModal
          visible={showEmailPreview}
          onClose={() => setShowEmailPreview(false)}
          email={email}
          resetToken={resetToken}
        />
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
              
              {/* Demo Info */}
              <View className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <View className="flex-row items-center mb-2">
                  <Ionicons name="information-circle" size={16} color="#3B82F6" />
                  <Text className="ml-2 text-sm font-medium text-blue-800">
                    Demo Mode
                  </Text>
                </View>
                <Text className="text-sm text-blue-700">
                  In production, the password reset email would be automatically sent to your email address. 
                  For demo purposes, we'll show you the email content and reset token.
                </Text>
              </View>
            </View>



            {/* Links */}
            <View className="space-y-3">
              {/* Already have token link */}
              <View className="flex-row justify-center items-center">
                <Text className="text-gray-600 text-sm">
                  Already have a reset token? 
                </Text>
                <Pressable
                  onPress={() => navigation.navigate('ResetPassword')}
                  disabled={isLoading}
                >
                  <Text className="text-blue-500 text-sm font-medium ml-1">
                    Reset Now
                  </Text>
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
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      <EmailPreviewModal
        visible={showEmailPreview}
        onClose={() => setShowEmailPreview(false)}
        email={email}
        resetToken={resetToken}
      />
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen;