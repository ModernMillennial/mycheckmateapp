import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  FlatList,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTransactionStore } from '../state/transactionStore';
import { Account } from '../types';
import { cn } from '../utils/cn';

interface Props {
  navigation: any;
}

const AccountsScreen: React.FC<Props> = ({ navigation }) => {
  const { accounts, addAccount, updateAccount, deleteAccount, switchAccount, getActiveAccount } = useTransactionStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const activeAccount = getActiveAccount();

  const handleDeleteAccount = (account: Account) => {
    Alert.alert(
      'Delete Account',
      `Are you sure you want to delete "${account.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            try {
              deleteAccount(account.id);
            } catch (error) {
              Alert.alert('Cannot Delete', 'This account has existing transactions and cannot be deleted.');
            }
          },
        },
      ]
    );
  };

  const renderAccount = ({ item }: { item: Account }) => (
    <Pressable
      onPress={() => switchAccount(item.id)}
      className="bg-white mx-4 mb-3 p-4 rounded-lg shadow-sm border-2"
      style={{ 
        borderColor: activeAccount?.id === item.id ? item.color : '#E5E7EB' 
      }}
    >
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <View
              className="w-4 h-4 rounded-full mr-3"
              style={{ backgroundColor: item.color }}
            />
            <Text className="text-lg font-bold text-gray-900">
              {item.name}
            </Text>
            {activeAccount?.id === item.id && (
              <View className="ml-2 px-2 py-1 bg-blue-100 rounded-full">
                <Text className="text-xs font-medium text-blue-800">Active</Text>
              </View>
            )}
          </View>
          
          <Text className="text-sm text-gray-600 mb-1">
            {item.bankName} •••{item.accountNumber}
          </Text>
          
          <Text className="text-xs text-gray-500 capitalize">
            {item.type} Account
          </Text>
        </View>
        
        <View className="items-end">
          <Text className="text-2xl font-bold text-gray-900">
            ${item.currentBalance.toFixed(2)}
          </Text>
          <Text className="text-sm text-gray-500">
            Current Balance
          </Text>
        </View>
      </View>

      <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
        <Text className="text-sm text-gray-600">
          Starting Balance: ${item.startingBalance.toFixed(2)}
        </Text>
        
        <View className="flex-row">
          <Pressable
            onPress={() => handleDeleteAccount(item)}
            className="p-2 ml-2"
          >
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={() => navigation.goBack()}
            className="p-2"
          >
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </Pressable>
          
          <Text className="text-lg font-semibold text-gray-900">
            Manage Accounts
          </Text>
          
          <Pressable
            onPress={() => setShowAddModal(true)}
            className="p-2"
          >
            <Ionicons name="add" size={24} color="#3B82F6" />
          </Pressable>
        </View>
      </View>

      {/* Account Summary */}
      <View className="px-4 py-4">
        <View className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <Text className="text-sm font-medium text-gray-500 mb-2">Total Across All Accounts</Text>
          <Text className="text-2xl font-bold text-gray-900">
            ${accounts.reduce((sum, account) => sum + account.currentBalance, 0).toFixed(2)}
          </Text>
          <Text className="text-sm text-gray-500 mt-1">
            {accounts.length} account{accounts.length !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      {/* Account List */}
      <View className="flex-1">
        <Text className="text-lg font-semibold text-gray-900 px-4 mb-4">
          Your Accounts
        </Text>
        
        <FlatList
          data={accounts}
          renderItem={renderAccount}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </View>

      {/* Add Account Modal */}
      <AddAccountModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={addAccount}
      />
    </SafeAreaView>
  );
};

// Add Account Modal Component
interface AddAccountModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (account: Omit<Account, 'id'>) => void;
}

const AddAccountModal: React.FC<AddAccountModalProps> = ({ visible, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'checking' as 'checking' | 'savings' | 'credit',
    bankName: '',
    accountNumber: '',
    startingBalance: '',
    startingBalanceDate: new Date(),
    color: '#3B82F6',
  });
  
  const [showDatePicker, setShowDatePicker] = useState(false);

  const colors = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#06B6D4', // Cyan
    '#F97316', // Orange
    '#84CC16', // Lime
  ];

  const handleSave = () => {
    if (!formData.name.trim() || !formData.bankName.trim() || !formData.accountNumber.trim()) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    const balance = parseFloat(formData.startingBalance) || 0;

    onSave({
      name: formData.name.trim(),
      type: formData.type,
      bankName: formData.bankName.trim(),
      accountNumber: formData.accountNumber.trim(),
      isActive: true,
      startingBalance: balance,
      startingBalanceDate: formData.startingBalanceDate.toISOString().split('T')[0],
      currentBalance: balance,
      color: formData.color,
    });

    // Reset form
    setFormData({
      name: '',
      type: 'checking',
      bankName: '',
      accountNumber: '',
      startingBalance: '',
      startingBalanceDate: new Date(),
      color: '#3B82F6',
    });

    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-200">
          <Pressable onPress={onClose} className="p-2">
            <Text className="text-blue-500 text-lg">Cancel</Text>
          </Pressable>
          
          <Text className="text-lg font-semibold text-gray-900">
            Add Account
          </Text>
          
          <Pressable onPress={handleSave} className="p-2">
            <Text className="text-blue-500 text-lg font-semibold">Save</Text>
          </Pressable>
        </View>

        <ScrollView className="flex-1 px-4 py-6">
          {/* Account Name */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">Account Name *</Text>
            <TextInput
              className="p-4 border border-gray-300 rounded-lg text-base"
              placeholder="e.g., Primary Checking"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />
          </View>

          {/* Account Type */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-3">Account Type</Text>
            <View className="flex-row bg-gray-100 rounded-lg p-1">
              {[
                { key: 'checking', label: 'Checking' },
                { key: 'savings', label: 'Savings' },
                { key: 'credit', label: 'Credit' },
              ].map((type) => (
                <Pressable
                  key={type.key}
                  onPress={() => setFormData({ ...formData, type: type.key as any })}
                  className={cn(
                    "flex-1 py-3 rounded-md items-center",
                    formData.type === type.key ? "bg-blue-500" : "bg-transparent"
                  )}
                >
                  <Text
                    className={cn(
                      "font-medium",
                      formData.type === type.key ? "text-white" : "text-gray-600"
                    )}
                  >
                    {type.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Bank Name */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">Bank Name *</Text>
            <TextInput
              className="p-4 border border-gray-300 rounded-lg text-base"
              placeholder="e.g., Chase Bank"
              value={formData.bankName}
              onChangeText={(text) => setFormData({ ...formData, bankName: text })}
            />
          </View>

          {/* Account Number (Last 4) */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">Account Number (Last 4 digits) *</Text>
            <TextInput
              className="p-4 border border-gray-300 rounded-lg text-base"
              placeholder="1234"
              value={formData.accountNumber}
              onChangeText={(text) => setFormData({ ...formData, accountNumber: text.slice(0, 4) })}
              keyboardType="number-pad"
              maxLength={4}
            />
          </View>

          {/* Starting Balance */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">Starting Balance</Text>
            <View className="flex-row items-center border border-gray-300 rounded-lg mb-3">
              <Text className="text-xl font-medium text-gray-600 pl-4">$</Text>
              <TextInput
                className="flex-1 p-4 text-base"
                placeholder="0.00"
                value={formData.startingBalance}
                onChangeText={(text) => setFormData({ ...formData, startingBalance: text })}
                keyboardType="decimal-pad"
              />
            </View>
            
            {/* Starting Balance Date */}
            <Text className="text-sm font-medium text-gray-700 mb-2">Starting Balance Date</Text>
            <Pressable
              onPress={() => setShowDatePicker(true)}
              className="flex-row items-center justify-between p-4 border border-gray-300 rounded-lg"
            >
              <Text className="text-base text-gray-900">
                {formData.startingBalanceDate.toLocaleDateString()}
              </Text>
              <Ionicons name="calendar-outline" size={20} color="#6B7280" />
            </Pressable>
          </View>

          {/* Color Selection */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-3">Account Color</Text>
            <View className="flex-row flex-wrap">
              {colors.map((color) => (
                <Pressable
                  key={color}
                  onPress={() => setFormData({ ...formData, color })}
                  className="w-12 h-12 rounded-full mr-3 mb-3 items-center justify-center border-2"
                  style={{ 
                    backgroundColor: color,
                    borderColor: formData.color === color ? '#374151' : 'transparent'
                  }}
                >
                  {formData.color === color && (
                    <Ionicons name="checkmark" size={20} color="white" />
                  )}
                </Pressable>
              ))}
            </View>
          </View>
        </ScrollView>
        
        {/* Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={formData.startingBalanceDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                setFormData({ ...formData, startingBalanceDate: selectedDate });
              }
            }}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
};

export default AccountsScreen;