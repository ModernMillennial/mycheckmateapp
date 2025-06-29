import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTransactionStore } from '../state/transactionStore';
import SimpleInitialBankSyncScreen from './SimpleInitialBankSyncScreen';

interface Props {
  navigation: any;
}

const DigitalRegisterMain: React.FC<Props> = ({ navigation }) => {
  const [showFirstTimeSetup, setShowFirstTimeSetup] = useState(false);
  
  const {
    settings,
    getActiveAccount,
    getActiveTransactions,
    getFilteredTransactionsFromStartingPoint,
    clearAndReinitialize,
    updateSettings,
    initializeWithSeedData,
  } = useTransactionStore();

  const activeAccount = getActiveAccount();
  const transactions = getFilteredTransactionsFromStartingPoint();

  useEffect(() => {
    console.log('DigitalRegisterMain loading...');
    console.log('Settings:', settings);
    console.log('Account:', activeAccount?.name);
    console.log('Transactions:', transactions.length);

    if (settings.bankLinked) {
      initializeWithSeedData();
    }

    // Check for first-time setup
    const hasTransactions = transactions.length > 0;
    const isBankLinked = settings.bankLinked;
    
    if (!hasTransactions && !isBankLinked) {
      setTimeout(() => {
        console.log('Showing first-time setup');
        setShowFirstTimeSetup(true);
      }, 1000);
    }
  }, []);

  const handleDemoReset = () => {
    Alert.alert(
      'Reset Demo',
      'Reset app to show initial bank setup?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          onPress: () => {
            updateSettings({ bankLinked: false });
            clearAndReinitialize();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="p-4 border-b border-gray-200">
        <View className="flex-row justify-between items-center">
          <Text className="text-3xl font-bold text-blue-600">
            Digital Register
          </Text>
          <Pressable
            onPress={handleDemoReset}
            className="bg-red-500 px-4 py-2 rounded-lg"
          >
            <Text className="text-white font-semibold">Reset Demo</Text>
          </Pressable>
        </View>
      </View>

      {/* Account Section */}
      {activeAccount ? (
        <View className="p-4 bg-blue-50 m-4 rounded-lg">
          <Text className="text-lg font-semibold text-blue-900">
            {activeAccount.name}
          </Text>
          <Text className="text-2xl font-bold text-blue-600 mt-2">
            ${(activeAccount.currentBalance || 0).toFixed(2)}
          </Text>
          <Text className="text-sm text-blue-700">
            Current Balance
          </Text>
        </View>
      ) : (
        <View className="p-4 bg-gray-50 m-4 rounded-lg">
          <Text className="text-gray-600">No account connected</Text>
        </View>
      )}

      {/* Transactions Section */}
      <View className="flex-1 p-4">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-xl font-semibold">
            Recent Transactions ({transactions.length})
          </Text>
          {activeAccount?.startingBalanceDate && (
            <Text className="text-sm text-blue-600 font-medium">
              From {new Date(activeAccount.startingBalanceDate).toLocaleDateString()}
            </Text>
          )}
        </View>
        
        {transactions.length > 0 ? (
          <ScrollView className="flex-1">
            {transactions
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((transaction) => (
                <View key={transaction.id} className="bg-white p-4 mb-2 rounded-lg border">
                  <View className="flex-row justify-between">
                    <View className="flex-1">
                      <Text className="font-semibold">{transaction.payee}</Text>
                      <Text className="text-sm text-gray-500">
                        {new Date(transaction.date).toLocaleDateString()}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className={`font-bold ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.amount >= 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                      </Text>
                      <Text className="text-xs text-gray-500">
                        {transaction.source} • {transaction.reconciled ? 'Reconciled' : 'Pending'}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
          </ScrollView>
        ) : (
          <View className="flex-1 items-center justify-center">
            <Ionicons name="wallet-outline" size={64} color="#9CA3AF" />
            <Text className="text-xl text-gray-500 mt-4">No Transactions</Text>
            <Text className="text-gray-400 mt-2 text-center">
              {settings.bankLinked 
                ? "Your transactions will appear here"
                : "Connect your bank to get started"
              }
            </Text>
          </View>
        )}
      </View>

      {/* Add Transaction Button */}
      <Pressable
        onPress={() => {
          Alert.alert('Add Transaction', 'This would open the add transaction screen');
        }}
        className="absolute bottom-6 right-6 bg-blue-500 w-16 h-16 rounded-full items-center justify-center"
        style={{ elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 }}
      >
        <Ionicons name="add" size={32} color="white" />
      </Pressable>

      {/* Bank Setup Modal */}
      <SimpleInitialBankSyncScreen
        visible={showFirstTimeSetup}
        onComplete={() => {
          setShowFirstTimeSetup(false);
          Alert.alert(
            'Setup Complete!',
            'Your Digital Register is ready to use.',
            [{ text: 'Great!' }]
          );
        }}
        onCancel={() => setShowFirstTimeSetup(false)}
      />
    </SafeAreaView>
  );
};

export default DigitalRegisterMain;