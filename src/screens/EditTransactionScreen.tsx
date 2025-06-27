import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useTransactionStore } from '../state/transactionStore';
import { Transaction } from '../types';
import { cn } from '../utils/cn';

interface Props {
  navigation: any;
  route: {
    params: {
      transaction: Transaction;
    };
  };
}

const EditTransactionScreen: React.FC<Props> = ({ navigation, route }) => {
  const { transaction } = route.params;
  const { updateTransaction, deleteTransaction, accounts } = useTransactionStore();
  
  const account = accounts.find(a => a.id === transaction.accountId);
  
  const [formData, setFormData] = useState({
    date: new Date(transaction.date),
    payee: transaction.payee,
    amount: Math.abs(transaction.amount).toString(),
    checkNumber: transaction.checkNumber || '',
    notes: transaction.notes || '',
    isCredit: transaction.amount >= 0,
    reconciled: transaction.reconciled,
  });
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.payee.trim()) {
      newErrors.payee = 'Payee is required';
    }
    
    // Only validate amount for manual transactions
    if (transaction.source === 'manual') {
      if (!formData.amount.trim()) {
        newErrors.amount = 'Amount is required';
      } else if (isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
        newErrors.amount = 'Please enter a valid amount';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    // Prepare update object
    const updates: Partial<Transaction> = {
      date: formData.date.toISOString().split('T')[0],
      payee: formData.payee.trim(),
      checkNumber: formData.checkNumber.trim() || undefined,
      notes: formData.notes.trim() || undefined,
      reconciled: formData.reconciled,
    };

    // Only update amount for manual transactions
    if (transaction.source === 'manual') {
      const amount = parseFloat(formData.amount);
      const finalAmount = formData.isCredit ? amount : -amount;
      updates.amount = finalAmount;
    }

    updateTransaction(transaction.id, updates);
    navigation.goBack();
  };

  const handleDelete = () => {
    // Extra protection: Don't allow deletion of bank transactions
    if (transaction.source === 'bank') {
      Alert.alert(
        'Cannot Delete Bank Transaction',
        'Bank transactions cannot be deleted as they reflect actual bank records. Only manual entries can be deleted.',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Delete Manual Transaction',
      'Are you sure you want to delete this manual transaction? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteTransaction(transaction.id);
            navigation.goBack();
          },
        },
      ]
    );
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
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </Pressable>
          
          <View className="items-center">
            <Text className="text-lg font-semibold text-gray-900">
              Edit Transaction
            </Text>
            {account && (
              <Text className="text-sm text-gray-500">
                {account.name}
              </Text>
            )}
          </View>
          
          <View className="flex-row">
            {/* Only show delete button for manual transactions */}
            {transaction.source === 'manual' && (
              <Pressable
                onPress={handleDelete}
                className="p-2 mr-2"
              >
                <Ionicons name="trash-outline" size={24} color="#EF4444" />
              </Pressable>
            )}
            <Pressable
              onPress={handleSave}
              className="px-4 py-2 bg-blue-500 rounded-lg"
            >
              <Text className="text-white font-medium">Save</Text>
            </Pressable>
          </View>
        </View>

        <ScrollView className="flex-1 px-4 py-6">
          {/* Source Indicator */}
          <View className="mb-6 p-4 bg-gray-50 rounded-lg">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons
                  name={transaction.source === 'manual' ? 'receipt-outline' : 'card-outline'}
                  size={20}
                  color="#6B7280"
                />
                <Text className="text-sm text-gray-600 ml-2 capitalize">
                  {transaction.source} Transaction
                </Text>
              </View>
              {transaction.source === 'bank' && (
                <View className="flex-row items-center">
                  <Ionicons name="lock-closed" size={16} color="#9CA3AF" />
                  <Text className="text-xs text-gray-500 ml-1">Amount locked</Text>
                </View>
              )}
            </View>
            {transaction.source === 'bank' && (
              <View>
                <Text className="text-xs text-gray-500 mt-2">
                  Bank transactions allow editing of payee, date, notes, and reconciliation status, but the amount cannot be modified and cannot be deleted.
                </Text>
                
                <View className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded">
                  <View className="flex-row items-center">
                    <Ionicons name="shield-checkmark" size={14} color="#F97316" />
                    <Text className="text-xs text-orange-800 ml-1 font-medium">
                      Protected Bank Transaction
                    </Text>
                  </View>
                  <Text className="text-xs text-orange-700 mt-1">
                    Bank transactions cannot be deleted as they reflect actual bank records. Only manual entries can be deleted.
                  </Text>
                </View>

                {transaction.notes?.includes('Converted from manual entry') && (
                  <View className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                    <View className="flex-row items-center">
                      <Ionicons name="swap-horizontal" size={14} color="#3B82F6" />
                      <Text className="text-xs text-blue-700 ml-1 font-medium">
                        Converted Transaction
                      </Text>
                    </View>
                    <Text className="text-xs text-blue-600 mt-1">
                      This transaction was originally entered manually and was automatically converted to a bank transaction when a matching entry was found during sync.
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Reconciliation Status */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-3">
              Transaction Status
            </Text>
            
            {transaction.source === 'manual' ? (
              <View className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <View className="flex-row items-center justify-between">
                  <Text className="text-base text-gray-700">Manual Entry</Text>
                  <View className="bg-gray-100 px-3 py-1 rounded">
                    <Text className="text-xs font-medium text-red-600">NOT POSTED</Text>
                  </View>
                </View>
                <Text className="text-xs text-gray-500 mt-2">
                  Manual entries show as "NOT POSTED". They will update to "POSTED" when found in bank sync.
                </Text>
              </View>
            ) : transaction.notes?.includes('Converted from manual entry') ? (
              <View className="p-4 border border-purple-200 rounded-lg bg-purple-50">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-base text-gray-900">Converted Manual Entry</Text>
                  <View className="bg-gray-100 px-3 py-1 rounded">
                    <Text className="text-xs font-medium text-blue-600">POSTED</Text>
                  </View>
                </View>
                <Pressable
                  onPress={() => setFormData({ ...formData, reconciled: !formData.reconciled })}
                  className="flex-row items-center justify-between p-3 bg-white rounded border"
                >
                  <Text className="text-sm text-gray-700">
                    Toggle posting status
                  </Text>
                  <View className="bg-gray-100 px-2 py-1 rounded">
                    <Text className={`text-xs font-medium ${
                      formData.reconciled ? 'text-blue-600' : 'text-red-600'
                    }`}>
                      {formData.reconciled ? 'POSTED' : 'NOT POSTED'}
                    </Text>
                  </View>
                </Pressable>
                <Text className="text-xs text-purple-700 mt-2">
                  This transaction was originally manual and converted to bank confirmed.
                </Text>
              </View>
            ) : (
              <Pressable
                onPress={() => setFormData({ ...formData, reconciled: !formData.reconciled })}
                className="flex-row items-center justify-between p-4 border border-gray-300 rounded-lg"
              >
                <Text className="text-base text-gray-900">Bank Transaction</Text>
                <View className="bg-gray-100 px-3 py-1 rounded">
                  <Text className={`text-xs font-medium ${
                    formData.reconciled ? 'text-blue-600' : 'text-red-600'
                  }`}>
                    {formData.reconciled ? 'POSTED' : 'NOT POSTED'}
                  </Text>
                </View>
              </Pressable>
            )}
          </View>

          {/* Transaction Type Toggle - Only for manual transactions */}
          {transaction.source === 'manual' && (
            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-3">
                Transaction Type
              </Text>
              <View className="flex-row bg-gray-100 rounded-lg p-1">
                <Pressable
                  onPress={() => setFormData({ ...formData, isCredit: false })}
                  className={cn(
                    "flex-1 py-3 rounded-md items-center",
                    !formData.isCredit ? "bg-red-500" : "bg-transparent"
                  )}
                >
                  <Text
                    className={cn(
                      "font-medium",
                      !formData.isCredit ? "text-white" : "text-gray-600"
                    )}
                  >
                    Debit (-)
                  </Text>
                </Pressable>
                
                <Pressable
                  onPress={() => setFormData({ ...formData, isCredit: true })}
                  className={cn(
                    "flex-1 py-3 rounded-md items-center",
                    formData.isCredit ? "bg-green-500" : "bg-transparent"
                  )}
                >
                  <Text
                    className={cn(
                      "font-medium",
                      formData.isCredit ? "text-white" : "text-gray-600"
                    )}
                  >
                    Credit (+)
                  </Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* Bank Transaction Type Display - Read-only */}
          {transaction.source === 'bank' && (
            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-3">
                Transaction Type
              </Text>
              <View className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <Text className={cn(
                  "text-base font-medium text-center",
                  formData.isCredit ? "text-green-600" : "text-red-600"
                )}>
                  {formData.isCredit ? "Credit (+)" : "Debit (-)"}
                </Text>
                <Text className="text-xs text-gray-500 text-center mt-1">
                  Bank transaction type cannot be changed
                </Text>
              </View>
            </View>
          )}

          {/* Date */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Date *
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
          </View>

          {/* Payee */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Payee / Description *
            </Text>
            <TextInput
              className={cn(
                "p-4 border rounded-lg text-base",
                errors.payee ? "border-red-500" : "border-gray-300"
              )}
              placeholder="Enter payee name or description"
              value={formData.payee}
              onChangeText={(text) => setFormData({ ...formData, payee: text })}
              placeholderTextColor="#9CA3AF"
            />
            {errors.payee && (
              <Text className="text-red-500 text-sm mt-1">{errors.payee}</Text>
            )}
          </View>

          {/* Amount - Editable for manual, read-only for bank */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Amount *
            </Text>
            {transaction.source === 'manual' ? (
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
            ) : (
              <View className="flex-row items-center border border-gray-200 rounded-lg bg-gray-50">
                <Text className="text-xl font-medium text-gray-600 pl-4">$</Text>
                <View className="flex-1 p-4">
                  <Text className="text-base text-gray-700">
                    {formData.amount}
                  </Text>
                </View>
                <View className="pr-4">
                  <Ionicons name="lock-closed" size={16} color="#9CA3AF" />
                </View>
              </View>
            )}
            {errors.amount && (
              <Text className="text-red-500 text-sm mt-1">{errors.amount}</Text>
            )}
            {transaction.source === 'bank' && (
              <Text className="text-xs text-gray-500 mt-1">
                Bank transaction amounts cannot be modified
              </Text>
            )}
          </View>

          {/* Check Number */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Check Number (Optional)
            </Text>
            <TextInput
              className="p-4 border border-gray-300 rounded-lg text-base"
              placeholder="Enter check number"
              value={formData.checkNumber}
              onChangeText={(text) => setFormData({ ...formData, checkNumber: text })}
              keyboardType="number-pad"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Notes */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </Text>
            <TextInput
              className="p-4 border border-gray-300 rounded-lg text-base"
              placeholder="Add any additional notes..."
              value={formData.notes}
              onChangeText={(text) => setFormData({ ...formData, notes: text })}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default EditTransactionScreen;