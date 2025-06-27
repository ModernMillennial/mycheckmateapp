import React, { useMemo, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  TextInput,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTransactionStore } from '../state/transactionStore';
import { Transaction, FilterType } from '../types';
import { cn } from '../utils/cn';
import ReconciliationLegend from '../components/ReconciliationLegend';
import InitialBankSyncScreen from './InitialBankSyncScreen';

interface Props {
  navigation: any;
}

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [showLegend, setShowLegend] = React.useState(false);
  const [showFirstTimeSetup, setShowFirstTimeSetup] = React.useState(false);
  const {
    accounts,
    searchQuery,
    filterType,
    settings,
    setSearchQuery,
    setFilterType,
    toggleReconciled,
    initializeWithSeedData,
    getActiveAccount,
    getActiveTransactions,
    switchAccount,
    addTransaction,
    syncBankTransactions,
    clearAndReinitialize,
    updateSettings,
  } = useTransactionStore();

  useEffect(() => {
    // Only initialize seed data if bank is already linked (returning user)
    if (settings.bankLinked) {
      initializeWithSeedData();
    }
  }, [initializeWithSeedData, settings.bankLinked]);

  const activeAccount = getActiveAccount();
  const transactions = getActiveTransactions();

  // Check for first-time user setup
  useEffect(() => {
    console.log('First-time setup check:', { 
      hasTransactions: transactions.length > 0, 
      isBankLinked: settings.bankLinked 
    });
    
    const hasTransactions = transactions.length > 0;
    const isBankLinked = settings.bankLinked;
    
    if (!hasTransactions && !isBankLinked) {
      // Show first-time setup after a brief delay
      setTimeout(() => {
        console.log('Showing first-time setup');
        setShowFirstTimeSetup(true);
      }, 500);
    }
  }, [transactions.length, settings.bankLinked]);

  // Debug logging
  console.log('Active Account:', activeAccount?.name);
  console.log('Transactions for account:', transactions.length);

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

  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.payee.toLowerCase().includes(query) ||
          t.notes?.toLowerCase().includes(query) ||
          t.amount.toString().includes(query)
      );
    }

    // Apply type filter
    switch (filterType) {
      case 'manual':
        filtered = filtered.filter((t) => t.source === 'manual');
        break;
      case 'bank':
        filtered = filtered.filter((t) => t.source === 'bank');
        break;
      case 'reconciled':
        filtered = filtered.filter((t) => t.reconciled);
        break;
      case 'unreconciled':
        filtered = filtered.filter((t) => !t.reconciled);
        break;
    }

    // Sort by date (newest first) 
    const sortedTransactions = filtered.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Add starting balance entry if we have an active account and no search/filter applied
    if (activeAccount && !searchQuery.trim() && filterType === 'all') {
      const startingBalanceEntry: Transaction = {
        id: `starting-balance-${activeAccount.id}`,
        userId: 'system',
        accountId: activeAccount.id,
        date: activeAccount.startingBalanceDate,
        payee: 'Starting Balance',
        amount: activeAccount.startingBalance,
        source: 'manual',
        notes: `Opening balance for ${activeAccount.name}`,
        reconciled: true,
        runningBalance: activeAccount.startingBalance,
      };

      // Insert starting balance at the correct chronological position
      const allWithStarting = [...sortedTransactions, startingBalanceEntry];
      return allWithStarting.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    }

    return sortedTransactions;
  }, [transactions, searchQuery, filterType, activeAccount]);

  const totalBalance = activeAccount?.currentBalance || 0;

  const isStartingBalance = (transaction: Transaction) => {
    return transaction.id.startsWith('starting-balance-');
  };

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const isStarting = isStartingBalance(item);
    
    return (
      <Pressable
        className={cn(
          "mx-4 mb-1 px-4 py-3 rounded-lg shadow-sm border",
          isStarting 
            ? "bg-blue-50 border-blue-200" 
            : "bg-white border-gray-100"
        )}
        onPress={() => {
          if (!isStarting) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            if (navigation) {
              navigation.navigate('EditTransaction', { transaction: item });
            } else {
              console.warn('Navigation not available yet');
            }
          }
        }}
        disabled={isStarting}
        style={({ pressed }) => ({
          opacity: pressed ? 0.7 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        })}
      >
        {/* Header Row - Payee and Check Number */}
        <View className="flex-row items-center mb-2">
          <View className="flex-row items-center flex-1">
            {isStarting && (
              <Ionicons 
                name="flag-outline" 
                size={16} 
                color="#3B82F6" 
                style={{ marginRight: 8 }}
              />
            )}
            <Text className={cn(
              "text-base font-semibold flex-1",
              isStarting ? "text-blue-900" : "text-gray-900"
            )}>
              {item.payee}
            </Text>
          </View>
          {item.checkNumber && (
            <Text className="text-sm text-gray-500 mr-2">
              #{item.checkNumber}
            </Text>
          )}
          <View className="flex-row items-center">
            {!isStarting && (
              <>
                {/* Reconciliation Status Icons */}
                <View className="flex-row items-center">
                  {/* Manual Transactions - Show gray circles */}
                  {item.source === 'manual' && (
                    <View className="flex-row items-center">
                      <View className="p-1">
                        <Ionicons
                          name="ellipse-outline"
                          size={20}
                          color="#9CA3AF"
                        />
                      </View>
                      <View className="p-1 -ml-2">
                        <Ionicons
                          name="ellipse-outline"
                          size={20}
                          color="#9CA3AF"
                        />
                      </View>
                    </View>
                  )}
                  
                  {/* Regular Bank Transactions - Show single green check */}
                  {item.source === 'bank' && !item.notes?.includes('Converted from manual entry') && (
                    <Pressable
                      onPress={() => toggleReconciled(item.id)}
                      className="p-1"
                    >
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color="#10B981"
                      />
                    </Pressable>
                  )}
                  
                  {/* Converted Transactions - Show green check + yellow check */}
                  {item.source === 'bank' && item.notes?.includes('Converted from manual entry') && (
                    <View className="flex-row items-center">
                      <Pressable
                        onPress={() => toggleReconciled(item.id)}
                        className="p-1"
                      >
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color="#10B981"
                        />
                      </Pressable>
                      <View className="p-1 -ml-2">
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color="#F59E0B"
                        />
                      </View>
                    </View>
                  )}
                </View>
                
                {item.source === 'bank' && (
                  <Ionicons
                    name="lock-closed"
                    size={12}
                    color="#9CA3AF"
                    style={{ marginLeft: 4 }}
                  />
                )}
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color="#9CA3AF"
                  style={{ marginLeft: 4 }}
                />
              </>
            )}
          </View>
        </View>

        {/* Register Row - Date, Type, Debit, Credit, Balance */}
        <View className="flex-row items-center">
          {/* Left: Date & Type */}
          <View className="flex-1">
            <Text className="text-sm text-gray-600 mb-1">
              {new Date(item.date).toLocaleDateString('en-US', { 
                month: 'short', 
                day: '2-digit' 
              })}
            </Text>
            <View className="flex-row items-center">
              <Ionicons
                name={item.source === 'manual' ? 'receipt-outline' : 'card-outline'}
                size={14}
                color={
                  item.source === 'manual' 
                    ? '#9CA3AF' 
                    : item.notes?.includes('Converted from manual entry')
                      ? '#F59E0B'
                      : '#10B981'
                }
              />
              <Text className={cn(
                "text-xs ml-1 capitalize",
                item.source === 'manual' 
                  ? 'text-gray-500' 
                  : item.notes?.includes('Converted from manual entry')
                    ? 'text-yellow-600'
                    : 'text-green-600'
              )}>
                {item.source === 'bank' && item.notes?.includes('Converted from manual entry')
                  ? 'converted'
                  : item.source}
              </Text>
              {item.source === 'manual' && (
                <Text className="text-xs text-gray-500 ml-1">• Pending</Text>
              )}
            </View>
          </View>

          {/* Middle-Left: Debit Amount */}
          <View className="w-24 items-end px-1">
            {item.amount < 0 && (
              <Text className="text-base font-semibold text-red-600" numberOfLines={1}>
                ${Math.abs(item.amount).toFixed(2)}
              </Text>
            )}
          </View>

          {/* Middle-Right: Credit Amount */}
          <View className="w-24 items-end px-1">
            {item.amount >= 0 && (
              <Text className={cn(
                "text-base font-semibold",
                isStarting ? "text-blue-600" : "text-green-600"
              )} numberOfLines={1}>
                ${item.amount.toFixed(2)}
              </Text>
            )}
          </View>

          {/* Right: Balance */}
          <View className="w-28 items-end px-1">
            <Text className={cn(
              "text-base font-semibold",
              isStarting ? "text-blue-900" : "text-gray-900"
            )} numberOfLines={1}>
              ${item.runningBalance.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Notes Row (if present) */}
        {item.notes && (
          <Text className="text-sm text-gray-600 mt-2" numberOfLines={2}>
            {item.notes}
          </Text>
        )}
      </Pressable>
    );
  };

  const FilterButton = ({ filter, title }: { filter: FilterType; title: string }) => (
    <Pressable
      onPress={() => setFilterType(filter)}
      className={cn(
        "px-4 py-2 rounded-full mr-2",
        filterType === filter
          ? "bg-blue-500"
          : "bg-gray-100"
      )}
    >
      <Text
        className={cn(
          "text-sm font-medium",
          filterType === filter ? "text-white" : "text-gray-700"
        )}
      >
        {title}
      </Text>
    </Pressable>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-gray-200">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-2xl font-bold text-gray-900">
            My Digital Register
          </Text>
          <View className="flex-row">
            <Pressable
              onPress={() => {
                const activeAccount = getActiveAccount();
                if (activeAccount) {
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
                    'Demo Started',
                    'Added manual transaction with two gray circles. In 3 seconds, it will convert to show green + yellow checks when "bank sync" finds the matching transaction.',
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
                        'Conversion Complete!',
                        'The manual "Demo Coffee Shop" entry has been converted to a bank transaction. Notice it now shows:\n\n✅ Green check = Bank confirmed\n🟡 Yellow check = Originally manual\n\nYou can tap the green check to toggle reconciliation.',
                        [{ text: 'Got it!' }]
                      );
                    }, 500);
                  }, 3000);
                }
              }}
              className="p-2 mr-1"
            >
              <Ionicons name="flask-outline" size={24} color="#3B82F6" />
            </Pressable>
            <Pressable
              onPress={handleDemoReset}
              className="p-2 mr-1"
            >
              <Ionicons name="refresh-outline" size={24} color="#EF4444" />
            </Pressable>
            <Pressable
              onPress={() => setShowLegend(!showLegend)}
              className="p-2 mr-1"
            >
              <Ionicons name="help-circle-outline" size={24} color="#374151" />
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate('Reports')}
              className="p-2 mr-1"
            >
              <Ionicons name="analytics-outline" size={24} color="#374151" />
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate('Settings')}
              className="p-2"
            >
              <Ionicons name="settings-outline" size={24} color="#374151" />
            </Pressable>
          </View>
        </View>

        {/* Account Selector */}
        <View className="mb-4">
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={accounts.filter(a => a.isActive)}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => switchAccount(item.id)}
                className={cn(
                  "mr-3 px-4 py-3 rounded-lg border-2 min-w-[140px]",
                  activeAccount?.id === item.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 bg-white"
                )}
                style={{ borderColor: activeAccount?.id === item.id ? item.color : '#E5E7EB' }}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className={cn(
                      "text-sm font-semibold",
                      activeAccount?.id === item.id ? "text-gray-900" : "text-gray-600"
                    )}>
                      {item.name}
                    </Text>
                    <Text className="text-xs text-gray-500">
                      {item.bankName} •••{item.accountNumber}
                    </Text>
                  </View>
                  <View
                    className="w-3 h-3 rounded-full ml-2"
                    style={{ backgroundColor: item.color }}
                  />
                </View>
                <Text className={cn(
                  "text-lg font-bold mt-1",
                  activeAccount?.id === item.id ? "text-gray-900" : "text-gray-700"
                )}>
                  ${item.currentBalance.toFixed(2)}
                </Text>
              </Pressable>
            )}
            keyExtractor={(item) => item.id}
          />
        </View>

        {/* Balance Display */}
        {activeAccount && (
          <View className="p-4 rounded-lg mb-4" style={{ backgroundColor: activeAccount.color + '20' }}>
            <Text className="text-sm font-medium" style={{ color: activeAccount.color }}>
              {activeAccount.name} Balance
            </Text>
            <Text className="text-3xl font-bold" style={{ color: activeAccount.color }}>
              ${totalBalance.toFixed(2)}
            </Text>
          </View>
        )}

        {/* Search Bar */}
        <View className="flex-row items-center bg-gray-100 rounded-lg px-4 py-3 mb-4">
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-3 text-base text-gray-900"
            placeholder="Search transactions..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </Pressable>
          )}
        </View>

        {/* Filter Buttons */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[
            { filter: 'all' as FilterType, title: 'All' },
            { filter: 'manual' as FilterType, title: 'Manual' },
            { filter: 'bank' as FilterType, title: 'Bank' },
            { filter: 'reconciled' as FilterType, title: 'Reconciled' },
            { filter: 'unreconciled' as FilterType, title: 'Pending' },
          ]}
          renderItem={({ item }) => (
            <FilterButton filter={item.filter} title={item.title} />
          )}
          keyExtractor={(item) => item.filter}
        />
      </View>

      {/* Demo Instructions */}
      <View className="mx-4 mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <View className="flex-row items-center">
          <Ionicons name="flask-outline" size={16} color="#3B82F6" />
          <Text className="text-sm font-medium text-blue-800 ml-2">Demo Mode</Text>
        </View>
        <Text className="text-xs text-blue-700 mt-1">
          Tap the flask icon (🧪) in the header to see a live demo of manual-to-bank conversion with green + yellow checks!
        </Text>
      </View>

      {/* Reconciliation Legend */}
      {showLegend && <ReconciliationLegend />}

      {/* Column Headers */}
      <View className="bg-gray-50 mx-4 px-4 py-2 rounded-lg mb-2">
        <View className="flex-row items-center">
          <View className="flex-1">
            <Text className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Date & Type
            </Text>
          </View>
          <View className="w-24 items-end px-1">
            <Text className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Debit
            </Text>
          </View>
          <View className="w-24 items-end px-1">
            <Text className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Credit
            </Text>
          </View>
          <View className="w-28 items-end px-1">
            <Text className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Balance
            </Text>
          </View>
        </View>
      </View>

      {/* Transaction List */}
      <FlatList
        key={activeAccount?.id} // Force re-render when account changes
        data={filteredTransactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        className="flex-1"
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 100 }}
        ListEmptyComponent={
          <View className="items-center justify-center py-16">
            <Ionicons name="receipt-outline" size={64} color="#D1D5DB" />
            <Text className="text-gray-500 text-lg mt-4">No transactions found</Text>
            <Text className="text-gray-400 text-sm mt-2 text-center px-8">
              Add your first transaction or sync with your bank account
            </Text>
            {transactions.length > 0 && (
              <Text className="text-gray-400 text-xs mt-4 text-center px-8">
                💡 Tip: Tap any transaction to edit its details
              </Text>
            )}
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() => {
              // Refresh functionality can be added here
            }}
          />
        }
      />

      {/* Floating Action Button */}
      <Pressable
        onPress={() => {
          if (navigation) {
            navigation.navigate('AddTransaction');
          } else {
            console.warn('Navigation not available yet');
          }
        }}
        className="absolute bottom-6 right-6 bg-blue-500 w-14 h-14 rounded-full items-center justify-center shadow-lg"
        style={{ elevation: 8 }}
      >
        <Ionicons name="add" size={28} color="white" />
      </Pressable>

      {/* First-time Bank Setup Modal */}
      <InitialBankSyncScreen
        visible={showFirstTimeSetup}
        onComplete={() => {
          setShowFirstTimeSetup(false);
          // Use setTimeout to ensure state is updated before showing alert
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

export default RegisterScreen;