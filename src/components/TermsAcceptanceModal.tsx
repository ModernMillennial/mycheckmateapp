import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  visible: boolean;
  onAccept: () => void;
  onViewTerms: () => void;
  onViewPrivacy: () => void;
}

const TermsAcceptanceModal: React.FC<Props> = ({ 
  visible, 
  onAccept, 
  onViewTerms, 
  onViewPrivacy 
}) => {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const handleContinue = () => {
    if (!termsAccepted || !privacyAccepted) {
      Alert.alert(
        'Agreement Required',
        'Please accept both the Terms of Service and Privacy Policy to continue using Checkmate.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    onAccept();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView className="flex-1 bg-white">
        {/* Header */}
        <View className="px-6 py-4 border-b border-gray-200">
          <View className="items-center mb-4">
            <View className="bg-blue-500 w-16 h-16 rounded-2xl items-center justify-center mb-3">
              <Ionicons name="shield-checkmark" size={32} color="white" />
            </View>
            <Text className="text-2xl font-bold text-gray-900 mb-2">
              Welcome to Checkmate!
            </Text>
            <Text className="text-gray-600 text-center">
              Before you start managing your finances, please review and accept our agreements
            </Text>
          </View>
        </View>

        <ScrollView className="flex-1 px-6 py-6">
          {/* Welcome Message */}
          <View className="mb-8">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              🎉 Account Created Successfully!
            </Text>
            <Text className="text-gray-700 leading-6">
              Your Checkmate account has been created. To ensure a secure and transparent experience, 
              please review and accept our Terms of Service and Privacy Policy.
            </Text>
          </View>

          {/* Terms of Service */}
          <View className="mb-6">
            <View className="bg-gray-50 rounded-xl p-5 mb-4">
              <View className="flex-row items-center mb-3">
                <Ionicons name="document-text" size={24} color="#3B82F6" />
                <Text className="text-lg font-semibold text-gray-900 ml-3">
                  Terms of Service
                </Text>
              </View>
              <Text className="text-gray-700 mb-4 leading-5">
                Our Terms of Service outline your rights and responsibilities when using Checkmate, 
                including account usage, data handling, and service limitations.
              </Text>
              <Pressable
                onPress={onViewTerms}
                className="bg-blue-500 rounded-lg py-3 px-4 items-center"
              >
                <Text className="text-white font-medium">
                  Read Terms of Service
                </Text>
              </Pressable>
            </View>

            <Pressable
              onPress={() => setTermsAccepted(!termsAccepted)}
              className="flex-row items-center"
            >
              <View className={`w-6 h-6 rounded border-2 ${termsAccepted ? 'bg-blue-500 border-blue-500' : 'border-gray-300'} items-center justify-center mr-3`}>
                {termsAccepted && (
                  <Ionicons name="checkmark" size={14} color="white" />
                )}
              </View>
              <Text className="text-gray-800 flex-1">
                I have read and agree to the Terms of Service
              </Text>
            </Pressable>
          </View>

          {/* Privacy Policy */}
          <View className="mb-8">
            <View className="bg-gray-50 rounded-xl p-5 mb-4">
              <View className="flex-row items-center mb-3">
                <Ionicons name="shield-outline" size={24} color="#10B981" />
                <Text className="text-lg font-semibold text-gray-900 ml-3">
                  Privacy Policy
                </Text>
              </View>
              <Text className="text-gray-700 mb-4 leading-5">
                Our Privacy Policy explains how we collect, use, and protect your personal and 
                financial information to provide you with secure banking services.
              </Text>
              <Pressable
                onPress={onViewPrivacy}
                className="bg-green-500 rounded-lg py-3 px-4 items-center"
              >
                <Text className="text-white font-medium">
                  Read Privacy Policy
                </Text>
              </Pressable>
            </View>

            <Pressable
              onPress={() => setPrivacyAccepted(!privacyAccepted)}
              className="flex-row items-center"
            >
              <View className={`w-6 h-6 rounded border-2 ${privacyAccepted ? 'bg-green-500 border-green-500' : 'border-gray-300'} items-center justify-center mr-3`}>
                {privacyAccepted && (
                  <Ionicons name="checkmark" size={14} color="white" />
                )}
              </View>
              <Text className="text-gray-800 flex-1">
                I have read and agree to the Privacy Policy
              </Text>
            </Pressable>
          </View>

          {/* Important Notice */}
          <View className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <View className="flex-row items-start">
              <Ionicons name="information-circle" size={20} color="#F59E0B" />
              <View className="ml-3 flex-1">
                <Text className="text-amber-800 font-medium text-sm mb-1">
                  Important Notice
                </Text>
                <Text className="text-amber-700 text-sm leading-5">
                  By accepting these agreements, you're agreeing to how Checkmate handles your 
                  financial data and the terms under which you can use our services.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Footer Actions */}
        <View className="px-6 py-4 border-t border-gray-200">
          <Pressable
            onPress={handleContinue}
            className={`${
              termsAccepted && privacyAccepted 
                ? 'bg-blue-500 active:bg-blue-600' 
                : 'bg-gray-300'
            } rounded-lg py-4 items-center justify-center mb-3`}
            disabled={!termsAccepted || !privacyAccepted}
          >
            <Text className={`${
              termsAccepted && privacyAccepted ? 'text-white' : 'text-gray-500'
            } text-base font-semibold`}>
              Accept & Continue to Checkmate
            </Text>
          </Pressable>

          <Text className="text-xs text-gray-500 text-center">
            You must accept both agreements to use Checkmate
          </Text>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default TermsAcceptanceModal;