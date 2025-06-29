import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Linking,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  navigation: any;
}

const AboutScreen: React.FC<Props> = ({ navigation }) => {
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
          <Text className="text-lg text-gray-600 mb-1">Version 1.0.0</Text>
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

        {/* Technology */}
        <InfoSection title="Built With">
          <View className="flex-row flex-wrap">
            <View className="bg-white rounded-lg px-3 py-2 mr-2 mb-2 border border-gray-200">
              <Text className="text-sm font-medium text-gray-700">React Native</Text>
            </View>
            <View className="bg-white rounded-lg px-3 py-2 mr-2 mb-2 border border-gray-200">
              <Text className="text-sm font-medium text-gray-700">Expo SDK 53</Text>
            </View>
            <View className="bg-white rounded-lg px-3 py-2 mr-2 mb-2 border border-gray-200">
              <Text className="text-sm font-medium text-gray-700">TypeScript</Text>
            </View>
            <View className="bg-white rounded-lg px-3 py-2 mr-2 mb-2 border border-gray-200">
              <Text className="text-sm font-medium text-gray-700">Plaid API</Text>
            </View>
            <View className="bg-white rounded-lg px-3 py-2 mr-2 mb-2 border border-gray-200">
              <Text className="text-sm font-medium text-gray-700">Zustand</Text>
            </View>
          </View>
        </InfoSection>

        {/* Contact Links */}
        <InfoSection title="Get In Touch">
          <View>
            <Pressable
              onPress={handleWebsitePress}
              className="flex-row items-center p-3 bg-white rounded-lg border border-gray-200 mb-3"
            >
              <Ionicons name="globe-outline" size={20} color="#3B82F6" />
              <Text className="ml-3 font-medium text-gray-900">Visit Our Website</Text>
              <Ionicons name="chevron-forward" size={16} color="#9CA3AF" className="ml-auto" />
            </Pressable>

            <Pressable
              onPress={handleSupportPress}
              className="flex-row items-center p-3 bg-white rounded-lg border border-gray-200 mb-3"
            >
              <Ionicons name="mail-outline" size={20} color="#3B82F6" />
              <Text className="ml-3 font-medium text-gray-900">Contact Support</Text>
              <Ionicons name="chevron-forward" size={16} color="#9CA3AF" className="ml-auto" />
            </Pressable>
          </View>
        </InfoSection>

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