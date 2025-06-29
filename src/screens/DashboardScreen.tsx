import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Dimensions,
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming,
  cancelAnimation 
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const AnimatedIonicons = Animated.createAnimatedComponent(Ionicons);
import { useTransactionStore } from '../state/transactionStore';
import { Transaction } from '../types';
import { VictoryLine, VictoryChart, VictoryArea, VictoryPie, VictoryLabel, VictoryTheme } from 'victory-native';

interface Props {
  navigation: any;
}

const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  // Safety check for navigation
  if (!navigation) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <Text className="text-red-500">Navigation error - please restart the app</Text>
        </View>
      </SafeAreaView>
    );
  }
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{visible: boolean, title: string, message: string, isError: boolean}>({
    visible: false,
    title: '',
    message: '',
    isError: false
  });
  
  const {
    getActiveAccount,
    getActiveTransactions,
    syncPlaidTransactions,
    calculateRunningBalance,
  } = useTransactionStore();

  // Animation for sync button
  const rotation = useSharedValue(0);
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  const activeAccount = getActiveAccount();
  const allTransactions = getActiveTransactions() || [];

  // Filter transactions by selected period
  const getTransactionsForPeriod = (days: number) => {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return allTransactions.filter(tx => {
      const txDate = new Date(tx.date);
      const isStarting = tx.payee === 'Starting Point' || tx.payee === 'Starting Balance' || tx.id.startsWith('starting-balance-');
      return txDate >= cutoffDate && !isStarting;
    });
  };

  const transactions = getTransactionsForPeriod(
    selectedPeriod === '7d' ? 7 : selectedPeriod === '30d' ? 30 : 90
  );

  // Calculate spending by category
  const getSpendingByCategory = () => {
    const categoryMap = new Map<string, number>();
    
    transactions
      .filter(tx => tx.amount < 0) // Only expenses
      .forEach(tx => {
        // Extract category from notes or use payee
        const category = tx.notes?.split(',')[0]?.trim() || 
                        getCategoryFromPayee(tx.payee);
        const current = categoryMap.get(category) || 0;
        categoryMap.set(category, current + Math.abs(tx.amount));
      });

    return Array.from(categoryMap.entries())
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5); // Top 5 categories
  };

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

  // Calculate daily spending for chart
  const getDailySpending = () => {
    const days = selectedPeriod === '7d' ? 7 : selectedPeriod === '30d' ? 30 : 90;
    const dailySpending = new Array(days).fill(0);
    const labels: string[] = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      labels.push(date.getDate().toString());
      
      const daySpending = transactions
        .filter(tx => tx.date === dateStr && tx.amount < 0)
        .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
      
      dailySpending[days - 1 - i] = daySpending;
    }
    
    return { data: dailySpending, labels };
  };

  // Calculate key metrics
  const totalIncome = transactions
    .filter(tx => tx.amount > 0)
    .reduce((sum, tx) => sum + tx.amount, 0);
    
  const totalExpenses = transactions
    .filter(tx => tx.amount < 0)
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    
  const netCashFlow = totalIncome - totalExpenses;
  const avgDailySpending = totalExpenses / (selectedPeriod === '7d' ? 7 : selectedPeriod === '30d' ? 30 : 90);



  const spendingByCategory = getSpendingByCategory();
  const dailySpending = getDailySpending();
  const screenWidth = Dimensions.get('window').width;

  const pieData = spendingByCategory.map((item, index) => ({
    x: item.name,
    y: item.amount,
    fill: [
      '#3B82F6', // Blue
      '#10B981', // Green
      '#F59E0B', // Yellow
      '#EF4444', // Red
      '#8B5CF6', // Purple
    ][index] || '#6B7280',
  }));

  const lineData = dailySpending.data.map((value, index) => ({
    x: index + 1,
    y: value,
  }));

  const handleSync = async () => {
    const activeAccount = getActiveAccount();
    if (!activeAccount) {
      setSyncMessage({
        visible: true,
        title: "Sync Not Available",
        message: "No account found. Please set up your account first.",
        isError: true
      });
      return;
    }

    setIsSyncing(true);
    
    // Start rotation animation
    rotation.value = withRepeat(
      withTiming(360, { duration: 1000 }),
      -1,
      false
    );

    try {
      // Sync transactions for the last 30 days
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      // Use demo access token if no real plaid token exists
      const accessToken = activeAccount.plaidAccessToken || `demo_access_token_ins_demo_chase_${Date.now()}`;
      
      await syncPlaidTransactions(
        accessToken,
        activeAccount.id,
        startDate,
        endDate
      );

      setSyncMessage({
        visible: true,
        title: "Sync Complete",
        message: "Your account has been successfully synced with your bank.",
        isError: false
      });
    } catch (error) {
      console.error('Sync error:', error);
      setSyncMessage({
        visible: true,
        title: "Sync Failed",
        message: "Unable to sync with your bank at this time. Please try again later.",
        isError: true
      });
    } finally {
      setIsSyncing(false);
      cancelAnimation(rotation);
      rotation.value = withTiming(0, { duration: 200 });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-200">
        <Pressable
          onPress={() => {
            try {
              navigation.goBack();
            } catch (error) {
              console.error('Navigation error:', error);
            }
          }}
          className="p-2"
        >
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </Pressable>
        
        <Text className="text-lg font-semibold text-gray-900">
          Financial Dashboard
        </Text>
        
        <View className="flex-row items-center space-x-2">
          <Pressable
            onPress={() => {
              try {
                navigation.navigate('Budget');
              } catch (error) {
                console.error('Navigation error:', error);
              }
            }}
            className="p-2"
          >
            <Ionicons name="wallet-outline" size={24} color="#374151" />
          </Pressable>
          <Pressable
            onPress={() => {
              try {
                navigation.navigate('Register');
              } catch (error) {
                console.error('Navigation error:', error);
              }
            }}
            className="p-2"
          >
            <Ionicons name="list" size={24} color="#374151" />
          </Pressable>
          <Pressable
            onPress={handleSync}
            disabled={isSyncing}
            className="p-2"
          >
            <AnimatedIonicons 
              name="sync" 
              size={24} 
              color={isSyncing ? "#3B82F6" : "#374151"}
              style={animatedStyle}
            />
          </Pressable>
        </View>
      </View>

      <ScrollView 
        className="flex-1"
      >
        {/* Account Balance Card */}
        {activeAccount ? (
          <View className="mx-4 mt-6 p-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-white text-lg font-semibold">
                {activeAccount.name}
              </Text>
              <Ionicons name="wallet" size={24} color="white" />
            </View>
            <Text className="text-white text-3xl font-bold">
              ${(activeAccount.currentBalance || 0).toFixed(2)}
            </Text>
            <Text className="text-blue-100 mt-1">
              Current Balance
            </Text>
          </View>
        ) : (
          <View className="mx-4 mt-6 p-6 bg-gray-100 rounded-xl">
            <Text className="text-gray-600 text-center">
              No account connected
            </Text>
          </View>
        )}

        {/* Period Selection */}
        <View className="mx-4 mt-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Overview
          </Text>
          <View className="flex-row bg-gray-100 rounded-lg p-1">
            {(['7d', '30d', '90d'] as const).map((period) => (
              <Pressable
                key={period}
                onPress={() => setSelectedPeriod(period)}
                className={`flex-1 py-2 px-3 rounded-md ${
                  selectedPeriod === period ? 'bg-white shadow-sm' : ''
                }`}
              >
                <Text className={`text-center font-medium ${
                  selectedPeriod === period ? 'text-blue-600' : 'text-gray-600'
                }`}>
                  {period === '7d' ? '7 Days' : period === '30d' ? '30 Days' : '90 Days'}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Key Metrics */}
        <View className="mx-4 mt-6">
          <View className="flex-row space-x-3">
            <View className="flex-1 bg-green-50 p-4 rounded-lg border border-green-200">
              <View className="flex-row items-center justify-between">
                <Ionicons name="trending-up" size={20} color="#10B981" />
                <Text className="text-xs text-green-600 font-medium">INCOME</Text>
              </View>
              <Text className="text-xl font-bold text-green-700 mt-1">
                ${totalIncome.toFixed(0)}
              </Text>
            </View>
            
            <View className="flex-1 bg-red-50 p-4 rounded-lg border border-red-200">
              <View className="flex-row items-center justify-between">
                <Ionicons name="trending-down" size={20} color="#EF4444" />
                <Text className="text-xs text-red-600 font-medium">EXPENSES</Text>
              </View>
              <Text className="text-xl font-bold text-red-700 mt-1">
                ${totalExpenses.toFixed(0)}
              </Text>
            </View>
          </View>
          
          <View className="flex-row space-x-3 mt-3">
            <View className="flex-1 bg-blue-50 p-4 rounded-lg border border-blue-200">
              <View className="flex-row items-center justify-between">
                <Ionicons name="calculator" size={20} color="#3B82F6" />
                <Text className="text-xs text-blue-600 font-medium">NET FLOW</Text>
              </View>
              <Text className={`text-xl font-bold mt-1 ${
                netCashFlow >= 0 ? 'text-green-700' : 'text-red-700'
              }`}>
                {netCashFlow >= 0 ? '+' : '-'}${Math.abs(netCashFlow).toFixed(0)}
              </Text>
            </View>
            
            <View className="flex-1 bg-purple-50 p-4 rounded-lg border border-purple-200">
              <View className="flex-row items-center justify-between">
                <Ionicons name="calendar" size={20} color="#8B5CF6" />
                <Text className="text-xs text-purple-600 font-medium">AVG DAILY</Text>
              </View>
              <Text className="text-xl font-bold text-purple-700 mt-1">
                ${avgDailySpending.toFixed(0)}
              </Text>
            </View>
          </View>
        </View>

        {/* Daily Spending Chart */}
        {dailySpending.data.some(val => val > 0) && (
          <View className="mx-4 mt-6">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              Daily Spending Trend
            </Text>
            <View className="bg-white rounded-lg border border-gray-200 p-4">
              <VictoryChart
                theme={VictoryTheme.material}
                height={180}
                width={screenWidth - 80}
                padding={{ left: 50, top: 20, right: 50, bottom: 40 }}
              >
                <VictoryArea
                  data={lineData}
                  style={{
                    data: { fill: "#3B82F6", fillOpacity: 0.1, stroke: "#3B82F6", strokeWidth: 2 },
                  }}
                  animate={{
                    duration: 1000,
                    onLoad: { duration: 500 }
                  }}
                />
              </VictoryChart>
            </View>
          </View>
        )}

        {/* Spending by Category */}
        {spendingByCategory.length > 0 && (
          <View className="mx-4 mt-6">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              Top Spending Categories
            </Text>
            
            {/* Pie Chart */}
            <View className="bg-white rounded-lg border border-gray-200 p-4 mb-4 items-center">
              <VictoryPie
                data={pieData}
                width={screenWidth - 80}
                height={200}
                colorScale={pieData.map(d => d.fill)}
                innerRadius={50}
                labelRadius={({ innerRadius }) => innerRadius as number + 40 }
                labelComponent={<VictoryLabel style={{ fontSize: 12, fill: "#374151" }} />}
                animate={{
                  duration: 1000,
                }}
              />
            </View>
            
            {/* Category List */}
            <View className="space-y-2">
              {spendingByCategory.map((category, index) => (
                <View key={category.name} className="flex-row items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <View className="flex-row items-center flex-1">
                    <View 
                      className="w-4 h-4 rounded-full mr-3"
                      style={{ backgroundColor: pieData[index]?.fill || '#6B7280' }}
                    />
                    <Text className="font-medium text-gray-900 flex-1">
                      {category.name}
                    </Text>
                  </View>
                  <Text className="font-bold text-gray-900">
                    ${category.amount.toFixed(0)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Recent Transactions */}
        <View className="mx-4 mt-6 mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-semibold text-gray-900">
              Recent Transactions
            </Text>
            <Pressable
              onPress={() => {
              try {
                navigation.navigate('Register');
              } catch (error) {
                console.error('Navigation error:', error);
              }
            }}
              className="flex-row items-center"
            >
              <Text className="text-blue-600 font-medium mr-1">View All</Text>
              <Ionicons name="chevron-forward" size={16} color="#3B82F6" />
            </Pressable>
          </View>
          
          <View className="space-y-2">
            {transactions.slice(0, 5).map((transaction) => (
              <View key={transaction.id} className="p-3 bg-white rounded-lg border border-gray-200">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="font-medium text-gray-900">
                      {transaction.payee}
                    </Text>
                    <Text className="text-sm text-gray-500">
                      {new Date(transaction.date).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text className={`font-bold ${
                    transaction.amount < 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {transaction.amount < 0 ? '-' : '+'}${Math.abs(transaction.amount).toFixed(2)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
          
          {transactions.length === 0 && (
            <View className="p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <View className="items-center">
                <Ionicons name="receipt-outline" size={48} color="#9CA3AF" />
                <Text className="text-lg font-semibold text-gray-600 mt-3">
                  No Transactions
                </Text>
                <Text className="text-gray-500 text-center mt-1">
                  Connect your bank or add transactions manually
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Sync Message Modal */}
      {syncMessage.visible && (
        <View className="absolute inset-0 bg-black/50 flex-1 justify-center items-center z-50">
          <View className="mx-6 bg-white rounded-2xl p-6 shadow-xl">
            <View className={`w-16 h-16 rounded-full mx-auto mb-4 items-center justify-center ${
              syncMessage.isError ? 'bg-red-100' : 'bg-green-100'
            }`}>
              <Ionicons 
                name={syncMessage.isError ? "alert-circle" : "checkmark-circle"} 
                size={32} 
                color={syncMessage.isError ? "#EF4444" : "#10B981"} 
              />
            </View>
            
            <Text className="text-xl font-bold text-gray-900 text-center mb-2">
              {syncMessage.title}
            </Text>
            
            <Text className="text-gray-600 text-center mb-6 leading-6">
              {syncMessage.message}
            </Text>
            
            <Pressable
              onPress={() => setSyncMessage({...syncMessage, visible: false})}
              className="bg-blue-600 py-3 px-6 rounded-lg"
            >
              <Text className="text-white font-semibold text-center">
                OK
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default DashboardScreen;