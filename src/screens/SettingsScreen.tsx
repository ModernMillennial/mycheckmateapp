import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Switch,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useTransactionStore } from '../state/transactionStore';

interface Props {
  navigation: any;
}

const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { settings, updateSettings, syncBankTransactions } = useTransactionStore();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startBalance, setStartBalance] = useState(settings.lastBalance.toString());
  const [isLoading, setIsLoading] = useState(false);

  const handleSyncBank = async () => {
    setIsLoading(true);
    
    // Simulate bank sync with mock data
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      const mockBankTransactions = [
        {
          userId: 'user-1',
          date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
          payee: 'Direct Deposit - Payroll',
          amount: 2500.00,
          source: 'bank' as const,
          notes: 'Monthly salary deposit',
          reconciled: false,
        },
        {
          userId: 'user-1',
          date: new Date(Date.now() - 172800000).toISOString().split('T')[0], // 2 days ago
          payee: 'Amazon Purchase',
          amount: -89.99,
          source: 'bank' as const,
          notes: 'Online purchase',
          reconciled: false,
        },
        {
          userId: 'user-1',
          date: new Date(Date.now() - 259200000).toISOString().split('T')[0], // 3 days ago
          payee: 'Gas Station',
          amount: -45.67,
          source: 'bank' as const,
          notes: 'Fuel purchase',
          reconciled: false,
        },
      ];
      
      syncBankTransactions(mockBankTransactions);
      updateSettings({ bankLinked: true });
      
      Alert.alert(
        'Sync Complete',
        `Successfully imported ${mockBankTransactions.length} transactions from your bank account.`
      );
    } catch (error) {
      Alert.alert('Sync Failed', 'Unable to sync with bank account. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveStartBalance = () => {
    const balance = parseFloat(startBalance) || 0;
    updateSettings({ lastBalance: balance });
    Alert.alert('Saved', 'Starting balance updated successfully.');
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      updateSettings({ startDate: selectedDate.toISOString().split('T')[0] });
    }
  };

  const SettingRow = ({ 
    title, 
    subtitle, 
    onPress, 
    rightComponent 
  }: { 
    title: string; 
    subtitle?: string; 
    onPress?: () => void; 
    rightComponent?: React.ReactNode;
  }) => (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between p-4 border-b border-gray-100"
    >
      <View className="flex-1">
        <Text className="text-base font-medium text-gray-900">{title}</Text>
        {subtitle && (
          <Text className="text-sm text-gray-500 mt-1">{subtitle}</Text>
        )}
      </View>
      {rightComponent}
    </Pressable>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-4 py-4 border-b border-gray-200">
        <Pressable
          onPress={() => navigation.goBack()}
          className="p-2"
        >
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </Pressable>
        
        <Text className="text-lg font-semibold text-gray-900 ml-2">
          Settings
        </Text>
      </View>

      <ScrollView className="flex-1">
        {/* Bank Integration Section */}
        <View className="mt-6">
          <Text className="text-sm font-semibold text-gray-500 uppercase tracking-wide px-4 mb-3">
            Bank Integration
          </Text>
          
          <View className="bg-white">
            <SettingRow
              title="Bank Account Status"
              subtitle={settings.bankLinked ? 'Connected' : 'Not connected'}
              rightComponent={
                <View className="flex-row items-center">
                  <View
                    className={`w-3 h-3 rounded-full mr-2 ${
                      settings.bankLinked ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  />
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </View>
              }
            />
            
            <SettingRow
              title="Sync Bank Transactions"
              subtitle="Import recent transactions from your bank"
              onPress={handleSyncBank}
              rightComponent={
                isLoading ? (
                  <Text className="text-blue-500">Syncing...</Text>
                ) : (
                  <Ionicons name="sync-outline" size={20} color="#3B82F6" />
                )
              }
            />
            
            <SettingRow
              title="Sync Start Date"
              subtitle={`Import transactions from ${new Date(settings.startDate).toLocaleDateString()}`}
              onPress={() => setShowDatePicker(true)}
              rightComponent={
                <Ionicons name="calendar-outline" size={20} color="#9CA3AF" />
              }
            />
          </View>
        </View>

        {/* Register Settings Section */}
        <View className="mt-8">
          <Text className="text-sm font-semibold text-gray-500 uppercase tracking-wide px-4 mb-3">
            Register Settings
          </Text>
          
          <View className="bg-white">
            <View className="p-4 border-b border-gray-100">
              <Text className="text-base font-medium text-gray-900 mb-2">
                Starting Balance
              </Text>
              <View className="flex-row items-center">
                <Text className="text-xl font-medium text-gray-600 mr-2">$</Text>
                <TextInput
                  className="flex-1 p-3 border border-gray-300 rounded-lg text-base mr-3"
                  placeholder="0.00"
                  value={startBalance}
                  onChangeText={setStartBalance}
                  keyboardType="decimal-pad"
                />
                <Pressable
                  onPress={handleSaveStartBalance}
                  className="px-4 py-3 bg-blue-500 rounded-lg"
                >
                  <Text className="text-white font-medium">Save</Text>
                </Pressable>
              </View>
            </View>
            
            <View className="flex-row items-center justify-between p-4">
              <View className="flex-1">
                <Text className="text-base font-medium text-gray-900">
                  Monthly Reset
                </Text>
                <Text className="text-sm text-gray-500 mt-1">
                  Start a new register each month
                </Text>
              </View>
              <Switch
                value={settings.monthlyResetEnabled}
                onValueChange={(value) => updateSettings({ monthlyResetEnabled: value })}
                trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* App Information Section */}
        <View className="mt-8">
          <Text className="text-sm font-semibold text-gray-500 uppercase tracking-wide px-4 mb-3">
            App Information
          </Text>
          
          <View className="bg-white">
            <SettingRow
              title="About Digital Register"
              subtitle="Version 1.0.0"
              rightComponent={<Ionicons name="information-circle-outline" size={20} color="#9CA3AF" />}
            />
            
            <SettingRow
              title="Help & Support"
              subtitle="Get help with using the app"
              rightComponent={<Ionicons name="help-circle-outline" size={20} color="#9CA3AF" />}
            />
          </View>
        </View>

        {/* Mock Bank Notice */}
        <View className="mx-4 mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <View className="flex-row items-start">
            <Ionicons name="information-circle" size={20} color="#F59E0B" />
            <View className="ml-3 flex-1">
              <Text className="text-sm font-medium text-yellow-800">
                Demo Mode
              </Text>
              <Text className="text-sm text-yellow-700 mt-1">
                Bank sync currently uses mock data for demonstration purposes. 
                In a production app, this would connect to your actual bank account via Plaid or similar service.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={new Date(settings.startDate)}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}
    </SafeAreaView>
  );
};

export default SettingsScreen;