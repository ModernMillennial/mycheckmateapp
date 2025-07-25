import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Linking,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../state/authStore';

interface Props {
  navigation: any;
}

const AboutScreen: React.FC<Props> = ({ navigation }) => {
  const [devTapCount, setDevTapCount] = useState(0);
  const { clearAllAuthData, resetAuthState } = useAuthStore();

  const handleWebsitePress = () => {
    Linking.openURL('https://checkmate-app.com').catch(() => {
      // Handle error silently or show alert
    });
  };

  const handleSupportPress = () => {
    Linking.openURL('mailto:support@checkmate-app.com').catch(() => {
      // Handle error silently or show alert
    });
  };

  const handleVersionTap = () => {
    const newCount = devTapCount + 1;
    setDevTapCount(newCount);
    
    if (newCount === 7) {
      Alert.alert(
        'Development Mode',
        'You are now in development mode! Test credentials:\n\n• test@example.com / password123\n• demo@test.com / demo123\n• user@app.com / user123\n\nDevelopment actions available below.',
        [{ text: 'OK' }]
      );
    } else if (newCount >= 10) {
      Alert.alert(
        'Reset Authentication',
        'This will clear all authentication data and log you out. Use this if you cannot logout normally.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Reset Auth',
            style: 'destructive',
            onPress: async () => {
              try {
                await clearAllAuthData();
                resetAuthState();
                Alert.alert('Reset Complete', 'Authentication data cleared. App will restart.');
              } catch (error) {
                Alert.alert('Error', 'Failed to reset authentication data');
              }
            }
          }
        ]
      );
      setDevTapCount(0);
    }
  };

  const InfoSection = ({ 
    title, 
    children 
  }: { 
    title: string; 
    children: React.ReactNode;
  }) => (
    <View className="mb-6">
      <Text className="text-lg font-semibold text-gray-900 mb-3">
        {title}
      </Text>
      <View className="bg-gray-50 rounded-lg p-4">
        {children}
      </View>
    </View>
  );

  const FeatureItem = ({ 
    icon, 
    title, 
    description 
  }: { 
    icon: string; 
    title: string; 
    description: string;
  }) => (
    <View className="flex-row items-start mb-3">
      <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center mr-3 mt-0.5">
        <Ionicons name={icon as any} size={16} color="#3B82F6" />
      </View>
      <View className="flex-1">
        <Text className="font-medium text-gray-900 mb-1">{title}</Text>
        <Text className="text-sm text-gray-600">{description}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-4 py-4 border-b border-gray-200">
        <Pressable
          onPress={() => navigation.goBack()}
          className="p-2"
        >
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </Pressable>
        
        <Text className="text-lg font-semibold text-gray-900 ml-2">
          About Checkmate
        </Text>
      </View>

      <ScrollView className="flex-1 px-4 py-6">
        {/* App Logo and Version */}
        <View className="items-center mb-8">
          <View className="w-24 h-24 rounded-2xl shadow-lg overflow-hidden mb-4">
            <Image
              source={require('../../assets/new-logo.png')}
              style={{ width: 96, height: 96 }}
              resizeMode="contain"
            />
          </View>
          <Text className="text-2xl font-bold text-gray-900 mb-2">Checkmate</Text>
          <Pressable onPress={handleVersionTap}>
            <Text className="text-lg text-gray-600 mb-1">Version 1.0.0</Text>
          </Pressable>
          <Text className="text-sm text-gray-500">Digital Register & Banking</Text>
        </View>

        {/* About Section */}
        <InfoSection title="About Checkmate">
          <Text className="text-gray-700 leading-6">
            Checkmate is your complete digital checkbook register that seamlessly integrates with your bank accounts. 
            Keep track of your finances with the familiar checkbook format while enjoying modern features like 
            automatic bank synchronization, transaction matching, and real-time balance calculations.
          </Text>
        </InfoSection>

        {/* Key Features */}
        <InfoSection title="Key Features">
          <View>
            <FeatureItem
              icon="card-outline"
              title="Bank Integration"
              description="Securely connect your bank accounts using Plaid for automatic transaction imports"
            />
            <FeatureItem
              icon="sync-outline"
              title="Smart Conversion"
              description="Manual entries automatically convert to bank transactions when matches are found"
            />
            <FeatureItem
              icon="calculator-outline"
              title="Built-in Calculator"
              description="Quick calculations right within the app for transaction planning"
            />
            <FeatureItem
              icon="refresh-outline"
              title="Real-time Sync"
              description="Pull-to-refresh keeps your transactions up-to-date with your bank"
            />
            <FeatureItem
              icon="shield-checkmark-outline"
              title="Secure & Private"
              description="Bank-level security with encrypted data transmission and storage"
            />
            <FeatureItem
              icon="phone-portrait-outline"
              title="iOS Optimized"
              description="Native iOS interface following Apple's Human Interface Guidelines"
            />
          </View>
        </InfoSection>

        {/* How It Works */}
        <InfoSection title="How It Works">
          <View>
            <View className="mb-4">
              <Text className="font-medium text-gray-900 mb-2">1. Connect Your Bank</Text>
              <Text className="text-sm text-gray-600">Securely link your bank account through our trusted banking partner.</Text>
            </View>
            <View className="mb-4">
              <Text className="font-medium text-gray-900 mb-2">2. Track Transactions</Text>
              <Text className="text-sm text-gray-600">Add manual entries or let automatic sync import your transactions.</Text>
            </View>
            <View className="mb-4">
              <Text className="font-medium text-gray-900 mb-2">3. Stay Balanced</Text>
              <Text className="text-sm text-gray-600">Watch your running balance update in real-time as you manage your money.</Text>
            </View>
            <View>
              <Text className="font-medium text-gray-900 mb-2">4. Convert & Match</Text>
              <Text className="text-sm text-gray-600">Manual entries automatically become "POSTED" when bank transactions match.</Text>
            </View>
          </View>
        </InfoSection>



        {/* Development Section - Shows after tapping version 7 times */}
        {devTapCount >= 7 && (
          <InfoSection title="Development Tools">
            <View>
              <Text className="text-sm text-gray-600 mb-4">
                Test credentials for development:
              </Text>
              <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <Text className="text-sm font-mono text-gray-700">
                  • test@example.com / password123{'\n'}
                  • demo@test.com / demo123{'\n'}
                  • user@app.com / user123
                </Text>
              </View>
              <Pressable
                onPress={async () => {
                  Alert.alert(
                    'Clear Auth Data',
                    'This will clear all authentication data and log you out immediately.',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Clear Data',
                        style: 'destructive',
                        onPress: async () => {
                          try {
                            await clearAllAuthData();
                            resetAuthState();
                            Alert.alert('Complete', 'Authentication data cleared');
                          } catch (error) {
                            Alert.alert('Error', 'Failed to clear data');
                          }
                        }
                      }
                    ]
                  );
                }}
                className="bg-red-50 border border-red-200 rounded-lg p-3 mb-2"
              >
                <Text className="text-red-700 font-medium text-center">Clear Auth Data</Text>
              </Pressable>
            </View>
          </InfoSection>
        )}

        {/* Copyright */}
        <View className="items-center pt-6 pb-4">
          <Text className="text-sm text-gray-500 text-center">
            © 2024 Checkmate. All rights reserved.
          </Text>
          <Text className="text-xs text-gray-400 text-center mt-1">
            Made with ♥ for better financial management
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AboutScreen;