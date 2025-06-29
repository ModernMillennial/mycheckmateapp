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

interface Props {
  navigation: any;
}

const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  const { user, isAuthenticated } = useAuthStore();

  const features = [
    {
      icon: 'card-outline',
      title: 'Digital Checkbook',
      description: 'Track your transactions like a traditional checkbook register',
      color: '#3B82F6'
    },
    {
      icon: 'sync-outline',
      title: 'Bank Integration',
      description: 'Connect your bank account for automatic transaction sync',
      color: '#10B981'
    },
    {
      icon: 'analytics-outline',
      title: 'Smart Matching',
      description: 'Manual entries automatically convert to bank transactions',
      color: '#8B5CF6'
    },
    {
      icon: 'calculator-outline',
      title: 'Built-in Tools',
      description: 'Calculator, reports, and balance tracking all in one place',
      color: '#F59E0B'
    }
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="flex-1 px-6 py-8">
          {/* Header */}
          <View className="items-center mb-12">
            <View className="bg-blue-500 w-24 h-24 rounded-3xl items-center justify-center mb-6">
              <Ionicons name="checkmark-circle" size={64} color="white" />
            </View>
            <Text className="text-3xl font-bold text-gray-900 mb-2 text-center">
              Welcome to CheckMate!
            </Text>
            <Text className="text-lg text-gray-600 text-center mb-2">
              {isAuthenticated && user?.firstName ? `Hi ${user.firstName}! ` : ''}Ready to take control of your finances?
            </Text>
            <Text className="text-gray-500 text-center">
              {isAuthenticated ? 'Let\'s get you started with your digital checkbook' : 'Your modern digital checkbook awaits'}
            </Text>
          </View>

          {/* Features */}
          <View className="mb-12">
            <Text className="text-xl font-semibold text-gray-900 mb-6 text-center">
              What you can do with CheckMate
            </Text>
            
            {features.map((feature, index) => (
              <View key={index} className="flex-row items-start mb-6">
                <View 
                  className="w-12 h-12 rounded-xl items-center justify-center mr-4"
                  style={{ backgroundColor: feature.color + '20' }}
                >
                  <Ionicons name={feature.icon as any} size={24} color={feature.color} />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-900 mb-1">
                    {feature.title}
                  </Text>
                  <Text className="text-sm text-gray-600">
                    {feature.description}
                  </Text>
                </View>
              </View>
            ))}
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

                <Pressable
                  onPress={() => {
                    // Auto-login with demo credentials
                    const { login } = useAuthStore.getState();
                    login('demo@checkmate.com', 'demo123');
                  }}
                  className="bg-gray-600 active:bg-gray-700 rounded-lg py-4 items-center justify-center"
                >
                  <Text className="text-white text-base font-semibold">
                    🚀 Try Demo (No Account Needed)
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