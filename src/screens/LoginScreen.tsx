import React, { useState, useEffect } from 'react';
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

interface Props {
  navigation: any;
}

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  const { login, isLoading, isAuthenticated, rememberedCredentials } = useAuthStore();

  // Effect to navigate when authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      console.log('User authenticated, navigating to BankConnection');
      navigation.navigate('BankConnection');
    }
  }, [isAuthenticated, navigation]);

  // Effect to load remembered credentials
  useEffect(() => {
    if (rememberedCredentials) {
      setEmail(rememberedCredentials.email);
      setPassword(rememberedCredentials.password);
      setRememberMe(true);
    }
  }, [rememberedCredentials]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    // Reset errors
    setEmailError('');
    setPasswordError('');

    // Validation
    let hasErrors = false;

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
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      hasErrors = true;
    }

    if (hasErrors) return;

    // Attempt login
    console.log('Attempting login with:', email.trim().toLowerCase());
    const success = await login(email.trim().toLowerCase(), password, rememberMe);
    console.log('Login result:', success);
    
    if (!success) {
      Alert.alert(
        'Login Failed',
        'Invalid email or password. Please try again.\n\nDemo Account:\nEmail: demo@checkmate.com\nPassword: demo123',
        [{ text: 'OK' }]
      );
    }
    // Navigation will be handled by the useEffect when authentication state changes
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
        >
          <View className="flex-1 px-6 py-8">
            {/* Header */}
            <View className="items-center mb-12">
              <View className="w-20 h-20 rounded-3xl shadow-lg overflow-hidden items-center justify-center mb-4">
                <Image
                  source={require('../../assets/new-logo.png')}
                  style={{ width: 72, height: 72 }}
                  resizeMode="contain"
                />
              </View>
              <Text className="text-3xl font-bold text-gray-900 mb-2">
                Welcome Back
              </Text>
              <Text className="text-gray-600 text-center">
                Sign in to your Checkmate account
              </Text>
            </View>

            {/* Login Form */}
            <View className="mb-8">
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
              <View className="mb-6">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Password
                </Text>
                <View className="relative">
                  <TextInput
                    className={`border ${passwordError ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 pr-12 text-base`}
                    placeholder="Enter your password"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (passwordError) setPasswordError('');
                    }}
                    secureTextEntry={!showPassword}
                    autoComplete="password"
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

              {/* Remember Me Checkbox */}
              <Pressable
                onPress={() => setRememberMe(!rememberMe)}
                className="flex-row items-center mb-6"
                disabled={isLoading}
              >
                <View className={`w-5 h-5 rounded border-2 ${rememberMe ? 'bg-blue-500 border-blue-500' : 'border-gray-300'} items-center justify-center mr-3`}>
                  {rememberMe && (
                    <Ionicons name="checkmark" size={12} color="white" />
                  )}
                </View>
                <Text className="text-sm text-gray-700">
                  Remember me
                </Text>
              </Pressable>

              {/* Login Button */}
              <Pressable
                onPress={handleLogin}
                disabled={isLoading}
                className={`${isLoading ? 'bg-blue-300' : 'bg-blue-500 active:bg-blue-600'} rounded-lg py-3 items-center justify-center mb-4`}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text className="text-white text-base font-semibold">
                    Sign In
                  </Text>
                )}
              </Pressable>

              {/* Forgot Password */}
              <Pressable 
                className="items-center"
                onPress={() => navigation.navigate('ForgotPassword')}
                disabled={isLoading}
              >
                <Text className="text-blue-500 text-sm font-medium">
                  Forgot Password?
                </Text>
              </Pressable>
            </View>

            {/* Demo Account Info */}
            <View className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <View className="flex-row items-start">
                <Ionicons name="information-circle" size={20} color="#3B82F6" />
                <View className="ml-3 flex-1">
                  <Text className="text-sm font-medium text-blue-800">
                    Demo Account
                  </Text>
                  <Text className="text-sm text-blue-700 mt-1">
                    Email: demo@checkmate.com{'\n'}
                    Password: demo123
                  </Text>
                </View>
              </View>
            </View>

            {/* Quick Demo Login */}
            <Pressable
              onPress={async () => {
                setEmail('demo@checkmate.com');
                setPassword('demo123');
                const success = await login('demo@checkmate.com', 'demo123', rememberMe);
                if (success) {
                  console.log('Quick demo login successful');
                  // Navigation will be handled by useEffect
                }
              }}
              disabled={isLoading}
              className="bg-green-500 active:bg-green-600 rounded-lg py-3 items-center justify-center mb-4"
            >
              <Text className="text-white text-base font-semibold">
                Quick Demo Login
              </Text>
            </Pressable>



            {/* Sign Up Link */}
            <View className="flex-row justify-center items-center">
              <Text className="text-gray-600 text-sm">
                Don't have an account? 
              </Text>
              <Pressable
                onPress={() => navigation.navigate('Signup')}
                disabled={isLoading}
              >
                <Text className="text-blue-500 text-sm font-medium ml-1">
                  Sign Up
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;