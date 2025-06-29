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
import { PlaidLinkResult, plaidService, MockBankInstitution } from '../services/plaidService';
import PlaidLink from '../components/PlaidLink';

interface Props {
  navigation: any;
}

const BankConnectionScreen: React.FC<Props> = ({ navigation }) => {
  const { connectPlaidAccount, syncPlaidTransactions } = useTransactionStore();
  const [connecting, setConnecting] = useState(false);
  const [isPlaidConfigured, setIsPlaidConfigured] = useState(false);
  const [mockInstitutions, setMockInstitutions] = useState<MockBankInstitution[]>([]);
  const [showInstitutionSelection, setShowInstitutionSelection] = useState(false);

  useEffect(() => {
    const checkPlaidConfig = async () => {
      const configured = plaidService.isPlaidConfigured();
      setIsPlaidConfigured(configured);
      
      if (!configured) {
        setMockInstitutions(plaidService.getMockInstitutions());
      }
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

  const handleDemoConnection = async (institution: MockBankInstitution) => {
    try {
      setConnecting(true);
      
      // Simulate connecting to the demo institution
      const demoResult = await plaidService.exchangePublicTokenOrDemo('DEMO_MODE', institution.id);
      
      // Get the first account (or let user choose)
      const primaryAccount = institution.accounts[0];
      
      if (!primaryAccount) {
        Alert.alert('No Accounts Found', 'No accounts were found in this demo bank.');
        return;
      }

      // Navigate to starting balance selection with demo data
      navigation.navigate('StartingBalanceSelection', {
        accessToken: demoResult,
        accountData: primaryAccount,
        institutionName: institution.name,
        isDemo: true,
      });
    } catch (error) {
      console.error('Error with demo connection:', error);
      Alert.alert(
        'Demo Connection Error',
        'There was an issue with the demo connection. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setConnecting(false);
    }
  };

  const renderDemoInstitutions = () => {
    if (isPlaidConfigured || !showInstitutionSelection) {
      return null;
    }

    return (
      <View className="mb-8">
        <Text className="text-lg font-semibold text-gray-900 mb-4">
          Choose a Demo Bank
        </Text>
        <Text className="text-sm text-gray-600 mb-4">
          These are demo banks with sample transaction data. You can connect to any of them to explore the app features.
        </Text>
        
        <View className="space-y-3">
          {mockInstitutions.map((institution) => (
            <Pressable
              key={institution.id}
              onPress={() => handleDemoConnection(institution)}
              className="border border-gray-200 p-4 rounded-lg bg-white active:bg-gray-50"
              disabled={connecting}
            >
              <View className="flex-row items-center">
                <Text className="text-2xl mr-3">{institution.logo}</Text>
                <View className="flex-1">
                  <Text className="font-semibold text-gray-900">
                    {institution.name}
                  </Text>
                  <Text className="text-sm text-gray-600">
                    {institution.accounts.length} account{institution.accounts.length !== 1 ? 's' : ''} • {institution.transactions.length} sample transactions
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </View>
            </Pressable>
          ))}
        </View>
        
        <Pressable
          onPress={() => setShowInstitutionSelection(false)}
          className="mt-4 p-3 border border-gray-300 rounded-lg"
        >
          <Text className="text-center text-gray-600 font-medium">
            ← Back to Connection Options
          </Text>
        </Pressable>
      </View>
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
          <View className="bg-blue-100 p-6 rounded-full mb-4">
            <Ionicons name="business" size={48} color="#3B82F6" />
          </View>
          <Text className="text-2xl font-bold text-gray-900 text-center mb-2">
            Connect Your Bank
          </Text>
          <Text className="text-gray-600 text-center text-base leading-6">
            Securely connect your bank account to automatically import transactions and keep your register up to date.
          </Text>
        </View>

        {/* Benefits */}
        <View className="mb-8">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Benefits of Connecting Your Bank
          </Text>
          
          <View className="space-y-4">
            <View className="flex-row items-start">
              <View className="bg-green-100 p-2 rounded-full mr-3 mt-1">
                <Ionicons name="sync" size={16} color="#10B981" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-medium text-gray-900">
                  Automatic Transaction Import
                </Text>
                <Text className="text-sm text-gray-600 mt-1">
                  New transactions appear automatically without manual entry
                </Text>
              </View>
            </View>
            
            <View className="flex-row items-start">
              <View className="bg-blue-100 p-2 rounded-full mr-3 mt-1">
                <Ionicons name="shield-checkmark" size={16} color="#3B82F6" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-medium text-gray-900">
                  Bank-Level Security
                </Text>
                <Text className="text-sm text-gray-600 mt-1">
                  Your data is protected with 256-bit encryption
                </Text>
              </View>
            </View>
            
            <View className="flex-row items-start">
              <View className="bg-purple-100 p-2 rounded-full mr-3 mt-1">
                <Ionicons name="analytics" size={16} color="#8B5CF6" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-medium text-gray-900">
                  Real-Time Balance Updates
                </Text>
                <Text className="text-sm text-gray-600 mt-1">
                  Always know your current account balance
                </Text>
              </View>
            </View>
            
            <View className="flex-row items-start">
              <View className="bg-orange-100 p-2 rounded-full mr-3 mt-1">
                <Ionicons name="git-merge" size={16} color="#F97316" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-medium text-gray-900">
                  Smart Transaction Matching
                </Text>
                <Text className="text-sm text-gray-600 mt-1">
                  Manual entries automatically convert to bank transactions
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Security Notice */}
        <View className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-8">
          <View className="flex-row items-start">
            <Ionicons name="information-circle" size={20} color="#3B82F6" />
            <View className="ml-3 flex-1">
              <Text className="text-sm font-medium text-blue-900">
                Powered by Plaid
              </Text>
              <Text className="text-xs text-blue-700 mt-1">
                We use Plaid, a secure financial technology service trusted by thousands of apps. Your bank login credentials are never stored on our servers.
              </Text>
            </View>
          </View>
        </View>

        {/* Demo Institution Selection */}
        {renderDemoInstitutions()}

        {/* Connect Button */}
        {!showInstitutionSelection && (
          <View className="mb-8">
            {connecting ? (
              <View className="bg-gray-100 p-4 rounded-lg">
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
                  <Pressable
                    onPress={() => setShowInstitutionSelection(true)}
                    className="bg-blue-600 p-4 rounded-lg active:bg-blue-700"
                  >
                    <View className="flex-row items-center justify-center">
                      <Ionicons name="business" size={20} color="white" />
                      <Text className="ml-2 text-white font-semibold text-base">
                        Connect Demo Bank Account
                      </Text>
                    </View>
                  </Pressable>
                )}
                
                {/* Demo Mode Indicator */}
                {!isPlaidConfigured && (
                  <View className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                    <View className="flex-row items-start">
                      <Ionicons name="information-circle" size={16} color="#EA580C" />
                      <Text className="ml-2 text-xs text-orange-800 flex-1">
                        <Text className="font-semibold">Demo Mode:</Text> Connect to sample banks with realistic transaction data to explore all features.
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {/* Manual Entry Option */}
        <View className="border-t border-gray-200 pt-6">
          <Text className="text-center text-gray-600 mb-4">
            Prefer to track transactions manually?
          </Text>
          <Pressable
            onPress={() => navigation.navigate('Register')}
            className="border border-gray-300 p-3 rounded-lg"
          >
            <View className="flex-row items-center justify-center">
              <Ionicons name="pencil" size={20} color="#6B7280" />
              <Text className="ml-2 text-gray-700 font-medium">
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