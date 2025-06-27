import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Props {
  navigation: any;
}

const SimpleTestScreen: React.FC<Props> = ({ navigation }) => {
  console.log('SimpleTestScreen rendering...');
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Digital Register</Text>
        <Text style={{ fontSize: 16, marginTop: 10, color: '#666' }}>
          Working Successfully!
        </Text>
        <Text style={{ fontSize: 14, marginTop: 20, color: '#999' }}>
          Navigation available: {navigation ? 'Yes' : 'No'}
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default SimpleTestScreen;