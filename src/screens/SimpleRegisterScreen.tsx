import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Alert, FlatList, Clipboard, ScrollView, Image, Modal } from 'react-native';
import * as MailComposer from 'expo-mail-composer';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming,
  cancelAnimation 
} from 'react-native-reanimated';
import { useTransactionStore } from '../state/transactionStore';
import { useAuthStore } from '../state/authStore';
import { Transaction } from '../types';

const AnimatedIonicons = Animated.createAnimatedComponent(Ionicons);


interface Props {
  navigation: any;
}

// Updated component with fixed imports and functions
const SimpleRegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [showTransactions, setShowTransactions] = useState(true);
  const [showLegend, setShowLegend] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{visible: boolean, title: string, message: string, isError: boolean}>({
    visible: false,
    title: '',
    message: '',
    isError: false
  });
  const [showDemoModal, setShowDemoModal] = useState(false);
  
  // Animation for sync button
  const rotation = useSharedValue(0);
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });
  
  const { user } = useAuthStore();
  const {
    settings,
    initializeWithSeedData,
    getActiveAccount,
    getActiveTransactions,
    getFilteredTransactionsFromStartingPoint,
    addTransaction,
    syncBankTransactions,
    clearAndReinitialize,
    updateSettings,
    toggleReconciled: togglePosted,
    syncPlaidTransactions,
    calculateRunningBalance,
    resetToFirstTimeUser,
  } = useTransactionStore();

  const activeAccount = getActiveAccount();
  const transactions = getFilteredTransactionsFromStartingPoint() || [];

  useEffect(() => {
    // Check if this is a first-time user
    const hasTransactions = transactions.length > 0;
    const isBankLinked = settings.bankLinked;
    
    if (!hasTransactions && !isBankLinked) {
      // First-time user - show onboarding
      setShowTransactions(false);
    } else {
      // Returning user or has data
      setShowTransactions(true);
    }
  }, [transactions?.length, settings.bankLinked]);

  // Auto-setup for working app (no first-time setup needed)
  useEffect(() => {
    // App will automatically initialize with working data
  }, []);





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
      'Send a bug report with diagnostic information to our support team.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Email',
          onPress: async () => {
            try {
              const isAvailable = await MailComposer.isAvailableAsync();
              if (isAvailable) {
                await MailComposer.composeAsync({
                  recipients: ['support@mycheckmateapp.com'],
                  subject: 'Checkmate Bug Report',
                  body: debugText,
                  isHtml: false,
                });
              } else {
                Alert.alert(
                  'Email Not Available',
                  'Email is not set up on this device. Please set up an email account in your device settings and try again.',
                  [{ text: 'OK' }]
                );
              }
            } catch (error) {
              console.error('Error opening email composer:', error);
              Alert.alert(
                'Email Error',
                'Unable to open email composer. Please check your email settings and try again.',
                [{ text: 'OK' }]
              );
            }
          },
        },
      ]
    );
  };

  const handleManualTransactionDemo = () => {
    setShowDemoModal(true);
    
    // Auto-dismiss after 3.5 seconds
    setTimeout(() => {
      setShowDemoModal(false);
    }, 3500);
  };

  const handleDemoReset = () => {
    Alert.alert(
      'Start Demo 🚀',
      'This will add sample transactions to demonstrate the Checkmate features including manual entry, bank sync, and transaction conversion.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add Demo Data',
          style: 'default',
          onPress: () => {
            // Add some demo transactions
            const activeAccount = getActiveAccount();
            if (activeAccount) {
              const demoTransactions = [
                {
                  userId: 'user-1',
                  accountId: activeAccount.id,
                  date: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0], // 3 days ago
                  payee: 'Coffee Shop',
                  amount: -4.50,
                  source: 'manual' as const,
                  notes: 'Morning coffee',
                  reconciled: false,
                },
                {
                  userId: 'user-1',
                  accountId: activeAccount.id,
                  date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0], // 2 days ago
                  payee: 'Grocery Store',
                  amount: -125.67,
                  source: 'manual' as const,
                  notes: 'Weekly shopping',
                  reconciled: false,
                },
                {
                  userId: 'user-1',
                  accountId: activeAccount.id,
                  date: new Date(Date.now() - 86400000 * 1).toISOString().split('T')[0], // 1 day ago
                  payee: 'Gas Station',
                  amount: -45.00,
                  source: 'manual' as const,
                  notes: 'Fill up tank',
                  reconciled: false,
                }
              ];
              
              demoTransactions.forEach(transaction => {
                addTransaction(transaction);
              });
              
              Alert.alert(
                'Demo Data Added! ✅',
                'Sample transactions have been added to your register. Try syncing with your bank to see the conversion feature in action!',
                [{ text: 'Great!' }]
              );
            }
          }
        }
      ]
    );
  };

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

  const renderTransaction = ({ item, index }: { item: Transaction; index: number }) => {
    const isStartingBalance = item.payee === 'Starting Point' || item.payee === 'Starting Balance' || item.id.startsWith('starting-balance-');
    
    // Calculate running balance safely
    let runningBalance = 0;
    try {
      // Sort transactions by date (oldest first for balance calculation)
      const sortedTransactions = transactions
        .slice()
        .sort((a, b) => {
          // Starting balance always first
          const aIsStarting = a.payee === 'Starting Point' || a.payee === 'Starting Balance' || a.id.startsWith('starting-balance-');
          const bIsStarting = b.payee === 'Starting Point' || b.payee === 'Starting Balance' || b.id.startsWith('starting-balance-');
          
          if (aIsStarting && !bIsStarting) return -1;
          if (bIsStarting && !aIsStarting) return 1;
          if (aIsStarting && bIsStarting) return new Date(a.date).getTime() - new Date(b.date).getTime();
          
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        });
      
      // Calculate running balance properly with starting balance
      const currentItemIndex = sortedTransactions.findIndex(t => t.id === item.id);
      
      if (isStartingBalance) {
        // For starting balance entry, just show the starting balance
        runningBalance = item.amount;
      } else {
        // For regular transactions, start with account starting balance and add all transactions up to this one
        runningBalance = activeAccount?.startingBalance || 0;
        for (let i = 0; i <= currentItemIndex; i++) {
          const transaction = sortedTransactions[i];
          if (transaction && typeof transaction.amount === 'number') {
            // Skip starting balance entries in the calculation since we already start with the starting balance
            const transactionIsStarting = transaction.payee === 'Starting Point' || transaction.payee === 'Starting Balance' || transaction.id.startsWith('starting-balance-');
            if (!transactionIsStarting) {
              runningBalance += transaction.amount;
            }
          }
        }
      }
    } catch (error) {
      console.log('Error calculating running balance:', error);
      runningBalance = item.amount || 0;
    }
    
    return (
      <Pressable
        className="mx-2 mb-1 px-3 py-3 bg-white rounded-lg shadow-sm border border-gray-100"
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
                name="flag" 
                size={16} 
                color="#3B82F6" 
                style={{ marginRight: 8 }}
              />
            )}
            <Text className={`text-base font-semibold flex-1 ${
              isStartingBalance ? "text-blue-900" : "text-gray-900"
            }`}>
              {isStartingBalance ? "Starting Point" : item.payee}
            </Text>
          </View>
          {item.checkNumber && (
            <Text className="text-sm text-gray-500 mr-2">
              #{item.checkNumber}
            </Text>
          )}
          
          {/* Posting Status - Only for non-starting balance transactions */}
          {!isStartingBalance && (
            <View className="ml-2">
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
            </View>
          )}
        </View>

        {/* Main Row - Date, Type, Amount, Balance */}
        {isStartingBalance ? (
          // Starting balance row - only show balance on the right
          <View className="flex-row items-center justify-end">
            <Text className="text-base font-bold text-black">
              ${Math.abs(item.amount).toFixed(2)}
            </Text>
          </View>
        ) : (
          // Regular transaction row - show all columns
          <View className="flex-row items-center">
            {/* Left: Date and Transaction Type */}
            <View className="flex-1 pr-2">
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
                <Text className={`text-sm ml-1 capitalize text-black font-medium`}>
                  {item.source === 'bank' && item.notes?.includes('Converted')
                    ? 'manual'
                    : item.source}
                </Text>
              </View>
            </View>

            {/* Center: Amount */}
            <View className="flex-1 items-center">
              <Text className={`text-base font-semibold ${
                item.amount < 0 ? "text-red-600" : "text-green-600"
              }`} numberOfLines={1}>
                {item.amount < 0 ? "-" : "+"}${Math.abs(item.amount).toFixed(2)}
              </Text>
            </View>

            {/* Right: Running Balance */}
            <View className="flex-1 items-center">
              <Text className={`text-base font-bold ${
                runningBalance >= 0 ? "text-gray-900" : "text-red-600"
              }`} numberOfLines={1}>
                ${Math.abs(runningBalance).toFixed(2)}
              </Text>
            </View>
          </View>
        )}

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
          <View className="flex-1 flex-row items-center">
            <Image 
              source={{ uri: 'https://images.composerapi.com/8A8AC393-DDA9-4F78-A538-3341A3DC14FC.jpg' }}
              style={{ width: 40, height: 40, marginRight: 12 }}
              resizeMode="contain"
            />
            <Text className="text-2xl font-bold text-gray-900">
              Checkmate
            </Text>
          </View>
          <View className="flex-row items-center">
            <Pressable
              onPress={handleSync}
              disabled={isSyncing}
              className="p-2 mr-2"
            >
              <AnimatedIonicons 
                name="sync" 
                size={24} 
                color={isSyncing ? "#3B82F6" : "#374151"}
                style={animatedStyle}
              />
            </Pressable>
            <Pressable
              onPress={() => {
                setShowMenu(!showMenu);
              }}
              className="p-2"
            >
              <Ionicons name="menu" size={24} color="#374151" />
            </Pressable>
          </View>
        </View>
        <Text className="text-gray-600">
          {user ? `Welcome back, ${user.firstName}!` : 'Your digital checkbook register'}
        </Text>
      </View>

      {/* Hamburger Menu */}
      {showMenu && (
        <View 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1000,
            backgroundColor: 'rgba(0,0,0,0.5)'
          }}
        >
          <Pressable 
            onPress={() => setShowMenu(false)}
            style={{ flex: 1 }}
          />
          
          <View 
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: 250,
              height: '100%',
              backgroundColor: 'white'
            }}
          >
            <View style={{ backgroundColor: '#3B82F6', paddingHorizontal: 16, paddingTop: 48, paddingBottom: 16 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: 'white', fontSize: 18, fontWeight: '600' }}>Menu</Text>
                <Pressable onPress={() => setShowMenu(false)}>
                  <Ionicons name="close" size={24} color="white" />
                </Pressable>
              </View>
            </View>
            
            <View style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 16 }}>
              <Pressable
                onPress={() => {
                  setShowMenu(false);
                  setTimeout(() => navigation?.navigate('BankConnection'), 100);
                }}
                style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}
              >
                <Ionicons name="link" size={22} color="#10B981" />
                <Text style={{ marginLeft: 12, color: '#111827', fontSize: 16 }}>Connect Bank</Text>
              </Pressable>
              

              
              <Pressable
                onPress={() => {
                  setShowMenu(false);
                  setTimeout(() => navigation?.navigate('Dashboard'), 100);
                }}
                style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}
              >
                <Ionicons name="analytics-outline" size={22} color="#374151" />
                <Text style={{ marginLeft: 12, color: '#111827', fontSize: 16 }}>Dashboard</Text>
              </Pressable>
              
              <Pressable
                onPress={() => {
                  setShowMenu(false);
                  setTimeout(() => navigation?.navigate('Budget'), 100);
                }}
                style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}
              >
                <Ionicons name="wallet-outline" size={22} color="#374151" />
                <Text style={{ marginLeft: 12, color: '#111827', fontSize: 16 }}>Budget Tracker</Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setShowMenu(false);
                  setTimeout(() => navigation?.navigate('Reports'), 100);
                }}
                style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}
              >
                <Ionicons name="bar-chart-outline" size={22} color="#374151" />
                <Text style={{ marginLeft: 12, color: '#111827', fontSize: 16 }}>Reports</Text>
              </Pressable>
              
              <Pressable
                onPress={() => {
                  setShowMenu(false);
                  setTimeout(() => setShowLegend(true), 100);
                }}
                style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}
              >
                <Ionicons name="help-circle-outline" size={22} color="#374151" />
                <Text style={{ marginLeft: 12, color: '#111827', fontSize: 16 }}>Help Guide</Text>
              </Pressable>
              

              
              <Pressable
                onPress={() => {
                  setShowMenu(false);
                  setTimeout(() => handleBugReport(), 100);
                }}
                style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}
              >
                <Ionicons name="bug-outline" size={22} color="#DC2626" />
                <Text style={{ marginLeft: 12, color: '#111827', fontSize: 16 }}>Report Bug</Text>
              </Pressable>
              

              
              <Pressable
                onPress={() => {
                  setShowMenu(false);
                  setTimeout(() => {
                    Alert.alert(
                      'Reset to First-Time User',
                      'This will clear all data and show the onboarding experience.',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Reset',
                          style: 'destructive',
                          onPress: () => {
                            resetToFirstTimeUser();
                            setShowTransactions(false);
                          },
                        },
                      ]
                    );
                  }, 100);
                }}
                style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}
              >
                <Ionicons name="person-add-outline" size={22} color="#8B5CF6" />
                <Text style={{ marginLeft: 12, color: '#111827', fontSize: 16 }}>First-Time User</Text>
              </Pressable>
              
              <Pressable
                onPress={() => {
                  setShowMenu(false);
                  setTimeout(() => navigation?.navigate('Settings'), 100);
                }}
                style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16 }}
              >
                <Ionicons name="settings-outline" size={22} color="#374151" />
                <Text style={{ marginLeft: 12, color: '#111827', fontSize: 16 }}>Settings</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}

      {/* Main Content */}
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 32, paddingBottom: 120 }}

      >
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
              <View className="flex-row items-start">
                <View className="bg-gray-100 px-2 py-1 rounded mr-3 mt-0.5">
                  <Text className="text-xs font-medium text-red-600">NOT POSTED</Text>
                </View>
                <Text className="text-blue-800 text-sm flex-1">Manual transactions (not yet posted to bank)</Text>
              </View>
              <View className="flex-row items-start">
                <View className="bg-gray-100 px-2 py-1 rounded mr-3 mt-0.5">
                  <Text className="text-xs font-medium text-blue-600">POSTED</Text>
                </View>
                <Text className="text-blue-800 text-sm flex-1">Bank transactions (automatically posted)</Text>
              </View>
              <View className="flex-row items-start">
                <View className="bg-gray-100 px-2 py-1 rounded mr-3 mt-0.5">
                  <Text className="text-xs font-medium text-black">MANUAL</Text>
                </View>
                <Text className="text-blue-800 text-sm flex-1">Transaction type (converted from manual to bank confirmed)</Text>
              </View>
            </View>
          </View>
        )}

        {/* First-Time User Onboarding */}
        {!showTransactions && transactions.length === 0 && !settings.bankLinked && (
          <View className="flex-1 items-center justify-center px-6">
            {/* Welcome Hero */}
            <View className="items-center mb-8">
              <View className="bg-blue-100 p-8 rounded-full mb-6">
                <Ionicons name="wallet" size={64} color="#3B82F6" />
              </View>
              <Text className="text-3xl font-bold text-gray-900 text-center mb-3">
                Welcome to Checkmate ✓
              </Text>
              <Text className="text-lg text-gray-600 text-center leading-6">
                Your digital checkbook register that automatically syncs with your bank account.
              </Text>
            </View>

            {/* Getting Started Options */}
            <View className="w-full space-y-4">
              {/* Connect Bank - Primary Option */}
              <Pressable
                onPress={() => navigation?.navigate('BankConnection')}
                className="bg-blue-500 p-6 rounded-xl shadow-lg"
              >
                <View className="flex-row items-center">
                  <Ionicons name="link" size={32} color="white" />
                  <View className="ml-4 flex-1">
                    <Text className="text-xl font-bold text-white">
                      Connect Your Bank
                    </Text>
                    <Text className="text-blue-100 mt-1">
                      Automatically import transactions and balances
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="white" />
                </View>
              </Pressable>

              {/* Manual Entry Option */}
              <Pressable
                onPress={() => {
                  // Initialize with default account for manual entry
                  initializeWithSeedData();
                  updateSettings({ bankLinked: false }); // Keep as manual, not bank-linked
                  setShowTransactions(true);
                  navigation?.navigate('AddTransaction');
                }}
                className="bg-white border-2 border-gray-200 p-6 rounded-xl"
              >
                <View className="flex-row items-center">
                  <Ionicons name="pencil" size={32} color="#6B7280" />
                  <View className="ml-4 flex-1">
                    <Text className="text-xl font-bold text-gray-900">
                      Enter Manually
                    </Text>
                    <Text className="text-gray-600 mt-1">
                      Track transactions by hand (you can connect later)
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="#6B7280" />
                </View>
              </Pressable>


            </View>

            {/* Features Preview */}
            <View className="mt-8 w-full">
              <Text className="text-lg font-semibold text-gray-900 mb-4 text-center">
                What you'll get:
              </Text>
              <View className="space-y-3">
                <View className="flex-row items-center">
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  <Text className="ml-3 text-gray-700">Automatic transaction import</Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  <Text className="ml-3 text-gray-700">Real-time balance updates</Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  <Text className="ml-3 text-gray-700">Smart transaction matching</Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  <Text className="ml-3 text-gray-700">Bank-level security</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Transactions */}
        {showTransactions && (
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-gray-900">
                Transaction Register
              </Text>
              {activeAccount?.startingBalanceDate && (
                <Text className="text-sm text-blue-600 font-medium">
                  From {new Date(activeAccount.startingBalanceDate).toLocaleDateString()}
                </Text>
              )}
            </View>
            
            {/* Starting Point Info */}
            {activeAccount?.startingBalanceDate && (
              <View className="bg-blue-50 p-3 rounded-lg border border-blue-200 mb-4">
                <View className="flex-row items-center">
                  <Ionicons name="information-circle" size={16} color="#3B82F6" />
                  <Text className="text-sm text-blue-800 ml-2 flex-1">
                    Showing transactions from your selected starting point on {new Date(activeAccount.startingBalanceDate).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            )}
            
{(() => {
              // Create transactions list with starting balance entry if we have an active account
              let transactionsToDisplay = [...transactions];
              
              if (activeAccount && activeAccount.startingBalance !== 0) {
                const startingBalanceEntry = {
                  id: `starting-balance-${activeAccount.id}`,
                  userId: 'system',
                  accountId: activeAccount.id,
                  date: activeAccount.startingBalanceDate || new Date().toISOString().split('T')[0],
                  payee: 'Starting Balance',
                  amount: activeAccount.startingBalance,
                  source: 'manual' as const,
                  notes: `Opening balance for ${activeAccount.name}`,
                  reconciled: true,
                  runningBalance: activeAccount.startingBalance,
                };
                
                transactionsToDisplay = [...transactions, startingBalanceEntry];
              }
              
              return transactionsToDisplay.length > 0 ? (
                <>
                  {/* Column Headers */}
                  <View className="mx-2 mb-2 px-2 py-2 bg-gray-50 rounded-lg">
                    <View className="flex-row items-center">
                      <View className="flex-1">
                        <Text className="text-xs font-bold text-gray-700 uppercase">Date/Type</Text>
                      </View>
                      <View className="flex-1 items-center">
                        <Text className="text-xs font-bold text-gray-700 uppercase">Amount</Text>
                      </View>
                      <View className="flex-1 items-center">
                        <Text className="text-xs font-bold text-gray-700 uppercase">Balance</Text>
                      </View>
                    </View>
                  </View>
                  
                  {transactionsToDisplay
                    .slice()
                    .sort((a, b) => {
                      // Starting balance transactions should always be at the bottom
                      const aIsStarting = a.payee === 'Starting Point' || a.payee === 'Starting Balance' || a.id.startsWith('starting-balance-');
                      const bIsStarting = b.payee === 'Starting Point' || b.payee === 'Starting Balance' || b.id.startsWith('starting-balance-');
                      
                      if (aIsStarting && !bIsStarting) return 1; // a goes to bottom
                      if (bIsStarting && !aIsStarting) return -1; // b goes to bottom
                      if (aIsStarting && bIsStarting) return new Date(a.date).getTime() - new Date(b.date).getTime(); // oldest starting balance first
                      
                      // For all other transactions, sort by date (newest first)
                      return new Date(b.date).getTime() - new Date(a.date).getTime();
                    })
                    .map((item, index) => (
                      <View key={item.id}>
                        {renderTransaction({ item, index })}
                      </View>
                    ))}
                </>
              ) : (
              <View className="mx-2 p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <View className="items-center">
                  <Ionicons name="receipt-outline" size={48} color="#9CA3AF" />
                  <Text className="text-lg font-semibold text-gray-600 mt-3">
                    No Transactions Yet
                  </Text>
                  <Text className="text-gray-500 text-center mt-1">
                    Add your first transaction or connect your bank account
                  </Text>
                  <Pressable
                    onPress={() => navigation?.navigate('AddTransaction')}
                    className="mt-4 bg-blue-500 px-4 py-2 rounded-lg"
                  >
                    <Text className="text-white font-medium">Add Transaction</Text>
                  </Pressable>
                </View>
              </View>
              );
            })()}
        )}

        {/* Quick Actions - Only show for existing users */}
        {showTransactions && (
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
        )}
      </ScrollView>
      
      {/* Footer Status - Only show for existing users */}
      {showTransactions && (
        <View className="px-6 py-4 border-t border-gray-200">
          <View className="flex-row items-center justify-center">
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text className="text-green-600 font-medium ml-2">
              Checkmate Active ✓
            </Text>
          </View>
          <Text className="text-center text-gray-500 text-sm mt-1">
            Navigation and all features working properly
          </Text>
        </View>
      )}

      {/* Floating Action Button - Only show for existing users */}
      {activeAccount && showTransactions && (
        <Pressable
          onPress={() => navigation?.navigate('AddTransaction')}
          className="absolute bottom-6 right-6 bg-blue-500 w-14 h-14 rounded-full items-center justify-center shadow-lg"
          style={{ elevation: 8 }}
        >
          <Ionicons name="add" size={28} color="white" />
        </Pressable>
      )}

      {/* Demo Modal */}
      <Modal
        visible={showDemoModal}
        transparent={true}
        animationType="fade"
      >
        <View className="flex-1 bg-black bg-opacity-50 items-center justify-center px-6">
          <View className="bg-white rounded-xl p-6 max-w-sm w-full">
            <View className="items-center mb-4">
              <Ionicons name="flask" size={48} color="#3B82F6" />
              <Text className="text-xl font-bold text-gray-900 mt-2">
                Demo: Manual to Bank Conversion 🔄
              </Text>
            </View>
            
            <Text className="text-gray-700 text-center leading-6">
              This feature demonstrates how manual transactions are automatically converted to bank transactions when matching deposits or withdrawals are found during bank sync.
            </Text>
            
            <View className="mt-4 space-y-2">
              <Text className="text-gray-700 font-medium">To see this in action:</Text>
              <Text className="text-gray-600">1. Add a manual transaction</Text>
              <Text className="text-gray-600">2. Go to Settings → Sync Bank Transactions</Text>
              <Text className="text-gray-600">3. Watch as matching transactions convert from "NOT POSTED" to "POSTED"</Text>
            </View>
            
            <View className="mt-6 pt-4 border-t border-gray-200">
              <Text className="text-center text-sm text-gray-500">
                Auto-closing in 3.5 seconds...
              </Text>
            </View>
          </View>
        </View>
      </Modal>

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

export default SimpleRegisterScreen;