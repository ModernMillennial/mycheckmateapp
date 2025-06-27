import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTransactionStore } from '../state/transactionStore';
import { Transaction } from '../types';
import SimpleInitialBankSyncScreen from './SimpleInitialBankSyncScreen';

interface Props {
  navigation: any;
}

const FreshRegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [showFirstTimeSetup, setShowFirstTimeSetup] = useState(false);
  
  const {
    settings,
    initializeWithSeedData,
    getActiveAccount,
    getActiveTransactions,
    addTransaction,
    clearAndReinitialize,
    updateSettings,
  } = useTransactionStore();

  useEffect(() => {
    console.log('FreshRegisterScreen mounting...');
    if (settings.bankLinked) {
      initializeWithSeedData();
    }
  }, [initializeWithSeedData, settings.bankLinked]);

  const activeAccount = getActiveAccount();
  const transactions = getActiveTransactions();

  // Check for first-time user setup
  useEffect(() => {
    const hasTransactions = transactions.length > 0;
    const isBankLinked = settings.bankLinked;
    
    if (!hasTransactions && !isBankLinked) {
      setTimeout(() => {
        setShowFirstTimeSetup(true);
      }, 500);
    }
  }, [transactions.length, settings.bankLinked]);

  const handleDemoReset = () => {
    Alert.alert(
      'Demo Reset',
      'This will reset the app to show the initial bank setup demo. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            updateSettings({ bankLinked: false });
            clearAndReinitialize();
          },
        },
      ]
    );
  };

  const renderTransaction = ({ item }: { item: Transaction }) => {
    return (
      <Pressable
        className="mx-4 mb-2 p-4 bg-white rounded-lg shadow-sm border border-gray-100"
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          if (navigation) {
            navigation.navigate('EditTransaction', { transaction: item });
          }
        }}
      >
        <View className="flex-row justify-between items-center">
          <View className="flex-1">
            <Text className="font-semibold text-gray-900">{item.payee}</Text>
            <Text className="text-sm text-gray-500 mt-1">
              {new Date(item.date).toLocaleDateString()} • {item.source}
            </Text>
          </View>
          <View className="items-end">
            <Text className={`font-semibold ${item.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {item.amount >= 0 ? '+' : ''}${Math.abs(item.amount).toFixed(2)}
            </Text>
            <View className="flex-row items-center mt-1">
              {item.reconciled ? (
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              ) : (
                <Ionicons name="ellipse-outline" size={16} color="#9CA3AF" />
              )}
              <Text className="text-xs text-gray-500 ml-1">
                {item.reconciled ? 'Reconciled' : 'Pending'}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-gray-200">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-2xl font-bold text-gray-900">
            Digital Register
          </Text>
          <View className="flex-row">
            <Pressable onPress={handleDemoReset} className="p-2 mr-1">
              <Ionicons name="refresh-outline" size={24} color="#EF4444" />
            </Pressable>
            <Pressable
              onPress={() => navigation?.navigate('Settings')}
              className="p-2"
            >
              <Ionicons name="settings-outline" size={24} color="#374151" />
            </Pressable>
          </View>
        </View>

        {/* Account Info */}
        {activeAccount && (
          <View className="bg-blue-50 p-3 rounded-lg">
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="font-semibold text-blue-900">{activeAccount.name}</Text>
                <Text className="text-sm text-blue-700">
                  {activeAccount.bankName} • ****{activeAccount.accountNumber}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-xl font-bold text-blue-900">
                  ${(activeAccount.currentBalance || 0).toFixed(2)}
                </Text>
                <Text className="text-sm text-blue-700">Current Balance</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Transaction List */}
      <View className="flex-1">
        {transactions.length > 0 ? (
          <FlatList
            data={transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())}
            renderItem={renderTransaction}
            keyExtractor={(item) => item.id}
            className="flex-1"
            contentContainerStyle={{ paddingVertical: 16 }}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Ionicons name="receipt-outline" size={64} color="#9CA3AF" />
            <Text className="text-xl font-semibold text-gray-500 mt-4">No Transactions</Text>
            <Text className="text-gray-400 text-center mt-2 px-8">
              {settings.bankLinked 
                ? "Your transactions will appear here"
                : "Connect your bank account to get started"
              }
            </Text>
          </View>
        )}
      </View>

      {/* Floating Action Button */}
      <Pressable
        onPress={() => navigation?.navigate('AddTransaction')}
        className="absolute bottom-6 right-6 bg-blue-500 w-14 h-14 rounded-full items-center justify-center shadow-lg"
        style={{ elevation: 8 }}
      >
        <Ionicons name="add" size={28} color="white" />
      </Pressable>

      {/* Initial Bank Setup Modal */}
      <SimpleInitialBankSyncScreen
        visible={showFirstTimeSetup}
        onComplete={() => {
          setShowFirstTimeSetup(false);
          setTimeout(() => {
            Alert.alert(
              'Welcome to Digital Register!',
              'Your bank account has been connected and you\'re ready to start tracking your finances.',
              [{ text: 'Let\'s Go!' }]
            );
          }, 100);
        }}
        onCancel={() => setShowFirstTimeSetup(false)}
      />
    </SafeAreaView>
  );
};

export default FreshRegisterScreen;