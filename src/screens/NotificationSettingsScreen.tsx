import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Switch,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTransactionStore } from '../state/transactionStore';
import { requestNotificationPermissions } from '../utils/notifications';

interface Props {
  navigation: any;
}

const NotificationSettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { notificationSettings, updateNotificationSettings } = useTransactionStore();
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [thresholdInput, setThresholdInput] = useState(notificationSettings.overdraftThreshold.toString());

  useEffect(() => {
    checkNotificationPermissions();
  }, []);

  const checkNotificationPermissions = async () => {
    const granted = await requestNotificationPermissions();
    setPermissionGranted(granted);
    
    if (!granted) {
      Alert.alert(
        'Notifications Disabled',
        'Please enable notifications in your device settings to receive bank transaction alerts.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleThresholdSave = () => {
    const threshold = parseFloat(thresholdInput) || 0;
    if (threshold < 0) {
      Alert.alert('Invalid Amount', 'Please enter a positive amount for the overdraft threshold.');
      return;
    }
    
    updateNotificationSettings({ overdraftThreshold: threshold });
    Alert.alert('Saved', 'Overdraft threshold updated successfully.');
  };

  const testDebitNotification = () => {
    // Simulate a test debit transaction notification
    Alert.alert(
      'Test Notification',
      'This would trigger a debit notification:\n\n💳 Transaction Posted\n-$25.00 to Coffee Shop\nNew balance: $1,234.56'
    );
  };

  const testDepositNotification = () => {
    // Simulate a test deposit notification
    Alert.alert(
      'Test Notification', 
      'This would trigger a deposit notification:\n\n💰 Deposit Received\n+$2,500.00 from Payroll\nNew balance: $3,734.56'
    );
  };

  const testOverdraftNotification = () => {
    // Simulate a test overdraft warning
    Alert.alert(
      'Test Notification',
      'This would trigger an overdraft warning:\n\n⚠️ Low Balance Warning\nYour balance is $75.00, which is below your alert threshold of $100.00'
    );
  };

  const SettingRow = ({ 
    title, 
    subtitle, 
    value, 
    onValueChange, 
    disabled = false 
  }: { 
    title: string; 
    subtitle?: string; 
    value: boolean; 
    onValueChange: (value: boolean) => void;
    disabled?: boolean;
  }) => (
    <View className={`flex-row items-center justify-between p-4 border-b border-gray-100 ${disabled ? 'opacity-50' : ''}`}>
      <View className="flex-1">
        <Text className="text-base font-medium text-gray-900">{title}</Text>
        {subtitle && (
          <Text className="text-sm text-gray-500 mt-1">{subtitle}</Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled || !permissionGranted}
        trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
        thumbColor="#FFFFFF"
      />
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
          Notification Settings
        </Text>
      </View>

      <ScrollView className="flex-1">
        {/* Permission Status */}
        <View className="mt-6 mx-4 p-4 bg-gray-50 rounded-lg">
          <View className="flex-row items-center">
            <Ionicons
              name={permissionGranted ? 'checkmark-circle' : 'alert-circle'}
              size={20}
              color={permissionGranted ? '#10B981' : '#F59E0B'}
            />
            <Text className="text-sm font-medium text-gray-700 ml-2">
              Notifications {permissionGranted ? 'Enabled' : 'Disabled'}
            </Text>
          </View>
          {!permissionGranted && (
            <Text className="text-sm text-gray-600 mt-2">
              Enable notifications in your device settings to receive alerts.
            </Text>
          )}
        </View>

        {/* Transaction Notifications */}
        <View className="mt-8">
          <Text className="text-sm font-semibold text-gray-500 uppercase tracking-wide px-4 mb-3">
            Transaction Alerts
          </Text>
          
          <View className="bg-white">
            <SettingRow
              title="Deposit Notifications"
              subtitle="Get notified when money is deposited to your account"
              value={notificationSettings.depositsEnabled}
              onValueChange={(value) => updateNotificationSettings({ depositsEnabled: value })}
            />
            
            <SettingRow
              title="Debit Notifications"
              subtitle="Get notified when money is withdrawn from your account"
              value={notificationSettings.debitsEnabled}
              onValueChange={(value) => updateNotificationSettings({ debitsEnabled: value })}
            />
          </View>
        </View>

        {/* Overdraft Protection */}
        <View className="mt-8">
          <Text className="text-sm font-semibold text-gray-500 uppercase tracking-wide px-4 mb-3">
            Overdraft Protection
          </Text>
          
          <View className="bg-white">
            <SettingRow
              title="Low Balance Warnings"
              subtitle="Get notified when your balance falls below the threshold"
              value={notificationSettings.overdraftWarningEnabled}
              onValueChange={(value) => updateNotificationSettings({ overdraftWarningEnabled: value })}
            />
            
            <View className="p-4 border-b border-gray-100">
              <Text className="text-base font-medium text-gray-900 mb-2">
                Alert Threshold
              </Text>
              <Text className="text-sm text-gray-500 mb-3">
                Receive warnings when your balance drops below this amount
              </Text>
              <View className="flex-row items-center">
                <Text className="text-xl font-medium text-gray-600 mr-2">$</Text>
                <TextInput
                  className="flex-1 p-3 border border-gray-300 rounded-lg text-base mr-3"
                  placeholder="100.00"
                  value={thresholdInput}
                  onChangeText={setThresholdInput}
                  keyboardType="decimal-pad"
                />
                <Pressable
                  onPress={handleThresholdSave}
                  className="px-4 py-3 bg-blue-500 rounded-lg"
                >
                  <Text className="text-white font-medium">Save</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        {/* Test Notifications */}
        <View className="mt-8">
          <Text className="text-sm font-semibold text-gray-500 uppercase tracking-wide px-4 mb-3">
            Test Notifications
          </Text>
          
          <View className="bg-white">
            <Pressable
              onPress={testDepositNotification}
              className="flex-row items-center justify-between p-4 border-b border-gray-100"
            >
              <View className="flex-1">
                <Text className="text-base font-medium text-gray-900">Test Deposit Alert</Text>
                <Text className="text-sm text-gray-500 mt-1">Preview deposit notification</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </Pressable>
            
            <Pressable
              onPress={testDebitNotification}
              className="flex-row items-center justify-between p-4 border-b border-gray-100"
            >
              <View className="flex-1">
                <Text className="text-base font-medium text-gray-900">Test Debit Alert</Text>
                <Text className="text-sm text-gray-500 mt-1">Preview debit notification</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </Pressable>
            
            <Pressable
              onPress={testOverdraftNotification}
              className="flex-row items-center justify-between p-4"
            >
              <View className="flex-1">
                <Text className="text-base font-medium text-gray-900">Test Low Balance Alert</Text>
                <Text className="text-sm text-gray-500 mt-1">Preview overdraft warning</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </Pressable>
          </View>
        </View>

        {/* Info Section */}
        <View className="mx-4 mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <View className="flex-row items-start">
            <Ionicons name="information-circle" size={20} color="#3B82F6" />
            <View className="ml-3 flex-1">
              <Text className="text-sm font-medium text-blue-800">
                How Notifications Work
              </Text>
              <Text className="text-sm text-blue-700 mt-1">
                • Notifications are triggered when new bank transactions are synced{'\n'}
                • Overdraft warnings check your balance after each transaction{'\n'}
                • All notifications respect your device's Do Not Disturb settings
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default NotificationSettingsScreen;