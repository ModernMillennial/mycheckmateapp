import React from 'react';
import { View, Text, Modal, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Props {
  visible: boolean;
  onComplete: () => void;
  onCancel: () => void;
}

const InitialBankSyncScreen: React.FC<Props> = ({ visible, onComplete, onCancel }) => {
  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center p-4">
          <Text className="text-xl font-bold text-gray-900 mb-4">
            Bank Setup Coming Soon
          </Text>
          <Text className="text-gray-600 text-center mb-8">
            Initial bank setup feature is being prepared. For now, you can use the manual transaction entry and regular bank sync features.
          </Text>
          
          <Pressable
            onPress={onComplete}
            className="bg-blue-500 px-8 py-4 rounded-lg"
          >
            <Text className="text-white font-semibold">Continue</Text>
          </Pressable>
          
          <Pressable
            onPress={onCancel}
            className="mt-4 px-8 py-4"
          >
            <Text className="text-gray-600">Cancel</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default InitialBankSyncScreen;