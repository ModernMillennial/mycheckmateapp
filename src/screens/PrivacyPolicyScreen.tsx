import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTransactionStore } from '../state/transactionStore';

interface Props {
  navigation: any;
  route: any;
}

const PrivacyPolicyScreen: React.FC<Props> = ({ navigation, route }) => {
  const isFirstTime = route.params?.isFirstTime || false;
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const { updateSettings } = useTransactionStore();

  const handleAccept = () => {
    if (!hasScrolledToBottom) {
      Alert.alert(
        'Please Read Complete Privacy Policy',
        'Please scroll to the bottom and read the complete Privacy Policy before proceeding.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Mark that user has accepted privacy policy
    updateSettings({ 
      hasAcceptedPrivacy: true,
      privacyAcceptedDate: new Date().toISOString()
    });

    if (isFirstTime) {
      // Navigate to main app after accepting both terms and privacy
      navigation.replace('Register');
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
        'Privacy Policy Required',
        'You must accept the Privacy Policy to use CheckMate.',
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
          <Ionicons name="shield-checkmark" size={32} color="#10B981" />
          <Text className="text-xl font-bold text-gray-900 mt-2">
            Privacy Policy
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
              CheckMate Inc. ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application CheckMate ("the Service").
            </Text>
            <Text className="text-base text-gray-700 leading-6 mt-3">
              Please read this Privacy Policy carefully. By using CheckMate, you consent to the data practices described in this policy.
            </Text>
          </View>

          {/* Information We Collect */}
          <View>
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              2. Information We Collect
            </Text>
            
            <Text className="text-base font-semibold text-gray-800 mb-2">
              2.1 Personal Information
            </Text>
            <Text className="text-base text-gray-700 leading-6 mb-3">
              We may collect personal information that you provide directly to us, including:
            </Text>
            <View className="ml-4 mb-4">
              <Text className="text-base text-gray-700 leading-6">• Name and contact information</Text>
              <Text className="text-base text-gray-700 leading-6">• Email address</Text>
              <Text className="text-base text-gray-700 leading-6">• Phone number</Text>
              <Text className="text-base text-gray-700 leading-6">• Profile information you choose to provide</Text>
            </View>

            <Text className="text-base font-semibold text-gray-800 mb-2">
              2.2 Financial Information
            </Text>
            <Text className="text-base text-gray-700 leading-6 mb-3">
              When you connect your bank accounts through our secure third-party providers (such as Plaid), we collect:
            </Text>
            <View className="ml-4 mb-4">
              <Text className="text-base text-gray-700 leading-6">• Bank account information and balances</Text>
              <Text className="text-base text-gray-700 leading-6">• Transaction history and details</Text>
              <Text className="text-base text-gray-700 leading-6">• Account numbers and routing information</Text>
              <Text className="text-base text-gray-700 leading-6">• Financial institution information</Text>
            </View>

            <Text className="text-base font-semibold text-gray-800 mb-2">
              2.3 Usage Information
            </Text>
            <Text className="text-base text-gray-700 leading-6 mb-3">
              We automatically collect information about how you use CheckMate:
            </Text>
            <View className="ml-4 mb-4">
              <Text className="text-base text-gray-700 leading-6">• App usage patterns and preferences</Text>
              <Text className="text-base text-gray-700 leading-6">• Device information (model, OS version, unique identifiers)</Text>
              <Text className="text-base text-gray-700 leading-6">• Log files and crash reports</Text>
              <Text className="text-base text-gray-700 leading-6">• Performance and diagnostic data</Text>
            </View>

            <Text className="text-base font-semibold text-gray-800 mb-2">
              2.4 Location Information
            </Text>
            <Text className="text-base text-gray-700 leading-6">
              We may collect location information if you enable location services, which helps us provide location-based features such as nearby ATM locations or merchant categorization.
            </Text>
          </View>

          {/* How We Use Your Information */}
          <View>
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              3. How We Use Your Information
            </Text>
            <Text className="text-base text-gray-700 leading-6 mb-3">
              We use the collected information for the following purposes:
            </Text>
            <View className="ml-4">
              <Text className="text-base text-gray-700 leading-6">• Provide and maintain the CheckMate service</Text>
              <Text className="text-base text-gray-700 leading-6">• Process and categorize your financial transactions</Text>
              <Text className="text-base text-gray-700 leading-6">• Generate account balances and financial insights</Text>
              <Text className="text-base text-gray-700 leading-6">• Sync data between devices and accounts</Text>
              <Text className="text-base text-gray-700 leading-6">• Improve our services and develop new features</Text>
              <Text className="text-base text-gray-700 leading-6">• Provide customer support and respond to inquiries</Text>
              <Text className="text-base text-gray-700 leading-6">• Send important notifications about your account</Text>
              <Text className="text-base text-gray-700 leading-6">• Detect and prevent fraud or security issues</Text>
              <Text className="text-base text-gray-700 leading-6">• Comply with legal obligations</Text>
            </View>
          </View>

          {/* Information Sharing */}
          <View>
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              4. Information Sharing and Disclosure
            </Text>
            <Text className="text-base text-gray-700 leading-6 mb-3">
              We do not sell, trade, or rent your personal information to third parties. We may share your information in the following limited circumstances:
            </Text>
            
            <Text className="text-base font-semibold text-gray-800 mb-2">
              4.1 Service Providers
            </Text>
            <Text className="text-base text-gray-700 leading-6 mb-3">
              We work with trusted third-party service providers, including:
            </Text>
            <View className="ml-4 mb-4">
              <Text className="text-base text-gray-700 leading-6">• Plaid Inc. for secure bank account connections</Text>
              <Text className="text-base text-gray-700 leading-6">• Cloud storage providers for data backup</Text>
              <Text className="text-base text-gray-700 leading-6">• Analytics services for app improvement</Text>
              <Text className="text-base text-gray-700 leading-6">• Customer support platforms</Text>
            </View>

            <Text className="text-base font-semibold text-gray-800 mb-2">
              4.2 Legal Requirements
            </Text>
            <Text className="text-base text-gray-700 leading-6 mb-3">
              We may disclose your information if required by law or in good faith belief that such action is necessary to:
            </Text>
            <View className="ml-4 mb-4">
              <Text className="text-base text-gray-700 leading-6">• Comply with legal processes or government requests</Text>
              <Text className="text-base text-gray-700 leading-6">• Protect our rights and property</Text>
              <Text className="text-base text-gray-700 leading-6">• Investigate potential fraud or security issues</Text>
              <Text className="text-base text-gray-700 leading-6">• Protect the safety of users or the public</Text>
            </View>

            <Text className="text-base font-semibold text-gray-800 mb-2">
              4.3 Business Transfers
            </Text>
            <Text className="text-base text-gray-700 leading-6">
              In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.
            </Text>
          </View>

          {/* Data Security */}
          <View>
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              5. Data Security
            </Text>
            <Text className="text-base text-gray-700 leading-6 mb-3">
              We implement industry-standard security measures to protect your information:
            </Text>
            <View className="ml-4">
              <Text className="text-base text-gray-700 leading-6">• End-to-end encryption for sensitive financial data</Text>
              <Text className="text-base text-gray-700 leading-6">• Secure Socket Layer (SSL) technology for data transmission</Text>
              <Text className="text-base text-gray-700 leading-6">• Regular security audits and vulnerability assessments</Text>
              <Text className="text-base text-gray-700 leading-6">• Access controls and authentication mechanisms</Text>
              <Text className="text-base text-gray-700 leading-6">• Secure cloud storage with reputable providers</Text>
            </View>
            <Text className="text-base text-gray-700 leading-6 mt-3">
              However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your personal information, we cannot guarantee absolute security.
            </Text>
          </View>

          {/* Data Retention */}
          <View>
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              6. Data Retention
            </Text>
            <Text className="text-base text-gray-700 leading-6">
              We retain your personal information only as long as necessary to provide the services and fulfill the purposes outlined in this Privacy Policy. We will retain and use your information to the extent necessary to comply with legal obligations, resolve disputes, and enforce our agreements.
            </Text>
          </View>

          {/* Your Privacy Rights */}
          <View>
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              7. Your Privacy Rights
            </Text>
            <Text className="text-base text-gray-700 leading-6 mb-3">
              Depending on your location, you may have the following rights regarding your personal information:
            </Text>
            <View className="ml-4">
              <Text className="text-base text-gray-700 leading-6">• Access: Request copies of your personal information</Text>
              <Text className="text-base text-gray-700 leading-6">• Correction: Request correction of inaccurate information</Text>
              <Text className="text-base text-gray-700 leading-6">• Deletion: Request deletion of your personal information</Text>
              <Text className="text-base text-gray-700 leading-6">• Portability: Request transfer of your data to another service</Text>
              <Text className="text-base text-gray-700 leading-6">• Opt-out: Unsubscribe from marketing communications</Text>
            </View>
            <Text className="text-base text-gray-700 leading-6 mt-3">
              To exercise these rights, please contact us using the information provided below.
            </Text>
          </View>

          {/* Third-Party Services */}
          <View>
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              8. Third-Party Services
            </Text>
            <Text className="text-base text-gray-700 leading-6">
              CheckMate integrates with third-party services, particularly Plaid, to provide bank connectivity. These services have their own privacy policies, and we encourage you to review them. We are not responsible for the privacy practices of these third-party services.
            </Text>
          </View>

          {/* Children's Privacy */}
          <View>
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              9. Children's Privacy
            </Text>
            <Text className="text-base text-gray-700 leading-6">
              CheckMate is not intended for children under 18 years of age. We do not knowingly collect personal information from children under 18. If we become aware that we have collected personal information from a child under 18, we will take steps to delete such information.
            </Text>
          </View>

          {/* International Data Transfers */}
          <View>
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              10. International Data Transfers
            </Text>
            <Text className="text-base text-gray-700 leading-6">
              Your information may be transferred to and processed in countries other than your country of residence. These countries may have different data protection laws. We will take appropriate measures to ensure your information receives adequate protection.
            </Text>
          </View>

          {/* Changes to Privacy Policy */}
          <View>
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              11. Changes to This Privacy Policy
            </Text>
            <Text className="text-base text-gray-700 leading-6">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy in the app and updating the "Last updated" date. Your continued use of CheckMate after any changes constitutes acceptance of the updated Privacy Policy.
            </Text>
          </View>

          {/* Contact Information */}
          <View className="mb-8">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              12. Contact Us
            </Text>
            <Text className="text-base text-gray-700 leading-6 mb-3">
              If you have any questions about this Privacy Policy or our privacy practices, please contact us:
            </Text>
            <View className="p-4 bg-gray-50 rounded-lg">
              <Text className="text-base font-medium text-gray-900">CheckMate Inc.</Text>
              <Text className="text-base text-gray-700">Email: support@mycheckmateapp.com</Text>
            </View>
            
            <Text className="text-sm text-gray-600 mt-4 italic">
              For privacy-related inquiries, we will respond within 30 days of receiving your request.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Buttons - Only for first time flow */}
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
                hasScrolledToBottom ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <Text className={`font-semibold ${
                hasScrolledToBottom ? 'text-white' : 'text-gray-500'
              }`}>
                Accept & Start Using CheckMate
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default PrivacyPolicyScreen;