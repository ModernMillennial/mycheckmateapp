import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useTransactionStore } from '../state/transactionStore';
import { cn } from '../utils/cn';

interface Props {
  visible: boolean;
  onComplete: () => void;
  onCancel: () => void;
}

const InitialBankSyncScreen: React.FC<Props> = ({ visible, onComplete, onCancel }) => {
  const { getActiveAccount, updateAccount, syncBankTransactions, updateSettings } = useTransactionStore();
  const activeAccount = getActiveAccount();
  
  const [step, setStep] = useState<'setup' | 'sync' | 'complete'>('setup');
  const [formData, setFormData] = useState({
    startingBalance: '',
    startingDate: new Date(),
    syncFromDate: new Date(Date.now() - 86400000 * 30), // 30 days ago default
  });
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showSyncDatePicker, setShowSyncDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSetupComplete = () => {
    if (!formData.startingBalance.trim()) {
      Alert.alert('Missing Information', 'Please enter your bank account balance.');
      return;
    }

    const balance = parseFloat(formData.startingBalance);
    if (isNaN(balance)) {
      Alert.alert('Invalid Amount', 'Please enter a valid balance amount.');
      return;
    }

    if (!activeAccount) {
      Alert.alert('Error', 'No active account selected.');
      return;
    }

    // Update account with bank balance and date
    updateAccount(activeAccount.id, {
      startingBalance: balance,
      startingBalanceDate: formData.startingDate.toISOString().split('T')[0],
    });

    // Update global sync settings
    updateSettings({
      startDate: formData.syncFromDate.toISOString().split('T')[0],
      bankLinked: true,
    });

    setStep('sync');
    performBankSync();
  };

  const performBankSync = async () => {
    setIsLoading(true);
    
    try {
      // Simulate bank sync delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock bank transactions based on sync date
      const mockBankTransactions = generateMockBankTransactions();
      
      syncBankTransactions(mockBankTransactions);
      
      setStep('complete');
      
    } catch (error) {
      Alert.alert('Sync Failed', 'Unable to sync with bank account. Please try again.');
      setStep('setup');
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockBankTransactions = () => {
    const syncFromTime = formData.syncFromDate.getTime();
    const dayMs = 86400000;
    
    return [
      // Recent transactions
      {
        userId: 'user-1',
        accountId: activeAccount!.id,
        date: new Date(Date.now() - dayMs).toISOString().split('T')[0], // Yesterday
        payee: 'GROCERY STORE INC',
        amount: -87.43,
        source: 'bank' as const,
        notes: 'Debit card purchase',
        reconciled: false,
      },
      {
        userId: 'user-1',
        accountId: activeAccount!.id,
        date: new Date(Date.now() - dayMs * 2).toISOString().split('T')[0], // 2 days ago
        payee: 'PAYROLL DIRECT DEPOSIT',
        amount: 2500.00,
        source: 'bank' as const,
        notes: 'Bi-weekly salary',
        reconciled: false,
      },
      {
        userId: 'user-1',
        accountId: activeAccount!.id,
        date: new Date(Date.now() - dayMs * 3).toISOString().split('T')[0], // 3 days ago
        payee: 'GAS STATION #4567',
        amount: -45.20,
        source: 'bank' as const,
        notes: 'Fuel purchase',
        reconciled: false,
      },
      // Additional transactions if sync date is older
      ...(syncFromTime < Date.now() - dayMs * 7 ? [
        {
          userId: 'user-1',
          accountId: activeAccount!.id,
          date: new Date(Date.now() - dayMs * 8).toISOString().split('T')[0],
          payee: 'ELECTRIC COMPANY',
          amount: -125.67,
          source: 'bank' as const,
          notes: 'Monthly utility bill',
          reconciled: false,
        },
        {
          userId: 'user-1',
          accountId: activeAccount!.id,
          date: new Date(Date.now() - dayMs * 12).toISOString().split('T')[0],
          payee: 'RESTAURANT DOWNTOWN',
          amount: -34.50,
          source: 'bank' as const,
          notes: 'Dinner',
          reconciled: false,
        }
      ] : [])
    ];
  };

  const handleComplete = () => {
    onComplete();
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-200">
          <Pressable onPress={onCancel} className="p-2">
            <Text className="text-blue-500 text-lg">Cancel</Text>
          </Pressable>
          
          <Text className="text-lg font-semibold text-gray-900">
            Bank Account Setup
          </Text>
          
          <View className="w-16" />
        </View>

        {step === 'setup' && (
          <ScrollView className="flex-1 px-4 py-6">
            <View className="mb-6">
              <View className="flex-row items-center mb-4">
                <Ionicons name="bank" size={24} color="#3B82F6" />
                <Text className="text-xl font-bold text-gray-900 ml-3">
                  Connect Your Bank Account
                </Text>
              </View>
              <Text className="text-gray-600 text-base leading-relaxed">
                To get started, we need to set up your account with your current bank balance and choose how far back to sync transactions.
              </Text>
            </View>

            {/* Current Bank Balance */}
            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Current Bank Balance *
              </Text>
              <Text className="text-xs text-gray-500 mb-3">
                Check your bank app or website for your current balance
              </Text>
              <View className="flex-row items-center border border-gray-300 rounded-lg">
                <Text className="text-xl font-medium text-gray-600 pl-4">$</Text>
                <TextInput
                  className="flex-1 p-4 text-base"
                  placeholder="0.00"
                  value={formData.startingBalance}
                  onChangeText={(text) => setFormData({ ...formData, startingBalance: text })}
                  keyboardType="decimal-pad"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            {/* Balance Date */}
            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Balance Date *
              </Text>
              <Text className="text-xs text-gray-500 mb-3">
                The date of the balance above (usually today)
              </Text>
              <Pressable
                onPress={() => setShowStartDatePicker(true)}
                className="flex-row items-center justify-between p-4 border border-gray-300 rounded-lg"
              >
                <Text className="text-base text-gray-900">
                  {formData.startingDate.toLocaleDateString()}
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#6B7280" />
              </Pressable>
            </View>

            {/* Sync From Date */}
            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Import Transactions From *
              </Text>
              <Text className="text-xs text-gray-500 mb-3">
                How far back should we import your transaction history?
              </Text>
              <Pressable
                onPress={() => setShowSyncDatePicker(true)}
                className="flex-row items-center justify-between p-4 border border-gray-300 rounded-lg"
              >
                <Text className="text-base text-gray-900">
                  {formData.syncFromDate.toLocaleDateString()}
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#6B7280" />
              </Pressable>
              
              {/* Quick Date Options */}
              <View className="flex-row flex-wrap mt-3">
                {[
                  { label: '1 Week', days: 7 },
                  { label: '1 Month', days: 30 },
                  { label: '3 Months', days: 90 },
                ].map((option) => (
                  <Pressable
                    key={option.label}
                    onPress={() => setFormData({
                      ...formData,
                      syncFromDate: new Date(Date.now() - option.days * 86400000)
                    })}
                    className="mr-3 mb-2 px-3 py-2 bg-blue-100 rounded-lg"
                  >
                    <Text className="text-sm text-blue-700 font-medium">
                      {option.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Information Box */}
            <View className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <View className="flex-row items-start">
                <Ionicons name="information-circle" size={20} color="#3B82F6" />
                <View className="ml-3 flex-1">
                  <Text className="text-sm font-medium text-blue-800">
                    What happens next?
                  </Text>
                  <Text className="text-sm text-blue-700 mt-1">
                    1. We'll set your starting balance and date{'\n'}
                    2. Import transactions from your chosen date{'\n'}
                    3. Your digital register will be ready to use
                  </Text>
                </View>
              </View>
            </View>

            <Pressable
              onPress={handleSetupComplete}
              className="bg-blue-500 p-4 rounded-lg items-center"
            >
              <Text className="text-white font-semibold text-lg">
                Connect & Sync Account
              </Text>
            </Pressable>
          </ScrollView>
        )}

        {step === 'sync' && (
          <View className="flex-1 items-center justify-center px-4">
            <View className="items-center">
              <Ionicons name="sync" size={64} color="#3B82F6" />
              <Text className="text-xl font-semibold text-gray-900 mt-4">
                Syncing with Bank
              </Text>
              <Text className="text-gray-600 text-center mt-2">
                Importing transactions from {formData.syncFromDate.toLocaleDateString()}...
              </Text>
              <Text className="text-sm text-gray-500 text-center mt-4">
                This may take a few moments
              </Text>
            </View>
          </View>
        )}

        {step === 'complete' && (
          <View className="flex-1 items-center justify-center px-4">
            <View className="items-center">
              <Ionicons name="checkmark-circle" size={64} color="#10B981" />
              <Text className="text-xl font-semibold text-gray-900 mt-4">
                Setup Complete!
              </Text>
              <Text className="text-gray-600 text-center mt-2 leading-relaxed">
                Your bank account has been connected and transactions have been imported. Your digital register is ready to use.
              </Text>
              
              <View className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <Text className="text-sm font-medium text-green-800 mb-2">
                  Account Summary:
                </Text>
                <Text className="text-sm text-green-700">
                  • Starting Balance: ${parseFloat(formData.startingBalance || '0').toFixed(2)}{'\n'}
                  • Balance Date: {formData.startingDate.toLocaleDateString()}{'\n'}
                  • Transactions imported from: {formData.syncFromDate.toLocaleDateString()}
                </Text>
              </View>

              <Pressable
                onPress={handleComplete}
                className="bg-blue-500 px-8 py-4 rounded-lg items-center mt-8"
              >
                <Text className="text-white font-semibold text-lg">
                  Start Using Digital Register
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Date Pickers */}
        {showStartDatePicker && (
          <DateTimePicker
            value={formData.startingDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowStartDatePicker(false);
              if (selectedDate) {
                setFormData({ ...formData, startingDate: selectedDate });
              }
            }}
          />
        )}

        {showSyncDatePicker && (
          <DateTimePicker
            value={formData.syncFromDate}
            mode="date"
            display="default"
            maximumDate={new Date()}
            onChange={(event, selectedDate) => {
              setShowSyncDatePicker(false);
              if (selectedDate) {
                setFormData({ ...formData, syncFromDate: selectedDate });
              }
            }}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
};

export default InitialBankSyncScreen;