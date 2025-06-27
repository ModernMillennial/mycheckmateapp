import React from 'react';
import { View, Text } from 'react-native';

interface Props {
  navigation: any;
}

const MinimalTestScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white', padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'black', marginBottom: 20 }}>
        MINIMAL TEST SCREEN
      </Text>
      <Text style={{ fontSize: 16, color: 'gray', textAlign: 'center' }}>
        If you see this message, the navigation is working properly.
      </Text>
      <Text style={{ fontSize: 14, color: 'blue', marginTop: 20 }}>
        Navigation available: {navigation ? 'YES' : 'NO'}
      </Text>
    </View>
  );
};

export default MinimalTestScreen;