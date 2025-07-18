import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  usePlaidStore,
  useSelectedItem,
  useSelectedAccount,
  useTransactionsByAccount,
  usePlaidLoading,
  usePlaidError,
} from '../state/plaidStore';
import { PlaidTransaction } from '../api/plaid';
import Calculator from '../components/Calculator';

const TransactionCard: React.FC<{
  transaction: PlaidTransaction;
}> = ({ transaction }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Math.abs(amount));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getCategoryIcon = (categories: string[]) => {
    const category = categories[0]?.toLowerCase() || '';
    
    if (category.includes('food') || category.includes('restaurant')) return 'restaurant-outline';
    if (category.includes('gas') || category.includes('transportation')) return 'car-outline';
    if (category.includes('shop') || category.includes('retail')) return 'storefront-outline';
    if (category.includes('groceries') || category.includes('grocery')) return 'basket-outline';
    if (category.includes('entertainment')) return 'game-controller-outline';
    if (category.includes('health') || category.includes('medical')) return 'medical-outline';
    if (category.includes('bills') || category.includes('utilities')) return 'receipt-outline';
    if (category.includes('deposit') || category.includes('payroll')) return 'arrow-down-circle-outline';
    if (category.includes('transfer')) return 'swap-horizontal-outline';
    if (category.includes('atm')) return 'card-outline';
    return 'ellipse-outline';
  };

  const isDebit = transaction.amount > 0;
  const isPending = transaction.pending;

  return (
    <View className={`bg-white rounded-lg p-4 mb-2 border border-gray-100 ${isPending ? 'opacity-75' : ''}`}>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <View className="bg-gray-100 rounded-full p-2 mr-3">
            <Ionicons
              name={getCategoryIcon(transaction.category)}
              size={20}
              color="#6B7280"
            />
          </View>
          
          <View className="flex-1">
            <Text className="font-medium text-gray-900 text-base">
              {transaction.merchant_name || transaction.name}
            </Text>
            
            <View className="flex-row items-center mt-1">
              <Text className="text-gray-500 text-sm">
                {formatDate(transaction.date)}
              </Text>
              
              {isPending && (
                <View className="bg-yellow-100 px-2 py-1 rounded-full ml-2">
                  <Text className="text-yellow-700 text-xs font-medium">
                    Pending
                  </Text>
                </View>
              )}
            </View>
            
            {transaction.category.length > 0 && (
              <Text className="text-gray-400 text-xs mt-1">
                {transaction.category.slice(0, 2).join(' • ')}
              </Text>
            )}
          </View>
        </View>

        <View className="items-end">
          <Text className={`font-semibold text-lg ${isDebit ? 'text-red-600' : 'text-green-600'}`}>
            {isDebit ? '-' : '+'}{formatCurrency(transaction.amount)}
          </Text>
          
          {transaction.location.city && (
            <Text className="text-gray-400 text-xs">
              {transaction.location.city}, {transaction.location.region}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

const DateSectionHeader: React.FC<{
  date: string;
  amount: number;
  count: number;
}> = ({ date, amount, count }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Math.abs(amount));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      });
    }
  };

  return (
    <View className="flex-row items-center justify-between py-3 px-1 bg-gray-50 rounded-lg mb-2 mt-4">
      <Text className="font-semibold text-gray-900">
        {formatDate(date)}
      </Text>
      
      <View className="flex-row items-center">
        <Text className="text-gray-600 text-sm mr-2">
          {count} transaction{count !== 1 ? 's' : ''}
        </Text>
        <Text className={`font-medium ${amount > 0 ? 'text-red-600' : 'text-green-600'}`}>
          {amount > 0 ? '-' : '+'}{formatCurrency(amount)}
        </Text>
      </View>
    </View>
  );
};

const TransactionsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const selectedItem = useSelectedItem();
  const selectedAccount = useSelectedAccount();
  const isLoading = usePlaidLoading();
  const error = usePlaidError();
  
  const { refreshTransactions, setSelectedAccount, setSelectedItem } = usePlaidStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState(30); // days
  const [calculatorVisible, setCalculatorVisible] = useState(false);
  
  const transactions = useTransactionsByAccount(selectedAccount?.account_id || '');

  useEffect(() => {
    if (selectedItem && selectedAccount && transactions.length === 0) {
      handleRefreshTransactions();
    }
  }, [selectedItem, selectedAccount]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleRefreshTransactions = async () => {
    if (!selectedItem) return;
    
    setRefreshing(true);
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - dateRange);
      
      await refreshTransactions(
        selectedItem.id,
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh transactions');
    } finally {
      setRefreshing(false);
    }
  };

  const handleBack = () => {
    setSelectedAccount(null);
    setSelectedItem(null);
    navigation.goBack();
  };

  const groupTransactionsByDate = (transactions: PlaidTransaction[]) => {
    const groups: { [date: string]: PlaidTransaction[] } = {};
    
    transactions.forEach(transaction => {
      const date = transaction.date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(transaction);
    });

    return Object.keys(groups)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
      .map(date => ({
        date,
        transactions: groups[date].sort((a, b) => 
          new Date(b.datetime || b.date).getTime() - new Date(a.datetime || a.date).getTime()
        ),
        totalAmount: groups[date].reduce((sum, tx) => sum + tx.amount, 0),
      }));
  };

  if (!selectedAccount || !selectedItem) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100">
        <View className="flex-1 justify-center items-center">
          <Ionicons name="alert-circle-outline" size={64} color="#9CA3AF" />
          <Text className="text-xl font-semibold text-gray-700 mt-4 mb-2">
            No Account Selected
          </Text>
          <Text className="text-gray-500 text-center mb-6 px-8">
            Please select an account to view transactions
          </Text>
          <Pressable
            onPress={() => navigation.navigate('Accounts')}
            className="bg-blue-500 px-6 py-3 rounded-lg"
          >
            <Text className="text-white font-medium">Go to Accounts</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const groupedTransactions = groupTransactionsByDate(transactions);
  const totalSpent = transactions.filter(tx => tx.amount > 0).reduce((sum, tx) => sum + tx.amount, 0);
  const totalEarned = transactions.filter(tx => tx.amount < 0).reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <Pressable onPress={handleBack} className="p-2 -ml-2">
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </Pressable>
          
          <View className="flex-1 mx-4">
            <Text className="font-semibold text-gray-900 text-lg text-center">
              {selectedAccount.name}
            </Text>
            <Text className="text-gray-500 text-sm text-center">
              {selectedItem.institutionName} • ••••{selectedAccount.mask}
            </Text>
          </View>
          
          <View className="flex-row">
            <Pressable onPress={() => setCalculatorVisible(true)} className="p-2">
              <Ionicons name="calculator-outline" size={24} color="#374151" />
            </Pressable>
            <Pressable onPress={handleRefreshTransactions} className="p-2 -mr-2">
              <Ionicons name="refresh-outline" size={24} color="#374151" />
            </Pressable>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefreshTransactions} />
        }
      >
        {/* Account Balance Card */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <View className="items-center">
            <Text className="text-gray-600 text-sm mb-1">Current Balance</Text>
            <Text className="text-3xl font-bold text-gray-900 mb-2">
              {formatCurrency(selectedAccount.balances.current || 0)}
            </Text>
            
            {selectedAccount.balances.available !== null && 
             selectedAccount.balances.available !== selectedAccount.balances.current && (
              <Text className="text-gray-500 text-sm">
                Available: {formatCurrency(selectedAccount.balances.available)}
              </Text>
            )}
          </View>
          
          {/* Summary Stats */}
          {transactions.length > 0 && (
            <View className="flex-row justify-around mt-4 pt-4 border-t border-gray-100">
              <View className="items-center">
                <Text className="text-red-600 font-semibold text-lg">
                  -{formatCurrency(totalSpent)}
                </Text>
                <Text className="text-gray-500 text-sm">Spent</Text>
              </View>
              
              <View className="items-center">
                <Text className="text-green-600 font-semibold text-lg">
                  +{formatCurrency(totalEarned)}
                </Text>
                <Text className="text-gray-500 text-sm">Earned</Text>
              </View>
              
              <View className="items-center">
                <Text className="text-gray-900 font-semibold text-lg">
                  {transactions.length}
                </Text>
                <Text className="text-gray-500 text-sm">Transactions</Text>
              </View>
            </View>
          )}
        </View>

        {/* Error Message */}
        {error && (
          <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
            <View className="flex-row items-center">
              <Ionicons name="alert-circle-outline" size={20} color="#DC2626" />
              <Text className="ml-2 text-red-700 font-medium">Error</Text>
            </View>
            <Text className="text-red-600 mt-1">{error}</Text>
          </View>
        )}

        {/* Loading State */}
        {isLoading && transactions.length === 0 && (
          <View className="flex-1 justify-center items-center py-12">
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text className="mt-2 text-gray-600">Loading transactions...</Text>
          </View>
        )}

        {/* Transactions List */}
        {groupedTransactions.map(({ date, transactions, totalAmount }) => (
          <View key={date}>
            <DateSectionHeader
              date={date}
              amount={totalAmount}
              count={transactions.length}
            />
            
            {transactions.map((transaction) => (
              <TransactionCard
                key={transaction.transaction_id}
                transaction={transaction}
              />
            ))}
          </View>
        ))}

        {/* Empty State */}
        {!isLoading && transactions.length === 0 && (
          <View className="items-center py-12">
            <Ionicons name="receipt-outline" size={64} color="#9CA3AF" />
            <Text className="text-xl font-semibold text-gray-700 mt-4 mb-2">
              No Transactions
            </Text>
            <Text className="text-gray-500 text-center mb-6 px-8">
              No transactions found for the selected period. Try refreshing or check back later.
            </Text>
            <Pressable
              onPress={handleRefreshTransactions}
              className="bg-blue-500 px-6 py-3 rounded-lg"
            >
              <Text className="text-white font-medium">Refresh Transactions</Text>
            </Pressable>
          </View>
        )}

        {/* Date Range Info */}
        {transactions.length > 0 && (
          <View className="bg-gray-50 rounded-xl p-4 mt-4">
            <Text className="text-gray-600 text-sm text-center">
              Showing transactions from the last {dateRange} days
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Calculator Modal */}
      <Calculator
        visible={calculatorVisible}
        onClose={() => setCalculatorVisible(false)}
      />
    </SafeAreaView>
  );
};

export default TransactionsScreen;