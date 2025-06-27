import React, { useMemo, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  TextInput,
  RefreshControl,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTransactionStore } from '../state/transactionStore';
import { Transaction, FilterType } from '../types';
import { cn } from '../utils/cn';

interface Props {
  navigation: any;
}

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const {
    transactions,
    searchQuery,
    filterType,
    setSearchQuery,
    setFilterType,
    toggleReconciled,
    initializeWithSeedData,
  } = useTransactionStore();

  useEffect(() => {
    initializeWithSeedData();
  }, [initializeWithSeedData]);

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
    return filtered.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [transactions, searchQuery, filterType]);

  const totalBalance = transactions.length > 0 
    ? transactions[transactions.length - 1]?.runningBalance || 0 
    : 0;

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <Pressable
      className="bg-white mx-4 mb-1 px-4 py-3 rounded-lg shadow-sm border border-gray-100"
      onPress={() => navigation.navigate('EditTransaction', { transaction: item })}
    >
      {/* Header Row - Payee and Check Number */}
      <View className="flex-row items-center mb-2">
        <Text className="text-base font-semibold text-gray-900 flex-1">
          {item.payee}
        </Text>
        {item.checkNumber && (
          <Text className="text-sm text-gray-500 mr-2">
            #{item.checkNumber}
          </Text>
        )}
        <Pressable
          onPress={() => toggleReconciled(item.id)}
          className="ml-2"
        >
          <Ionicons
            name={item.reconciled ? 'checkmark-circle' : 'ellipse-outline'}
            size={20}
            color={item.reconciled ? '#10B981' : (item.source === 'bank' ? '#3B82F6' : '#9CA3AF')}
          />
        </Pressable>
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
              color={item.reconciled ? '#10B981' : '#9CA3AF'}
            />
            <Text className={cn(
              "text-xs ml-1 capitalize",
              item.reconciled ? 'text-green-600' : 'text-gray-500'
            )}>
              {item.source}
            </Text>
            {!item.reconciled && item.source === 'manual' && (
              <Text className="text-xs text-orange-500 ml-1">• Pending</Text>
            )}
          </View>
        </View>

        {/* Middle-Left: Debit Amount */}
        <View className="w-20 items-end">
          {item.amount < 0 && (
            <Text className="text-base font-semibold text-red-600">
              ${Math.abs(item.amount).toFixed(2)}
            </Text>
          )}
        </View>

        {/* Middle-Right: Credit Amount */}
        <View className="w-20 items-end">
          {item.amount >= 0 && (
            <Text className="text-base font-semibold text-green-600">
              ${item.amount.toFixed(2)}
            </Text>
          )}
        </View>

        {/* Right: Balance */}
        <View className="w-24 items-end">
          <Text className="text-base font-semibold text-gray-900">
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
          <Pressable
            onPress={() => navigation.navigate('Settings')}
            className="p-2"
          >
            <Ionicons name="settings-outline" size={24} color="#374151" />
          </Pressable>
        </View>

        {/* Balance Display */}
        <View className="bg-blue-50 p-4 rounded-lg mb-4">
          <Text className="text-sm text-blue-600 font-medium">Current Balance</Text>
          <Text className="text-3xl font-bold text-blue-900">
            ${totalBalance.toFixed(2)}
          </Text>
        </View>

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

      {/* Column Headers */}
      <View className="bg-gray-50 mx-4 px-4 py-2 rounded-lg mb-2">
        <View className="flex-row items-center">
          <View className="flex-1">
            <Text className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Date & Type
            </Text>
          </View>
          <View className="w-20 items-end">
            <Text className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Debit
            </Text>
          </View>
          <View className="w-20 items-end">
            <Text className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Credit
            </Text>
          </View>
          <View className="w-24 items-end">
            <Text className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Balance
            </Text>
          </View>
        </View>
      </View>

      {/* Transaction List */}
      <FlatList
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
        onPress={() => navigation.navigate('AddTransaction')}
        className="absolute bottom-6 right-6 bg-blue-500 w-14 h-14 rounded-full items-center justify-center shadow-lg"
        style={{ elevation: 8 }}
      >
        <Ionicons name="add" size={28} color="white" />
      </Pressable>
    </SafeAreaView>
  );
};

export default RegisterScreen;