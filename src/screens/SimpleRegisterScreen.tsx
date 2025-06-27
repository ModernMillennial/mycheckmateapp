import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Alert, FlatList, Clipboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTransactionStore } from '../state/transactionStore';
import { Transaction } from '../types';


interface Props {
  navigation: any;
}

const SimpleRegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [showTransactions, setShowTransactions] = useState(true);
  const [showLegend, setShowLegend] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  
  const {
    settings,
    initializeWithSeedData,
    getActiveAccount,
    getActiveTransactions,
    addTransaction,
    syncBankTransactions,
    clearAndReinitialize,
    updateSettings,
    toggleReconciled: togglePosted,
  } = useTransactionStore();

  useEffect(() => {
    // Auto-setup for working app (bypassing demo mode)
    if (!settings.bankLinked) {
      updateSettings({ bankLinked: true });
    }
    initializeWithSeedData();
    setShowTransactions(true);
  }, [initializeWithSeedData, settings.bankLinked]);

  const activeAccount = getActiveAccount();
  const transactions = getActiveTransactions();

  // Auto-setup for working app (no first-time setup needed)
  useEffect(() => {
    // App will automatically initialize with working data
  }, []);

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
      'Added manual transaction with "NOT POSTED" status. In 3 seconds, it will convert to show "POSTED" when "bank sync" finds the matching transaction.',
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
          'The manual "Demo Coffee Shop" entry has been converted to a bank transaction. Notice the change:\n\n• Before: "NOT POSTED" (manual entry)\n• After: "POSTED" (converted transaction)\n\nThis transaction was originally manual but is now bank-confirmed.',
          [{ text: 'Perfect!' }]
        );
      }, 500);
    }, 3000);
  };

  const handleBugReport = () => {
    // Collect diagnostic information
    const debugInfo = {
      timestamp: new Date().toISOString(),
      appVersion: '1.0.0',
      platform: 'React Native / Expo',
      accountInfo: {
        hasActiveAccount: !!activeAccount,
        accountName: activeAccount?.name || 'None',
        bankLinked: settings.bankLinked,
        transactionCount: transactions.length,
      },
      systemInfo: {
        transactionStoreLoaded: true,
        navigationWorking: !!navigation,
        currentScreen: 'SimpleRegisterScreen',
      },
      recentErrors: 'No recent errors logged', // In a real app, you'd track errors
    };

    const debugText = `CHECKMATE BUG REPORT
=====================================
Timestamp: ${debugInfo.timestamp}
App Version: ${debugInfo.appVersion}
Platform: ${debugInfo.platform}

ACCOUNT INFO:
- Active Account: ${debugInfo.accountInfo.hasActiveAccount ? 'Yes' : 'No'}
- Account Name: ${debugInfo.accountInfo.accountName}
- Bank Linked: ${debugInfo.accountInfo.bankLinked ? 'Yes' : 'No'}
- Transaction Count: ${debugInfo.accountInfo.transactionCount}

SYSTEM INFO:
- Store Loaded: ${debugInfo.systemInfo.transactionStoreLoaded ? 'Yes' : 'No'}
- Navigation Working: ${debugInfo.systemInfo.navigationWorking ? 'Yes' : 'No'}
- Current Screen: ${debugInfo.systemInfo.currentScreen}

RECENT ERRORS:
${debugInfo.recentErrors}

DESCRIPTION:
[Please describe the bug you encountered]

STEPS TO REPRODUCE:
1. [Step 1]
2. [Step 2]
3. [Step 3]

EXPECTED BEHAVIOR:
[What you expected to happen]

ACTUAL BEHAVIOR:
[What actually happened]
=====================================`;

    Alert.alert(
      'Bug Report 🐛',
      'Choose how to share your bug report with diagnostic information:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Copy to Clipboard',
          onPress: () => {
            Clipboard.setString(debugText);
            Alert.alert(
              'Copied! 📋',
              'Bug report template with diagnostic info copied to clipboard. You can now paste it in an email or support form.',
              [{ text: 'OK' }]
            );
          },
        },
        {
          text: 'View Details',
          onPress: () => {
            Alert.alert(
              'Debug Information',
              `Current Status:
• Account: ${activeAccount?.name || 'None'}
• Bank Linked: ${settings.bankLinked ? 'Yes' : 'No'}
• Transactions: ${transactions.length}
• Navigation: Working
• Store: Loaded

Tap "Copy to Clipboard" to get the full bug report template.`,
              [{ text: 'OK' }]
            );
          },
        },
      ]
    );
  };

  const renderTransaction = ({ item, index }: { item: Transaction; index: number }) => {
    const isStartingBalance = item.id.startsWith('starting-balance-');
    
    // Calculate running balance safely
    let runningBalance = activeAccount?.currentBalance || 0;
    try {
      const sortedTransactions = transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      for (let i = 0; i < index && i < sortedTransactions.length; i++) {
        if (sortedTransactions[i] && typeof sortedTransactions[i].amount === 'number') {
          runningBalance -= sortedTransactions[i].amount;
        }
      }
    } catch (error) {
      console.log('Error calculating running balance:', error);
      runningBalance = activeAccount?.currentBalance || 0;
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
          
          {/* Posting Status */}
          <Pressable
            onPress={() => !isStartingBalance && item.source === 'bank' && togglePosted(item.id)}
            disabled={isStartingBalance || item.source === 'manual'}
            className="ml-2"
          >
            <View className="bg-gray-100 px-2 py-1 rounded">
              <Text className={`text-xs font-medium ${
                item.source === 'manual' && !item.reconciled 
                  ? 'text-red-600' 
                  : 'text-blue-600'
              }`}>
                {item.source === 'manual' && !item.reconciled 
                  ? 'NOT POSTED'
                  : 'POSTED'}
              </Text>
            </View>
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
                color="#000000"
              />
              <Text className={`text-xs ml-1 capitalize text-black`}>
                {item.source === 'bank' && item.notes?.includes('Converted')
                  ? 'manual'
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
              <Text className="text-base font-semibold text-green-600" numberOfLines={1}>
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
              Checkmate
            </Text>
          </View>
          <Pressable
            onPress={() => setShowMenu(!showMenu)}
            className="p-2"
          >
            <Ionicons name="menu" size={24} color="#374151" />
          </Pressable>
        </View>
        <Text className="text-gray-600">
          Your digital checkbook register
        </Text>
      </View>

      {/* Hamburger Menu Overlay */}
      {showMenu && (
        <View className="absolute top-0 left-0 right-0 bottom-0 z-50">
          {/* Background overlay */}
          <Pressable 
            onPress={() => setShowMenu(false)}
            className="flex-1 bg-black/50"
          />
          
          {/* Menu panel */}
          <View className="absolute top-0 right-0 w-64 h-full bg-white shadow-lg">
            {/* Menu header */}
            <View className="bg-blue-500 px-4 py-6 pt-12">
              <View className="flex-row justify-between items-center">
                <Text className="text-white text-lg font-semibold">Menu</Text>
                <Pressable onPress={() => setShowMenu(false)}>
                  <Ionicons name="close" size={24} color="white" />
                </Pressable>
              </View>
            </View>
            
            {/* Menu items */}
            <View className="flex-1 px-4 py-4">
              <Pressable
                onPress={() => {
                  setShowMenu(false);
                  navigation?.navigate('Accounts');
                }}
                className="flex-row items-center py-4 border-b border-gray-100"
              >
                <Ionicons name="wallet-outline" size={22} color="#374151" />
                <Text className="ml-3 text-gray-900 text-base">Accounts</Text>
              </Pressable>
              
              <Pressable
                onPress={() => {
                  setShowMenu(false);
                  navigation?.navigate('Reports');
                }}
                className="flex-row items-center py-4 border-b border-gray-100"
              >
                <Ionicons name="bar-chart-outline" size={22} color="#374151" />
                <Text className="ml-3 text-gray-900 text-base">Reports</Text>
              </Pressable>
              
              <Pressable
                onPress={() => {
                  setShowMenu(false);
                  setShowLegend(true);
                }}
                className="flex-row items-center py-4 border-b border-gray-100"
              >
                <Ionicons name="help-circle-outline" size={22} color="#374151" />
                <Text className="ml-3 text-gray-900 text-base">Help Guide</Text>
              </Pressable>
              
              <Pressable
                onPress={() => {
                  setShowMenu(false);
                  handleManualTransactionDemo();
                }}
                className="flex-row items-center py-4 border-b border-gray-100"
                disabled={!activeAccount}
              >
                <Ionicons 
                  name="flask-outline" 
                  size={22} 
                  color={activeAccount ? "#3B82F6" : "#9CA3AF"} 
                />
                <Text className={`ml-3 text-base ${
                  activeAccount ? "text-gray-900" : "text-gray-400"
                }`}>Demo Conversion</Text>
              </Pressable>
              
              <Pressable
                onPress={() => {
                  setShowMenu(false);
                  handleBugReport();
                }}
                className="flex-row items-center py-4 border-b border-gray-100"
              >
                <Ionicons name="bug-outline" size={22} color="#DC2626" />
                <Text className="ml-3 text-gray-900 text-base">Report Bug</Text>
              </Pressable>
              
              <Pressable
                onPress={() => {
                  setShowMenu(false);
                  handleDemoReset();
                }}
                className="flex-row items-center py-4 border-b border-gray-100"
              >
                <Ionicons name="refresh-outline" size={22} color="#EF4444" />
                <Text className="ml-3 text-gray-900 text-base">Reset Demo</Text>
              </Pressable>
              
              <Pressable
                onPress={() => {
                  setShowMenu(false);
                  navigation?.navigate('Settings');
                }}
                className="flex-row items-center py-4"
              >
                <Ionicons name="settings-outline" size={22} color="#374151" />
                <Text className="ml-3 text-gray-900 text-base">Settings</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}

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
              {settings.bankLinked && (
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
                Posting Status Guide
              </Text>
              <Pressable onPress={() => setShowLegend(false)}>
                <Ionicons name="close" size={20} color="#3B82F6" />
              </Pressable>
            </View>
            <View className="space-y-3">
              <View className="flex-row items-center">
                <View className="bg-gray-100 px-2 py-1 rounded mr-3">
                  <Text className="text-xs font-medium text-red-600">NOT POSTED</Text>
                </View>
                <Text className="text-blue-800">Manual transactions (not yet posted to bank)</Text>
              </View>
              <View className="flex-row items-center">
                <View className="bg-gray-100 px-2 py-1 rounded mr-3">
                  <Text className="text-xs font-medium text-blue-600">POSTED</Text>
                </View>
                <Text className="text-blue-800">Bank transactions (tap to toggle posted status)</Text>
              </View>
              <View className="flex-row items-center">
                <View className="bg-gray-100 px-2 py-1 rounded mr-3">
                  <Text className="text-xs font-medium text-black">MANUAL</Text>
                </View>
                <Text className="text-blue-800">Transaction type (converted from manual to bank confirmed)</Text>
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
                Tap "POSTED" to toggle status
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
              data={transactions.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())}
              renderItem={renderTransaction}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              removeClippedSubviews={false}
              initialNumToRender={10}
              maxToRenderPerBatch={5}
              windowSize={10}
            />
          </View>
        )}

        {/* Quick Actions */}
        <View className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <Text className="text-lg font-semibold text-gray-900 mb-3">Quick Actions</Text>
          <View className="flex-row space-x-3">
            {activeAccount ? (
              <>
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
              </>
            ) : (
              <>
                <Pressable 
                  className="flex-1 bg-white p-3 rounded-lg border border-gray-200"
                  onPress={handleDemoReset}
                >
                  <View className="items-center">
                    <Ionicons name="play-circle" size={24} color="#3B82F6" />
                    <Text className="text-sm font-medium text-gray-900 mt-1">Start</Text>
                    <Text className="text-xs text-gray-500">Demo</Text>
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
                
                <Pressable 
                  className="flex-1 bg-white p-3 rounded-lg border border-gray-200"
                  onPress={handleBugReport}
                >
                  <View className="items-center">
                    <Ionicons name="bug" size={24} color="#DC2626" />
                    <Text className="text-sm font-medium text-gray-900 mt-1">Report</Text>
                    <Text className="text-xs text-gray-500">Bug</Text>
                  </View>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </View>

      {/* Footer Status */}
      <View className="px-6 py-4 border-t border-gray-200">
        <View className="flex-row items-center justify-center">
          <Ionicons name="checkmark-circle" size={20} color="#10B981" />
          <Text className="text-green-600 font-medium ml-2">
            CheckMate Active
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


    </SafeAreaView>
  );
};

export default SimpleRegisterScreen;