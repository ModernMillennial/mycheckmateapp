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
  const [step, setStep] = useState('connect');
  
  // Test store usage
  const { addAccount, updateSettings } = useTransactionStore();
  console.log('SimpleInitialBankSyncScreen: Store accessed successfully');

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
            onPress={onComplete}
            className="bg-blue-500 px-8 py-4 rounded-lg mb-4"
          >
            <Text className="text-white font-semibold">Complete</Text>
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