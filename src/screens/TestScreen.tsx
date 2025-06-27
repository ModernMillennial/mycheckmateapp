import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Props {
  navigation: any;
}

const TestScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center">
        <Text className="text-xl font-bold">Test Screen Working!</Text>
        <Text className="text-gray-600 mt-4">Navigation available: {!!navigation ? 'Yes' : 'No'}</Text>
      </View>
    </SafeAreaView>
  );
};

export default TestScreen;