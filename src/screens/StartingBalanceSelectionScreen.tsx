import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTransactionStore } from '../state/transactionStore';
import { plaidService, PlaidTransaction } from '../services/plaidService';

interface Props {
  navigation: any;
  route: {
    params: {
      accessToken: string;
      accountData: any;
      institutionName: string;
    };
  };
}

const StartingBalanceSelectionScreen: React.FC<Props> = ({ navigation, route }) => {
  const { accessToken, accountData, institutionName } = route.params;
  const { connectPlaidAccount, syncPlaidTransactions } = useTransactionStore();
  
  const [transactions, setTransactions] = useState<PlaidTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<'current' | 'transaction' | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<PlaidTransaction | null>(null);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      
      // Get last 60 days of transactions
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const bankTransactions = await plaidService.getTransactions(
        accessToken,
        [accountData.account_id],
        startDate,
        endDate
      );
      
      setTransactions(bankTransactions.slice(0, 20)); // Show last 20 transactions
    } catch (error) {
      console.error('Error loading transactions:', error);
      Alert.alert(
        'Error Loading Transactions',
        'Unable to load recent transactions. You can still connect with current balance.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCurrentBalanceSelection = () => {
    setSelectedOption('current');
    setSelectedTransaction(null);
  };

  const handleTransactionSelection = (transaction: PlaidTransaction) => {
    setSelectedOption('transaction');
    setSelectedTransaction(transaction);
  };

  const handleConnect = async () => {
    if (!selectedOption) {
      Alert.alert('Selection Required', 'Please choose a starting balance option.');
      return;
    }

    try {
      let startingBalance = accountData.balances?.current || 0;
      let startingDate = new Date().toISOString().split('T')[0];
      let syncFromDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      if (selectedOption === 'transaction' && selectedTransaction) {
        // Calculate balance at the time of selected transaction
        const transactionIndex = transactions.findIndex(t => t.transaction_id === selectedTransaction.transaction_id);
        let balanceAtTransaction = accountData.balances?.current || 0;
        
        // Add back all transactions that happened after the selected transaction
        for (let i = 0; i < transactionIndex; i++) {
          balanceAtTransaction += transactions[i].amount;
        }
        
        startingBalance = balanceAtTransaction;
        startingDate = selectedTransaction.date;
        syncFromDate = selectedTransaction.date;
      }

      // Create account with selected starting balance
      const accountWithBalance = {
        ...accountData,
        balances: {
          ...accountData.balances,
          current: startingBalance,
        },
      };

      connectPlaidAccount(accessToken, accountWithBalance);

      // Sync transactions from selected date
      await syncPlaidTransactions(accessToken, accountData.account_id, syncFromDate, new Date().toISOString().split('T')[0]);

      Alert.alert(
        'Account Connected! 🎉',
        `Successfully connected to ${institutionName}.\n\nStarting Balance: $${startingBalance.toFixed(2)}\nStarting Date: ${new Date(startingDate).toLocaleDateString()}`,
        [
          {
            text: 'View Register',
            onPress: () => navigation.navigate('Register'),
          },
        ]
      );
    } catch (error) {
      console.error('Error connecting account:', error);
      Alert.alert(
        'Connection Error',
        'There was an issue setting up your account. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-600 mt-4">Loading account information...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
          Choose Starting Balance
        </Text>
        
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 px-6 py-8">
        {/* Account Info */}
        <View className="bg-blue-50 p-4 rounded-lg mb-6">
          <Text className="text-lg font-semibold text-blue-900 mb-1">
            {accountData.name || accountData.official_name}
          </Text>
          <Text className="text-blue-700">
            {institutionName} • ****{accountData.mask}
          </Text>
          <Text className="text-2xl font-bold text-blue-900 mt-2">
            ${(accountData.balances?.current || 0).toFixed(2)}
          </Text>
          <Text className="text-blue-700 text-sm">Current Balance</Text>
        </View>

        {/* Instructions */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-2">
            Select Your Starting Point
          </Text>
          <Text className="text-gray-600 leading-6">
            Choose whether to start with your current balance or select a specific transaction as your starting point. This determines your register's beginning balance and transaction history.
          </Text>
        </View>

        {/* Current Balance Option */}
        <Pressable
          onPress={handleCurrentBalanceSelection}
          className={`p-4 rounded-lg border-2 mb-4 ${
            selectedOption === 'current' 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-200 bg-white'
          }`}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-base font-semibold text-gray-900">
                Use Current Balance
              </Text>
              <Text className="text-sm text-gray-600 mt-1">
                Start with ${(accountData.balances?.current || 0).toFixed(2)} as of today
              </Text>
              <Text className="text-xs text-gray-500 mt-1">
                Import transactions from the last 30 days
              </Text>
            </View>
            <View className={`w-6 h-6 rounded-full border-2 ${
              selectedOption === 'current' 
                ? 'border-blue-500 bg-blue-500' 
                : 'border-gray-300'
            }`}>
              {selectedOption === 'current' && (
                <Ionicons name="checkmark" size={14} color="white" style={{ margin: 1 }} />
              )}
            </View>
          </View>
        </Pressable>

        {/* Transaction Selection Option */}
        <View className="mb-4">
          <Text className="text-base font-semibold text-gray-900 mb-3">
            Or Choose a Specific Transaction
          </Text>
          <Text className="text-sm text-gray-600 mb-4">
            Select a transaction to use as your starting point. Your balance will be calculated from that date forward.
          </Text>
          
          {transactions.length > 0 ? (
            <View>
              {/* Column Headers */}
              <View className="bg-gray-50 px-4 py-2 rounded-lg mb-3">
                <View className="flex-row items-center">
                  <View className="flex-1">
                    <Text className="text-xs font-bold text-gray-700 uppercase">Date/Type</Text>
                  </View>
                  <View className="flex-1 items-center">
                    <Text className="text-xs font-bold text-gray-700 uppercase">Amount</Text>
                  </View>
                  <View className="flex-1 items-center">
                    <Text className="text-xs font-bold text-gray-700 uppercase">Account Balance</Text>
                  </View>
                </View>
              </View>
              
              <View className="space-y-2">
                {transactions.map((transaction, index) => {
                  // Calculate running balance for this transaction
                  // Start with current balance and work backwards
                  let runningBalance = accountData.balances?.current || 0;
                  for (let i = 0; i < index; i++) {
                    runningBalance -= transactions[i].amount; // Subtract previous transactions to go backwards
                  }
                  
                  return (
                    <Pressable
                      key={transaction.transaction_id}
                      onPress={() => handleTransactionSelection(transaction)}
                      className={`p-4 rounded-lg border ${
                        selectedTransaction?.transaction_id === transaction.transaction_id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      {/* Header Row - Payee and Selection Check */}
                      <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-gray-900 font-medium flex-1">
                          {transaction.merchant_name || transaction.name}
                        </Text>
                        {selectedTransaction?.transaction_id === transaction.transaction_id && (
                          <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />
                        )}
                      </View>
                      
                      {/* Transaction Details Row - Date/Type, Amount, Balance */}
                      <View className="flex-row items-center">
                        {/* Left: Date and Type */}
                        <View className="flex-1">
                          <Text className="text-sm text-gray-600">
                            {new Date(transaction.date).toLocaleDateString('en-US', { 
                              month: 'numeric', 
                              day: 'numeric' 
                            })}
                          </Text>
                          <Text className="text-xs text-gray-500 capitalize">bank</Text>
                        </View>
                        
                        {/* Center: Transaction Amount */}
                        <View className="flex-1 items-center">
                          <Text className={`text-base font-semibold ${
                            transaction.amount < 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.amount < 0 ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                          </Text>
                        </View>
                        
                        {/* Right: Account Balance */}
                        <View className="flex-1 items-center">
                          <Text className={`text-base font-bold ${
                            runningBalance >= 0 ? 'text-gray-900' : 'text-red-600'
                          }`}>
                            ${Math.abs(runningBalance).toFixed(2)}
                          </Text>
                        </View>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ) : (
            <View className="p-4 bg-gray-50 rounded-lg">
              <Text className="text-gray-600 text-center">
                No recent transactions available
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Connect Button */}
      <View className="px-6 py-4 border-t border-gray-200">
        <Pressable
          onPress={handleConnect}
          disabled={!selectedOption}
          className={`p-4 rounded-lg ${
            selectedOption 
              ? 'bg-blue-500' 
              : 'bg-gray-300'
          }`}
        >
          <Text className={`text-center font-semibold ${
            selectedOption ? 'text-white' : 'text-gray-500'
          }`}>
            Connect Account
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default StartingBalanceSelectionScreen;