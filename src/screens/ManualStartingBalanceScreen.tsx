import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useTransactionStore } from '../state/transactionStore';
import { cn } from '../utils/cn';

interface Props {
  navigation: any;
}

const ManualStartingBalanceScreen: React.FC<Props> = ({ navigation }) => {
  const { addTransaction, getActiveAccount, accounts, createAccount } = useTransactionStore();
  
  const [formData, setFormData] = useState({
    date: new Date(),
    amount: '',
    accountName: '',
    notes: '',
  });
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.accountName.trim()) {
      newErrors.accountName = 'Account name is required';
    }
    
    if (!formData.amount.trim()) {
      newErrors.amount = 'Starting balance is required';
    } else if (isNaN(parseFloat(formData.amount))) {
      newErrors.amount = 'Please enter a valid amount';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const amount = parseFloat(formData.amount);
    
    // Create the account if it doesn't exist
    let targetAccount = getActiveAccount();
    
    if (!targetAccount || formData.accountName.trim() !== targetAccount.name) {
      // Create a new account with the specified name
      const newAccount = {
        id: `account-${Date.now()}`,
        name: formData.accountName.trim(),
        type: 'checking' as const,
        balance: amount,
        isActive: true,
        userId: 'user-1', // In a real app, this would come from auth
        source: 'manual' as const,
      };
      
      createAccount(newAccount);
      targetAccount = newAccount;
    }

    if (!targetAccount) return;

    // Add the starting balance transaction
    addTransaction({
      userId: 'user-1', // In a real app, this would come from auth
      accountId: targetAccount.id,
      date: formData.date.toISOString().split('T')[0],
      payee: 'Starting Balance',
      amount: amount,
      source: 'manual',
      category: 'Transfer',
      notes: formData.notes.trim() || 'Initial account balance',
      reconciled: false,
    });

    setShowSuccessModal(true);
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData({ ...formData, date: selectedDate });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-200">
          <Pressable
            onPress={() => navigation.goBack()}
            className="p-2"
          >
            <Ionicons name="close" size={24} color="#374151" />
          </Pressable>
          
          <Text className="text-lg font-semibold text-gray-900">
            Set Starting Balance
          </Text>
          
          <Pressable
            onPress={handleSave}
            className="px-4 py-2 bg-blue-500 rounded-lg"
          >
            <Text className="text-white font-medium">Save</Text>
          </Pressable>
        </View>

        <ScrollView className="flex-1 px-4 py-6">
          {/* Info Card */}
          <View className="bg-blue-50 p-4 rounded-lg mb-6">
            <View className="flex-row items-start">
              <Ionicons name="information-circle" size={24} color="#3B82F6" />
              <View className="ml-3 flex-1">
                <Text className="text-blue-900 font-medium mb-1">
                  Manual Starting Balance
                </Text>
                <Text className="text-blue-700 text-sm leading-5">
                  Set up your account with a manual starting balance. This is useful when you want to track from a specific date without connecting to your bank.
                </Text>
              </View>
            </View>
          </View>

          {/* Account Name */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Account Name *
            </Text>
            <TextInput
              className={cn(
                "p-4 border rounded-lg text-base",
                errors.accountName ? "border-red-500" : "border-gray-300"
              )}
              placeholder="e.g., Main Checking, Savings Account"
              value={formData.accountName}
              onChangeText={(text) => setFormData({ ...formData, accountName: text })}
              placeholderTextColor="#9CA3AF"
            />
            {errors.accountName && (
              <Text className="text-red-500 text-sm mt-1">{errors.accountName}</Text>
            )}
          </View>

          {/* Starting Date */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Starting Date *
            </Text>
            <Pressable
              onPress={() => setShowDatePicker(true)}
              className="flex-row items-center justify-between p-4 border border-gray-300 rounded-lg"
            >
              <Text className="text-base text-gray-900">
                {formData.date.toLocaleDateString()}
              </Text>
              <Ionicons name="calendar-outline" size={20} color="#6B7280" />
            </Pressable>
            
            {showDatePicker && (
              <DateTimePicker
                value={formData.date}
                mode="date"
                display="default"
                onChange={onDateChange}
              />
            )}
            
            <Text className="text-xs text-gray-500 mt-1">
              The date your account balance starts tracking from
            </Text>
          </View>

          {/* Starting Balance */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Starting Balance *
            </Text>
            <View
              className={cn(
                "flex-row items-center border rounded-lg",
                errors.amount ? "border-red-500" : "border-gray-300"
              )}
            >
              <Text className="text-xl font-medium text-gray-600 pl-4">$</Text>
              <TextInput
                className="flex-1 p-4 text-base"
                placeholder="0.00"
                value={formData.amount}
                onChangeText={(text) => setFormData({ ...formData, amount: text })}
                keyboardType="decimal-pad"
                placeholderTextColor="#9CA3AF"
              />
            </View>
            {errors.amount && (
              <Text className="text-red-500 text-sm mt-1">{errors.amount}</Text>
            )}
            <Text className="text-xs text-gray-500 mt-1">
              Your account balance as of the starting date
            </Text>
          </View>

          {/* Notes */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </Text>
            <TextInput
              className="p-4 border border-gray-300 rounded-lg text-base"
              placeholder="Add any notes about this starting balance..."
              value={formData.notes}
              onChangeText={(text) => setFormData({ ...formData, notes: text })}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Preview Card */}
          <View className="bg-gray-50 p-4 rounded-lg">
            <Text className="text-sm font-medium text-gray-700 mb-3">
              Preview
            </Text>
            <View className="space-y-2">
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Account:</Text>
                <Text className="text-gray-900 font-medium">
                  {formData.accountName || 'Account Name'}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Starting Date:</Text>
                <Text className="text-gray-900 font-medium">
                  {formData.date.toLocaleDateString()}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Starting Balance:</Text>
                <Text className="text-gray-900 font-medium">
                  ${formData.amount || '0.00'}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <View className="items-center mb-4">
              <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center mb-4">
                <Ionicons name="checkmark-circle" size={32} color="#10B981" />
              </View>
              <Text className="text-xl font-bold text-gray-900 text-center mb-2">
                Starting Balance Set! 🎉
              </Text>
              <Text className="text-gray-600 text-center leading-6">
                Your account "{formData.accountName}" has been created with a starting balance of ${parseFloat(formData.amount || '0').toFixed(2)}.
              </Text>
            </View>
            <Pressable
              onPress={() => {
                setShowSuccessModal(false);
                navigation.navigate('Register');
              }}
              className="bg-blue-500 py-3 px-6 rounded-lg"
            >
              <Text className="text-white font-semibold text-center">
                Go to Register
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ManualStartingBalanceScreen;