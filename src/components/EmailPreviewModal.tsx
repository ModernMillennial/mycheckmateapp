import React from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EmailPreviewModalProps {
  visible: boolean;
  onClose: () => void;
  email: string;
  resetToken: string;
}

const EmailPreviewModal: React.FC<EmailPreviewModalProps> = ({
  visible,
  onClose,
  email,
  resetToken,
}) => {
  const resetUrl = `https://your-app-domain.com/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
          <Text className="text-lg font-semibold text-gray-900">Email Preview</Text>
          <Pressable onPress={onClose} className="p-2">
            <Ionicons name="close" size={24} color="#374151" />
          </Pressable>
        </View>

        <ScrollView className="flex-1 bg-gray-100">
          <View className="mx-4 my-6 bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Email Header */}
            <View className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <Text className="text-lg font-semibold text-gray-900">
                Checkmate - Password Reset Request
              </Text>
              <View className="mt-2">
                <Text className="text-sm text-gray-600">
                  <Text className="font-medium">To:</Text> {email}
                </Text>
                <Text className="text-sm text-gray-600">
                  <Text className="font-medium">From:</Text> support@mycheckmateapp.com
                </Text>
                <Text className="text-sm text-gray-600">
                  <Text className="font-medium">Subject:</Text> Checkmate - Password Reset Request
                </Text>
              </View>
            </View>

            {/* Email Body */}
            <View className="p-6">
              <Text className="text-base text-gray-900 mb-4">Hello,</Text>
              
              <Text className="text-base text-gray-900 mb-4">
                We received a request to reset your password for your Checkmate account associated with this email address.
              </Text>
              
              <Text className="text-base text-gray-900 mb-4">
                To reset your password, please click the link below:
              </Text>
              
              <View className="bg-blue-50 p-4 rounded-lg mb-4">
                <Text className="text-blue-600 text-sm break-all">
                  {resetUrl}
                </Text>
              </View>
              
              <Text className="text-base text-gray-900 mb-4">
                This link will expire in 1 hour for security reasons.
              </Text>
              
              <Text className="text-base text-gray-900 mb-6">
                If you didn{"'"}t request this password reset, please ignore this email. Your account remains secure.
              </Text>
              
              <Text className="text-base text-gray-900">
                Best regards,{'\n'}
                The Checkmate Team
              </Text>
            </View>
          </View>

          {/* Demo Information */}
          <View className="mx-4 mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <View className="flex-row items-center mb-2">
              <Ionicons name="information-circle" size={20} color="#D97706" />
              <Text className="ml-2 text-sm font-medium text-yellow-800">
                Demo Mode Information
              </Text>
            </View>
            <Text className="text-sm text-yellow-700">
              In a production app, this email would be automatically sent to the user{"'"}s email address. 
              For demo purposes, we{"'"}re showing you the email content and reset token here.
            </Text>
            <View className="mt-3 bg-white p-3 rounded border">
              <Text className="text-xs text-gray-600 mb-1">Reset Token:</Text>
              <Text className="text-sm font-mono text-gray-900 break-all">
                {resetToken}
              </Text>
            </View>
          </View>
        </ScrollView>

        <View className="px-4 py-4 border-t border-gray-200">
          <Pressable
            onPress={onClose}
            className="bg-blue-500 rounded-lg py-3 items-center justify-center"
          >
            <Text className="text-white text-base font-semibold">
              Got it
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default EmailPreviewModal;