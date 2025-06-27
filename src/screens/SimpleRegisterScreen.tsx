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
  const [showLegend, setShowLegend] = useState(false);
  
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

  const renderTransaction = ({ item, index }: { item: Transaction; index: number }) => {
    const isStartingBalance = item.id.startsWith('starting-balance-');
    
    // Calculate running balance (working backwards from current balance)
    const sortedTransactions = transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    let runningBalance = activeAccount?.currentBalance || 0;
    for (let i = 0; i < index; i++) {
      runningBalance -= sortedTransactions[i].amount;
    }
    
    return (
      <Pressable
        className="mx-4 mb-1 px-4 py-3 bg-white rounded-lg shadow-sm border border-gray-100"
        onPress={() => {
          if (!isStartingBalance) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation?.navigate('EditTransaction', { transaction: item });
          }
        }}
        disabled={isStartingBalance}
        style={({ pressed }) => ({
          opacity: pressed ? 0.7 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        })}
      >
        {/* Header Row - Payee and Check Number */}
        <View className="flex-row items-center mb-2">
          <View className="flex-row items-center flex-1">
            {isStartingBalance && (
              <Ionicons 
                name="flag-outline" 
                size={16} 
                color="#3B82F6" 
                style={{ marginRight: 8 }}
              />
            )}
            <Text className={`text-base font-semibold flex-1 ${
              isStartingBalance ? "text-blue-900" : "text-gray-900"
            }`}>
              {item.payee}
            </Text>
          </View>
          {item.checkNumber && (
            <Text className="text-sm text-gray-500 mr-2">
              #{item.checkNumber}
            </Text>
          )}
          
          {/* Reconciliation Status */}
          <Pressable
            onPress={() => !isStartingBalance && toggleReconciled(item.id)}
            disabled={isStartingBalance}
            className="ml-2"
          >
            {item.source === 'manual' && !item.reconciled ? (
              // Manual transaction - two gray circles
              <View className="flex-row">
                <Ionicons name="ellipse-outline" size={16} color="#9CA3AF" />
                <Ionicons name="ellipse-outline" size={16} color="#9CA3AF" style={{ marginLeft: 2 }} />
              </View>
            ) : item.source === 'bank' && item.notes?.includes('Converted') ? (
              // Converted transaction - green + yellow
              <View className="flex-row">
                <Ionicons 
                  name={item.reconciled ? "checkmark-circle" : "checkmark-circle-outline"} 
                  size={16} 
                  color="#10B981" 
                />
                <Ionicons name="checkmark-circle" size={16} color="#F59E0B" style={{ marginLeft: 2 }} />
              </View>
            ) : (
              // Regular bank transaction - single green check
              <Ionicons 
                name={item.reconciled ? "checkmark-circle" : "checkmark-circle-outline"} 
                size={16} 
                color="#10B981" 
              />
            )}
          </Pressable>
        </View>

        {/* Main Row - Date, Type, Debit, Credit, Balance */}
        <View className="flex-row items-center">
          {/* Left: Date and Transaction Type */}
          <View className="w-20 pr-2">
            <Text className="text-sm text-gray-600" numberOfLines={1}>
              {new Date(item.date).toLocaleDateString('en-US', { 
                month: 'numeric', 
                day: 'numeric' 
              })}
            </Text>
            <View className="flex-row items-center">
              <Ionicons
                name={item.source === 'manual' ? 'receipt-outline' : 'card-outline'}
                size={12}
                color={
                  item.source === 'manual' 
                    ? '#9CA3AF' 
                    : item.notes?.includes('Converted')
                      ? '#F59E0B'
                      : '#10B981'
                }
              />
              <Text className={`text-xs ml-1 capitalize ${
                item.source === 'manual' 
                  ? 'text-gray-500' 
                  : item.notes?.includes('Converted')
                    ? 'text-yellow-600'
                    : 'text-green-600'
              }`}>
                {item.source === 'bank' && item.notes?.includes('Converted')
                  ? 'converted'
                  : item.source}
              </Text>
            </View>
          </View>

          {/* Middle-Left: Debit Amount */}
          <View className="w-24 items-end px-1">
            <Text className="text-xs text-gray-500 font-medium">DEBIT</Text>
            {item.amount < 0 && (
              <Text className="text-base font-semibold text-red-600" numberOfLines={1}>
                ${Math.abs(item.amount).toFixed(2)}
              </Text>
            )}
          </View>

          {/* Middle-Right: Credit Amount */}
          <View className="w-24 items-end px-1">
            <Text className="text-xs text-gray-500 font-medium">CREDIT</Text>
            {item.amount >= 0 && (
              <Text className={`text-base font-semibold ${
                isStartingBalance ? "text-blue-600" : "text-green-600"
              }`} numberOfLines={1}>
                ${item.amount.toFixed(2)}
              </Text>
            )}
          </View>

          {/* Right: Running Balance */}
          <View className="w-24 items-end pl-1">
            <Text className="text-xs text-gray-500 font-medium">BALANCE</Text>
            <Text className={`text-base font-bold ${
              runningBalance >= 0 ? "text-gray-900" : "text-red-600"
            }`} numberOfLines={1}>
              ${Math.abs(runningBalance).toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Notes Row (if exists) */}
        {item.notes && (
          <View className="mt-2 pt-2 border-t border-gray-100">
            <Text className="text-sm text-gray-500">{item.notes}</Text>
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-gray-200">
        <View className="flex-row justify-between items-center mb-4">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-gray-900">
              Digital Register
            </Text>
          </View>
          <View className="flex-row items-center">
            <Pressable
              onPress={handleManualTransactionDemo}
              className="p-2"
              disabled={!activeAccount}
              style={{ marginRight: 4 }}
            >
              <Ionicons 
                name="flask-outline" 
                size={22} 
                color={activeAccount ? "#3B82F6" : "#9CA3AF"} 
              />
            </Pressable>
            <Pressable
              onPress={handleDemoReset}
              className="p-2"
              style={{ marginRight: 4 }}
            >
              <Ionicons name="refresh-outline" size={22} color="#EF4444" />
            </Pressable>
            <Pressable
              onPress={() => setShowLegend(!showLegend)}
              className="p-2"
              style={{ marginRight: 4 }}
            >
              <Ionicons name="help-circle-outline" size={22} color="#374151" />
            </Pressable>
            <Pressable
              onPress={() => navigation?.navigate('Reports')}
              className="p-2"
              style={{ marginRight: 4 }}
            >
              <Ionicons name="bar-chart-outline" size={22} color="#374151" />
            </Pressable>
            <Pressable
              onPress={() => navigation?.navigate('Accounts')}
              className="p-2"
              style={{ marginRight: 4 }}
            >
              <Ionicons name="wallet-outline" size={22} color="#374151" />
            </Pressable>
            <Pressable
              onPress={() => navigation?.navigate('Settings')}
              className="p-2"
              style={{ marginRight: 0 }}
            >
              <Ionicons name="settings-outline" size={22} color="#374151" />
            </Pressable>
          </View>
        </View>
        <Text className="text-gray-600">
          Your digital checkbook register
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

        {/* Reconciliation Legend */}
        {showLegend && (
          <View className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-semibold text-blue-900">
                Reconciliation Guide
              </Text>
              <Pressable onPress={() => setShowLegend(false)}>
                <Ionicons name="close" size={20} color="#3B82F6" />
              </Pressable>
            </View>
            <View className="space-y-3">
              <View className="flex-row items-center">
                <View className="flex-row mr-3">
                  <Ionicons name="ellipse-outline" size={16} color="#9CA3AF" />
                  <Ionicons name="ellipse-outline" size={16} color="#9CA3AF" style={{ marginLeft: 2 }} />
                </View>
                <Text className="text-blue-800">Manual transactions (not yet reconciled)</Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={16} color="#10B981" style={{ marginRight: 12 }} />
                <Text className="text-blue-800">Bank transactions (tap to toggle reconciliation)</Text>
              </View>
              <View className="flex-row items-center">
                <View className="flex-row mr-3">
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  <Ionicons name="checkmark-circle" size={16} color="#F59E0B" style={{ marginLeft: 2 }} />
                </View>
                <Text className="text-blue-800">Converted transactions (was manual, now bank confirmed)</Text>
              </View>
            </View>
          </View>
        )}

        {/* Transactions */}
        {showTransactions && transactions.length > 0 && (
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-gray-900">
                Transaction Register
              </Text>
              <Text className="text-sm text-gray-500">
                Tap checks to reconcile
              </Text>
            </View>
            
            {/* Column Headers */}
            <View className="mx-4 mb-2 px-4 py-2 bg-gray-50 rounded-lg">
              <View className="flex-row items-center">
                <View className="w-20 pr-2">
                  <Text className="text-xs font-bold text-gray-700 uppercase">Date/Type</Text>
                </View>
                <View className="w-24 items-center px-1">
                  <Text className="text-xs font-bold text-gray-700 uppercase">Debit</Text>
                </View>
                <View className="w-24 items-center px-1">
                  <Text className="text-xs font-bold text-gray-700 uppercase">Credit</Text>
                </View>
                <View className="w-24 items-center pl-1">
                  <Text className="text-xs font-bold text-gray-700 uppercase">Balance</Text>
                </View>
              </View>
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

        {/* Quick Actions */}
        {activeAccount && (
          <View className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <Text className="text-lg font-semibold text-gray-900 mb-3">Quick Actions</Text>
            <View className="flex-row space-x-3">
              <Pressable 
                className="flex-1 bg-white p-3 rounded-lg border border-gray-200"
                onPress={() => navigation?.navigate('AddTransaction')}
              >
                <View className="items-center">
                  <Ionicons name="add-circle" size={24} color="#10B981" />
                  <Text className="text-sm font-medium text-gray-900 mt-1">Add</Text>
                  <Text className="text-xs text-gray-500">Transaction</Text>
                </View>
              </Pressable>
              
              <Pressable 
                className="flex-1 bg-white p-3 rounded-lg border border-gray-200"
                onPress={handleManualTransactionDemo}
              >
                <View className="items-center">
                  <Ionicons name="flask" size={24} color="#3B82F6" />
                  <Text className="text-sm font-medium text-gray-900 mt-1">Demo</Text>
                  <Text className="text-xs text-gray-500">Conversion</Text>
                </View>
              </Pressable>
              
              <Pressable 
                className="flex-1 bg-white p-3 rounded-lg border border-gray-200"
                onPress={() => setShowLegend(true)}
              >
                <View className="items-center">
                  <Ionicons name="help-circle" size={24} color="#F59E0B" />
                  <Text className="text-sm font-medium text-gray-900 mt-1">Help</Text>
                  <Text className="text-xs text-gray-500">Guide</Text>
                </View>
              </Pressable>
            </View>
          </View>
        )}
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