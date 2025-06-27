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
  const { settings, updateSettings, syncBankTransactions, getActiveAccount, updateAccount } = useTransactionStore();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showBalanceDatePicker, setShowBalanceDatePicker] = useState(false);
  const [startBalance, setStartBalance] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const activeAccount = getActiveAccount();
  
  React.useEffect(() => {
    if (activeAccount) {
      setStartBalance(activeAccount.startingBalance.toString());
    }
  }, [activeAccount]);

  const handleSyncBank = async () => {
    setIsLoading(true);
    
    const activeAccount = getActiveAccount();
    if (!activeAccount) {
      Alert.alert('No Active Account', 'Please select an account first.');
      setIsLoading(false);
      return;
    }
    
    // Simulate bank sync with mock data
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      const mockBankTransactions = [
        // This will convert the "Grocery Store" manual transaction (exact match)
        {
          userId: 'user-1',
          accountId: activeAccount.id,
          date: new Date(Date.now() - 86400000 * 6).toISOString().split('T')[0], // 6 days ago (within matching window)
          payee: 'SAFEWAY GROCERY STORE #1234',
          amount: -125.67,
          source: 'bank' as const,
          notes: 'Debit card purchase',
          reconciled: false,
        },
        // This will convert the "Shell Gas Station" manual transaction  
        {
          userId: 'user-1',
          accountId: activeAccount.id,
          date: new Date(Date.now() - 86400000 * 1).toISOString().split('T')[0], // Yesterday (1 day after manual entry)
          payee: 'SHELL OIL STATION #4567',
          amount: -45.00,
          source: 'bank' as const,
          notes: 'Fuel purchase',
          reconciled: false,
        },
        // This will convert the "Local Restaurant" manual transaction
        {
          userId: 'user-1',
          accountId: activeAccount.id,
          date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow (1 day after manual entry)
          payee: 'LOCAL RESTAURANT & BAR',
          amount: -28.75,
          source: 'bank' as const,
          notes: 'Card payment',
          reconciled: false,
        },
        // New bank transaction with no manual equivalent
        {
          userId: 'user-1',
          accountId: activeAccount.id,
          date: new Date().toISOString().split('T')[0], // Today
          payee: 'Amazon.com Purchase',
          amount: -89.99,
          source: 'bank' as const,
          notes: 'Online purchase',
          reconciled: false,
        },
        // Recent deposit that will trigger notification
        {
          userId: 'user-1',
          accountId: activeAccount.id,
          date: new Date().toISOString().split('T')[0], // Today
          payee: 'Direct Deposit Payroll',
          amount: 500.00,
          source: 'bank' as const,
          notes: 'Bi-weekly salary',
          reconciled: false,
        },
      ];
      
      const { transactions: currentTransactions } = useTransactionStore.getState();
      const manualCountBefore = currentTransactions.filter(t => t.source === 'manual').length;
      const bankCountBefore = currentTransactions.filter(t => t.source === 'bank').length;
      
      syncBankTransactions(mockBankTransactions);
      updateSettings({ bankLinked: true });
      
      // Check how many manual transactions were converted
      setTimeout(() => {
        const { transactions: updatedTransactions } = useTransactionStore.getState();
        const manualCountAfter = updatedTransactions.filter(t => t.source === 'manual').length;
        const bankCountAfter = updatedTransactions.filter(t => t.source === 'bank').length;
        
        const convertedCount = manualCountBefore - manualCountAfter;
        const newBankCount = bankCountAfter - bankCountBefore;
        
        let message = `Bank sync completed successfully!`;
        
        if (convertedCount > 0) {
          message += `\n\n✅ ${convertedCount} manual entr${convertedCount > 1 ? 'ies were' : 'y was'} converted to bank transactions (no duplicates created).`;
        }
        
        if (newBankCount > convertedCount) {
          const newCount = newBankCount - convertedCount;
          message += `\n\n📥 ${newCount} new bank transaction${newCount > 1 ? 's were' : ' was'} imported.`;
        }
        
        if (convertedCount === 0 && newBankCount === 0) {
          message += '\n\nNo new transactions found.';
        }
        
        Alert.alert('Sync Complete', message);
      }, 100);
      
    } catch (error) {
      Alert.alert('Sync Failed', 'Unable to sync with bank account. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveStartBalance = () => {
    if (!activeAccount) return;
    
    const balance = parseFloat(startBalance) || 0;
    updateAccount(activeAccount.id, { startingBalance: balance });
    Alert.alert('Saved', 'Starting balance updated successfully.');
  };

  const handleSaveStartBalanceDate = (selectedDate: Date) => {
    if (!activeAccount) return;
    
    updateAccount(activeAccount.id, { 
      startingBalanceDate: selectedDate.toISOString().split('T')[0] 
    });
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      updateSettings({ startDate: selectedDate.toISOString().split('T')[0] });
    }
  };

  const onBalanceDateChange = (event: any, selectedDate?: Date) => {
    setShowBalanceDatePicker(false);
    if (selectedDate) {
      handleSaveStartBalanceDate(selectedDate);
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

        {/* Account Management Section */}
        <View className="mt-8">
          <Text className="text-sm font-semibold text-gray-500 uppercase tracking-wide px-4 mb-3">
            Account Management
          </Text>
          
          <View className="bg-white">
            <SettingRow
              title="Manage Accounts"
              subtitle="Add, edit, or switch between your bank accounts"
              onPress={() => navigation.navigate('Accounts')}
              rightComponent={<Ionicons name="card-outline" size={20} color="#9CA3AF" />}
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
              <Text className="text-base font-medium text-gray-900 mb-3">
                Starting Balance for {activeAccount?.name || 'Active Account'}
              </Text>
              
              {/* Starting Balance Amount */}
              <View className="flex-row items-center mb-4">
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

              {/* Starting Balance Date */}
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Starting Balance Date
                </Text>
                <Pressable
                  onPress={() => setShowBalanceDatePicker(true)}
                  className="flex-row items-center justify-between p-3 border border-gray-300 rounded-lg"
                >
                  <Text className="text-base text-gray-900">
                    {activeAccount 
                      ? new Date(activeAccount.startingBalanceDate).toLocaleDateString()
                      : 'Select Date'
                    }
                  </Text>
                  <Ionicons name="calendar-outline" size={20} color="#6B7280" />
                </Pressable>
                <Text className="text-xs text-gray-500 mt-2">
                  This date determines when your starting balance is shown in the transaction list
                </Text>
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

        {/* Notifications Section */}
        <View className="mt-8">
          <Text className="text-sm font-semibold text-gray-500 uppercase tracking-wide px-4 mb-3">
            Notifications
          </Text>
          
          <View className="bg-white">
            <SettingRow
              title="Push Notifications"
              subtitle="Configure alerts for deposits, debits, and overdrafts"
              onPress={() => navigation.navigate('NotificationSettings')}
              rightComponent={<Ionicons name="notifications-outline" size={20} color="#9CA3AF" />}
            />
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

      {/* Date Picker Modals */}
      {showDatePicker && (
        <DateTimePicker
          value={new Date(settings.startDate)}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}
      
      {showBalanceDatePicker && activeAccount && (
        <DateTimePicker
          value={new Date(activeAccount.startingBalanceDate)}
          mode="date"
          display="default"
          onChange={onBalanceDateChange}
        />
      )}
    </SafeAreaView>
  );
};

export default SettingsScreen;