import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Alert, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTransactionStore } from '../state/transactionStore';
import { Transaction } from '../types';
import SimpleInitialBankSyncScreen from './SimpleInitialBankSyncScreen';

interface Props {
  navigation: any;
}

const SimpleRegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [showFirstTimeSetup, setShowFirstTimeSetup] = useState(false);
  const [showTransactions, setShowTransactions] = useState(false);
  
  const {
    settings,
    initializeWithSeedData,
    getActiveAccount,
    getActiveTransactions,
    addTransaction,
    syncBankTransactions,
    clearAndReinitialize,
    updateSettings,
    toggleReconciled,
  } = useTransactionStore();

  useEffect(() => {
    if (settings.bankLinked) {
      initializeWithSeedData();
      setShowTransactions(true);
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
      'Reset Demo',
      'This will reset the app and show the complete Initial Bank Sync demo from the beginning.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start Demo',
          style: 'destructive',
          onPress: () => {
            setShowTransactions(false);
            updateSettings({ bankLinked: false });
            clearAndReinitialize();
          },
        },
      ]
    );
  };

  const handleManualTransactionDemo = () => {
    if (!activeAccount) return;
    
    // Add a demo manual transaction
    addTransaction({
      userId: 'user-1',
      accountId: activeAccount.id,
      date: new Date().toISOString().split('T')[0],
      payee: 'Demo Coffee Shop',
      amount: -4.50,
      source: 'manual',
      notes: 'Demo transaction to show conversion',
      reconciled: false,
    });
    
    Alert.alert(
      'Manual Transaction Added!',
      'Added manual transaction with gray circles (pending reconciliation). In 3 seconds, it will convert to show green + yellow checks when "bank sync" finds the matching transaction.',
      [{ text: 'OK' }]
    );
    
    // After a short delay, sync with matching bank transaction
    setTimeout(() => {
      syncBankTransactions([{
        userId: 'user-1',
        accountId: activeAccount.id,
        date: new Date().toISOString().split('T')[0],
        payee: 'COFFEE SHOP DOWNTOWN #123',
        amount: -4.50,
        source: 'bank' as const,
        notes: 'Card payment',
        reconciled: false,
      }]);
      
      setTimeout(() => {
        Alert.alert(
          'Conversion Complete! 🎉',
          'The manual "Demo Coffee Shop" entry has been converted to a bank transaction. Notice it now shows:\n\n✅ Green check = Bank confirmed\n🟡 Yellow check = Originally manual\n\nYou can tap the green check to toggle reconciliation.',
          [{ text: 'Got it!' }]
        );
      }, 500);
    }, 3000);
  };

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const isStartingBalance = item.id.startsWith('starting-balance-');
    
    return (
      <Pressable
        className="mx-4 mb-2 p-4 bg-white rounded-lg shadow-sm border border-gray-100"
        onPress={() => {
          if (!isStartingBalance) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation?.navigate('EditTransaction', { transaction: item });
          }
        }}
        disabled={isStartingBalance}
      >
        <View className="flex-row justify-between items-center">
          <View className="flex-1">
            <Text className={`font-semibold ${isStartingBalance ? 'text-blue-900' : 'text-gray-900'}`}>
              {item.payee}
            </Text>
            <View className="flex-row items-center mt-1">
              <Text className="text-sm text-gray-500">
                {new Date(item.date).toLocaleDateString()}
              </Text>
              <Text className="text-sm text-gray-400 mx-2">•</Text>
              <Text className={`text-sm ${
                item.source === 'manual' ? 'text-gray-500' : 
                item.notes?.includes('Converted') ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {item.source === 'bank' && item.notes?.includes('Converted') ? 'converted' : item.source}
              </Text>
            </View>
          </View>
          
          <View className="items-end">
            <Text className={`font-semibold ${
              item.amount >= 0 
                ? isStartingBalance ? 'text-blue-600' : 'text-green-600'
                : 'text-red-600'
            }`}>
              {item.amount >= 0 ? '+' : ''}${Math.abs(item.amount).toFixed(2)}
            </Text>
            
            {/* Reconciliation Status */}
            <Pressable
              onPress={() => !isStartingBalance && toggleReconciled(item.id)}
              className="flex-row items-center mt-1"
              disabled={isStartingBalance}
            >
              {item.source === 'manual' && !item.reconciled ? (
                // Manual transaction - two gray circles
                <View className="flex-row">
                  <Ionicons name="ellipse-outline" size={12} color="#9CA3AF" />
                  <Ionicons name="ellipse-outline" size={12} color="#9CA3AF" style={{ marginLeft: 2 }} />
                </View>
              ) : item.source === 'bank' && item.notes?.includes('Converted') ? (
                // Converted transaction - green + yellow
                <View className="flex-row">
                  <Ionicons 
                    name={item.reconciled ? "checkmark-circle" : "checkmark-circle-outline"} 
                    size={12} 
                    color="#10B981" 
                  />
                  <Ionicons name="checkmark-circle" size={12} color="#F59E0B" style={{ marginLeft: 2 }} />
                </View>
              ) : (
                // Regular bank transaction - single green check
                <Ionicons 
                  name={item.reconciled ? "checkmark-circle" : "checkmark-circle-outline"} 
                  size={12} 
                  color="#10B981" 
                />
              )}
              <Text className="text-xs text-gray-500 ml-1">
                {isStartingBalance ? 'Starting Balance' :
                 item.source === 'manual' && !item.reconciled ? 'Pending' :
                 item.reconciled ? 'Reconciled' : 'Tap to reconcile'}
              </Text>
            </Pressable>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 py-4 border-b border-gray-200">
        <Text className="text-3xl font-bold text-gray-900 mb-2">
          Digital Register
        </Text>
        <Text className="text-gray-600">
          Your digital checkbook is ready to use
        </Text>
      </View>

      {/* Main Content */}
      <View className="flex-1 px-6 py-8">
        {/* Account Summary */}
        {activeAccount ? (
          <View className="bg-blue-50 p-6 rounded-xl mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <Ionicons name="wallet" size={24} color="#3B82F6" />
                <View className="ml-2">
                  <Text className="text-lg font-semibold text-blue-900">
                    {activeAccount.name}
                  </Text>
                  <Text className="text-sm text-blue-700">
                    {activeAccount.bankName} • ****{activeAccount.accountNumber}
                  </Text>
                </View>
              </View>
              {activeAccount.isConnected && (
                <Ionicons name="link" size={20} color="#10B981" />
              )}
            </View>
            <Text className="text-3xl font-bold text-blue-900">
              ${(activeAccount.currentBalance || 0).toFixed(2)}
            </Text>
            <Text className="text-blue-700 mt-1">
              Available Balance • {transactions.length} transactions
            </Text>
          </View>
        ) : (
          <View className="bg-gray-50 p-6 rounded-xl mb-6 border-2 border-dashed border-gray-300">
            <View className="items-center">
              <Ionicons name="wallet-outline" size={48} color="#9CA3AF" />
              <Text className="text-lg font-semibold text-gray-600 mt-3">
                No Account Connected
              </Text>
              <Text className="text-gray-500 text-center mt-1">
                Connect your bank account to get started
              </Text>
            </View>
          </View>
        )}

        {/* Demo Controls */}
        <View className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-6">
          <View className="flex-row items-center mb-3">
            <Ionicons name="flask" size={20} color="#F59E0B" />
            <Text className="text-lg font-semibold text-yellow-900 ml-2">
              Demo Controls
            </Text>
          </View>
          <View className="space-y-3">
            <Pressable 
              className="bg-yellow-100 p-3 rounded-lg"
              onPress={handleDemoReset}
            >
              <View className="flex-row items-center">
                <Ionicons name="refresh" size={20} color="#F59E0B" />
                <Text className="font-medium text-yellow-900 ml-2">
                  Reset & Start Bank Sync Demo
                </Text>
              </View>
            </Pressable>
            
            {activeAccount && (
              <Pressable 
                className="bg-yellow-100 p-3 rounded-lg"
                onPress={handleManualTransactionDemo}
              >
                <View className="flex-row items-center">
                  <Ionicons name="git-merge" size={20} color="#F59E0B" />
                  <Text className="font-medium text-yellow-900 ml-2">
                    Demo Manual → Bank Conversion
                  </Text>
                </View>
              </Pressable>
            )}
          </View>
        </View>

        {/* Transactions */}
        {showTransactions && transactions.length > 0 && (
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-gray-900">
                Recent Transactions
              </Text>
              <Text className="text-sm text-gray-500">
                Tap green checks to toggle reconciliation
              </Text>
            </View>
            <FlatList
              data={transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())}
              renderItem={renderTransaction}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}

        {/* Feature Cards */}
        <View className="space-y-4">
          <Pressable 
            className="bg-gray-50 p-4 rounded-lg border border-gray-200"
            onPress={() => navigation?.navigate('AddTransaction')}
          >
            <View className="flex-row items-center">
              <Ionicons name="add-circle" size={24} color="#10B981" />
              <Text className="text-lg font-medium text-gray-900 ml-3">
                Add Transaction
              </Text>
            </View>
            <Text className="text-gray-600 mt-1 ml-9">
              Record a new transaction manually
            </Text>
          </Pressable>

          <Pressable 
            className="bg-gray-50 p-4 rounded-lg border border-gray-200"
            onPress={() => navigation?.navigate('Reports')}
          >
            <View className="flex-row items-center">
              <Ionicons name="bar-chart" size={24} color="#F59E0B" />
              <Text className="text-lg font-medium text-gray-900 ml-3">
                View Reports
              </Text>
            </View>
            <Text className="text-gray-600 mt-1 ml-9">
              See spending analysis and trends
            </Text>
          </Pressable>

          <Pressable 
            className="bg-gray-50 p-4 rounded-lg border border-gray-200"
            onPress={() => navigation?.navigate('Settings')}
          >
            <View className="flex-row items-center">
              <Ionicons name="settings" size={24} color="#6B7280" />
              <Text className="text-lg font-medium text-gray-900 ml-3">
                Settings
              </Text>
            </View>
            <Text className="text-gray-600 mt-1 ml-9">
              Configure your account preferences
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Footer Status */}
      <View className="px-6 py-4 border-t border-gray-200">
        <View className="flex-row items-center justify-center">
          <Ionicons name="checkmark-circle" size={20} color="#10B981" />
          <Text className="text-green-600 font-medium ml-2">
            Digital Register Active
          </Text>
        </View>
        <Text className="text-center text-gray-500 text-sm mt-1">
          Navigation and all features working properly
        </Text>
      </View>

      {/* Floating Action Button */}
      {activeAccount && (
        <Pressable
          onPress={() => navigation?.navigate('AddTransaction')}
          className="absolute bottom-6 right-6 bg-blue-500 w-14 h-14 rounded-full items-center justify-center shadow-lg"
          style={{ elevation: 8 }}
        >
          <Ionicons name="add" size={28} color="white" />
        </Pressable>
      )}

      {/* Initial Bank Setup Modal */}
      <SimpleInitialBankSyncScreen
        visible={showFirstTimeSetup}
        onComplete={() => {
          setShowFirstTimeSetup(false);
          setShowTransactions(true);
          setTimeout(() => {
            Alert.alert(
              'Welcome to Digital Register! 🎉',
              'Your bank account has been connected and demo transactions imported. You can now:\n\n• View and reconcile transactions\n• Add manual entries\n• See real-time balance updates\n• Try the manual→bank conversion demo',
              [{ text: "Let's Explore!" }]
            );
          }, 100);
        }}
        onCancel={() => setShowFirstTimeSetup(false)}
      />
    </SafeAreaView>
  );
};

export default SimpleRegisterScreen;