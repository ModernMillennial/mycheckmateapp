import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useTransactionStore } from '../state/transactionStore';
import { useAuthStore } from '../state/authStore';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

import InitialBankSyncScreen from './InitialBankSyncScreen';
import Calculator from '../components/Calculator';
import * as MailComposer from 'expo-mail-composer';

interface Props {
  navigation: StackNavigationProp<RootStackParamList>;
}

const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  // Safety check for navigation
  if (!navigation) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <Text className="text-red-500">Navigation error - please restart the app</Text>
        </View>
      </SafeAreaView>
    );
  }
  const { settings, updateSettings, syncBankTransactions, syncPlaidTransactions, getActiveAccount, updateAccountInfo, getActiveTransactions } = useTransactionStore();
  const { logout, deleteAccount } = useAuthStore();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showInitialSync, setShowInitialSync] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showHelp, setShowHelp] = useState(false);




  
  const activeAccount = getActiveAccount();



  const handleSyncBank = async () => {
    setIsLoading(true);
    
    const activeAccount = getActiveAccount();
    if (!activeAccount) {
      Alert.alert('No Active Account', 'Please select an account first.');
      setIsLoading(false);
      return;
    }
    
    // Real bank sync implementation
    try {
      if (!activeAccount.plaidAccessToken) {
        Alert.alert('Bank Not Connected', 'Please connect your bank account first.');
        setIsLoading(false);
        return;
      }
      
      // Sync transactions for the last 30 days
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      await syncPlaidTransactions(
        activeAccount.plaidAccessToken,
        activeAccount.id,
        startDate,
        endDate
      );
      
      Alert.alert('Sync Complete', 'Bank sync completed successfully!');
      
    } catch (error) {
      console.error('Bank sync error:', error);
      Alert.alert('Sync Failed', 'Unable to sync with bank account. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };





  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      updateSettings({ startDate: selectedDate.toISOString().split('T')[0] });
    }
  };



  const handleHelpAndSupport = () => {
    contactSupport();
  };



  const contactSupport = async () => {
    try {
      // Check if MailComposer is available before proceeding
      if (!MailComposer || typeof MailComposer.isAvailableAsync !== 'function') {
        Alert.alert(
          'Email Not Available',
          'Email functionality is not available on this device. Please contact us directly at support@mycheckmateapp.com',
          [{ text: 'OK' }]
        );
        return;
      }

      const isAvailable = await MailComposer.isAvailableAsync();
      if (isAvailable) {
        const supportInfo = `CHECKMATE SUPPORT REQUEST
=======================
App Version: 1.0.0
Device: React Native / Expo
Account: ${activeAccount?.name || 'Not connected'}
Transactions: ${getActiveTransactions()?.length || 0}

SUPPORT REQUEST:
[Please describe your question or issue]

ADDITIONAL DETAILS:
[Any additional information that might help]
`;
        
        await MailComposer.composeAsync({
          recipients: ['support@mycheckmateapp.com'],
          subject: 'Checkmate Support Request',
          body: supportInfo,
          isHtml: false,
        });
      } else {
        Alert.alert(
          'Email Not Available',
          'Email is not set up on this device. Please email us directly at support@mycheckmateapp.com',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error opening email:', error);
      Alert.alert(
        'Email Error',
        'Unable to open email. Please contact us at support@mycheckmateapp.com',
        [{ text: 'OK' }]
      );
    }
  };



  const SettingRow = ({ 
    title, 
    subtitle, 
    onPress, 
    rightComponent 
  }: { 
    title: string; 
    subtitle?: string; 
    onPress?: () => void; 
    rightComponent?: React.ReactNode;
  }) => (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between p-4 border-b border-gray-100"
    >
      <View className="flex-1">
        <Text className="text-base font-medium text-gray-900">{title}</Text>
        {subtitle && (
          <Text className="text-sm text-gray-500 mt-1">{subtitle}</Text>
        )}
      </View>
      {rightComponent}
    </Pressable>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-4 py-4 border-b border-gray-200">
        <Pressable
          onPress={() => {
            try {
              navigation.goBack();
            } catch (error) {
              console.error('Navigation error:', error);
            }
          }}
          className="p-2"
        >
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </Pressable>
        
        <Text className="text-lg font-semibold text-gray-900 ml-2">
          Settings
        </Text>
      </View>

      <ScrollView className="flex-1">
        {/* Bank Integration Section */}
        <View className="mt-6">
          <Text className="text-sm font-semibold text-gray-500 uppercase tracking-wide px-4 mb-3">
            Bank Integration
          </Text>
          
          <View className="bg-white">
            <SettingRow
              title="Bank Account Status"
              subtitle={settings.bankLinked ? 'Connected' : 'Not connected'}
              rightComponent={
                <View className="flex-row items-center">
                  <View
                    className={`w-3 h-3 rounded-full mr-2 ${
                      settings.bankLinked ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  />
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </View>
              }
            />

            {!settings.bankLinked && (
              <SettingRow
                title="Initial Bank Setup"
                subtitle="Connect your bank account with starting balance"
                onPress={() => setShowInitialSync(true)}
                rightComponent={<Ionicons name="add-circle-outline" size={20} color="#3B82F6" />}
              />
            )}
            
            <SettingRow
              title="Sync Bank Transactions"
              subtitle="Import recent transactions from your bank"
              onPress={handleSyncBank}
              rightComponent={
                isLoading ? (
                  <Text className="text-blue-500">Syncing...</Text>
                ) : (
                  <Ionicons name="sync-outline" size={20} color="#3B82F6" />
                )
              }
            />
            
            <SettingRow
              title="Sync Start Date"
              subtitle={`Import transactions from ${new Date(settings.startDate).toLocaleDateString()}`}
              onPress={() => setShowDatePicker(true)}
              rightComponent={
                <Ionicons name="calendar-outline" size={20} color="#9CA3AF" />
              }
            />
          </View>
        </View>





        {/* Register Settings Section */}
        <View className="mt-8">
          <Text className="text-sm font-semibold text-gray-500 uppercase tracking-wide px-4 mb-3">
            Register Settings
          </Text>
          
          <View className="bg-white">
            <View className="flex-row items-center justify-between p-4">
              <View className="flex-1">
                <Text className="text-base font-medium text-gray-900">
                  Monthly Reset
                </Text>
                <Text className="text-sm text-gray-500 mt-1">
                  Start a new register each month
                </Text>
              </View>
              <Switch
                value={settings.monthlyResetEnabled}
                onValueChange={(value) => updateSettings({ monthlyResetEnabled: value })}
                trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* Notifications Section */}
        <View className="mt-8">
          <Text className="text-sm font-semibold text-gray-500 uppercase tracking-wide px-4 mb-3">
            Notifications
          </Text>
          
          <View className="bg-white">
            <SettingRow
              title="Push Notifications"
              subtitle="Configure alerts for deposits, debits, and overdrafts"
              onPress={() => {
                try {
                  navigation.navigate('NotificationSettings');
                } catch (error) {
                  console.error('Navigation error:', error);
                }
              }}
              rightComponent={<Ionicons name="notifications-outline" size={20} color="#9CA3AF" />}
            />
          </View>
        </View>

        {/* Tools Section */}
        <View className="mt-8">
          <Text className="text-sm font-semibold text-gray-500 uppercase tracking-wide px-4 mb-3">
            Tools
          </Text>
          
          <View className="bg-white">
            <SettingRow
              title="Calculator"
              subtitle="Built-in calculator for quick calculations"
              onPress={() => setShowCalculator(true)}
              rightComponent={<Ionicons name="calculator-outline" size={20} color="#9CA3AF" />}
            />
            
            <SettingRow
              title="AI Assistant"
              subtitle="Ask questions about your account and get financial help"
              onPress={() => {
                try {
                  navigation.navigate('Chat');
                } catch (error) {
                  console.error('Navigation error:', error);
                }
              }}
              rightComponent={<Ionicons name="chatbubbles-outline" size={20} color="#9CA3AF" />}
            />
          </View>
        </View>



        {/* App Information Section */}
        <View className="mt-8">
          <Text className="text-sm font-semibold text-gray-500 uppercase tracking-wide px-4 mb-3">
            App Information
          </Text>
          
          <View className="bg-white">
            <SettingRow
              title="About Checkmate"
              subtitle="Version 1.0.0"
              onPress={() => {
                try {
                  navigation.navigate('About');
                } catch (error) {
                  console.error('Navigation error:', error);
                }
              }}
              rightComponent={<Ionicons name="information-circle-outline" size={20} color="#9CA3AF" />}
            />
            
            <SettingRow
              title="Terms & Conditions"
              subtitle="View our terms and conditions"
              onPress={() => {
                try {
                  navigation.navigate('TermsAndConditions', { isFirstTime: false });
                } catch (error) {
                  console.error('Navigation error:', error);
                }
              }}
              rightComponent={<Ionicons name="document-text-outline" size={20} color="#9CA3AF" />}
            />
            
            <SettingRow
              title="Privacy Policy"
              subtitle="View our privacy policy"
              onPress={() => {
                try {
                  navigation.navigate('PrivacyPolicy', { isFirstTime: false });
                } catch (error) {
                  console.error('Navigation error:', error);
                }
              }}
              rightComponent={<Ionicons name="shield-outline" size={20} color="#9CA3AF" />}
            />
            
            <SettingRow
              title="Contact Support"
              subtitle="Email support for help with the app"
              onPress={handleHelpAndSupport}
              rightComponent={<Ionicons name="mail-outline" size={20} color="#9CA3AF" />}
            />
          </View>
        </View>

        {/* Account Actions Section */}
        <View className="mt-8">
          <Text className="text-sm font-semibold text-gray-500 uppercase tracking-wide px-4 mb-3">
            Account Actions
          </Text>
          
          <View className="bg-white">
            <SettingRow
              title="Sign Out"
              subtitle="Sign out of your Checkmate account"
              onPress={() => {
                Alert.alert(
                  'Sign Out',
                  'Are you sure you want to sign out? Your data will remain on this device.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Sign Out',
                      style: 'destructive',
                      onPress: () => {
                        // Sign out user - navigation will automatically handle the redirect
                        logout();
                      }
                    }
                  ]
                );
              }}
              rightComponent={<Ionicons name="log-out-outline" size={20} color="#EF4444" />}
            />
            
            <SettingRow
              title="Delete Account"
              subtitle="Permanently delete your account and all data"
              onPress={() => {
                Alert.alert(
                  'Delete Account',
                  'This will permanently delete your Checkmate account and all associated data. This action cannot be undone.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Delete Account',
                      style: 'destructive',
                      onPress: () => {
                        Alert.alert(
                          'Final Confirmation',
                          'Are you absolutely sure? This will delete ALL your transactions, accounts, and settings permanently.',
                          [
                            { text: 'Cancel', style: 'cancel' },
                            {
                              text: 'Yes, Delete Everything',
                              style: 'destructive',
                              onPress: () => {
                                // Delete account and all associated data
                                deleteAccount();
                                try {
                                  navigation.reset({
                                    index: 0,
                                    routes: [{ name: 'Login' }],
                                  });
                                } catch (error) {
                                  console.error('Navigation error:', error);
                                  navigation.navigate('Login');
                                }
                              }
                            }
                          ]
                        );
                      }
                    }
                  ]
                );
              }}
              rightComponent={<Ionicons name="trash-outline" size={20} color="#EF4444" />}
            />
          </View>
        </View>


      </ScrollView>

      {/* Date Picker Modals */}
      {showDatePicker && (
        <DateTimePicker
          value={new Date(settings.startDate)}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}
      


      {/* Initial Bank Sync Modal */}
      <InitialBankSyncScreen
        visible={showInitialSync}
        onComplete={() => {
          setShowInitialSync(false);
          Alert.alert(
            'Bank Account Connected!',
            'Your bank account has been successfully connected and your transaction history has been imported.',
            [{ text: 'Great!' }]
          );
        }}
        onCancel={() => setShowInitialSync(false)}
      />

      {/* Calculator Modal */}
      <Calculator
        visible={showCalculator}
        onClose={() => setShowCalculator(false)}
      />
    </SafeAreaView>
  );
};

export default SettingsScreen;