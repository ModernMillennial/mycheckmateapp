import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useBudgetStore } from '../state/budgetStore';
import { useTransactionStore } from '../state/transactionStore';
import { Budget } from '../types';

interface Props {
  navigation: any;
}

interface EditModalData {
  budget: Budget;
  visible: boolean;
}

const BudgetScreen: React.FC<Props> = ({ navigation }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editModal, setEditModal] = useState<EditModalData>({ budget: {} as Budget, visible: false });
  const [newBudget, setNewBudget] = useState({
    name: '',
    category: '',
    limit: '',
    period: 'monthly' as 'weekly' | 'monthly' | 'yearly',
    color: '#3B82F6',
  });

  const { budgets, addBudget, updateBudget, deleteBudget, initializeDefaults } = useBudgetStore();
  const { getActiveTransactions } = useTransactionStore();
  const transactions = getActiveTransactions() || [];

  useEffect(() => {
    initializeDefaults();
  }, []);

  const getCategoryFromPayee = (payee: string): string => {
    const lowercasePayee = payee.toLowerCase();
    
    if (lowercasePayee.includes('starbucks') || lowercasePayee.includes('coffee') || lowercasePayee.includes('dunkin') || lowercasePayee.includes('restaurant') || lowercasePayee.includes('dining')) return 'Dining';
    if (lowercasePayee.includes('whole foods') || lowercasePayee.includes('grocery') || lowercasePayee.includes('market') || lowercasePayee.includes('walmart') || lowercasePayee.includes('target')) return 'Groceries';
    if (lowercasePayee.includes('shell') || lowercasePayee.includes('gas') || lowercasePayee.includes('exxon') || lowercasePayee.includes('uber') || lowercasePayee.includes('lyft')) return 'Transportation';
    if (lowercasePayee.includes('rent') || lowercasePayee.includes('mortgage') || lowercasePayee.includes('electric') || lowercasePayee.includes('utilities') || lowercasePayee.includes('phone') || lowercasePayee.includes('internet')) return 'Bills';
    if (lowercasePayee.includes('amazon') || lowercasePayee.includes('shopping')) return 'Shopping';
    if (lowercasePayee.includes('netflix') || lowercasePayee.includes('spotify') || lowercasePayee.includes('entertainment')) return 'Entertainment';
    
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
      return;
    }

    addBudget({
      name: newBudget.name.trim(),
      category: newBudget.category.trim(),
      limit: parseFloat(newBudget.limit),
      period: newBudget.period,
      color: newBudget.color,
      isActive: true,
    });

    setShowCreateModal(false);
    setNewBudget({
      name: '',
      category: '',
      limit: '',
      period: 'monthly',
      color: '#3B82F6',
    });
  };

  const handleEditBudget = (budget: Budget) => {
    setEditModal({ budget, visible: true });
  };

  const handleUpdateBudget = () => {
    if (!editModal.budget.name.trim() || !editModal.budget.category.trim() || !editModal.budget.limit) {
      return;
    }

    updateBudget(editModal.budget.id, {
      name: editModal.budget.name.trim(),
      category: editModal.budget.category.trim(),
      limit: editModal.budget.limit,
      period: editModal.budget.period,
      color: editModal.budget.color,
    });

    setEditModal({ budget: {} as Budget, visible: false });
  };

  const handleDeleteBudget = (budgetId: string) => {
    deleteBudget(budgetId);
  };

  const colors = [
    '#10B981', // Green
    '#F59E0B', // Orange
    '#EF4444', // Red
    '#3B82F6', // Blue
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#14B8A6', // Teal
    '#F97316', // Orange Alt
  ];

  const BudgetItem = ({ budget }: { budget: Budget }) => {
    const spending = getBudgetSpending(budget);
    const isOverBudget = spending.percentUsed > 100;
    
    return (
      <Pressable 
        onPress={() => handleEditBudget(budget)}
        className="bg-white rounded-xl p-4 mb-4 border border-gray-100"
        style={{ 
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 1,
        }}
      >
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center flex-1">
            <View 
              className="w-3 h-3 rounded-full mr-3"
              style={{ backgroundColor: budget.color }}
            />
            <View className="flex-1">
              <Text className="text-base font-semibold text-gray-900">
                {budget.name}
              </Text>
              <Text className="text-sm text-gray-500">
                ${budget.limit}/{budget.period}
              </Text>
            </View>
          </View>
          
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              handleDeleteBudget(budget.id);
            }}
            className="p-2"
          >
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
          </Pressable>
        </View>
        
        {/* Progress Bar */}
        <View className="mb-3">
          <View 
            className="bg-gray-200 rounded-full h-2"
            style={{ backgroundColor: '#E5E7EB' }}
          >
            <View 
              className="h-2 rounded-full"
              style={{ 
                width: `${Math.min(100, spending.percentUsed)}%`,
                backgroundColor: budget.color
              }}
            />
          </View>
        </View>
        
        {/* Spending Details */}
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-base font-semibold text-gray-900">
              ${spending.spent.toFixed(2)} spent
            </Text>
            <Text className="text-sm text-gray-500">
              ${spending.remaining.toFixed(2)} remaining
            </Text>
          </View>
          
          <View className="items-end">
            <Text className="text-base font-semibold text-gray-900">
              {spending.percentUsed.toFixed(0)}%
            </Text>
            <Text className="text-sm text-gray-500">
              {isOverBudget ? 'Over budget' : 'On track'}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  };

  const BudgetModal = ({ 
    visible, 
    budget, 
    onSave, 
    onCancel, 
    title 
  }: { 
    visible: boolean;
    budget: any;
    onSave: () => void;
    onCancel: () => void;
    title: string;
  }) => (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-200">
          <Pressable onPress={onCancel} className="p-2">
            <Text className="text-blue-600 font-medium">Cancel</Text>
          </Pressable>
          
          <Text className="text-lg font-semibold text-gray-900">
            {title}
          </Text>
          
          <Pressable onPress={onSave} className="p-2">
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
              value={budget.name}
              onChangeText={(text) => {
                if (title === 'Create Budget') {
                  setNewBudget({ ...newBudget, name: text });
                } else {
                  setEditModal({ ...editModal, budget: { ...budget, name: text } });
                }
              }}
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
              value={budget.category}
              onChangeText={(text) => {
                if (title === 'Create Budget') {
                  setNewBudget({ ...newBudget, category: text });
                } else {
                  setEditModal({ ...editModal, budget: { ...budget, category: text } });
                }
              }}
              placeholder="e.g., Groceries, Dining, Transportation"
              className="border border-gray-300 rounded-lg px-3 py-3 text-base"
            />
          </View>

          {/* Budget Limit */}
          <View className="mb-6">
            <Text className="text-base font-medium text-gray-900 mb-2">
              Budget Limit
            </Text>
            <View className="flex-row items-center border border-gray-300 rounded-lg">
              <Text className="px-3 text-gray-600 text-base">$</Text>
              <TextInput
                value={typeof budget.limit === 'number' ? budget.limit.toString() : budget.limit}
                onChangeText={(text) => {
                  if (title === 'Create Budget') {
                    setNewBudget({ ...newBudget, limit: text });
                  } else {
                    setEditModal({ ...editModal, budget: { ...budget, limit: parseFloat(text) || 0 } });
                  }
                }}
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
                  onPress={() => {
                    if (title === 'Create Budget') {
                      setNewBudget({ ...newBudget, period });
                    } else {
                      setEditModal({ ...editModal, budget: { ...budget, period } });
                    }
                  }}
                  className={`flex-1 py-3 px-4 rounded-lg border-2 ${
                    budget.period === period
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <Text className={`text-center font-medium ${
                    budget.period === period ? 'text-blue-600' : 'text-gray-600'
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
                  onPress={() => {
                    if (title === 'Create Budget') {
                      setNewBudget({ ...newBudget, color });
                    } else {
                      setEditModal({ ...editModal, budget: { ...budget, color } });
                    }
                  }}
                  className="w-12 h-12 rounded-full mr-3 mb-3 border-2 border-white"
                  style={{ 
                    backgroundColor: color,
                    borderColor: budget.color === color ? '#374151' : 'white',
                    borderWidth: budget.color === color ? 3 : 1,
                  }}
                >
                  {budget.color === color && (
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
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white flex-row items-center justify-between px-4 py-4 border-b border-gray-200">
        <Pressable
          onPress={() => navigation.canGoBack() ? navigation.goBack() : null}
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
          <Text className="text-2xl font-bold text-gray-900 mb-6">
            This Month&apos;s Budgets
          </Text>
          
          {budgets.length > 0 ? (
            <View>
              {budgets.map((budget) => (
                <BudgetItem key={budget.id} budget={budget} />
              ))}
            </View>
          ) : (
            <View className="p-6 bg-white rounded-lg border-2 border-dashed border-gray-300">
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

        {/* Budget Tips */}
        <View className="bg-blue-50 p-4 rounded-xl border border-blue-200">
          <View className="flex-row items-center mb-2">
            <Ionicons name="bulb-outline" size={20} color="#1D4ED8" />
            <Text className="text-lg font-semibold text-blue-900 ml-2">
              Budget Tips
            </Text>
          </View>
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
      <BudgetModal
        visible={showCreateModal}
        budget={newBudget}
        onSave={handleCreateBudget}
        onCancel={() => setShowCreateModal(false)}
        title="Create Budget"
      />

      {/* Edit Budget Modal */}
      <BudgetModal
        visible={editModal.visible}
        budget={editModal.budget}
        onSave={handleUpdateBudget}
        onCancel={() => setEditModal({ budget: {} as Budget, visible: false })}
        title="Edit Budget"
      />
    </SafeAreaView>
  );
};

export default BudgetScreen;