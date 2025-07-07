import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTransactionStore } from '../state/transactionStore';
import { PlaidLinkResult, plaidService } from '../services/plaidService';
import PlaidLink from '../components/PlaidLink';

interface Props {
  navigation: any;
}

const BankConnectionScreen: React.FC<Props> = ({ navigation }) => {
  const { connectPlaidAccount, syncPlaidTransactions } = useTransactionStore();
  const [connecting, setConnecting] = useState(false);
  const [isPlaidConfigured, setIsPlaidConfigured] = useState(false);


  useEffect(() => {
    const checkPlaidConfig = async () => {
      const configured = plaidService.isPlaidConfigured();
      setIsPlaidConfigured(configured);
      

    };
    
    checkPlaidConfig();
  }, []);

  const handlePlaidSuccess = async (result: PlaidLinkResult) => {
    try {
      setConnecting(true);
      
      // If multiple accounts, let user choose which one first
      // For now, just take the first account
      const primaryAccount = result.metadata.accounts[0];
      
      if (!primaryAccount) {
        Alert.alert('No Accounts Found', 'No accounts were found in your bank connection.');
        return;
      }

      // Navigate to starting balance selection
      navigation.navigate('StartingBalanceSelection', {
        accessToken: result.publicToken,
        accountData: primaryAccount,
        institutionName: result.metadata.institution.name,
      });
    } catch (error) {
      console.error('Error processing Plaid success:', error);
      Alert.alert(
        'Connection Error',
        'There was an issue connecting your bank account. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setConnecting(false);
    }
  };

  const handlePlaidError = (error: any) => {
    console.error('Plaid Link error:', error);
    Alert.alert(
      'Connection Failed',
      'Unable to connect to your bank. Please check your internet connection and try again.',
      [{ text: 'OK' }]
    );
  };





  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-200">
        <Pressable
          onPress={() => navigation.goBack()}
          className="p-2"
        >
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </Pressable>
        
        <Text className="text-lg font-semibold text-gray-900">
          Connect Bank Account
        </Text>
        
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 px-6 py-8">
        {/* Hero Section */}
        <View className="items-center mb-8">
          <View className="bg-blue-100 w-20 h-20 rounded-full mb-6 items-center justify-center">
            <Ionicons name="business" size={32} color="#3B82F6" />
          </View>
          <Text className="text-2xl font-bold text-gray-900 text-center mb-3">
            Connect Your Bank
          </Text>
          <Text className="text-gray-600 text-center text-base leading-6 px-4">
            Securely connect your bank account to automatically import transactions and keep your register up to date.
          </Text>
        </View>

        {/* Benefits */}
        <View className="mb-8">
          <Text className="text-xl font-bold text-gray-900 mb-6">
            Benefits of Connecting Your Bank
          </Text>
          
          <View className="space-y-5">
            <View className="flex-row items-start">
              <View className="bg-green-100 w-10 h-10 rounded-full mr-4 items-center justify-center">
                <Ionicons name="sync" size={20} color="#10B981" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-900 mb-1">
                  Automatic Transaction Import
                </Text>
                <Text className="text-base text-gray-600">
                  New transactions appear automatically without manual entry
                </Text>
              </View>
            </View>
            
            <View className="flex-row items-start">
              <View className="bg-blue-100 w-10 h-10 rounded-full mr-4 items-center justify-center">
                <Ionicons name="shield-checkmark" size={20} color="#3B82F6" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-900 mb-1">
                  Bank-Level Security
                </Text>
                <Text className="text-base text-gray-600">
                  Your data is protected with 256-bit encryption
                </Text>
              </View>
            </View>
            
            <View className="flex-row items-start">
              <View className="bg-purple-100 w-10 h-10 rounded-full mr-4 items-center justify-center">
                <Ionicons name="trending-up" size={20} color="#8B5CF6" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-900 mb-1">
                  Real-Time Balance Updates
                </Text>
                <Text className="text-base text-gray-600">
                  Always know your current account balance
                </Text>
              </View>
            </View>
            
            <View className="flex-row items-start">
              <View className="bg-orange-100 w-10 h-10 rounded-full mr-4 items-center justify-center">
                <Ionicons name="link" size={20} color="#F97316" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-900 mb-1">
                  Smart Transaction Matching
                </Text>
                <Text className="text-base text-gray-600">
                  Manual entries automatically convert to bank transactions
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Security Notice */}
        <View className="bg-blue-50 p-4 rounded-xl mb-8">
          <View className="flex-row items-start">
            <Ionicons name="information-circle" size={20} color="#3B82F6" />
            <View className="ml-3 flex-1">
              <Text className="text-base font-semibold text-blue-900 mb-1">
                Powered by Plaid
              </Text>
              <Text className="text-sm text-blue-700 leading-5">
                We use Plaid, a secure financial technology service trusted by thousands of apps. Your bank login credentials are never stored on our servers.
              </Text>
            </View>
          </View>
        </View>



        {/* Connect Button */}
        <View className="mb-8">
          {connecting ? (
            <View className="bg-gray-100 p-4 rounded-xl">
              <View className="flex-row items-center justify-center">
                <ActivityIndicator color="#3B82F6" size="small" />
                <Text className="ml-2 text-gray-600 font-medium">
                  Connecting your account...
                </Text>
              </View>
            </View>
          ) : (
            <View className="space-y-3">
              {isPlaidConfigured ? (
                <PlaidLink
                  userId="user-1"
                  onSuccess={handlePlaidSuccess}
                  onError={handlePlaidError}
                  buttonText="Connect Real Bank Account"
                  buttonStyle="primary"
                />
              ) : (
                <View className="bg-gray-100 p-4 rounded-xl">
                  <Text className="text-center text-gray-600 text-base">
                    Bank connection not configured
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Manual Entry Option */}
        <View className="border-t border-gray-200 pt-8">
          <Text className="text-center text-gray-600 mb-6 text-base">
            Prefer to track transactions manually?
          </Text>
          <Pressable
            onPress={() => navigation.navigate('Register')}
            className="border border-gray-300 p-4 rounded-xl"
          >
            <View className="flex-row items-center justify-center">
              <Ionicons name="pencil" size={20} color="#6B7280" />
              <Text className="ml-2 text-gray-700 font-medium text-base">
                Continue with Manual Entry
              </Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default BankConnectionScreen;