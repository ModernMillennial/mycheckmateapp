import React, { useMemo, useState } from 'react';
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
  const { transactions } = useTransactionStore();
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  // Generate monthly reports
  const monthlyReports = useMemo(() => {
    const reports: { [key: string]: MonthlyReport } = {};

    transactions.forEach((transaction) => {
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

      // Categorize transactions based on payee keywords
      const category = categorizeTransaction(transaction);
      report.categories[category] = (report.categories[category] || 0) + Math.abs(transaction.amount);
    });

    return Object.entries(reports)
      .map(([key, report]) => ({ key, ...report }))
      .sort((a, b) => b.key.localeCompare(a.key)); // Sort by date descending
  }, [transactions]);

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

  const getSelectedMonthTransactions = () => {
    if (!selectedMonth) return [];
    
    return transactions.filter(transaction => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      return monthKey === selectedMonth;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const renderMonthlyReport = ({ item }: { item: MonthlyReport & { key: string } }) => (
    <Pressable
      onPress={() => setSelectedMonth(selectedMonth === item.key ? null : item.key)}
      className="bg-white mx-4 mb-3 p-4 rounded-lg shadow-sm border border-gray-100"
    >
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-lg font-bold text-gray-900">{item.month}</Text>
        <Ionicons
          name={selectedMonth === item.key ? 'chevron-up' : 'chevron-down'}
          size={20}
          color="#9CA3AF"
        />
      </View>

      <View className="flex-row justify-between mb-4">
        <View className="flex-1">
          <Text className="text-sm text-gray-500">Total Income</Text>
          <Text className="text-lg font-semibold text-green-600">
            ${item.totalCredits.toFixed(2)}
          </Text>
        </View>
        <View className="flex-1 items-center">
          <Text className="text-sm text-gray-500">Total Expenses</Text>
          <Text className="text-lg font-semibold text-red-600">
            ${item.totalDebits.toFixed(2)}
          </Text>
        </View>
        <View className="flex-1 items-end">
          <Text className="text-sm text-gray-500">Net Amount</Text>
          <Text className={cn(
            "text-lg font-semibold",
            item.netAmount >= 0 ? "text-green-600" : "text-red-600"
          )}>
            {item.netAmount >= 0 ? '+' : ''}${item.netAmount.toFixed(2)}
          </Text>
        </View>
      </View>

      <Text className="text-sm text-gray-500 mb-2">
        {item.transactionCount} transactions
      </Text>

      {selectedMonth === item.key && (
        <View>
          {/* Category Breakdown */}
          <View className="border-t border-gray-200 pt-4 mt-2">
            <Text className="text-sm font-semibold text-gray-700 mb-3">Category Breakdown</Text>
            {Object.entries(item.categories)
              .sort(([,a], [,b]) => b - a)
              .map(([category, amount]) => (
                <View key={category} className="flex-row justify-between items-center mb-2">
                  <Text className="text-sm text-gray-600">{category}</Text>
                  <Text className="text-sm font-medium text-gray-900">
                    ${amount.toFixed(2)}
                  </Text>
                </View>
              ))
            }
          </View>

          {/* Transaction List */}
          <View className="border-t border-gray-200 pt-4 mt-4">
            <Text className="text-sm font-semibold text-gray-700 mb-3">Transactions</Text>
            {getSelectedMonthTransactions().map((transaction) => (
              <View key={transaction.id} className="flex-row justify-between items-center mb-2 py-1">
                <View className="flex-1">
                  <Text className="text-sm text-gray-900">{transaction.payee}</Text>
                  <Text className="text-xs text-gray-500">
                    {new Date(transaction.date).toLocaleDateString()}
                  </Text>
                </View>
                <Text className={cn(
                  "text-sm font-medium",
                  transaction.amount >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  {transaction.amount >= 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </Pressable>
  );

  const totalBalance = transactions.length > 0 
    ? transactions[transactions.length - 1]?.runningBalance || 0 
    : 0;

  const totalIncome = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);

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
            Financial Reports
          </Text>
          
          <View className="w-10" />
        </View>
      </View>

      {/* Summary Cards */}
      <View className="px-4 py-4">
        <View className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-4">
          <Text className="text-sm font-medium text-gray-500 mb-2">Account Overview</Text>
          <View className="flex-row justify-between">
            <View className="flex-1">
              <Text className="text-sm text-gray-500">Current Balance</Text>
              <Text className="text-xl font-bold text-blue-600">
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
          Monthly Reports
        </Text>
        
        {monthlyReports.length > 0 ? (
          <FlatList
            data={monthlyReports}
            renderItem={renderMonthlyReport}
            keyExtractor={(item) => item.key}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        ) : (
          <View className="items-center justify-center py-16">
            <Ionicons name="analytics-outline" size={64} color="#D1D5DB" />
            <Text className="text-gray-500 text-lg mt-4">No transaction data</Text>
            <Text className="text-gray-400 text-sm mt-2 text-center px-8">
              Add some transactions to see your monthly reports
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default ReportsScreen;