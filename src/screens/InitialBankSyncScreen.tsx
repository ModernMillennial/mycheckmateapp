import React, { useState } from 'react';
import { View, Text, Modal, Pressable, TextInput, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useTransactionStore } from '../state/transactionStore';

interface Props {
  visible: boolean;
  onComplete: () => void;
  onCancel: () => void;
}

type Step = 'connect' | 'balance' | 'importing' | 'complete';

const InitialBankSyncScreen: React.FC<Props> = ({ visible, onComplete, onCancel }) => {
  const [step, setStep] = useState<Step>('connect');
  const [selectedBank, setSelectedBank] = useState<string>('');
  const [startingBalance, setStartingBalance] = useState<string>('');
  const [startingDate, setStartingDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
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
      setStep('balance');
    }, 2000);
  };

  const handleBalanceSubmit = () => {
    if (!startingBalance || parseFloat(startingBalance) < 0) {
      Alert.alert('Invalid Balance', 'Please enter a valid starting balance.');
      return;
    }
    
    setStep('importing');
    simulateImport();
  };

  const simulateImport = async () => {
    setIsImporting(true);
    
    // Create new account
    const bankName = demoBank.find(b => b.id === selectedBank)?.name || 'Demo Bank';
    
    const newAccount = {
      name: `${bankName} Checking`,
      type: 'checking' as const,
      balance: parseFloat(startingBalance),
      startingBalance: parseFloat(startingBalance),
      startingBalanceDate: startingDate.toISOString().split('T')[0],
      isConnected: true,
      lastSyncDate: new Date(),
      bankName: bankName,
      accountNumber: '****1234',
      isActive: true,
      currentBalance: parseFloat(startingBalance),
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
      
      // Add some demo bank transactions
      const demoTransactions = [
        {
          accountId: newAccountId,
          type: 'debit' as const,
          amount: -4.50,
          payee: 'Starbucks Coffee',
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          reconciled: true,
          userId: 'demo-user',
          source: 'bank' as const,
          category: 'Food & Dining',
        },
        {
          accountId: newAccountId,
          type: 'credit' as const,
          amount: 2500.00,
          payee: 'Payroll Deposit',
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          reconciled: true,
          userId: 'demo-user',
          source: 'bank' as const,
          category: 'Income',
        },
        {
          accountId: newAccountId,
          type: 'debit' as const,
          amount: -85.32,
          payee: 'Grocery Store',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          reconciled: true,
          userId: 'demo-user',
          source: 'bank' as const,
          category: 'Groceries',
        },
      ];
      
      demoTransactions.forEach(transaction => {
        addTransaction(transaction);
      });
    }
    
    setTimeout(() => {
      setIsImporting(false);
      setStep('complete');
      // Mark bank as linked
      updateSettings({ bankLinked: true });
    }, 1000);
  };

  const handleComplete = () => {
    onComplete();
    // Reset state for next time
    setStep('connect');
    setSelectedBank('');
    setStartingBalance('');
    setStartingDate(new Date());
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

  const renderBalanceStep = () => (
    <ScrollView className="flex-1 p-6">
      <View className="items-center mb-8">
        <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center mb-4">
          <Ionicons name="wallet" size={32} color="#10B981" />
        </View>
        <Text className="text-2xl font-bold text-gray-900 mb-2">Set Starting Balance</Text>
        <Text className="text-gray-600 text-center">
          Enter your current account balance and the date you want to start tracking from
        </Text>
      </View>

      <View className="mb-6">
        <Text className="text-lg font-semibold text-gray-900 mb-3">Current Balance</Text>
        <View className="flex-row items-center border border-gray-300 rounded-lg p-4">
          <Text className="text-gray-600 text-lg mr-2">$</Text>
          <TextInput
            value={startingBalance}
            onChangeText={setStartingBalance}
            placeholder="0.00"
            keyboardType="decimal-pad"
            className="flex-1 text-lg text-gray-900"
          />
        </View>
      </View>

      <View className="mb-8">
        <Text className="text-lg font-semibold text-gray-900 mb-3">Starting Date</Text>
        <Pressable
          onPress={() => setShowDatePicker(true)}
          className="flex-row items-center justify-between border border-gray-300 rounded-lg p-4"
        >
          <Text className="text-gray-900 text-lg">
            {startingDate.toLocaleDateString()}
          </Text>
          <Ionicons name="calendar" size={20} color="#6B7280" />
        </Pressable>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={startingDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setStartingDate(selectedDate);
            }
          }}
        />
      )}

      <View className="flex-row justify-between">
        <Pressable
          onPress={() => setStep('connect')}
          className="flex-1 mr-2 py-4 px-6 rounded-lg border border-gray-300"
        >
          <Text className="text-gray-700 font-semibold text-center">Back</Text>
        </Pressable>
        
        <Pressable
          onPress={handleBalanceSubmit}
          disabled={!startingBalance}
          className={`flex-1 ml-2 py-4 px-6 rounded-lg ${
            startingBalance ? 'bg-blue-500' : 'bg-gray-300'
          }`}
        >
          <Text className="text-white font-semibold text-center">Import</Text>
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
          <Text className="text-green-600 font-medium mb-2">✓ 3 transactions imported</Text>
          <Text className="text-green-600 font-medium mb-2">✓ Account balance set</Text>
          <Text className="text-green-600 font-medium">✓ Ready to use</Text>
        </View>
      )}
    </View>
  );

  const renderCompleteStep = () => (
    <View className="flex-1 items-center justify-center p-6">
      <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-6">
        <Ionicons name="checkmark-circle" size={40} color="#10B981" />
      </View>
      
      <Text className="text-2xl font-bold text-gray-900 mb-4">You're All Set!</Text>
      
      <Text className="text-gray-600 text-center mb-8">
        Your bank account has been connected and your transactions have been imported. 
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

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView className="flex-1 bg-white">
        {step === 'connect' && renderConnectStep()}
        {step === 'balance' && renderBalanceStep()}
        {step === 'importing' && renderImportingStep()}
        {step === 'complete' && renderCompleteStep()}
      </SafeAreaView>
    </Modal>
  );
};

export default InitialBankSyncScreen;