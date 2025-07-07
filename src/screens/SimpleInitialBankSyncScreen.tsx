import React, { useState } from 'react';
import { View, Text, Modal, Pressable, Alert } from 'react-native';
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

  // Real bank connection and import functionality
  const connectAndImport = async () => {
    setIsImporting(true);
    
    try {
      // TODO: Replace with actual bank connection logic
      // This should integrate with your real banking API (Plaid, etc.)
      
      // For now, throw an error to indicate this needs to be implemented
      throw new Error('Bank connection not implemented. Please integrate with a real banking service.');
      
    } catch (error) {
      console.error('Bank connection error:', error);
      setIsImporting(false);
      // Show error to user
      Alert.alert(
        'Connection Failed',
        'Unable to connect to bank. Please check your configuration and try again.',
        [{ text: 'OK' }]
      );
    }
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
            Welcome to Checkmate! Let's connect your bank account to get started with automatic transaction tracking.
          </Text>
          
          {step === 'connect' && (
            <>
              <Text className="text-lg font-semibold text-gray-900 mb-4">Choose Your Bank</Text>
              
              <Text className="text-gray-600 text-center">
                Bank connection requires proper integration with a banking service like Plaid.
              </Text>
              
              <View className="flex-row justify-between w-full mt-8">
                <Pressable
                  onPress={onCancel}
                  className="flex-1 mr-2 py-4 px-6 rounded-lg border border-gray-300"
                >
                  <Text className="text-gray-700 font-semibold text-center">Cancel</Text>
                </Pressable>
                
                <Pressable
                  onPress={() => {
                    setStep('importing');
                    connectAndImport();
                  }}
                  className="flex-1 ml-2 py-4 px-6 rounded-lg bg-gray-300"
                >
                  <Text className="text-gray-600 font-semibold text-center">
                    Connect & Import
                  </Text>
                </Pressable>
              </View>
            </>
          )}
          
          {step === 'importing' && (
            <>
              <Text className="text-xl font-bold text-gray-900 mb-4">
                Bank Connection Setup Required
              </Text>
              <Text className="text-gray-600 text-center mb-8">
                This feature requires integration with a banking service like Plaid. Please configure your banking integration first.
              </Text>
              
              <Pressable
                onPress={() => {
                  console.log('OK button pressed');
                  onCancel();
                }}
                className="w-full py-4 px-6 bg-gray-300 rounded-lg"
                style={({ pressed }) => ({
                  opacity: pressed ? 0.8 : 1,
                })}
              >
                <Text className="text-gray-700 font-semibold text-center text-lg">
                  OK
                </Text>
              </Pressable>
            </>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default SimpleInitialBankSyncScreen;