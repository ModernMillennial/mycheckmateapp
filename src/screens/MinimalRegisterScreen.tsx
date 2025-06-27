import React, { useEffect, useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTransactionStore } from '../state/transactionStore';
import SimpleInitialBankSyncScreen from './SimpleInitialBankSyncScreen';

interface Props {
  navigation: any;
}

const MinimalRegisterScreen: React.FC<Props> = ({ navigation }) => {
  console.log('MinimalRegisterScreen rendering, navigation available:', !!navigation);
  
  const [showFirstTimeSetup, setShowFirstTimeSetup] = useState(false);
  
  const { 
    accounts, 
    settings, 
    getActiveAccount, 
    getActiveTransactions,
    initializeWithSeedData 
  } = useTransactionStore();
  console.log('Store accessed successfully, accounts:', accounts.length);
  
  // Test the useEffect that initializes seed data
  useEffect(() => {
    console.log('useEffect: Checking if should initialize seed data, bankLinked:', settings.bankLinked);
    if (settings.bankLinked) {
      console.log('useEffect: Calling initializeWithSeedData');
      initializeWithSeedData();
    }
  }, [initializeWithSeedData, settings.bankLinked]);
  
  const activeAccount = getActiveAccount();
  const transactions = getActiveTransactions();
  console.log('Active account:', activeAccount?.name, 'Transactions:', transactions.length);
  
  // Test the first-time setup logic
  useEffect(() => {
    console.log('useEffect: First-time setup check:', { 
      hasTransactions: transactions.length > 0, 
      isBankLinked: settings.bankLinked 
    });
    
    const hasTransactions = transactions.length > 0;
    const isBankLinked = settings.bankLinked;
    
    if (!hasTransactions && !isBankLinked) {
      console.log('useEffect: Should show first-time setup');
      setTimeout(() => {
        console.log('useEffect: Setting showFirstTimeSetup to true');
        setShowFirstTimeSetup(true);
      }, 500);
    }
  }, [transactions.length, settings.bankLinked]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center">
        <Text className="text-xl font-bold">Minimal Register Screen</Text>
        <Text className="text-gray-600 mt-4">Navigation: {navigation ? 'Available' : 'Not Available'}</Text>
        <Text className="text-gray-600 mt-2">Active Account: {activeAccount?.name || 'None'}</Text>
        <Text className="text-gray-600 mt-2">Transactions: {transactions.length}</Text>
        <Text className="text-gray-600 mt-2">Show First Time Setup: {showFirstTimeSetup ? 'Yes' : 'No'}</Text>
      </View>
      
      {/* Test SimpleInitialBankSyncScreen */}
      <SimpleInitialBankSyncScreen
        visible={showFirstTimeSetup}
        onComplete={() => {
          setShowFirstTimeSetup(false);
          Alert.alert('Simple Bank Sync Complete!');
        }}
        onCancel={() => setShowFirstTimeSetup(false)}
      />
    </SafeAreaView>
  );
};

export default MinimalRegisterScreen;