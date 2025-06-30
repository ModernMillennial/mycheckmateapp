import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTransactionStore } from '../state/transactionStore';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { 
    transactions, 
    getTotalIncome, 
    getTotalExpenses, 
    getCurrentBalance,
    initializeWithSeedData,
    isInitialized 
  } = useTransactionStore();

  // Initialize store if not already initialized
  React.useEffect(() => {
    if (!isInitialized) {
      initializeWithSeedData();
    }
  }, [isInitialized, initializeWithSeedData]);

  // Safe function calls with fallbacks
  const totalIncome = getTotalIncome ? getTotalIncome() : 0;
  const totalExpenses = getTotalExpenses ? getTotalExpenses() : 0;
  const currentBalance = getCurrentBalance ? getCurrentBalance() : 0;

  const recentTransactions = (transactions || []).slice(0, 5);

  const quickActions = [
    {
      title: 'Add Transaction',
      icon: 'add-circle' as const,
      color: 'bg-blue-500',
      onPress: () => navigation.navigate('AddTransaction'),
    },
    {
      title: 'View Budget',
      icon: 'pie-chart' as const,
      color: 'bg-green-500',
      onPress: () => navigation.navigate('Budget'),
    },
    {
      title: 'Reports',
      icon: 'bar-chart' as const,
      color: 'bg-purple-500',
      onPress: () => navigation.navigate('Reports'),
    },
    {
      title: 'Settings',
      icon: 'settings' as const,
      color: 'bg-gray-500',
      onPress: () => navigation.navigate('Settings'),
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-4">
        {/* Header */}
        <View className="flex-row items-center justify-between py-4">
          <View>
            <Text className="text-2xl font-bold text-gray-900">Dashboard</Text>
            <Text className="text-gray-500">Welcome back!</Text>
          </View>
          <Pressable
            onPress={() => navigation.navigate('Settings')}
            className="p-2 rounded-full bg-gray-100"
          >
            <Ionicons name="person-circle-outline" size={24} color="#374151" />
          </Pressable>
        </View>

        {/* Balance Overview */}
        <View className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 mb-6">
          <Text className="text-white text-lg font-medium mb-2">Current Balance</Text>
          <Text className="text-white text-3xl font-bold mb-4">
            ${currentBalance.toFixed(2)}
          </Text>
          <View className="flex-row justify-between">
            <View>
              <Text className="text-blue-100 text-sm">Income</Text>
              <Text className="text-white text-lg font-semibold">
                +${totalIncome.toFixed(2)}
              </Text>
            </View>
            <View>
              <Text className="text-blue-100 text-sm">Expenses</Text>
              <Text className="text-white text-lg font-semibold">
                -${totalExpenses.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <Text className="text-xl font-bold text-gray-900 mb-4">Quick Actions</Text>
        <View className="flex-row flex-wrap justify-between mb-6">
          {quickActions.map((action, index) => (
            <Pressable
              key={index}
              onPress={action.onPress}
              className="w-[48%] mb-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100"
            >
              <View className={`w-12 h-12 ${action.color} rounded-xl items-center justify-center mb-3`}>
                <Ionicons name={action.icon} size={24} color="white" />
              </View>
              <Text className="text-gray-900 font-medium">{action.title}</Text>
            </Pressable>
          ))}
        </View>

        {/* Recent Transactions */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold text-gray-900">Recent Transactions</Text>
            <Pressable onPress={() => navigation.navigate('Budget')}>
              <Text className="text-blue-500 font-medium">View All</Text>
            </Pressable>
          </View>
          
          {recentTransactions.length > 0 ? (
            <View className="bg-white rounded-xl shadow-sm border border-gray-100">
              {recentTransactions.map((transaction, index) => (
                <View key={transaction.id}>
                  <View className="flex-row items-center justify-between p-4">
                    <View className="flex-row items-center flex-1">
                      <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
                        transaction.amount >= 0 ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        <Ionicons 
                          name={transaction.amount >= 0 ? 'arrow-up' : 'arrow-down'} 
                          size={16} 
                          color={transaction.amount >= 0 ? '#059669' : '#DC2626'} 
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="font-medium text-gray-900" numberOfLines={1}>
                          {transaction.payee}
                        </Text>
                        <Text className="text-sm text-gray-500">
                          {transaction.category || 'Uncategorized'}
                        </Text>
                      </View>
                    </View>
                    <Text className={`font-semibold ${
                      transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.amount >= 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                    </Text>
                  </View>
                  {index < recentTransactions.length - 1 && (
                    <View style={{ height: 1 }} className="bg-gray-100 mx-4" />
                  )}
                </View>
              ))}
            </View>
          ) : (
            <View className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 items-center">
              <Ionicons name="receipt-outline" size={48} color="#9CA3AF" />
              <Text className="text-gray-500 text-center mt-4">No transactions yet</Text>
              <Text className="text-gray-400 text-center text-sm mt-1">
                Add your first transaction to get started
              </Text>
            </View>
          )}
        </View>

        {/* Monthly Summary */}
        <View className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-4">This Month</Text>
          <View className="flex-row justify-between items-center">
            <View className="flex-1">
              <Text className="text-gray-500 text-sm">Transactions</Text>
              <Text className="text-2xl font-bold text-gray-900">{(transactions || []).length}</Text>
            </View>
            <View className="w-px h-12 bg-gray-200 mx-4" />
            <View className="flex-1">
              <Text className="text-gray-500 text-sm">Net Change</Text>
              <Text className={`text-2xl font-bold ${
                (totalIncome - totalExpenses) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {(totalIncome - totalExpenses) >= 0 ? '+' : ''}${(totalIncome - totalExpenses).toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DashboardScreen;