// src/components/NetworkStatusBar.tsx
import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useNetworkStatus } from '../utils/networkMonitor';

const NetworkStatusBar: React.FC = () => {
  const isConnected = useNetworkStatus();
  const [animation] = React.useState(new Animated.Value(0));
  
  React.useEffect(() => {
    Animated.timing(animation, {
      toValue: isConnected ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isConnected, animation]);
  
  const translateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [-40, 0],
  });
  
  return (
    <Animated.View 
      style={[
        styles.container, 
        { transform: [{ translateY }] }
      ]}
    >
      <Text style={styles.text}>
        No internet connection
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#EF4444',
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  text: {
    color: 'white',
    fontWeight: '600',
  },
});

export default NetworkStatusBar;
