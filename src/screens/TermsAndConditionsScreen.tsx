import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTransactionStore } from '../state/transactionStore';

interface Props {
  navigation: any;
  route: any;
}

const TermsAndConditionsScreen: React.FC<Props> = ({ navigation, route }) => {
  const isFirstTime = route.params?.isFirstTime || false;
  const isReadOnly = route.params?.isReadOnly || false;
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const { updateSettings } = useTransactionStore();

  const handleAccept = () => {
    if (!hasScrolledToBottom) {
      Alert.alert(
        'Please Read Complete Terms',
        'Please scroll to the bottom and read the complete Terms & Conditions before proceeding.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Mark that user has accepted terms
    updateSettings({ 
      hasAcceptedTerms: true,
      termsAcceptedDate: new Date().toISOString()
    });

    if (isFirstTime) {
      // Navigate to Privacy Policy next
      navigation.navigate('PrivacyPolicy', { isFirstTime: true });
    } else {
      // Just go back to settings
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate('Settings');
      }
    }
  };

  const handleDecline = () => {
    if (isFirstTime) {
      Alert.alert(
        'Terms Required',
        'You must accept the Terms & Conditions to use Checkmate.',
        [
          {
            text: 'Review Again',
            style: 'default'
          }
        ]
      );
    } else {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate('Settings');
      }
    }
  };

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 20;
    const isScrolledToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
    
    if (isScrolledToBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 py-4 border-b border-gray-200">
        <View className="items-center">
          <Ionicons name="document-text" size={32} color="#3B82F6" />
          <Text className="text-xl font-bold text-gray-900 mt-2">
            Terms & Conditions
          </Text>
          {isFirstTime && (
            <Text className="text-sm text-gray-600 mt-1 text-center">
              Please read the complete document before proceeding
            </Text>
          )}
        </View>
        {!isFirstTime && (
          <Pressable
            onPress={() => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate('Settings');
              }
            }}
            className="absolute left-4 top-4 p-2"
          >
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </Pressable>
        )}
      </View>

      <ScrollView 
        className="flex-1 px-6 py-4"
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <Text className="text-sm text-gray-500 mb-6">
          Last updated: {new Date().toLocaleDateString()}
        </Text>

        <View className="space-y-6">
          {/* Introduction */}
          <View>
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              1. Introduction
            </Text>
            <Text className="text-base text-gray-700 leading-6">
              Welcome to Checkmate ("we," "our," or "us"). These Terms and Conditions ("Terms") govern your use of our mobile application Checkmate (the "Service") operated by Checkmate Inc.
            </Text>
            <Text className="text-base text-gray-700 leading-6 mt-3">
              By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of these terms, then you may not access the Service.
            </Text>
          </View>

          {/* Acceptance of Terms */}
          <View>
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              2. Acceptance of Terms
            </Text>
            <Text className="text-base text-gray-700 leading-6">
              By downloading, installing, or using Checkmate, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy. These Terms constitute a legally binding agreement between you and Checkmate Inc.
            </Text>
          </View>

          {/* Description of Service */}
          <View>
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              3. Description of Service
            </Text>
            <Text className="text-base text-gray-700 leading-6">
              Checkmate is a digital checkbook register application that allows users to:
            </Text>
            <View className="ml-4 mt-2">
              <Text className="text-base text-gray-700 leading-6">• Track personal financial transactions</Text>
              <Text className="text-base text-gray-700 leading-6">• Connect bank accounts through secure third-party services</Text>
              <Text className="text-base text-gray-700 leading-6">• Synchronize bank transactions with manual entries</Text>
              <Text className="text-base text-gray-700 leading-6">• Calculate running account balances</Text>
              <Text className="text-base text-gray-700 leading-6">• Generate financial reports and insights</Text>
            </View>
          </View>

          {/* User Eligibility */}
          <View>
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              4. User Eligibility
            </Text>
            <Text className="text-base text-gray-700 leading-6">
              You must be at least 18 years old to use Checkmate. By using the Service, you represent and warrant that you are at least 18 years of age and have the legal capacity to enter into these Terms.
            </Text>
          </View>

          {/* User Account and Security */}
          <View>
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              5. User Account and Security
            </Text>
            <Text className="text-base text-gray-700 leading-6">
              You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to:
            </Text>
            <View className="ml-4 mt-2">
              <Text className="text-base text-gray-700 leading-6">• Provide accurate and complete information</Text>
              <Text className="text-base text-gray-700 leading-6">• Keep your login credentials secure</Text>
              <Text className="text-base text-gray-700 leading-6">• Notify us immediately of any unauthorized use</Text>
              <Text className="text-base text-gray-700 leading-6">• Use the Service only for lawful purposes</Text>
            </View>
          </View>

          {/* Financial Data and Bank Connections */}
          <View>
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              6. Financial Data and Bank Connections
            </Text>
            <Text className="text-base text-gray-700 leading-6">
              Checkmate uses Plaid and other third-party services to connect to your bank accounts. By connecting your bank account, you authorize us to:
            </Text>
            <View className="ml-4 mt-2">
              <Text className="text-base text-gray-700 leading-6">• Access your account information and transaction history</Text>
              <Text className="text-base text-gray-700 leading-6">• Store and process this information securely</Text>
              <Text className="text-base text-gray-700 leading-6">• Use this data to provide our services</Text>
            </View>
            <Text className="text-base text-gray-700 leading-6 mt-3">
              We do not store your banking credentials. All bank connections are managed securely through our third-party providers.
            </Text>
          </View>

          {/* Prohibited Uses */}
          <View>
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              7. Prohibited Uses
            </Text>
            <Text className="text-base text-gray-700 leading-6">
              You may not use Checkmate to:
            </Text>
            <View className="ml-4 mt-2">
              <Text className="text-base text-gray-700 leading-6">• Violate any applicable laws or regulations</Text>
              <Text className="text-base text-gray-700 leading-6">• Engage in fraudulent or illegal financial activities</Text>
              <Text className="text-base text-gray-700 leading-6">• Attempt to reverse engineer or hack the application</Text>
              <Text className="text-base text-gray-700 leading-6">• Share your account with unauthorized users</Text>
              <Text className="text-base text-gray-700 leading-6">• Use the Service for commercial purposes without authorization</Text>
            </View>
          </View>

          {/* Data Accuracy and Disclaimers */}
          <View>
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              8. Data Accuracy and Disclaimers
            </Text>
            <Text className="text-base text-gray-700 leading-6">
              While we strive to provide accurate financial data, Checkmate is not a substitute for professional financial advice. You are responsible for:
            </Text>
            <View className="ml-4 mt-2">
              <Text className="text-base text-gray-700 leading-6">• Verifying the accuracy of all financial information</Text>
              <Text className="text-base text-gray-700 leading-6">• Reconciling your accounts with official bank statements</Text>
              <Text className="text-base text-gray-700 leading-6">• Making your own financial decisions</Text>
            </View>
          </View>

          {/* Limitation of Liability */}
          <View>
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              9. Limitation of Liability
            </Text>
            <Text className="text-base text-gray-700 leading-6">
              Checkmate Inc. shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or use, incurred by you or any third party, whether in an action in contract or tort, even if we have been advised of the possibility of such damages.
            </Text>
          </View>

          {/* Service Availability */}
          <View>
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              10. Service Availability
            </Text>
            <Text className="text-base text-gray-700 leading-6">
              We strive to maintain high service availability but cannot guarantee uninterrupted access. We reserve the right to modify, suspend, or discontinue the Service at any time with or without notice.
            </Text>
          </View>

          {/* Termination */}
          <View>
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              11. Termination
            </Text>
            <Text className="text-base text-gray-700 leading-6">
              We may terminate or suspend your account and access to the Service immediately, without prior notice, for any reason, including breach of these Terms. Upon termination, your right to use the Service will cease immediately.
            </Text>
          </View>

          {/* Changes to Terms */}
          <View>
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              12. Changes to Terms
            </Text>
            <Text className="text-base text-gray-700 leading-6">
              We reserve the right to modify these Terms at any time. We will notify users of any material changes via the application or email. Your continued use of the Service after changes constitutes acceptance of the new Terms.
            </Text>
          </View>

          {/* Governing Law */}
          <View>
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              13. Governing Law
            </Text>
            <Text className="text-base text-gray-700 leading-6">
              These Terms shall be governed by and construed in accordance with the laws of the State of California, United States, without regard to its conflict of law provisions.
            </Text>
          </View>

          {/* Contact Information */}
          <View className="mb-8">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              14. Contact Information
            </Text>
            <Text className="text-base text-gray-700 leading-6">
              If you have any questions about these Terms and Conditions, please contact us at:
            </Text>
            <View className="mt-3 p-4 bg-gray-50 rounded-lg">
              <Text className="text-base text-gray-700">Email: support@mycheckmateapp.com</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Buttons */}
      {isFirstTime && (
        <View className="p-6 border-t border-gray-200 bg-white">
          {hasScrolledToBottom && (
            <View className="flex-row items-center justify-center mb-4">
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text className="text-sm text-green-600 ml-2">
                Document read completely
              </Text>
            </View>
          )}
          
          <View className="flex-row space-x-3">
            <Pressable
              onPress={handleDecline}
              className="flex-1 bg-gray-200 py-4 rounded-lg items-center"
            >
              <Text className="text-gray-700 font-semibold">
                Decline
              </Text>
            </Pressable>
            
            <Pressable
              onPress={handleAccept}
              className={`flex-1 py-4 rounded-lg items-center ${
                hasScrolledToBottom ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            >
              <Text className={`font-semibold ${
                hasScrolledToBottom ? 'text-white' : 'text-gray-500'
              }`}>
                Accept & Continue
              </Text>
            </Pressable>
          </View>
        </View>
      )}
      
      {/* Read-only mode close button */}
      {isReadOnly && (
        <View className="p-6 border-t border-gray-200 bg-white">
          <Pressable
            onPress={() => navigation.goBack()}
            className="bg-blue-500 py-4 rounded-lg items-center"
          >
            <Text className="text-white font-semibold">
              Close
            </Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
};

export default TermsAndConditionsScreen;