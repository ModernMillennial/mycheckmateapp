import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import analytics from '../utils/analytics';
import crashReporting from '../utils/crashReporting';
import Button from '../components/Button';

interface Props {
  navigation: any;
}

const AnalyticsSettingsScreen: React.FC<Props> = ({ navigation }) => {
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [crashReportingEnabled, setCrashReportingEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Initialize services
        await analytics.initialize();
        await crashReporting.initialize();
        
        // Get current settings
        setAnalyticsEnabled(analytics.isAnalyticsEnabled());
        setCrashReportingEnabled(crashReporting.isCrashReportingEnabled());
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading analytics settings:', error);
        setLoading(false);
      }
    };

    loadSettings();
    
    // Log screen view
    analytics.logScreenView('AnalyticsSettings');
  }, []);

  // Toggle analytics
  const toggleAnalytics = async (value: boolean) => {
    try {
      await analytics.setEnabled(value);
      setAnalyticsEnabled(value);
      
      // Log the change if analytics is being enabled
      if (value) {
        analytics.logEvent(analytics.EventType.CUSTOM, {
          event_name: 'analytics_enabled_changed',
          enabled: value,
        });
      }
    } catch (error) {
      console.error('Error toggling analytics:', error);
      Alert.alert('Error', 'Failed to update analytics settings');
    }
  };

  // Toggle crash reporting
  const toggleCrashReporting = async (value: boolean) => {
    try {
      await crashReporting.setEnabled(value);
      setCrashReportingEnabled(value);
      
      // Log the change
      analytics.logEvent(analytics.EventType.CUSTOM, {
        event_name: 'crash_reporting_enabled_changed',
        enabled: value,
      });
    } catch (error) {
      console.error('Error toggling crash reporting:', error);
      Alert.alert('Error', 'Failed to update crash reporting settings');
    }
  };

  // Test crash reporting
  const testCrashReporting = () => {
    Alert.alert(
      'Test Crash Reporting',
      'This will simulate a crash to test the crash reporting system. The app will not actually crash.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Test',
          onPress: () => {
            try {
              // Log that we're testing crash reporting
              analytics.logEvent(analytics.EventType.CUSTOM, {
                event_name: 'crash_reporting_test',
              });
              
              // Simulate an error
              const testError = new Error('This is a test error for crash reporting');
              crashReporting.reportError(testError, { source: 'user_initiated_test' });
              
              // Show success message
              Alert.alert(
                'Test Successful',
                'A test error was sent to the crash reporting system.'
              );
            } catch (error) {
              console.error('Error testing crash reporting:', error);
              Alert.alert('Error', 'Failed to test crash reporting');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading settings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Button
          title="Back"
          onPress={() => navigation.goBack()}
          variant="outline"
          size="small"
          style={styles.backButton}
        />
        <Text style={styles.headerTitle}>Analytics & Privacy</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Analytics Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Usage Analytics</Text>
          <Text style={styles.sectionDescription}>
            Help us improve the app by sharing anonymous usage data. This data helps us understand how people use the app and identify areas for improvement.
          </Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Enable Analytics</Text>
              <Text style={styles.settingDescription}>
                Share anonymous usage data to help improve the app
              </Text>
            </View>
            <Switch
              value={analyticsEnabled}
              onValueChange={toggleAnalytics}
              trackColor={{ false: '#D1D5DB', true: '#BFDBFE' }}
              thumbColor={analyticsEnabled ? '#3B82F6' : '#F3F4F6'}
            />
          </View>
        </View>

        {/* Crash Reporting Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Crash Reporting</Text>
          <Text style={styles.sectionDescription}>
            Help us identify and fix bugs by sending crash reports. These reports include technical information about the app state when it crashes.
          </Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Enable Crash Reporting</Text>
              <Text style={styles.settingDescription}>
                Send crash reports to help fix bugs
              </Text>
            </View>
            <Switch
              value={crashReportingEnabled}
              onValueChange={toggleCrashReporting}
              trackColor={{ false: '#D1D5DB', true: '#BFDBFE' }}
              thumbColor={crashReportingEnabled ? '#3B82F6' : '#F3F4F6'}
            />
          </View>
          
          <Button
            title="Test Crash Reporting"
            onPress={testCrashReporting}
            variant="outline"
            style={styles.testButton}
            disabled={!crashReportingEnabled}
          />
        </View>

        {/* Data Collection Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What We Collect</Text>
          
          <View style={styles.infoRow}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" style={styles.infoIcon} />
            <Text style={styles.infoText}>
              <Text style={styles.bold}>Anonymous usage data:</Text> Which features you use and how often
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" style={styles.infoIcon} />
            <Text style={styles.infoText}>
              <Text style={styles.bold}>Device information:</Text> Device model, operating system version
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" style={styles.infoIcon} />
            <Text style={styles.infoText}>
              <Text style={styles.bold}>App performance:</Text> Crash reports and performance metrics
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="close-circle" size={20} color="#EF4444" style={styles.infoIcon} />
            <Text style={styles.infoText}>
              <Text style={styles.bold}>We never collect:</Text> Your financial data, transaction details, or personal information
            </Text>
          </View>
        </View>

        {/* Privacy Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy Commitment</Text>
          <Text style={styles.paragraphText}>
            We take your privacy seriously. All data is collected anonymously and is used solely to improve the app experience. We never sell your data to third parties.
          </Text>
          <Text style={styles.paragraphText}>
            You can change these settings at any time. Disabling analytics or crash reporting will not affect your ability to use the app.
          </Text>
          <Text style={styles.paragraphText}>
            For more information, please see our Privacy Policy.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  backButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingInfo: {
    flex: 1,
    paddingRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  testButton: {
    marginTop: 16,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  infoIcon: {
    marginTop: 2,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  bold: {
    fontWeight: '600',
  },
  paragraphText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
});

export default AnalyticsSettingsScreen;
