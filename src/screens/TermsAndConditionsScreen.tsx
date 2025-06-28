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
  const [hasReadTerms, setHasReadTerms] = useState(false);
  const [hasReadPrivacy, setHasReadPrivacy] = useState(false);
  const { updateSettings } = useTransactionStore();

  const handleAccept = () => {
    if (!hasReadTerms || !hasReadPrivacy) {
      Alert.alert(
        'Agreement Required',
        'Please confirm that you have read both the Terms & Conditions and Privacy Policy before proceeding.',
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
      // Navigate to the main app after first-time setup
      navigation.replace('Register');
    } else {
      // Just go back to settings
      navigation.goBack();
    }
  };

  const handleDecline = () => {
    if (isFirstTime) {
      Alert.alert(
        'Terms Required',
        'You must accept the Terms & Conditions and Privacy Policy to use CheckMate.',
        [
          {
            text: 'Review Again',
            style: 'default'
          }
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const CheckBox = ({ 
    value, 
    onValueChange, 
    label 
  }: { 
    value: boolean; 
    onValueChange: (value: boolean) => void;
    label: string;
  }) => (
    <Pressable
      onPress={() => onValueChange(!value)}
      className="flex-row items-start p-4 bg-gray-50 rounded-lg mb-4"
    >
      <View className="mr-3 mt-1">
        <Ionicons
          name={value ? "checkbox" : "square-outline"}
          size={20}
          color={value ? "#10B981" : "#6B7280"}
        />
      </View>
      <Text className="flex-1 text-sm text-gray-700 leading-5">
        {label}
      </Text>
    </Pressable>
  );

  if (isFirstTime) {
    // First-time agreement flow
    return (
      <SafeAreaView className="flex-1 bg-white">
        {/* Header */}
        <View className="px-6 py-4 border-b border-gray-200">
          <View className="items-center">
            <Ionicons name="shield-checkmark" size={32} color="#10B981" />
            <Text className="text-xl font-bold text-gray-900 mt-2">
              Welcome to CheckMate
            </Text>
            <Text className="text-sm text-gray-600 mt-1 text-center">
              Please review and accept our terms to continue
            </Text>
          </View>
        </View>

        <ScrollView className="flex-1 px-6 py-4">
          {/* Terms & Conditions Section */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              Terms & Conditions
            </Text>
            
            <View className="bg-gray-50 rounded-lg p-4 mb-4">
              <ScrollView className="max-h-40">
                <Text className="text-sm text-gray-700 leading-5">
                  <Text className="font-semibold">1. Acceptance of Terms{'\n'}</Text>
                  By using CheckMate, you agree to be bound by these Terms & Conditions.{'\n\n'}
                  
                  <Text className="font-semibold">2. Service Description{'\n'}</Text>
                  CheckMate is a digital checkbook register app that helps you track your financial transactions and connect with your bank accounts.{'\n\n'}
                  
                  <Text className="font-semibold">3. User Responsibilities{'\n'}</Text>
                  You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.{'\n\n'}
                  
                  <Text className="font-semibold">4. Privacy & Data Security{'\n'}</Text>
                  We take your privacy seriously. Your financial data is encrypted and stored securely. We do not sell or share your personal information with third parties.{'\n\n'}
                  
                  <Text className="font-semibold">5. Bank Account Integration{'\n'}</Text>
                  When you connect your bank account, we use secure, read-only access through Plaid to retrieve transaction data. We cannot make transactions on your behalf.{'\n\n'}
                  
                  <Text className="font-semibold">6. Limitation of Liability{'\n'}</Text>
                  CheckMate is provided "as is" without warranties. We are not liable for any damages arising from your use of the app.{'\n\n'}
                  
                  <Text className="font-semibold">7. Modifications{'\n'}</Text>
                  We reserve the right to modify these terms at any time. Continued use constitutes acceptance of modified terms.{'\n\n'}
                  
                  <Text className="font-semibold">8. Termination{'\n'}</Text>
                  You may terminate your account at any time. We may terminate accounts that violate these terms.
                </Text>
              </ScrollView>
            </View>
          </View>

          {/* Privacy Policy Section */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              Privacy Policy
            </Text>
            
            <View className="bg-gray-50 rounded-lg p-4 mb-4">
              <ScrollView className="max-h-40">
                <Text className="text-sm text-gray-700 leading-5">
                  <Text className="font-semibold">Information We Collect{'\n'}</Text>
                  • Account information (name, email){'\n'}
                  • Transaction data from connected bank accounts{'\n'}
                  • Usage analytics to improve our service{'\n\n'}
                  
                  <Text className="font-semibold">How We Use Your Information{'\n'}</Text>
                  • To provide and improve our services{'\n'}
                  • To sync your transaction data{'\n'}
                  • To send important account notifications{'\n\n'}
                  
                  <Text className="font-semibold">Data Security{'\n'}</Text>
                  • All data is encrypted in transit and at rest{'\n'}
                  • We use industry-standard security measures{'\n'}
                  • Bank connections use read-only access through Plaid{'\n\n'}
                  
                  <Text className="font-semibold">Data Sharing{'\n'}</Text>
                  • We do not sell your personal information{'\n'}
                  • We may share anonymized usage data for analytics{'\n'}
                  • We may disclose information if required by law{'\n\n'}
                  
                  <Text className="font-semibold">Your Rights{'\n'}</Text>
                  • You can request deletion of your data{'\n'}
                  • You can export your transaction history{'\n'}
                  • You can disconnect bank accounts at any time{'\n\n'}
                  
                  <Text className="font-semibold">Contact Us{'\n'}</Text>
                  For privacy questions, contact us at privacy@checkmate-app.com
                </Text>
              </ScrollView>
            </View>
          </View>

          {/* Agreement Checkboxes */}
          <View className="mb-6">
            <CheckBox
              value={hasReadTerms}
              onValueChange={setHasReadTerms}
              label="I have read and agree to the Terms & Conditions"
            />
            
            <CheckBox
              value={hasReadPrivacy}
              onValueChange={setHasReadPrivacy}
              label="I have read and agree to the Privacy Policy"
            />
          </View>

          {/* Buttons */}
          <View className="flex-row space-x-3 mb-8">
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
                hasReadTerms && hasReadPrivacy 
                  ? 'bg-green-500' 
                  : 'bg-gray-300'
              }`}
            >
              <Text className={`font-semibold ${
                hasReadTerms && hasReadPrivacy 
                  ? 'text-white' 
                  : 'text-gray-500'
              }`}>
                Accept & Continue
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Regular terms view (for settings)
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
          Terms and Conditions
        </Text>
      </View>

      <ScrollView className="flex-1 px-4 py-6">
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
              Welcome to CheckMate ("we," "our," or "us"). These Terms and Conditions ("Terms") govern your use of our mobile application CheckMate (the "Service") operated by CheckMate Inc.
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
              By downloading, installing, or using CheckMate, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy. These Terms constitute a legally binding agreement between you and CheckMate Inc.
            </Text>
          </View>

          {/* Description of Service */}
          <View>
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              3. Description of Service
            </Text>
            <Text className="text-base text-gray-700 leading-6">
              CheckMate is a digital checkbook register application that allows users to:
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
              You must be at least 18 years old to use CheckMate. By using the Service, you represent and warrant that you are at least 18 years of age and have the legal capacity to enter into these Terms.
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
              CheckMate uses Plaid and other third-party services to connect to your bank accounts. By connecting your bank account, you authorize us to:
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
              You may not use CheckMate to:
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
              While we strive to provide accurate financial data, CheckMate is not a substitute for professional financial advice. You are responsible for:
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
              CheckMate Inc. shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or use, incurred by you or any third party, whether in an action in contract or tort, even if we have been advised of the possibility of such damages.
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
    </SafeAreaView>
  );
};

export default TermsAndConditionsScreen;