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
import { Ionicons } from '@expo/vector-icons';
import { useTransactionStore } from '../state/transactionStore';
import { Budget } from '../types';

interface Props {
  navigation: any;
}

const BudgetScreen: React.FC<Props> = ({ navigation }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBudget, setNewBudget] = useState({
    name: '',
    category: '',
    limit: '',
    period: 'monthly' as 'weekly' | 'monthly' | 'yearly',
    color: '#3B82F6',
  });

  const { getActiveTransactions } = useTransactionStore();
  const transactions = getActiveTransactions() || [];

  // Mock budgets for demo
  const [budgets, setBudgets] = useState<Budget[]>([
    {
      id: '1',
      name: 'Groceries',
      category: 'Groceries',
      limit: 400,
      period: 'monthly',
      color: '#10B981',
      isActive: true,
      createdDate: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Dining Out',
      category: 'Coffee & Dining',
      limit: 200,
      period: 'monthly',
      color: '#F59E0B',
      isActive: true,
      createdDate: new Date().toISOString(),
    },
    {
      id: '3',
      name: 'Transportation',
      category: 'Transportation',
      limit: 300,
      period: 'monthly',
      color: '#EF4444',
      isActive: true,
      createdDate: new Date().toISOString(),
    },
  ]);

  const getCategoryFromPayee = (payee: string): string => {
    const lowercasePayee = payee.toLowerCase();
    
    if (lowercasePayee.includes('starbucks') || lowercasePayee.includes('coffee') || lowercasePayee.includes('dunkin')) return 'Coffee & Dining';
    if (lowercasePayee.includes('whole foods') || lowercasePayee.includes('grocery') || lowercasePayee.includes('market')) return 'Groceries';
    if (lowercasePayee.includes('shell') || lowercasePayee.includes('gas') || lowercasePayee.includes('exxon')) return 'Transportation';
    if (lowercasePayee.includes('rent') || lowercasePayee.includes('mortgage')) return 'Housing';
    if (lowercasePayee.includes('amazon') || lowercasePayee.includes('target') || lowercasePayee.includes('walmart')) return 'Shopping';
    if (lowercasePayee.includes('netflix') || lowercasePayee.includes('spotify') || lowercasePayee.includes('entertainment')) return 'Entertainment';
    if (lowercasePayee.includes('electric') || lowercasePayee.includes('utilities') || lowercasePayee.includes('pg&e')) return 'Utilities';
    
    return 'Other';
  };

  const getBudgetSpending = (budget: Budget) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    let startDate: Date;
    
    switch (budget.period) {
      case 'weekly':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        startDate = weekStart;
        break;
      case 'yearly':
        startDate = new Date(currentYear, 0, 1);
        break;
      case 'monthly':
      default:
        startDate = new Date(currentYear, currentMonth, 1);
        break;
    }

    const relevantTransactions = transactions.filter(tx => {
      const txDate = new Date(tx.date);
      const txCategory = tx.notes?.split(',')[0]?.trim() || getCategoryFromPayee(tx.payee);
      
      return txDate >= startDate && 
             tx.amount < 0 && 
             txCategory === budget.category;
    });

    const spent = relevantTransactions.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    const remaining = Math.max(0, budget.limit - spent);
    const percentUsed = Math.min(100, (spent / budget.limit) * 100);

    return { spent, remaining, percentUsed };
  };

  const handleCreateBudget = () => {
    if (!newBudget.name.trim() || !newBudget.category.trim() || !newBudget.limit) {
      Alert.alert('Invalid Input', 'Please fill in all fields.');
      return;
    }

    const budget: Budget = {
      id: Date.now().toString(),
      name: newBudget.name.trim(),
      category: newBudget.category.trim(),
      limit: parseFloat(newBudget.limit),
      period: newBudget.period,
      color: newBudget.color,
      isActive: true,
      createdDate: new Date().toISOString(),
    };

    setBudgets([...budgets, budget]);
    setShowCreateModal(false);
    setNewBudget({
      name: '',
      category: '',
      limit: '',
      period: 'monthly',
      color: '#3B82F6',
    });

    Alert.alert('Budget Created', `Your ${budget.name} budget has been created successfully!`);
  };

  const handleDeleteBudget = (budgetId: string) => {
    Alert.alert(
      'Delete Budget',
      'Are you sure you want to delete this budget?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setBudgets(budgets.filter(b => b.id !== budgetId));
          },
        },
      ]
    );
  };

  const colors = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#14B8A6', // Teal
    '#F97316', // Orange
  ];

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
          Budget Tracker
        </Text>
        
        <Pressable
          onPress={() => setShowCreateModal(true)}
          className="p-2"
        >
          <Ionicons name="add" size={24} color="#3B82F6" />
        </Pressable>
      </View>

      <ScrollView className="flex-1 px-4 py-6">
        {/* Budget Overview */}
        <View className="mb-6">
          <Text className="text-xl font-bold text-gray-900 mb-4">
            This Month's Budgets
          </Text>
          
          {budgets.length > 0 ? (
            <View className="space-y-4">
              {budgets.map((budget) => {
                const spending = getBudgetSpending(budget);
                const isOverBudget = spending.percentUsed > 100;
                
                return (
                  <View key={budget.id} className="bg-white rounded-lg border border-gray-200 p-4">
                    <View className="flex-row items-center justify-between mb-3">
                      <View className="flex-row items-center flex-1">
                        <View 
                          className="w-4 h-4 rounded-full mr-3"
                          style={{ backgroundColor: budget.color }}
                        />
                        <View className="flex-1">
                          <Text className="font-semibold text-gray-900">
                            {budget.name}
                          </Text>
                          <Text className="text-sm text-gray-600">
                            ${budget.limit}/{budget.period}
                          </Text>
                        </View>
                      </View>
                      
                      <Pressable
                        onPress={() => handleDeleteBudget(budget.id)}
                        className="p-2"
                      >
                        <Ionicons name="trash-outline" size={18} color="#EF4444" />
                      </Pressable>
                    </View>
                    
                    {/* Progress Bar */}
                    <View className="mb-3">
                      <View className="bg-gray-200 rounded-full h-3">
                        <View 
                          className={`h-3 rounded-full ${
                            isOverBudget ? 'bg-red-500' : 'bg-green-500'
                          }`}
                          style={{ 
                            width: `${Math.min(100, spending.percentUsed)}%`,
                            backgroundColor: isOverBudget ? '#EF4444' : budget.color
                          }}
                        />
                      </View>
                    </View>
                    
                    {/* Spending Details */}
                    <View className="flex-row justify-between items-center">
                      <View>
                        <Text className={`font-bold ${
                          isOverBudget ? 'text-red-600' : 'text-gray-900'
                        }`}>
                          ${spending.spent.toFixed(2)} spent
                        </Text>
                        <Text className="text-sm text-gray-600">
                          ${spending.remaining.toFixed(2)} remaining
                        </Text>
                      </View>
                      
                      <View className="items-end">
                        <Text className={`font-bold ${
                          isOverBudget ? 'text-red-600' : 'text-gray-900'
                        }`}>
                          {spending.percentUsed.toFixed(0)}%
                        </Text>
                        <Text className="text-sm text-gray-600">
                          {isOverBudget ? 'Over budget' : 'On track'}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View className="p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <View className="items-center">
                <Ionicons name="pie-chart-outline" size={48} color="#9CA3AF" />
                <Text className="text-lg font-semibold text-gray-600 mt-3">
                  No Budgets Created
                </Text>
                <Text className="text-gray-500 text-center mt-1">
                  Create your first budget to start tracking spending
                </Text>
                <Pressable
                  onPress={() => setShowCreateModal(true)}
                  className="mt-4 bg-blue-500 px-4 py-2 rounded-lg"
                >
                  <Text className="text-white font-medium">Create Budget</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>

        {/* Quick Tips */}
        <View className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <Text className="text-lg font-semibold text-blue-900 mb-2">
            💡 Budget Tips
          </Text>
          <View className="space-y-1">
            <Text className="text-blue-800 text-sm">
              • Review your budgets weekly to stay on track
            </Text>
            <Text className="text-blue-800 text-sm">
              • Set realistic limits based on past spending
            </Text>
            <Text className="text-blue-800 text-sm">
              • Use different colors to organize categories
            </Text>
            <Text className="text-blue-800 text-sm">
              • Connect your bank for automatic categorization
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Create Budget Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView className="flex-1 bg-white">
          <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-200">
            <Pressable
              onPress={() => setShowCreateModal(false)}
              className="p-2"
            >
              <Text className="text-blue-600 font-medium">Cancel</Text>
            </Pressable>
            
            <Text className="text-lg font-semibold text-gray-900">
              Create Budget
            </Text>
            
            <Pressable
              onPress={handleCreateBudget}
              className="p-2"
            >
              <Text className="text-blue-600 font-medium">Save</Text>
            </Pressable>
          </View>

          <ScrollView className="flex-1 px-4 py-6">
            {/* Budget Name */}
            <View className="mb-6">
              <Text className="text-base font-medium text-gray-900 mb-2">
                Budget Name
              </Text>
              <TextInput
                value={newBudget.name}
                onChangeText={(text) => setNewBudget({ ...newBudget, name: text })}
                placeholder="e.g., Groceries, Dining Out, Gas"
                className="border border-gray-300 rounded-lg px-3 py-3 text-base"
              />
            </View>

            {/* Category */}
            <View className="mb-6">
              <Text className="text-base font-medium text-gray-900 mb-2">
                Category
              </Text>
              <TextInput
                value={newBudget.category}
                onChangeText={(text) => setNewBudget({ ...newBudget, category: text })}
                placeholder="e.g., Groceries, Coffee & Dining, Transportation"
                className="border border-gray-300 rounded-lg px-3 py-3 text-base"
              />
              <Text className="text-sm text-gray-500 mt-1">
                This should match how your transactions are categorized
              </Text>
            </View>

            {/* Budget Limit */}
            <View className="mb-6">
              <Text className="text-base font-medium text-gray-900 mb-2">
                Budget Limit
              </Text>
              <View className="flex-row items-center border border-gray-300 rounded-lg">
                <Text className="px-3 text-gray-600 text-base">$</Text>
                <TextInput
                  value={newBudget.limit}
                  onChangeText={(text) => setNewBudget({ ...newBudget, limit: text })}
                  placeholder="0.00"
                  keyboardType="numeric"
                  className="flex-1 py-3 pr-3 text-base"
                />
              </View>
            </View>

            {/* Period Selection */}
            <View className="mb-6">
              <Text className="text-base font-medium text-gray-900 mb-3">
                Budget Period
              </Text>
              <View className="flex-row space-x-3">
                {(['weekly', 'monthly', 'yearly'] as const).map((period) => (
                  <Pressable
                    key={period}
                    onPress={() => setNewBudget({ ...newBudget, period })}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 ${
                      newBudget.period === period
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <Text className={`text-center font-medium ${
                      newBudget.period === period ? 'text-blue-600' : 'text-gray-600'
                    }`}>
                      {period.charAt(0).toUpperCase() + period.slice(1)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Color Selection */}
            <View className="mb-6">
              <Text className="text-base font-medium text-gray-900 mb-3">
                Budget Color
              </Text>
              <View className="flex-row flex-wrap">
                {colors.map((color) => (
                  <Pressable
                    key={color}
                    onPress={() => setNewBudget({ ...newBudget, color })}
                    className="w-12 h-12 rounded-full mr-3 mb-3 border-2 border-white"
                    style={{ 
                      backgroundColor: color,
                      borderColor: newBudget.color === color ? '#374151' : 'white',
                      borderWidth: newBudget.color === color ? 3 : 1,
                    }}
                  >
                    {newBudget.color === color && (
                      <View className="flex-1 items-center justify-center">
                        <Ionicons name="checkmark" size={18} color="white" />
                      </View>
                    )}
                  </Pressable>
                ))}
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

export default BudgetScreen;