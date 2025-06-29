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
import InitialBankSyncScreen from './InitialBankSyncScreen';
import Calculator from '../components/Calculator';
import * as MailComposer from 'expo-mail-composer';

interface Props {
  navigation: any;
}

const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { settings, updateSettings, syncBankTransactions, getActiveAccount, updateAccount } = useTransactionStore();
  const { user, logout } = useAuthStore();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showInitialSync, setShowInitialSync] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showHelp, setShowHelp] = useState(false);




  
  const activeAccount = getActiveAccount();

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out? You will need to sign in again to access your account.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            logout();
            // Navigation will automatically redirect to login due to auth state change
          }
        }
      ]
    );
  };

  const handleSyncBank = async () => {
    setIsLoading(true);
    
    const activeAccount = getActiveAccount();
    if (!activeAccount) {
      Alert.alert('No Active Account', 'Please select an account first.');
      setIsLoading(false);
      return;
    }
    
    // Simulate bank sync with mock data
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      const mockBankTransactions = [
        // This will convert the "Grocery Store" manual transaction (exact match)
        {
          userId: 'user-1',
          accountId: activeAccount.id,
          date: new Date(Date.now() - 86400000 * 6).toISOString().split('T')[0], // 6 days ago (within matching window)
          payee: 'SAFEWAY GROCERY STORE #1234',
          amount: -125.67,
          source: 'bank' as const,
          notes: 'Debit card purchase',
          reconciled: false,
        },
        // This will convert the "Shell Gas Station" manual transaction  
        {
          userId: 'user-1',
          accountId: activeAccount.id,
          date: new Date(Date.now() - 86400000 * 1).toISOString().split('T')[0], // Yesterday (1 day after manual entry)
          payee: 'SHELL OIL STATION #4567',
          amount: -45.00,
          source: 'bank' as const,
          notes: 'Fuel purchase',
          reconciled: false,
        },
        // This will convert the "Local Restaurant" manual transaction
        {
          userId: 'user-1',
          accountId: activeAccount.id,
          date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow (1 day after manual entry)
          payee: 'LOCAL RESTAURANT & BAR',
          amount: -28.75,
          source: 'bank' as const,
          notes: 'Card payment',
          reconciled: false,
        },
        // New bank transaction with no manual equivalent
        {
          userId: 'user-1',
          accountId: activeAccount.id,
          date: new Date().toISOString().split('T')[0], // Today
          payee: 'Amazon.com Purchase',
          amount: -89.99,
          source: 'bank' as const,
          notes: 'Online purchase',
          reconciled: false,
        },
        // Recent deposit that will trigger notification
        {
          userId: 'user-1',
          accountId: activeAccount.id,
          date: new Date().toISOString().split('T')[0], // Today
          payee: 'Direct Deposit Payroll',
          amount: 500.00,
          source: 'bank' as const,
          notes: 'Bi-weekly salary',
          reconciled: false,
        },
      ];
      
      const { transactions: currentTransactions } = useTransactionStore.getState();
      const manualCountBefore = currentTransactions.filter(t => t.source === 'manual').length;
      const bankCountBefore = currentTransactions.filter(t => t.source === 'bank').length;
      
      syncBankTransactions(mockBankTransactions);
      updateSettings({ bankLinked: true });
      
      // Check how many manual transactions were converted
      setTimeout(() => {
        const { transactions: updatedTransactions } = useTransactionStore.getState();
        const manualCountAfter = updatedTransactions.filter(t => t.source === 'manual').length;
        const bankCountAfter = updatedTransactions.filter(t => t.source === 'bank').length;
        
        const convertedCount = manualCountBefore - manualCountAfter;
        const newBankCount = bankCountAfter - bankCountBefore;
        
        let message = `Bank sync completed successfully!`;
        
        if (convertedCount > 0) {
          message += `\n\n✅ ${convertedCount} manual entr${convertedCount > 1 ? 'ies were' : 'y was'} converted to bank transactions (no duplicates created).`;
        }
        
        if (newBankCount > convertedCount) {
          const newCount = newBankCount - convertedCount;
          message += `\n\n📥 ${newCount} new bank transaction${newCount > 1 ? 's were' : ' was'} imported.`;
        }
        
        if (convertedCount === 0 && newBankCount === 0) {
          message += '\n\nNo new transactions found.';
        }
        
        Alert.alert('Sync Complete', message);
      }, 100);
      
    } catch (error) {
      Alert.alert('Sync Failed', 'Unable to sync with bank account. Please try again later.');
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
    Alert.alert(
      'Help & Support 🤝',
      'How can we help you today?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'User Guide', 
          onPress: showUserGuide,
          style: 'default'
        },
        { 
          text: 'Contact Support', 
          onPress: contactSupport,
          style: 'default'
        },
        { 
          text: 'FAQ', 
          onPress: showFAQ,
          style: 'default'
        }
      ]
    );
  };

  const showUserGuide = () => {
    Alert.alert(
      'CheckMate User Guide 📚',
      `Welcome to CheckMate! Here's how to use the app:

🏦 BANK CONNECTION:
• Go to Settings → Initial Bank Setup
• Connect your bank account via Plaid
• Select a starting transaction point

💰 ADDING TRANSACTIONS:
• Tap "Add" button on main screen
• Enter transaction details
• Manual entries show "NOT POSTED"

🔄 BANK SYNC:
• Use Settings → Sync Bank Transactions
• Manual entries convert to "POSTED" when matched
• Pull down on main screen to refresh

🧮 BALANCE TRACKING:
• Running balance calculated automatically
• Green = credits, Red = debits
• Blue = posted transactions

🛠️ TOOLS:
• Built-in calculator in Settings
• Transaction filtering options
• Monthly register reset option

📱 DEMO MODE:
• Try "Start Demo" for sample data
• "Demo Conversion" shows how sync works`,
      [{ text: 'Got it!' }]
    );
  };

  const showFAQ = () => {
    Alert.alert(
      'Frequently Asked Questions ❓',
      `Q: Why do some transactions show "NOT POSTED"?
A: Manual entries show "NOT POSTED" until they're matched with bank transactions during sync.

Q: How often should I sync with my bank?
A: We recommend syncing daily or weekly to keep your register up-to-date.

Q: Can I use CheckMate without connecting a bank?
A: Yes! You can manually track all transactions without bank connection.

Q: What happens if I delete a transaction?
A: Deleted transactions will be removed from your register and balance calculations.

Q: Is my financial data secure?
A: Yes, we use bank-level encryption and never store your banking credentials.

Q: Can I export my transaction data?
A: Currently, you can email transaction reports through the bug report feature.

Q: How do I reset my register?
A: Enable "Monthly Reset" in Settings to start fresh each month, or contact support for a full reset.`,
      [{ text: 'Thanks!' }]
    );
  };

  const contactSupport = () => {
    Alert.alert(
      'Contact Support 📞',
      'Need help with CheckMate? Here are your options:\n\n📧 Email: support@checkmate-app.com\n📞 Phone: 1-800-CHECKMATE\n💬 Live Chat: checkmate-app.com/support\n\nWould you like to compose an email now?',
      [
        { text: 'Not Now', style: 'cancel' },
        {
          text: 'Send Email',
          onPress: async () => {
            try {
              const isAvailable = await MailComposer.isAvailableAsync();
              if (isAvailable) {
                const supportInfo = `
CHECKMATE SUPPORT REQUEST
=======================
App Version: 1.0.0
Device: React Native / Expo
Account: ${activeAccount?.name || 'Not connected'}
Transactions: ${getActiveTransactions()?.length || 0}

SUPPORT REQUEST:
[Please describe your issue or question]

CONTACT INFO:
Email: 
Phone: (optional)
`;
                
                await MailComposer.composeAsync({
                  recipients: ['support@checkmate-app.com'],
                  subject: 'CheckMate Support Request',
                  body: supportInfo,
                  isHtml: false,
                });
              } else {
                Alert.alert(
                  'Email Not Available',
                  'Email is not configured on this device. Please email us directly at support@checkmate-app.com',
                  [{ text: 'OK' }]
                );
              }
            } catch (error) {
              console.error('Email error:', error);
              Alert.alert(
                'Email Error',
                'Could not open email. Please contact us directly at support@checkmate-app.com',
                [{ text: 'OK' }]
              );
            }
          }
        }
      ]
    );
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
          onPress={() => navigation.goBack()}
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

        {/* Account Management Section */}
        <View className="mt-8">
          <Text className="text-sm font-semibold text-gray-500 uppercase tracking-wide px-4 mb-3">
            Account Management
          </Text>
          
          <View className="bg-white">
            <SettingRow
              title="Manage Accounts"
              subtitle="Add, edit, or switch between your bank accounts"
              onPress={() => navigation.navigate('Accounts')}
              rightComponent={<Ionicons name="card-outline" size={20} color="#9CA3AF" />}
            />
            
            <SettingRow
              title="User Profile"
              subtitle={`Signed in as ${user?.firstName} ${user?.lastName}`}
              rightComponent={<Ionicons name="person-outline" size={20} color="#9CA3AF" />}
            />
            
            <SettingRow
              title="Sign Out"
              subtitle="Sign out of your CheckMate account"
              onPress={handleLogout}
              rightComponent={<Ionicons name="log-out-outline" size={20} color="#EF4444" />}
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
              onPress={() => navigation.navigate('NotificationSettings')}
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
          </View>
        </View>



        {/* App Information Section */}
        <View className="mt-8">
          <Text className="text-sm font-semibold text-gray-500 uppercase tracking-wide px-4 mb-3">
            App Information
          </Text>
          
          <View className="bg-white">
            <SettingRow
              title="About CheckMate"
              subtitle="Version 1.0.0"
              rightComponent={<Ionicons name="information-circle-outline" size={20} color="#9CA3AF" />}
            />
            
            <SettingRow
              title="Terms & Conditions"
              subtitle="View our terms and conditions"
              onPress={() => navigation.navigate('TermsAndConditions', { isFirstTime: false })}
              rightComponent={<Ionicons name="document-text-outline" size={20} color="#9CA3AF" />}
            />
            
            <SettingRow
              title="Privacy Policy"
              subtitle="View our privacy policy"
              onPress={() => navigation.navigate('PrivacyPolicy', { isFirstTime: false })}
              rightComponent={<Ionicons name="shield-outline" size={20} color="#9CA3AF" />}
            />
            
            <SettingRow
              title="Help & Support"
              subtitle="Get help with using the app"
              onPress={handleHelpAndSupport}
              rightComponent={<Ionicons name="help-circle-outline" size={20} color="#9CA3AF" />}
            />
            
            <SettingRow
              title="Sign Out"
              subtitle="Sign out of your account"
              onPress={() => {
                Alert.alert(
                  'Sign Out',
                  'Are you sure you want to sign out? This will clear all your data.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { 
                      text: 'Sign Out', 
                      style: 'destructive',
                      onPress: () => {
                        logout();
                        // Navigation will automatically redirect to login screen
                      }
                    }
                  ]
                );
              }}
              rightComponent={<Ionicons name="log-out-outline" size={20} color="#EF4444" />}
            />
          </View>
        </View>

        {/* Mock Bank Notice */}
        <View className="mx-4 mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <View className="flex-row items-start">
            <Ionicons name="information-circle" size={20} color="#F59E0B" />
            <View className="ml-3 flex-1">
              <Text className="text-sm font-medium text-yellow-800">
                Demo Mode
              </Text>
              <Text className="text-sm text-yellow-700 mt-1">
                Bank sync currently uses mock data for demonstration purposes. 
                In a production app, this would connect to your actual bank account via Plaid or similar service.
              </Text>
            </View>
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