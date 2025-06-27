import React from 'react';
import { View, Text, Pressable } from 'react-native';

interface Props {
  navigation: any;
}

const DebugScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={{ 
      flex: 1, 
      backgroundColor: 'white', 
      justifyContent: 'center', 
      alignItems: 'center',
      padding: 20 
    }}>
      <Text style={{ 
        fontSize: 24, 
        fontWeight: 'bold', 
        color: 'black',
        textAlign: 'center',
        marginBottom: 20
      }}>
        DEBUG: Digital Register Loading...
      </Text>
      
      <Text style={{ 
        fontSize: 16, 
        color: 'gray',
        textAlign: 'center',
        marginBottom: 30
      }}>
        If you see this, the navigation is working and we can fix the main app.
      </Text>
      
      <Pressable
        style={{
          backgroundColor: '#3B82F6',
          padding: 15,
          borderRadius: 8,
          minWidth: 200,
        }}
        onPress={() => {
          console.log('Button pressed - navigation available:', !!navigation);
          if (navigation) {
            console.log('Navigation methods:', Object.keys(navigation));
          }
        }}
      >
        <Text style={{ 
          color: 'white', 
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          Test Navigation
        </Text>
      </Pressable>
      
      <Text style={{ 
        fontSize: 12, 
        color: 'red',
        textAlign: 'center',
        marginTop: 20
      }}>
        DEBUG MODE - This should not be the final screen
      </Text>
    </View>
  );
};

export default DebugScreen;