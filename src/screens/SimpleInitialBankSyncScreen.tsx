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
  const { updateAccountInfo, addTransaction, updateSettings, initializeWithSeedData, getActiveAccount } = useTransactionStore();
  console.log('SimpleInitialBankSyncScreen: All store functions accessed successfully');

  // Enhanced simulateImport function with proper demo flow
  const simulateImport = async () => {
    setIsImporting(true);
    
    // Simulate the import process with realistic timing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Create new account with demo data
    const bankName = 'Demo Bank';
    
    const newAccount = {
      name: `${bankName} Checking`,
      type: 'checking' as const,
      balance: 1504.00,
      startingBalance: 1504.00,
      startingBalanceDate: new Date().toISOString().split('T')[0],
      isConnected: true,
      lastSyncDate: new Date(),
      bankName: bankName,
      accountNumber: '****1234',
      isActive: true,
      currentBalance: 1504.00,
      color: '#3B82F6',
    };
    
    // Initialize default account and update with bank info
    initializeWithSeedData();
    updateAccountInfo(newAccount);
    
    // Add some demo transactions
    const activeAccount = getActiveAccount();
    const demoTransactions = [
      {
        accountId: activeAccount?.id || 'default',
        amount: 2500.00,
        payee: 'Payroll Deposit',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        reconciled: true,
        userId: 'demo-user',
        source: 'bank' as const,
        notes: 'Income',
      },
      {
        accountId: activeAccount?.id || 'default',
        amount: -85.32,
        payee: 'Grocery Store',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        reconciled: true,
        userId: 'demo-user',
        source: 'bank' as const,
        notes: 'Groceries',
      },
      {
        accountId: activeAccount?.id || 'default',
        amount: -4.50,
        payee: 'Coffee Shop',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        reconciled: true,
        userId: 'demo-user',
        source: 'bank' as const,
        notes: 'Food & Dining',
      },
    ];
    
    // Add demo transactions
    demoTransactions.forEach(transaction => {
      addTransaction(transaction);
    });
    
    // Mark bank as linked and finish setup
    updateSettings({ bankLinked: true });
    
    // Complete the import process
    setIsImporting(false);
    console.log('Bank sync demo complete - 3 transactions imported');
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center p-6">
          <View className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center mb-6">
            <Text className="text-2xl">🏦</Text>
          </View>
          
          <Text className="text-2xl font-bold text-gray-900 mb-4">
            Connect Your Bank
          </Text>
          <Text className="text-gray-600 text-center mb-8">
            Welcome to CheckMate! Let's connect your bank account to get started with automatic transaction tracking.
          </Text>
          
          {step === 'connect' && (
            <>
              <Text className="text-lg font-semibold text-gray-900 mb-4">Choose Your Bank</Text>
              
              <Pressable
                onPress={() => setSelectedBank('demo')}
                className={`w-full p-4 rounded-lg border-2 mb-4 ${
                  selectedBank === 'demo' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
                }`}
              >
                <View className="flex-row items-center">
                  <Text className="text-2xl mr-4">🏦</Text>
                  <Text className="text-gray-900 font-medium flex-1">Demo Bank</Text>
                  {selectedBank === 'demo' && (
                    <Text className="text-blue-500">✓</Text>
                  )}
                </View>
              </Pressable>
              
              <View className="flex-row justify-between w-full mt-8">
                <Pressable
                  onPress={onCancel}
                  className="flex-1 mr-2 py-4 px-6 rounded-lg border border-gray-300"
                >
                  <Text className="text-gray-700 font-semibold text-center">Cancel</Text>
                </Pressable>
                
                <Pressable
                  onPress={() => {
                    if (selectedBank) {
                      setStep('importing');
                      simulateImport();
                    }
                  }}
                  disabled={!selectedBank}
                  className={`flex-1 ml-2 py-4 px-6 rounded-lg ${
                    selectedBank ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                >
                  <Text className="text-white font-semibold text-center">
                    Connect & Import
                  </Text>
                </Pressable>
              </View>
            </>
          )}
          
          {step === 'importing' && (
            <>
              <Text className="text-xl font-bold text-gray-900 mb-4">
                {isImporting ? 'Setting Up Your Account...' : 'Setup Complete!'}
              </Text>
              <Text className="text-gray-600 text-center mb-8">
                {isImporting 
                  ? 'We are connecting to your bank and importing your transaction history'
                  : 'Your Digital Register is ready to use!'
                }
              </Text>
              
              {isImporting && (
                <View className="w-full max-w-xs mb-8">
                  <View className="w-full bg-gray-200 rounded-full h-2">
                    <View className="bg-blue-500 h-2 rounded-full w-3/4" />
                  </View>
                  <Text className="text-center text-sm text-gray-600 mt-2">Importing...</Text>
                </View>
              )}
              
              {!isImporting && (
                <>
                  <View className="bg-green-50 rounded-lg p-4 mb-6 w-full">
                    <Text className="text-green-800 font-semibold mb-2">Success!</Text>
                    <Text className="text-green-700 text-sm">✓ Bank account connected</Text>
                    <Text className="text-green-700 text-sm">✓ Starting balance set</Text>
                    <Text className="text-green-700 text-sm">✓ Ready to track transactions</Text>
                  </View>
                  
                  <Pressable
                    onPress={() => {
                      console.log('Start Using Digital Register button pressed');
                      onComplete();
                    }}
                    className="w-full py-4 px-6 bg-blue-500 rounded-lg"
                    style={({ pressed }) => ({
                      opacity: pressed ? 0.8 : 1,
                    })}
                  >
                    <Text className="text-white font-semibold text-center text-lg">
                      Start Using CheckMate
                    </Text>
                  </Pressable>
                </>
              )}
            </>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default SimpleInitialBankSyncScreen;