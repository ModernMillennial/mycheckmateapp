import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTransactionStore } from '../state/transactionStore';
import { Transaction } from '../types';
import { cn } from '../utils/cn';

interface Props {
  navigation: any;
}

interface MonthlyReport {
  month: string;
  year: number;
  totalCredits: number;
  totalDebits: number;
  netAmount: number;
  transactionCount: number;
  categories: { [key: string]: number };
}

const ReportsScreen: React.FC<Props> = ({ navigation }) => {
  const { getActiveTransactions, getActiveAccount } = useTransactionStore();
  const transactions = getActiveTransactions();
  const activeAccount = getActiveAccount();

  // Debug logging
  console.log('Reports - Active Account:', activeAccount?.name);
  console.log('Reports - Transactions:', transactions.length);

  const categorizeTransaction = (transaction: Transaction): string => {
    const payee = transaction.payee.toLowerCase();
    
    if (transaction.amount >= 0) {
      if (payee.includes('salary') || payee.includes('payroll') || payee.includes('deposit')) {
        return 'Income';
      }
      return 'Other Income';
    }

    // Expense categories
    if (payee.includes('grocery') || payee.includes('market') || payee.includes('food')) {
      return 'Groceries';
    }
    if (payee.includes('gas') || payee.includes('fuel') || payee.includes('shell') || payee.includes('exxon')) {
      return 'Fuel';
    }
    if (payee.includes('restaurant') || payee.includes('coffee') || payee.includes('starbucks') || payee.includes('dining')) {
      return 'Dining';
    }
    if (payee.includes('electric') || payee.includes('utility') || payee.includes('water') || payee.includes('gas bill')) {
      return 'Utilities';
    }
    if (payee.includes('amazon') || payee.includes('store') || payee.includes('shop')) {
      return 'Shopping';
    }
    if (payee.includes('atm') || payee.includes('cash')) {
      return 'Cash & ATM';
    }
    if (payee.includes('bank') || payee.includes('fee')) {
      return 'Bank Fees';
    }
    
    return 'Other Expenses';
  };

  // Generate monthly reports
  const monthlyReports = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return [];
    }

    const reports: { [key: string]: MonthlyReport } = {};

    // Filter out starting balance entries for reports
    const realTransactions = transactions.filter(t => 
      !t.id.startsWith('starting-balance-') && 
      t.payee !== 'Starting Balance' && 
      t.payee !== 'Starting Point'
    );

    realTransactions.forEach((transaction) => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

      if (!reports[monthKey]) {
        reports[monthKey] = {
          month: monthName,
          year: date.getFullYear(),
          totalCredits: 0,
          totalDebits: 0,
          netAmount: 0,
          transactionCount: 0,
          categories: {},
        };
      }

      const report = reports[monthKey];
      report.transactionCount++;

      if (transaction.amount >= 0) {
        report.totalCredits += transaction.amount;
      } else {
        report.totalDebits += Math.abs(transaction.amount);
      }

      report.netAmount += transaction.amount;

      // Categorize transactions
      const category = categorizeTransaction(transaction);
      report.categories[category] = (report.categories[category] || 0) + Math.abs(transaction.amount);
    });

    return Object.entries(reports)
      .map(([key, report]) => ({ key, ...report }))
      .sort((a, b) => b.key.localeCompare(a.key));
  }, [transactions]);

  // Calculate current balance from starting point + all transactions
  const startingPointTransaction = transactions.find(t => 
    t.payee === 'Starting Point' || t.payee === 'Starting Balance' || t.id.startsWith('starting-balance-')
  );
  
  const startingBalance = startingPointTransaction?.amount || 0;
  
  // Filter out starting balance for income/expense totals
  const realTransactions = transactions.filter(t => 
    !t.id.startsWith('starting-balance-') && 
    t.payee !== 'Starting Balance' && 
    t.payee !== 'Starting Point'
  );

  const totalIncome = realTransactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpenses = realTransactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  // Calculate actual current balance: starting balance + net transactions
  const netTransactions = totalIncome - totalExpenses;
  const totalBalance = startingBalance + netTransactions;

  const renderMonthlyReport = ({ item }: { item: MonthlyReport & { key: string } }) => (
    <View className="bg-white mx-4 mb-3 p-4 rounded-lg shadow-sm border border-gray-100">
      <Text className="text-lg font-bold text-gray-900 mb-3">{item.month}</Text>

      <View className="flex-row justify-between mb-4">
        <View className="flex-1">
          <Text className="text-sm text-gray-500">Income</Text>
          <Text className="text-lg font-semibold text-green-600">
            ${item.totalCredits.toFixed(2)}
          </Text>
        </View>
        <View className="flex-1 items-center">
          <Text className="text-sm text-gray-500">Expenses</Text>
          <Text className="text-lg font-semibold text-red-600">
            ${item.totalDebits.toFixed(2)}
          </Text>
        </View>
        <View className="flex-1 items-end">
          <Text className="text-sm text-gray-500">Net</Text>
          <Text className={cn(
            "text-lg font-semibold",
            item.netAmount >= 0 ? "text-green-600" : "text-red-600"
          )}>
            {item.netAmount >= 0 ? '+' : ''}${item.netAmount.toFixed(2)}
          </Text>
        </View>
      </View>

      <Text className="text-sm text-gray-500 mb-3">
        {item.transactionCount} transactions
      </Text>

      {/* Top Categories */}
      <View className="border-t border-gray-200 pt-3">
        <Text className="text-sm font-semibold text-gray-700 mb-2">Top Categories</Text>
        {Object.entries(item.categories)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 3)
          .map(([category, amount]) => (
            <View key={category} className="flex-row justify-between items-center mb-1">
              <Text className="text-sm text-gray-600">{category}</Text>
              <Text className="text-sm font-medium text-gray-900">
                ${amount.toFixed(2)}
              </Text>
            </View>
          ))
        }
      </View>
    </View>
  );

  return (
    <SafeAreaView key={activeAccount?.id} className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={() => navigation.goBack()}
            className="p-2"
          >
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </Pressable>
          
          <View className="items-center">
            <Text className="text-lg font-semibold text-gray-900">
              Financial Reports
            </Text>
            {activeAccount && (
              <Text className="text-sm text-gray-500">
                {activeAccount.name}
              </Text>
            )}
          </View>
          
          <View className="w-10" />
        </View>
      </View>

      {/* Account Info */}
      {activeAccount && (
        <View className="px-4 py-2">
          <View className="bg-white px-3 py-2 rounded-lg border border-gray-200">
            <View className="flex-row items-center">
              <View
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: activeAccount.color }}
              />
              <Text className="text-sm font-medium text-gray-900">
                {activeAccount.name}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Summary Cards */}
      <View className="px-4 py-4">
        <View className="p-4 rounded-lg shadow-sm border border-gray-100 mb-4" style={{ 
          backgroundColor: activeAccount ? activeAccount.color + '10' : 'white' 
        }}>
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-sm font-medium text-gray-500">
              {activeAccount?.name || 'Account'} Overview
            </Text>
            {activeAccount && (
              <View
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: activeAccount.color }}
              />
            )}
          </View>
          <View className="flex-row justify-between">
            <View className="flex-1">
              <Text className="text-sm text-gray-500">Current Balance</Text>
              <Text className="text-xl font-bold" style={{ 
                color: activeAccount?.color || '#3B82F6' 
              }}>
                ${totalBalance.toFixed(2)}
              </Text>
            </View>
            <View className="flex-1 items-center">
              <Text className="text-sm text-gray-500">Total Income</Text>
              <Text className="text-xl font-bold text-green-600">
                ${totalIncome.toFixed(2)}
              </Text>
            </View>
            <View className="flex-1 items-end">
              <Text className="text-sm text-gray-500">Total Expenses</Text>
              <Text className="text-xl font-bold text-red-600">
                ${totalExpenses.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Monthly Reports */}
      <View className="flex-1">
        <Text className="text-lg font-semibold text-gray-900 px-4 mb-4">
          Monthly Breakdown
        </Text>
        
        {monthlyReports.length > 0 ? (
          <FlatList
            key={`reports-${activeAccount?.id}`} // Force re-render when account changes
            data={monthlyReports}
            renderItem={renderMonthlyReport}
            keyExtractor={(item) => item.key}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        ) : (
          <View className="items-center justify-center py-16">
            <Ionicons name="analytics-outline" size={64} color="#D1D5DB" />
            <Text className="text-gray-500 text-lg mt-4">No Data Available</Text>
            <Text className="text-gray-400 text-sm mt-2 text-center px-8">
              {activeAccount 
                ? `No transactions found for ${activeAccount.name}`
                : 'Add some transactions to see your monthly reports'
              }
            </Text>
            {/* Debug info */}
            <Text className="text-gray-300 text-xs mt-4 text-center px-8">
              Debug: {transactions.length} total transactions
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default ReportsScreen;