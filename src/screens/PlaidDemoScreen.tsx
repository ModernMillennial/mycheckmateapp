import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePlaidStore, usePlaidItems } from '../state/plaidStore';
import PlaidLink from '../components/PlaidLink';
import { PLAID_CONFIG, SANDBOX_TEST_CREDENTIALS, isProduction } from '../config/plaid';

const FeatureCard: React.FC<{
  icon: string;
  title: string;
  description: string;
  color: string;
}> = ({ icon, title, description, color }) => (
  <View className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
    <View className="flex-row items-center mb-2">
      <View className={`w-10 h-10 rounded-full ${color} items-center justify-center mr-3`}>
        <Ionicons name={icon as any} size={20} color="white" />
      </View>
      <Text className="font-semibold text-gray-900 text-lg flex-1">
        {title}
      </Text>
    </View>
    <Text className="text-gray-600">{description}</Text>
  </View>
);

const ConfigCard: React.FC<{
  title: string;
  value: string;
  description: string;
  icon: string;
  color: string;
}> = ({ title, value, description, icon, color }) => (
  <View className="bg-white rounded-lg p-4 mb-2 border border-gray-100">
    <View className="flex-row items-center justify-between mb-2">
      <View className="flex-row items-center">
        <Ionicons name={icon as any} size={16} color={color} />
        <Text className="ml-2 font-medium text-gray-900">{title}</Text>
      </View>
      <Text className={`font-mono text-sm px-2 py-1 rounded ${
        value.includes('production') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
      }`}>
        {value}
      </Text>
    </View>
    <Text className="text-gray-600 text-sm">{description}</Text>
  </View>
);

const PlaidDemoScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const items = usePlaidItems();
  const { reset, clearError } = usePlaidStore();
  const [showConfig, setShowConfig] = useState(false);

  const handleReset = () => {
    Alert.alert(
      'Reset All Data',
      'This will remove all connected accounts and clear all Plaid data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            reset();
            clearError();
            Alert.alert('Success', 'All Plaid data has been cleared');
          },
        },
      ]
    );
  };

  const handleNavigateToAccounts = () => {
    navigation.navigate('Accounts');
  };

  const handleLinkSuccess = () => {
    Alert.alert(
      'Account Connected!',
      'Your account has been successfully connected. You can now view your accounts and transactions.',
      [
        {
          text: 'View Accounts',
          onPress: handleNavigateToAccounts,
        },
        { text: 'Stay Here', style: 'cancel' },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
      >
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-gray-900 mb-2">
            Plaid Integration Demo
          </Text>
          <Text className="text-gray-600">
            Experience secure bank account connectivity with comprehensive transaction management
          </Text>
        </View>

        {/* Status Card */}
        <View className={`rounded-xl p-4 mb-6 ${
          isProduction ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'
        }`}>
          <View className="flex-row items-center mb-2">
            <Ionicons 
              name={isProduction ? 'warning-outline' : 'checkmark-circle-outline'} 
              size={20} 
              color={isProduction ? '#DC2626' : '#059669'} 
            />
            <Text className={`ml-2 font-semibold ${
              isProduction ? 'text-red-700' : 'text-green-700'
            }`}>
              {isProduction ? 'Production Mode' : 'Sandbox Mode'}
            </Text>
          </View>
          <Text className={isProduction ? 'text-red-600' : 'text-green-600'}>
            {isProduction 
              ? 'Using live Plaid environment with real bank data'
              : 'Using Plaid sandbox with test data - safe for development'
            }
          </Text>
        </View>

        {/* Quick Actions */}
        <View className="mb-6">
          <Text className="text-xl font-bold text-gray-900 mb-4">Quick Actions</Text>
          
          <PlaidLink
            userId="demo-user-123"
            onSuccess={handleLinkSuccess}
            buttonText="Connect Bank Account"
            autoLink={true}
          />
          
          <View className="flex-row mt-3 space-x-3">
            <Pressable
              onPress={handleNavigateToAccounts}
              className="flex-1 bg-blue-500 p-3 rounded-lg active:bg-blue-600"
            >
              <View className="flex-row items-center justify-center">
                <Ionicons name="wallet-outline" size={20} color="white" />
                <Text className="ml-2 text-white font-medium">
                  View Accounts ({items.length})
                </Text>
              </View>
            </Pressable>
            
            <Pressable
              onPress={handleReset}
              className="bg-red-500 p-3 rounded-lg active:bg-red-600"
            >
              <Ionicons name="trash-outline" size={20} color="white" />
            </Pressable>
          </View>
        </View>

        {/* Features */}
        <View className="mb-6">
          <Text className="text-xl font-bold text-gray-900 mb-4">Features</Text>
          
          <FeatureCard
            icon="shield-checkmark-outline"
            title="Secure Authentication"
            description="Bank-level security with OAuth and encryption for all account connections"
            color="bg-green-500"
          />
          
          <FeatureCard
            icon="card-outline"
            title="Account Management"
            description="View all connected accounts with real-time balance updates"
            color="bg-blue-500"
          />
          
          <FeatureCard
            icon="list-outline"
            title="Transaction History"
            description="Comprehensive transaction data with categorization and merchant information"
            color="bg-purple-500"
          />
          
          <FeatureCard
            icon="refresh-outline"
            title="Real-time Sync"
            description="Automatic transaction updates and account balance synchronization"
            color="bg-orange-500"
          />
          
          <FeatureCard
            icon="analytics-outline"
            title="Rich Metadata"
            description="Detailed transaction categories, merchant names, and location data"
            color="bg-indigo-500"
          />
        </View>

        {/* Configuration Toggle */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold text-gray-900">Configuration</Text>
            <View className="flex-row items-center">
              <Text className="text-gray-600 mr-2">Show Details</Text>
              <Switch
                value={showConfig}
                onValueChange={setShowConfig}
                trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
                thumbColor={showConfig ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>
          </View>

          {showConfig && (
            <View>
              <ConfigCard
                icon="server-outline"
                title="Environment"
                value={isProduction ? 'production' : 'sandbox'}
                description={`Connected to Plaid ${isProduction ? 'production' : 'sandbox'} environment`}
                color="#3B82F6"
              />
              
              <ConfigCard
                icon="apps-outline"
                title="Products"
                value={PLAID_CONFIG.products.join(', ')}
                description="Enabled Plaid products for data access"
                color="#059669"
              />
              
              <ConfigCard
                icon="globe-outline"
                title="Countries"
                value={PLAID_CONFIG.countryCodes.join(', ')}
                description="Supported country codes for institution access"
                color="#7C3AED"
              />
              
              {!isProduction && (
                <ConfigCard
                  icon="flask-outline"
                  title="Test Credentials"
                  value={`${SANDBOX_TEST_CREDENTIALS.username} / ${SANDBOX_TEST_CREDENTIALS.password}`}
                  description="Sandbox test credentials for demo institutions"
                  color="#F59E0B"
                />
              )}
            </View>
          )}
        </View>

        {/* Instructions */}
        <View className="bg-blue-50 rounded-xl p-4 mb-6">
          <View className="flex-row items-center mb-3">
            <Ionicons name="information-circle-outline" size={20} color="#3B82F6" />
            <Text className="ml-2 font-semibold text-blue-900">
              How to Use
            </Text>
          </View>
          
          <View className="space-y-2">
            <Text className="text-blue-800 text-sm">• Tap "Connect Bank Account" to start the linking process</Text>
            <Text className="text-blue-800 text-sm">• Select your bank from the list of institutions</Text>
            <Text className="text-blue-800 text-sm">• Enter your credentials securely through Plaid</Text>
            <Text className="text-blue-800 text-sm">• View accounts and transactions in real-time</Text>
            <Text className="text-blue-800 text-sm">• Use "View Accounts" to manage connected accounts</Text>
          </View>
        </View>

        {/* Sandbox Instructions */}
        {!isProduction && (
          <View className="bg-yellow-50 rounded-xl p-4">
            <View className="flex-row items-center mb-3">
              <Ionicons name="construct-outline" size={20} color="#F59E0B" />
              <Text className="ml-2 font-semibold text-yellow-800">
                Sandbox Testing
              </Text>
            </View>
            
            <Text className="text-yellow-700 text-sm mb-2">
              In sandbox mode, you can test with these credentials:
            </Text>
            
            <View className="bg-yellow-100 rounded-lg p-3">
              <Text className="font-mono text-yellow-800 text-sm">
                Username: {SANDBOX_TEST_CREDENTIALS.username}
              </Text>
              <Text className="font-mono text-yellow-800 text-sm">
                Password: {SANDBOX_TEST_CREDENTIALS.password}
              </Text>
            </View>
            
            <Text className="text-yellow-700 text-sm mt-2">
              Choose "Chase Bank" or any other institution to test the integration.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default PlaidDemoScreen;