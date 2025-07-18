import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../state/authStore';
import { useTransactionStore } from '../state/transactionStore';


interface Props {
  navigation: any;
}

const SignupScreen: React.FC<Props> = ({ navigation }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  
  // Error states
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  
  const { signup, isLoading } = useAuthStore();
  const { updateSettings } = useTransactionStore();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const handleSignup = async () => {
    // Reset errors
    setFirstNameError('');
    setLastNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');

    // Validation
    let hasErrors = false;

    if (!firstName.trim()) {
      setFirstNameError('First name is required');
      hasErrors = true;
    }

    if (!lastName.trim()) {
      setLastNameError('Last name is required');
      hasErrors = true;
    }

    if (!email.trim()) {
      setEmailError('Email is required');
      hasErrors = true;
    } else if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      hasErrors = true;
    }

    if (!password.trim()) {
      setPasswordError('Password is required');
      hasErrors = true;
    } else if (!validatePassword(password)) {
      setPasswordError('Password must be at least 6 characters');
      hasErrors = true;
    }

    if (!confirmPassword.trim()) {
      setConfirmPasswordError('Please confirm your password');
      hasErrors = true;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      hasErrors = true;
    }



    if (hasErrors) return;

    // Attempt signup
    const success = await signup(
      email.trim().toLowerCase(), 
      password, 
      firstName.trim(), 
      lastName.trim()
    );
    
    if (!success) {
      Alert.alert(
        'Signup Failed',
        'An account with this email already exists. Please try logging in instead.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Go to Login', 
            onPress: () => navigation.navigate('Login') 
          }
        ]
      );
    } else {
      // Success - navigation will automatically handle showing the authenticated screens
      // The conditional navigator will switch to authenticated stack automatically
      // No manual navigation needed as isAuthenticated state change triggers re-render
    }
  };

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
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 px-6 py-8">
            {/* Header */}
            <View className="items-center mb-8">
              <View className="w-20 h-20 rounded-3xl shadow-lg overflow-hidden items-center justify-center mb-4">
                <Image
                  source={require('../../assets/new-logo.png')}
                  style={{ width: 72, height: 72 }}
                  resizeMode="contain"
                />
              </View>
              <Text className="text-3xl font-bold text-gray-900 mb-2">
                Create Account
              </Text>
              <Text className="text-gray-600 text-center">
                Join Checkmate and take control of your finances
              </Text>
            </View>

            {/* Signup Form */}
            <View className="mb-6">
              {/* Name Fields */}
              <View className="flex-row mb-4">
                <View className="flex-1 mr-2">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </Text>
                  <TextInput
                    className={`border ${firstNameError ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 text-base`}
                    placeholder="First name"
                    value={firstName}
                    onChangeText={(text) => {
                      setFirstName(text);
                      if (firstNameError) setFirstNameError('');
                    }}
                    autoCapitalize="words"
                    editable={!isLoading}
                  />
                  {firstNameError ? (
                    <Text className="text-red-500 text-xs mt-1">{firstNameError}</Text>
                  ) : null}
                </View>

                <View className="flex-1 ml-2">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </Text>
                  <TextInput
                    className={`border ${lastNameError ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 text-base`}
                    placeholder="Last name"
                    value={lastName}
                    onChangeText={(text) => {
                      setLastName(text);
                      if (lastNameError) setLastNameError('');
                    }}
                    autoCapitalize="words"
                    editable={!isLoading}
                  />
                  {lastNameError ? (
                    <Text className="text-red-500 text-xs mt-1">{lastNameError}</Text>
                  ) : null}
                </View>
              </View>

              {/* Email Input */}
              <View className="mb-4">
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

              {/* Password Input */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Password
                </Text>
                <View className="relative">
                  <TextInput
                    className={`border ${passwordError ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 pr-12 text-base`}
                    placeholder="Create a password"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (passwordError) setPasswordError('');
                    }}
                    secureTextEntry={!showPassword}
                    autoComplete="password-new"
                    editable={!isLoading}
                  />
                  <Pressable
                    onPress={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3"
                  >
                    <Ionicons 
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
                      size={20} 
                      color="#9CA3AF" 
                    />
                  </Pressable>
                </View>
                {passwordError ? (
                  <Text className="text-red-500 text-sm mt-1">{passwordError}</Text>
                ) : null}
              </View>

              {/* Confirm Password Input */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </Text>
                <View className="relative">
                  <TextInput
                    className={`border ${confirmPasswordError ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 pr-12 text-base`}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      if (confirmPasswordError) setConfirmPasswordError('');
                    }}
                    secureTextEntry={!showConfirmPassword}
                    editable={!isLoading}
                  />
                  <Pressable
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3"
                  >
                    <Ionicons 
                      name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} 
                      size={20} 
                      color="#9CA3AF" 
                    />
                  </Pressable>
                </View>
                {confirmPasswordError ? (
                  <Text className="text-red-500 text-sm mt-1">{confirmPasswordError}</Text>
                ) : null}
              </View>



              {/* Signup Button */}
              <Pressable
                onPress={handleSignup}
                disabled={isLoading}
                className={`${isLoading ? 'bg-green-300' : 'bg-green-500 active:bg-green-600'} rounded-lg py-3 items-center justify-center mb-4`}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text className="text-white text-base font-semibold">
                    Create Account
                  </Text>
                )}
              </Pressable>
            </View>

            {/* Login Link */}
            <View className="flex-row justify-center items-center">
              <Text className="text-gray-600 text-sm">
                Already have an account? 
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

export default SignupScreen;