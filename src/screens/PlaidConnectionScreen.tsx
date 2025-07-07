import React from 'react';
import {
  View,
  Text,
  ScrollView,
} from 'react-native';
import { Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePlaidItems } from '../state/plaidStore';
import PlaidLink from '../components/PlaidLink';
import { isProduction } from '../config/plaid';

const PlaidConnectionScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const items = usePlaidItems();

  const handleNavigateToAccounts = () => {
    navigation.navigate('Accounts');
  };

  const handleLinkSuccess = () => {
    navigation.navigate('Accounts');
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
      >
        {/* Header */}
        <View className="mb-8 text-center">
          <Text className="text-2xl font-bold text-gray-900 mb-2 text-center">
            Connect Your Bank Account
          </Text>
          <Text className="text-gray-600 text-center">
            Securely link your bank account to get started
          </Text>
        </View>

        {/* Status Card */}
        <View className={`rounded-xl p-4 mb-6 ${
          isProduction ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'
        }`}>
          <View className="flex-row items-center mb-2">
            <Ionicons 
              name="shield-checkmark-outline" 
              size={20} 
              color={isProduction ? '#059669' : '#3B82F6'} 
            />
            <Text className={`ml-2 font-semibold ${
              isProduction ? 'text-green-700' : 'text-blue-700'
            }`}>
              Secure Connection
            </Text>
          </View>
          <Text className={isProduction ? 'text-green-600' : 'text-blue-600'}>
            Your bank credentials are encrypted and never stored on our servers
          </Text>
        </View>

        {/* Main Actions */}
        <View className="space-y-4">
          <PlaidLink
            userId={`user-${Date.now()}`}
            onSuccess={handleLinkSuccess}
            buttonText="Connect Bank Account"
            autoLink={false}
          />
          
          {items.length > 0 && (
            <Pressable
              onPress={handleNavigateToAccounts}
              className="bg-gray-500 p-4 rounded-lg active:bg-gray-600"
            >
              <View className="flex-row items-center justify-center">
                <Ionicons name="wallet-outline" size={20} color="white" />
                <Text className="ml-2 text-white font-medium">
                  View Connected Accounts ({items.length})
                </Text>
              </View>
            </Pressable>
          )}
        </View>

        {/* Benefits */}
        <View className="mt-8">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Why connect your bank?
          </Text>
          
          <View className="space-y-3">
            <View className="flex-row items-start">
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text className="ml-3 text-gray-700 flex-1">
                Automatic transaction syncing saves time
              </Text>
            </View>
            
            <View className="flex-row items-start">
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text className="ml-3 text-gray-700 flex-1">
                Real-time balance updates
              </Text>
            </View>
            
            <View className="flex-row items-start">
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text className="ml-3 text-gray-700 flex-1">
                Categorized transactions for better insights
              </Text>
            </View>
            
            <View className="flex-row items-start">
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text className="ml-3 text-gray-700 flex-1">
                Secure, bank-level encryption
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PlaidConnectionScreen;