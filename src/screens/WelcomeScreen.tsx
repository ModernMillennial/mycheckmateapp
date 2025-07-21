import React from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../state/authStore';
import { TransparentLogo } from '../components/TransparentLogo';
import { Image } from 'react-native';

interface Props {
  navigation: any;
}

const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  const { user, isAuthenticated } = useAuthStore();



  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="flex-1 px-6 py-8">
          {/* Header */}
          <View className="items-center mb-12">
            <View className="w-24 h-24 rounded-3xl shadow-lg overflow-hidden items-center justify-center mb-6">
              <Image
                source={require('../../assets/new-logo.png')}
                style={{ width: 84, height: 84 }}
                resizeMode="contain"
              />
            </View>
            <Text className="text-3xl font-bold text-gray-900 mb-2 text-center">
              Welcome to Checkmate
            </Text>
            <Text className="text-lg text-gray-600 text-center mb-2">
              {isAuthenticated && user?.firstName ? `Hi ${user.firstName}! ` : ''}Ready to take control of your finances?
            </Text>
            <Text className="text-gray-500 text-center">
              {isAuthenticated ? 'Let\'s get you started with your digital checkbook' : 'Your modern digital checkbook awaits'}
            </Text>
          </View>



          {/* Get Started Button */}
          <View className="mb-8">
            {isAuthenticated ? (
              <>
                <Pressable
                  onPress={() => navigation.replace('Register')}
                  className="bg-blue-500 active:bg-blue-600 rounded-lg py-4 items-center justify-center mb-4"
                >
                  <Text className="text-white text-lg font-semibold">
                    Get Started
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => navigation.navigate('BankConnection')}
                  className="border border-blue-500 rounded-lg py-4 items-center justify-center"
                >
                  <Text className="text-blue-500 text-base font-semibold">
                    Connect Bank Account First
                  </Text>
                </Pressable>
              </>
            ) : (
              <>
                <Pressable
                  onPress={() => navigation.navigate('Signup')}
                  className="bg-blue-500 active:bg-blue-600 rounded-lg py-4 items-center justify-center mb-4"
                >
                  <Text className="text-white text-lg font-semibold">
                    Create Account
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => navigation.navigate('Login')}
                  className="border border-blue-500 rounded-lg py-4 items-center justify-center mb-3"
                >
                  <Text className="text-blue-500 text-base font-semibold">
                    I Already Have an Account
                  </Text>
                </Pressable>


              </>
            )}
          </View>

          {/* Tips */}
          <View className="bg-gray-50 rounded-lg p-4">
            <View className="flex-row items-start">
              <Ionicons name="bulb-outline" size={20} color="#F59E0B" />
              <View className="ml-3 flex-1">
                <Text className="text-sm font-medium text-gray-800">
                  Pro Tip
                </Text>
                <Text className="text-sm text-gray-600 mt-1">
                  Start by connecting your bank account to automatically import your transaction history and current balance.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default WelcomeScreen;