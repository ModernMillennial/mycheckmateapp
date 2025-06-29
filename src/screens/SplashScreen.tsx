import React, { useEffect } from 'react';
import {
  View,
  Text,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../state/authStore';
import { useTransactionStore } from '../state/transactionStore';

interface Props {
  navigation: any;
}

const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const { width, height } = Dimensions.get('window');
  const { isAuthenticated } = useAuthStore();
  const { settings } = useTransactionStore();
  
  // Animation values
  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const subtitleOpacity = useSharedValue(0);

  // Animated styles
  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
  }));

  const subtitleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  useEffect(() => {
    // Start animations
    logoScale.value = withTiming(1, { duration: 800 });
    logoOpacity.value = withTiming(1, { duration: 800 });
    
    titleOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));
    subtitleOpacity.value = withDelay(800, withTiming(1, { duration: 600 }));

    // Navigate to appropriate screen after animation completes
    const timer = setTimeout(() => {
      if (!isAuthenticated) {
        navigation.replace('Welcome');
      } else if (!settings.hasAcceptedTerms || !settings.hasAcceptedPrivacy) {
        navigation.replace('TermsAndConditions');
      } else {
        navigation.replace('Register');
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center px-8">
        {/* Logo */}
        <Animated.View style={[logoAnimatedStyle]} className="items-center mb-8">
          <View className="w-32 h-32 bg-blue-500 rounded-3xl items-center justify-center shadow-lg">
            <Ionicons name="library" size={64} color="white" />
          </View>
        </Animated.View>

        {/* App Name */}
        <Animated.View style={[titleAnimatedStyle]} className="items-center mb-4">
          <Text className="text-4xl font-bold text-gray-900 tracking-tight">
            CheckMate
          </Text>
        </Animated.View>

        {/* Tagline */}
        <Animated.View style={[subtitleAnimatedStyle]} className="items-center">
          <Text className="text-lg text-gray-600 text-center font-medium">
            Master Your Finances
          </Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

export default SplashScreen;