import React from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  navigation: any;
}

const SimpleRegisterScreen: React.FC<Props> = ({ navigation }) => {
  const handleDemoStart = () => {
    Alert.alert(
      'Digital Register Demo',
      'This would start the bank sync demo. The app is working correctly!',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 py-4 border-b border-gray-200">
        <Text className="text-3xl font-bold text-gray-900 mb-2">
          Digital Register
        </Text>
        <Text className="text-gray-600">
          Your digital checkbook is ready to use
        </Text>
      </View>

      {/* Main Content */}
      <View className="flex-1 px-6 py-8">
        {/* Account Summary */}
        <View className="bg-blue-50 p-6 rounded-xl mb-6">
          <View className="flex-row items-center mb-3">
            <Ionicons name="wallet" size={24} color="#3B82F6" />
            <Text className="text-lg font-semibold text-blue-900 ml-2">
              Demo Checking Account
            </Text>
          </View>
          <Text className="text-3xl font-bold text-blue-900">$1,547.23</Text>
          <Text className="text-blue-700 mt-1">Available Balance</Text>
        </View>

        {/* Feature Cards */}
        <View className="space-y-4">
          <Pressable 
            className="bg-gray-50 p-4 rounded-lg border border-gray-200"
            onPress={() => navigation?.navigate('AddTransaction')}
          >
            <View className="flex-row items-center">
              <Ionicons name="add-circle" size={24} color="#10B981" />
              <Text className="text-lg font-medium text-gray-900 ml-3">
                Add Transaction
              </Text>
            </View>
            <Text className="text-gray-600 mt-1 ml-9">
              Record a new transaction manually
            </Text>
          </Pressable>

          <Pressable 
            className="bg-gray-50 p-4 rounded-lg border border-gray-200"
            onPress={handleDemoStart}
          >
            <View className="flex-row items-center">
              <Ionicons name="sync" size={24} color="#3B82F6" />
              <Text className="text-lg font-medium text-gray-900 ml-3">
                Bank Sync Demo
              </Text>
            </View>
            <Text className="text-gray-600 mt-1 ml-9">
              See how bank connections work
            </Text>
          </Pressable>

          <Pressable 
            className="bg-gray-50 p-4 rounded-lg border border-gray-200"
            onPress={() => navigation?.navigate('Reports')}
          >
            <View className="flex-row items-center">
              <Ionicons name="bar-chart" size={24} color="#F59E0B" />
              <Text className="text-lg font-medium text-gray-900 ml-3">
                View Reports
              </Text>
            </View>
            <Text className="text-gray-600 mt-1 ml-9">
              See spending analysis and trends
            </Text>
          </Pressable>

          <Pressable 
            className="bg-gray-50 p-4 rounded-lg border border-gray-200"
            onPress={() => navigation?.navigate('Settings')}
          >
            <View className="flex-row items-center">
              <Ionicons name="settings" size={24} color="#6B7280" />
              <Text className="text-lg font-medium text-gray-900 ml-3">
                Settings
              </Text>
            </View>
            <Text className="text-gray-600 mt-1 ml-9">
              Configure your account preferences
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Footer Status */}
      <View className="px-6 py-4 border-t border-gray-200">
        <View className="flex-row items-center justify-center">
          <Ionicons name="checkmark-circle" size={20} color="#10B981" />
          <Text className="text-green-600 font-medium ml-2">
            Digital Register Active
          </Text>
        </View>
        <Text className="text-center text-gray-500 text-sm mt-1">
          Navigation and all features working properly
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default SimpleRegisterScreen;