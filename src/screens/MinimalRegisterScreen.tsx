import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTransactionStore } from '../state/transactionStore';

interface Props {
  navigation: any;
}

const MinimalRegisterScreen: React.FC<Props> = ({ navigation }) => {
  console.log('MinimalRegisterScreen rendering, navigation available:', !!navigation);
  
  const { accounts, settings } = useTransactionStore();
  console.log('Store accessed successfully, accounts:', accounts.length);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center">
        <Text className="text-xl font-bold">Minimal Register Screen</Text>
        <Text className="text-gray-600 mt-4">Navigation: {navigation ? 'Available' : 'Not Available'}</Text>
      </View>
    </SafeAreaView>
  );
};

export default MinimalRegisterScreen;