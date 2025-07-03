import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePlaidStore, usePlaidItems, usePlaidLoading, usePlaidError, useTotalBalance } from '../state/plaidStore';
import PlaidLink from '../components/PlaidLink';
import { PlaidAccount } from '../api/plaid';

const AccountCard: React.FC<{
  account: PlaidAccount;
  institutionName: string;
  onPress: () => void;
}> = ({ account, institutionName, onPress }) => {
  const formatCurrency = (amount: number | null) => {
    if (amount === null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getAccountTypeIcon = (type: string, subtype: string) => {
    if (type === 'depository') {
      if (subtype === 'checking') return 'card-outline';
      if (subtype === 'savings') return 'wallet-outline';
      return 'business-outline';
    }
    if (type === 'credit') return 'card';
    if (type === 'investment') return 'trending-up-outline';
    return 'ellipse-outline';
  };

  const isNegativeBalance = account.balances.current && account.balances.current < 0;

  return (
    <Pressable
      onPress={onPress}
      className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100 active:bg-gray-50"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <View className="flex-row items-center mb-2">
            <Ionicons
              name={getAccountTypeIcon(account.type, account.subtype)}
              size={20}
              color="#3B82F6"
              style={{ marginRight: 8 }}
            />
            <Text className="font-semibold text-gray-900 text-lg">
              {account.name}
            </Text>
          </View>
          
          <Text className="text-gray-600 text-sm mb-1">
            {institutionName} • ••••{account.mask}
          </Text>
          
          <Text className="text-gray-500 text-xs capitalize">
            {account.type} • {account.subtype}
          </Text>
        </View>

        <View className="items-end">
          <Text className={`text-lg font-bold ${isNegativeBalance ? 'text-red-600' : 'text-gray-900'}`}>
            {formatCurrency(account.balances.current)}
          </Text>
          {account.balances.available !== null && account.balances.available !== account.balances.current && (
            <Text className="text-gray-500 text-sm">
              Available: {formatCurrency(account.balances.available)}
            </Text>
          )}
          {account.balances.limit && (
            <Text className="text-gray-400 text-xs">
              Limit: {formatCurrency(account.balances.limit)}
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
};

const ItemCard: React.FC<{
  item: any;
  onRefresh: () => void;
  onUnlink: () => void;
  onAccountPress: (account: PlaidAccount) => void;
}> = ({ item, onRefresh, onUnlink, onAccountPress }) => {
  return (
    <View className="bg-gray-50 rounded-xl p-4 mb-4">
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-1">
          <Text className="font-bold text-gray-900 text-lg">
            {item.institutionName}
          </Text>
          <Text className="text-gray-500 text-sm">
            Connected {new Date(item.lastUpdate).toLocaleDateString()}
          </Text>
        </View>

        <View className="flex-row">
          <Pressable
            onPress={onRefresh}
            className="bg-blue-500 px-3 py-2 rounded-lg mr-2 active:bg-blue-600"
          >
            <Ionicons name="refresh-outline" size={16} color="white" />
          </Pressable>
          
          <Pressable
            onPress={onUnlink}
            className="bg-red-500 px-3 py-2 rounded-lg active:bg-red-600"
          >
            <Ionicons name="unlink-outline" size={16} color="white" />
          </Pressable>
        </View>
      </View>

      {item.accounts.map((account: PlaidAccount) => (
        <AccountCard
          key={account.account_id}
          account={account}
          institutionName={item.institutionName}
          onPress={() => onAccountPress(account)}
        />
      ))}
    </View>
  );
};

const AccountsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const items = usePlaidItems();
  const isLoading = usePlaidLoading();
  const error = usePlaidError();
  const totalBalance = useTotalBalance();
  
  const {
    refreshAccounts,
    unlinkAccount,
    setSelectedAccount,
    setSelectedItem,
    clearError,
  } = usePlaidStore();

  const [refreshing, setRefreshing] = React.useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      clearError();
      // Refresh all items
      await Promise.all(
        items.map(item => refreshAccounts(item.id))
      );
    } catch (error) {
      console.error('Failed to refresh accounts:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleUnlinkAccount = (itemId: string, institutionName: string) => {
    Alert.alert(
      'Unlink Account',
      `Are you sure you want to unlink ${institutionName}? This will remove all associated accounts and transaction data.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unlink',
          style: 'destructive',
          onPress: async () => {
            try {
              await unlinkAccount(itemId);
            } catch (error) {
              Alert.alert('Error', 'Failed to unlink account');
            }
          },
        },
      ]
    );
  };

  const handleAccountPress = (account: PlaidAccount) => {
    const item = items.find(item => 
      item.accounts.some(acc => acc.account_id === account.account_id)
    );
    
    if (item) {
      setSelectedItem(item);
      setSelectedAccount(account);
      navigation.navigate('Transactions');
    }
  };

  const handleLinkSuccess = () => {
    // Account linked successfully, refresh the list
    handleRefresh();
  };

  if (isLoading && items.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="mt-2 text-gray-600">Loading accounts...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-gray-900 mb-2">
            Your Accounts
          </Text>
          
          {items.length > 0 && (
            <View className="bg-white rounded-xl p-4 shadow-sm">
              <Text className="text-gray-600 text-sm mb-1">Total Balance</Text>
              <Text className="text-2xl font-bold text-gray-900">
                {formatCurrency(totalBalance)}
              </Text>
              <Text className="text-gray-500 text-sm">
                Across {items.reduce((total, item) => total + item.accounts.length, 0)} accounts
              </Text>
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
            <Pressable
              onPress={clearError}
              className="mt-2 self-start"
            >
              <Text className="text-red-600 font-medium">Dismiss</Text>
            </Pressable>
          </View>
        )}

        {/* Connected Accounts */}
        {items.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            onRefresh={() => refreshAccounts(item.id)}
            onUnlink={() => handleUnlinkAccount(item.id, item.institutionName)}
            onAccountPress={handleAccountPress}
          />
        ))}

        {/* Add Account Button */}
        <View className="mb-4">
          <PlaidLink
            userId="user123" // Replace with actual user ID
            onSuccess={handleLinkSuccess}
            buttonText={items.length === 0 ? 'Connect Your First Account' : 'Connect Another Account'}
            autoLink={true}
          />
        </View>

        {/* Empty State */}
        {items.length === 0 && !isLoading && (
          <View className="items-center py-12">
            <Ionicons name="wallet-outline" size={64} color="#9CA3AF" />
            <Text className="text-xl font-semibold text-gray-700 mt-4 mb-2">
              No Accounts Connected
            </Text>
            <Text className="text-gray-500 text-center mb-6 px-8">
              Connect your bank accounts to view balances and transactions
            </Text>
          </View>
        )}

        {/* Instructions */}
        <View className="bg-blue-50 rounded-xl p-4 mt-4">
          <View className="flex-row items-center mb-2">
            <Ionicons name="information-circle-outline" size={20} color="#3B82F6" />
            <Text className="ml-2 font-medium text-blue-900">
              How it works
            </Text>
          </View>
          <Text className="text-blue-800 text-sm leading-relaxed">
            Your account credentials are encrypted and securely stored. Plaid uses bank-level security to protect your information and never stores your login credentials.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AccountsScreen;