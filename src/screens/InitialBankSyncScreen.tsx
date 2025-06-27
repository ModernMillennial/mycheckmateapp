import React, { useState } from 'react';
import { View, Text, Modal, Pressable, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTransactionStore } from '../state/transactionStore';

interface Props {
  visible: boolean;
  onComplete: () => void;
  onCancel: () => void;
}

type Step = 'connect' | 'fetching' | 'selectStart' | 'importing' | 'complete';

const InitialBankSyncScreen: React.FC<Props> = ({ visible, onComplete, onCancel }) => {
  console.log('InitialBankSyncScreen render - visible:', visible);
  const [step, setStep] = useState<Step>('connect');
  const [selectedBank, setSelectedBank] = useState<string>('');
  const [fetchedTransactions, setFetchedTransactions] = useState<any[]>([]);
  const [selectedStartingTransaction, setSelectedStartingTransaction] = useState<string>('');
  const [currentBalance, setCurrentBalance] = useState<number>(0);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  
  const { addAccount, updateAccount, addTransaction, switchAccount, updateSettings } = useTransactionStore();

  const demoBank = [
    { id: 'chase', name: 'Chase Bank', icon: '🏦' },
    { id: 'bofa', name: 'Bank of America', icon: '🏛️' },
    { id: 'wellsfargo', name: 'Wells Fargo', icon: '🌟' },
    { id: 'citi', name: 'Citibank', icon: '🏢' },
  ];

  const handleBankSelect = (bankId: string) => {
    setSelectedBank(bankId);
  };

  const handleConnect = async () => {
    if (!selectedBank) return;
    
    setIsConnecting(true);
    
    // Simulate connection process
    setTimeout(() => {
      setIsConnecting(false);
      setStep('fetching');
      fetchBankTransactions();
    }, 2000);
  };

  const fetchBankTransactions = async () => {
    setIsFetching(true);
    
    // Simulate fetching bank transactions
    const fetchSteps = [
      { progress: 25, message: 'Connecting to bank...' },
      { progress: 50, message: 'Fetching account history...' },
      { progress: 75, message: 'Processing transactions...' },
      { progress: 100, message: 'History retrieved!' },
    ];
    
    for (const step of fetchSteps) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setImportProgress(step.progress);
    }
    
    // Create demo transaction history (90 days)
    const demoTransactions = [];
    let balance = 2847.23;
    setCurrentBalance(balance);
    
    // Add realistic transaction history
    const transactionTemplates = [
      { payee: 'Payroll Deposit - ACME Corp', amount: 2500.00, type: 'credit' },
      { payee: 'Rent Payment - Property Mgmt', amount: -1200.00, type: 'debit' },
      { payee: 'Electric Bill - City Power', amount: -89.45, type: 'debit' },
      { payee: 'Grocery Store - Fresh Market', amount: -156.78, type: 'debit' },
      { payee: 'Gas Station - Shell #4821', amount: -42.30, type: 'debit' },
      { payee: 'Coffee Shop - Starbucks', amount: -4.95, type: 'debit' },
      { payee: 'ATM Withdrawal', amount: -100.00, type: 'debit' },
      { payee: 'Direct Deposit - Tax Refund', amount: 834.50, type: 'credit' },
      { payee: 'Online Purchase - Amazon', amount: -67.89, type: 'debit' },
      { payee: 'Restaurant - Pizza Palace', amount: -23.45, type: 'debit' },
      { payee: 'Phone Bill - Verizon', amount: -78.99, type: 'debit' },
      { payee: 'Insurance - Auto Premium', amount: -124.50, type: 'debit' },
      { payee: 'Transfer from Savings', amount: 500.00, type: 'credit' },
      { payee: 'Pharmacy - CVS', amount: -15.67, type: 'debit' },
      { payee: 'Streaming Service - Netflix', amount: -15.99, type: 'debit' },
    ];
    
    // Generate transactions over 90 days
    for (let i = 0; i < 45; i++) {
      const daysAgo = Math.floor(Math.random() * 90) + 1;
      const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
      const template = transactionTemplates[Math.floor(Math.random() * transactionTemplates.length)];
      
      // Add some randomness to amounts
      const randomAmount = template.amount + (Math.random() - 0.5) * Math.abs(template.amount) * 0.1;
      const amount = Math.round(randomAmount * 100) / 100;
      
      balance -= amount; // Calculate running balance backwards
      
      demoTransactions.push({
        id: `fetched_${i}`,
        date: date,
        payee: template.payee,
        amount: amount,
        type: template.type,
        balance: Math.round(balance * 100) / 100,
        category: template.payee.includes('Payroll') ? 'Income' : 
                 template.payee.includes('Rent') ? 'Housing' :
                 template.payee.includes('Grocery') ? 'Food' : 'Other'
      });
    }
    
    // Sort by date (newest first)
    demoTransactions.sort((a, b) => b.date.getTime() - a.date.getTime());
    
    setFetchedTransactions(demoTransactions);
    setIsFetching(false);
    setImportProgress(0);
    setStep('selectStart');
  };

  const handleStartingPointSubmit = () => {
    console.log('Starting point submit clicked, selected:', selectedStartingTransaction);
    if (!selectedStartingTransaction) {
      Alert.alert('Select Starting Point', 'Please select a transaction to start tracking from.');
      return;
    }
    
    setStep('importing');
    simulateImport();
  };

  const simulateImport = async () => {
    setIsImporting(true);
    
    // Find the selected starting transaction
    const startingTransaction = fetchedTransactions.find(t => t.id === selectedStartingTransaction);
    if (!startingTransaction) return;
    
    // Create new account
    const bankName = demoBank.find(b => b.id === selectedBank)?.name || 'Demo Bank';
    
    const newAccount = {
      name: `${bankName} Checking`,
      type: 'checking' as const,
      balance: currentBalance,
      startingBalance: startingTransaction.balance,
      startingBalanceDate: startingTransaction.date.toISOString().split('T')[0],
      isConnected: true,
      lastSyncDate: new Date(),
      bankName: bankName,
      accountNumber: '****1234',
      isActive: true,
      currentBalance: currentBalance,
      color: '#3B82F6',
    };
    
    addAccount(newAccount);
    
    // Simulate import progress
    const importSteps = [
      { progress: 20, message: 'Connecting to bank...' },
      { progress: 40, message: 'Fetching account data...' },
      { progress: 60, message: 'Importing transactions...' },
      { progress: 80, message: 'Processing data...' },
      { progress: 100, message: 'Import complete!' },
    ];
    
    for (const step of importSteps) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setImportProgress(step.progress);
    }
    
    // Get the newly created account ID and switch to it
    const accounts = useTransactionStore.getState().accounts;
    const newAccountId = accounts[accounts.length - 1]?.id;
    
    if (newAccountId) {
      switchAccount(newAccountId);
      
      // Import transactions from the selected starting point forward
      const startingTransactionIndex = fetchedTransactions.findIndex(t => t.id === selectedStartingTransaction);
      const transactionsToImport = fetchedTransactions.slice(0, startingTransactionIndex + 1);
      
      transactionsToImport.forEach(transaction => {
        addTransaction({
          accountId: newAccountId,
          amount: transaction.amount,
          payee: transaction.payee,
          date: transaction.date.toISOString().split('T')[0],
          reconciled: true,
          userId: 'demo-user',
          source: 'bank' as const,
          notes: transaction.category,
        });
      });
    }
    
    setTimeout(() => {
      setIsImporting(false);
      setStep('complete');
      // Mark bank as linked
      updateSettings({ bankLinked: true });
      
      // Log completion for debugging
      const startingTransactionIndex = fetchedTransactions.findIndex(t => t.id === selectedStartingTransaction);
      const importedCount = startingTransactionIndex + 1;
      console.log(`Import complete: ${importedCount} transactions imported`);
    }, 1000);
  };

  const handleComplete = () => {
    onComplete();
    // Reset state for next time
    setStep('connect');
    setSelectedBank('');
    setFetchedTransactions([]);
    setSelectedStartingTransaction('');
    setCurrentBalance(0);
    setImportProgress(0);
  };

  const renderConnectStep = () => (
    <ScrollView className="flex-1 p-6">
      <View className="items-center mb-8">
        <View className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center mb-4">
          <Ionicons name="business" size={32} color="#3B82F6" />
        </View>
        <Text className="text-2xl font-bold text-gray-900 mb-2">Connect Your Bank</Text>
        <Text className="text-gray-600 text-center">
          Select your bank to automatically import your transactions and starting balance
        </Text>
      </View>

      <Text className="text-lg font-semibold text-gray-900 mb-4">Choose Your Bank</Text>
      
      {demoBank.map((bank) => (
        <Pressable
          key={bank.id}
          onPress={() => handleBankSelect(bank.id)}
          className={`flex-row items-center p-4 rounded-lg border-2 mb-3 ${
            selectedBank === bank.id
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 bg-white'
          }`}
        >
          <Text className="text-2xl mr-4">{bank.icon}</Text>
          <Text className="text-gray-900 font-medium flex-1">{bank.name}</Text>
          {selectedBank === bank.id && (
            <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />
          )}
        </Pressable>
      ))}

      <View className="flex-row justify-between mt-8">
        <Pressable
          onPress={onCancel}
          className="flex-1 mr-2 py-4 px-6 rounded-lg border border-gray-300"
        >
          <Text className="text-gray-700 font-semibold text-center">Cancel</Text>
        </Pressable>
        
        <Pressable
          onPress={handleConnect}
          disabled={!selectedBank || isConnecting}
          className={`flex-1 ml-2 py-4 px-6 rounded-lg ${
            selectedBank && !isConnecting
              ? 'bg-blue-500'
              : 'bg-gray-300'
          }`}
        >
          <Text className="text-white font-semibold text-center">
            {isConnecting ? 'Connecting...' : 'Connect'}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );



  const renderImportingStep = () => (
    <View className="flex-1 items-center justify-center p-6">
      <View className="w-20 h-20 bg-blue-100 rounded-full items-center justify-center mb-6">
        <Ionicons 
          name={importProgress === 100 ? "checkmark" : "download"} 
          size={40} 
          color="#3B82F6" 
        />
      </View>
      
      <Text className="text-2xl font-bold text-gray-900 mb-4">
        {importProgress === 100 ? 'Import Complete!' : 'Importing Transactions'}
      </Text>
      
      <Text className="text-gray-600 text-center mb-8">
        {importProgress === 100 
          ? 'Your account has been set up successfully'
          : 'We are importing your recent transactions and setting up your account'
        }
      </Text>

      <View className="w-full max-w-xs mb-4">
        <View className="flex-row justify-between mb-2">
          <Text className="text-sm text-gray-600">Progress</Text>
          <Text className="text-sm text-gray-600">{importProgress}%</Text>
        </View>
        <View className="w-full bg-gray-200 rounded-full h-2">
          <View 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${importProgress}%` }}
          />
        </View>
      </View>

      {importProgress === 100 && (
        <View className="items-center">
          <Text className="text-green-600 font-medium mb-2">✓ Transactions imported</Text>
          <Text className="text-green-600 font-medium mb-2">✓ Account balance set</Text>
          <Text className="text-green-600 font-medium">✓ Ready to use</Text>
        </View>
      )}
    </View>
  );

  const renderFetchingStep = () => (
    <View className="flex-1 items-center justify-center p-6">
      <View className="w-20 h-20 bg-blue-100 rounded-full items-center justify-center mb-6">
        <Ionicons 
          name={importProgress === 100 ? "checkmark" : "cloud-download"} 
          size={40} 
          color="#3B82F6" 
        />
      </View>
      
      <Text className="text-2xl font-bold text-gray-900 mb-4">
        {importProgress === 100 ? 'History Retrieved!' : 'Fetching Account History'}
      </Text>
      
      <Text className="text-gray-600 text-center mb-8">
        {importProgress === 100 
          ? 'Your transaction history has been retrieved successfully'
          : 'We are fetching your recent transaction history from your bank'
        }
      </Text>

      <View className="w-full max-w-xs mb-4">
        <View className="flex-row justify-between mb-2">
          <Text className="text-sm text-gray-600">Progress</Text>
          <Text className="text-sm text-gray-600">{importProgress}%</Text>
        </View>
        <View className="w-full bg-gray-200 rounded-full h-2">
          <View 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${importProgress}%` }}
          />
        </View>
      </View>
    </View>
  );

  const renderSelectStartStep = () => {
    try {
      return (
    <ScrollView className="flex-1 p-6">
      <View className="items-center mb-8">
        <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center mb-4">
          <Ionicons name="list" size={32} color="#10B981" />
        </View>
        <Text className="text-2xl font-bold text-gray-900 mb-2">Choose Starting Point</Text>
        <Text className="text-gray-600 text-center">
          Tap a transaction below to select your starting point. All transactions from that point forward will be imported.
        </Text>
      </View>

      <View className="bg-blue-50 rounded-lg p-4 mb-6">
        <Text className="text-blue-900 font-semibold mb-2">Current Balance: ${(currentBalance || 0).toFixed(2)}</Text>
        <Text className="text-blue-800 text-sm">Found {fetchedTransactions.length} transactions in the last 90 days</Text>
      </View>

      <Text className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</Text>
      
      {selectedStartingTransaction && (
        <View className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
          <Text className="text-green-800 font-medium text-center">
            ✓ Starting point selected! Tap "Import" to continue.
          </Text>
        </View>
      )}
      
      {fetchedTransactions.length === 0 ? (
        <View className="items-center py-8">
          <Text className="text-gray-500">Loading transactions...</Text>
        </View>
      ) : (
        fetchedTransactions.slice(0, 10).map((transaction) => {
        // Safety checks to prevent render errors
        if (!transaction || !transaction.id || !transaction.payee) {
          return null;
        }
        
        return (
        <Pressable
          key={transaction.id}
          onPress={() => {
            console.log('Transaction selected:', transaction.id, transaction.payee);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setSelectedStartingTransaction(transaction.id);
          }}
          className={`flex-row items-center p-4 rounded-lg border-2 mb-3 ${
            selectedStartingTransaction === transaction.id
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 bg-white'
          }`}
        >
          <View className="flex-1">
            <Text className="text-gray-900 font-medium">{transaction.payee}</Text>
            <Text className="text-gray-500 text-sm">
              {new Date(transaction.date).toLocaleDateString()} • Balance: ${(transaction.balance || 0).toFixed(2)}
            </Text>
          </View>
          <View className="items-end">
            <Text className={`font-semibold ${
              (transaction.amount || 0) >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {(transaction.amount || 0) >= 0 ? '+' : ''}${Math.abs(transaction.amount || 0).toFixed(2)}
            </Text>
          </View>
          {selectedStartingTransaction === transaction.id && (
            <View className="ml-3">
              <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />
            </View>
          )}
        </Pressable>
        );
      }).filter(Boolean)
      )}

      <View className="flex-row justify-between mt-8">
        <Pressable
          onPress={() => setStep('connect')}
          className="flex-1 mr-2 py-4 px-6 rounded-lg border border-gray-300"
        >
          <Text className="text-gray-700 font-semibold text-center">Back</Text>
        </Pressable>
        
        <Pressable
          onPress={handleStartingPointSubmit}
          disabled={!selectedStartingTransaction}
          className={`flex-1 ml-2 py-4 px-6 rounded-lg ${
            selectedStartingTransaction ? 'bg-blue-500 shadow-lg' : 'bg-gray-300'
          }`}
          style={({ pressed }) => ({
            opacity: pressed ? 0.8 : 1,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          })}
        >
          <Text className={`font-semibold text-center ${
            selectedStartingTransaction ? 'text-white' : 'text-gray-500'
          }`}>
            {selectedStartingTransaction ? 'Import Transactions' : 'Select Transaction First'}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
      );
    } catch (error) {
      console.error('Error rendering selectStart step:', error);
      return (
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-red-600 text-center">
            Something went wrong. Please try again.
          </Text>
          <Pressable
            onPress={() => setStep('connect')}
            className="mt-4 bg-blue-500 px-6 py-3 rounded-lg"
          >
            <Text className="text-white font-semibold">Go Back</Text>
          </Pressable>
        </View>
      );
    }
  };

  const renderCompleteStep = () => (
    <View className="flex-1 items-center justify-center p-6">
      <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-6">
        <Ionicons name="checkmark-circle" size={40} color="#10B981" />
      </View>
      
      <Text className="text-2xl font-bold text-gray-900 mb-4">You're All Set!</Text>
      
      <Text className="text-gray-600 text-center mb-8">
        Your bank account has been connected and transactions from your selected starting point have been imported. 
        You can now start tracking your finances with the Digital Register.
      </Text>

      <View className="bg-blue-50 rounded-lg p-4 mb-8 w-full">
        <Text className="text-blue-900 font-semibold mb-2">What's Next?</Text>
        <Text className="text-blue-800 text-sm mb-1">• Add manual transactions</Text>
        <Text className="text-blue-800 text-sm mb-1">• Reconcile your entries</Text>
        <Text className="text-blue-800 text-sm">• View detailed reports</Text>
      </View>

      <Pressable
        onPress={handleComplete}
        className="w-full py-4 px-6 bg-blue-500 rounded-lg"
      >
        <Text className="text-white font-semibold text-center text-lg">Start Using Digital Register</Text>
      </Pressable>
    </View>
  );

  if (!visible) {
    console.log('InitialBankSyncScreen not visible, returning null');
    return null;
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView className="flex-1 bg-white">
        {step === 'connect' && renderConnectStep()}
        {step === 'fetching' && renderFetchingStep()}
        {step === 'selectStart' && renderSelectStartStep()}
        {step === 'importing' && renderImportingStep()}
        {step === 'complete' && renderCompleteStep()}
      </SafeAreaView>
    </Modal>
  );
};

export default InitialBankSyncScreen;