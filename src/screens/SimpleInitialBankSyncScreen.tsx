import React, { useState } from 'react';
import { View, Text, Modal, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTransactionStore } from '../state/transactionStore';

interface Props {
  visible: boolean;
  onComplete: () => void;
  onCancel: () => void;
}

const SimpleInitialBankSyncScreen: React.FC<Props> = ({ visible, onComplete, onCancel }) => {
  // Add all the state variables from the original component
  const [step, setStep] = useState('connect');
  const [selectedBank, setSelectedBank] = useState('');
  const [fetchedTransactions, setFetchedTransactions] = useState([]);
  const [selectedStartingTransaction, setSelectedStartingTransaction] = useState('');
  const [currentBalance, setCurrentBalance] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  
  // Test all store functions from original component
  const { addAccount, updateAccount, addTransaction, switchAccount, updateSettings } = useTransactionStore();
  console.log('SimpleInitialBankSyncScreen: All store functions accessed successfully');

  // Add the problematic simulateImport function
  const simulateImport = async () => {
    setIsImporting(true);
    
    // Find the selected starting transaction
    const startingTransaction = fetchedTransactions.find(t => t.id === selectedStartingTransaction);
    if (!startingTransaction) return;
    
    // Create new account
    const bankName = 'Demo Bank';
    
    const newAccount = {
      name: `${bankName} Checking`,
      type: 'checking' as const,
      balance: currentBalance,
      startingBalance: startingTransaction.balance || 1000,
      startingBalanceDate: new Date().toISOString().split('T')[0],
      isConnected: true,
      lastSyncDate: new Date(),
      bankName: bankName,
      accountNumber: '****1234',
      isActive: true,
      currentBalance: currentBalance,
      color: '#3B82F6',
    };
    
    addAccount(newAccount);
    
    // Simple approach: add transactions to the default account for now
    setTimeout(() => {
      const demoAccountId = 'checking-1';
      switchAccount(demoAccountId);
      
      // Mark bank as linked
      updateSettings({ bankLinked: true });
      
      setTimeout(() => {
        setIsImporting(false);
        console.log('Import simulation complete');
      }, 1000);
    }, 150);
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-2xl font-bold text-gray-900 mb-4">
            Simple Bank Setup Test
          </Text>
          <Text className="text-gray-600 text-center mb-8">
            This is a simplified version to test if the component works without navigation errors.
          </Text>
          
          <Pressable
            onPress={() => {
              console.log('Testing simulateImport function...');
              simulateImport();
              onComplete();
            }}
            className="bg-blue-500 px-8 py-4 rounded-lg mb-4"
          >
            <Text className="text-white font-semibold">Test Import & Complete</Text>
          </Pressable>
          
          <Pressable
            onPress={onCancel}
            className="px-8 py-4"
          >
            <Text className="text-gray-600">Cancel</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default SimpleInitialBankSyncScreen;