import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useTransactionStore } from '../state/transactionStore';
import { useCategoryStore, Category } from '../state/categoryStore';
import { AITransactionMatcher } from '../services/aiTransactionMatcher';
import { cn } from '../utils/cn';

interface Props {
  navigation: any;
}

const AddTransactionScreen: React.FC<Props> = ({ navigation }) => {
  const { addTransaction, getActiveAccount, transactions } = useTransactionStore();
  const { categories, addCategory, initializeDefaults } = useCategoryStore();
  
  const [formData, setFormData] = useState({
    date: new Date(),
    payee: '',
    amount: '',
    category: '',
    checkNumber: '',
    notes: '',
    isCredit: false,
  });
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [payeeSuggestions, setPayeeSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    initializeDefaults();
  }, []);

  // Get AI payee suggestions when user types
  useEffect(() => {
    const getSuggestions = async () => {
      if (formData.payee.length >= 3) {
        setIsLoadingSuggestions(true);
        const bankTransactions = transactions.filter(t => t.source === 'bank');
        const suggestions = await AITransactionMatcher.suggestPayeeCorrection(
          formData.payee,
          bankTransactions
        );
        setPayeeSuggestions(suggestions);
        setShowSuggestions(suggestions.length > 0);
        setIsLoadingSuggestions(false);
      } else {
        setShowSuggestions(false);
        setPayeeSuggestions([]);
      }
    };

    const timeoutId = setTimeout(getSuggestions, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.payee, transactions]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.payee.trim()) {
      newErrors.payee = 'Payee is required';
    }
    
    if (!formData.amount.trim()) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const activeAccount = getActiveAccount();
    if (!activeAccount) return;

    const amount = parseFloat(formData.amount);
    const finalAmount = formData.isCredit ? amount : -amount;

    addTransaction({
      userId: 'user-1', // In a real app, this would come from auth
      accountId: activeAccount.id,
      date: formData.date.toISOString().split('T')[0],
      payee: formData.payee.trim(),
      amount: finalAmount,
      source: 'manual',
      category: formData.category || 'Other',
      checkNumber: formData.checkNumber.trim() || undefined,
      notes: formData.notes.trim() || undefined,
      reconciled: false,
    });

    navigation.goBack();
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
            Add Transaction
          </Text>
          
          <Pressable
            onPress={handleSave}
            className="px-4 py-2 bg-blue-500 rounded-lg"
          >
            <Text className="text-white font-medium">Save</Text>
          </Pressable>
        </View>

        <ScrollView className="flex-1 px-4 py-6">
          {/* Transaction Type Toggle */}
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
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-sm font-medium text-gray-700">
                Payee / Description *
              </Text>
              {isLoadingSuggestions && (
                <ActivityIndicator size="small" color="#3B82F6" />
              )}
            </View>
            <TextInput
              className={cn(
                "p-4 border rounded-lg text-base",
                errors.payee ? "border-red-500" : "border-gray-300"
              )}
              placeholder="Enter payee name or description"
              value={formData.payee}
              onChangeText={(text) => {
                setFormData({ ...formData, payee: text });
                if (text.length < 3) setShowSuggestions(false);
              }}
              placeholderTextColor="#9CA3AF"
            />
            
            {/* AI Suggestions */}
            {showSuggestions && payeeSuggestions.length > 0 && (
              <View className="mt-2 border border-gray-200 rounded-lg bg-white shadow-sm">
                <Text className="text-xs font-medium text-blue-600 px-3 py-2 bg-blue-50 rounded-t-lg">
                  AI Suggestions
                </Text>
                {payeeSuggestions.map((suggestion, index) => (
                  <Pressable
                    key={index}
                    onPress={() => {
                      setFormData({ ...formData, payee: suggestion });
                      setShowSuggestions(false);
                    }}
                    className="px-3 py-3 border-b border-gray-100 last:border-b-0 active:bg-gray-50"
                  >
                    <Text className="text-base text-gray-900">{suggestion}</Text>
                  </Pressable>
                ))}
              </View>
            )}
            
            {errors.payee && (
              <Text className="text-red-500 text-sm mt-1">{errors.payee}</Text>
            )}
          </View>

          {/* Category */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Category *
            </Text>
            <Pressable
              onPress={() => setShowCategoryModal(true)}
              className="flex-row items-center justify-between p-4 border border-gray-300 rounded-lg"
            >
              <Text className={cn(
                "text-base",
                formData.category ? "text-gray-900" : "text-gray-400"
              )}>
                {formData.category || 'Select category'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#6B7280" />
            </Pressable>
          </View>

          {/* Amount */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Amount *
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

      {/* Category Selection Modal */}
      <Modal
        visible={showCategoryModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView className="flex-1 bg-white">
          <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-200">
            <Pressable onPress={() => setShowCategoryModal(false)} className="p-2">
              <Text className="text-blue-600 font-medium">Cancel</Text>
            </Pressable>
            
            <Text className="text-lg font-semibold text-gray-900">
              Select Category
            </Text>
            
            <View className="w-16" />
          </View>

          <ScrollView className="flex-1 px-4 py-6">
            {/* Existing Categories */}
            <View className="mb-6">
              <Text className="text-base font-medium text-gray-900 mb-3">
                Categories
              </Text>
              <View className="space-y-2">
                {categories.map((category) => (
                  <Pressable
                    key={category.id}
                    onPress={() => {
                      setFormData({ ...formData, category: category.name });
                      setShowCategoryModal(false);
                    }}
                    className="flex-row items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <View className="flex-row items-center">
                      <View 
                        className="w-4 h-4 rounded-full mr-3"
                        style={{ backgroundColor: category.color }}
                      />
                      <Text className="text-base text-gray-900">{category.name}</Text>
                    </View>
                    {formData.category === category.name && (
                      <Ionicons name="checkmark" size={20} color="#3B82F6" />
                    )}
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Add New Category */}
            <View className="border-t border-gray-200 pt-6">
              <Text className="text-base font-medium text-gray-900 mb-3">
                Add New Category
              </Text>
              <View className="flex-row space-x-3">
                <TextInput
                  className="flex-1 p-3 border border-gray-300 rounded-lg text-base"
                  placeholder="Category name"
                  value={newCategoryName}
                  onChangeText={setNewCategoryName}
                  placeholderTextColor="#9CA3AF"
                />
                <Pressable
                  onPress={() => {
                    if (newCategoryName.trim()) {
                      addCategory({
                        name: newCategoryName.trim(),
                        color: '#6B7280',
                        isDefault: false,
                      });
                      setFormData({ ...formData, category: newCategoryName.trim() });
                      setNewCategoryName('');
                      setShowCategoryModal(false);
                    }
                  }}
                  className="px-4 py-3 bg-blue-500 rounded-lg"
                >
                  <Text className="text-white font-medium">Add</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

export default AddTransactionScreen;