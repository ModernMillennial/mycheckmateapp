import React, { useState, useEffect } from 'react';
import { View, Text, Switch, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import biometricAuth from '../utils/biometricAuth';
import sessionManager from '../utils/sessionManager';
import LoadingOverlay from '../components/LoadingOverlay';
import useLoading from '../hooks/useLoading';
import Button from '../components/Button';

interface Props {
  navigation: any;
}

const SecuritySettingsScreen: React.FC<Props> = ({ navigation }) => {
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricName, setBiometricName] = useState('Biometric Authentication');
  const [sessionTimeout, setSessionTimeout] = useState(5); // minutes
  const { isLoading, startLoading, stopLoading, withLoading } = useLoading();

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Load all security settings
  const loadSettings = async () => {
    await withLoading(async () => {
      // Initialize session manager
      await sessionManager.initialize();
      
      // Check biometric availability
      const available = await biometricAuth.isBiometricAvailable();
      setBiometricAvailable(available);
      
      if (available) {
        // Get biometric name
        const name = await biometricAuth.getBiometricName();
        setBiometricName(name);
        
        // Check if biometric is enabled
        const enabled = await biometricAuth.isBiometricEnabled();
        setBiometricEnabled(enabled);
      }
      
      // Get session timeout
      const timeout = sessionManager.getTimeoutMinutes();
      setSessionTimeout(timeout);
    });
  };

  // Toggle biometric authentication
  const toggleBiometric = async (value: boolean) => {
    try {
      startLoading();
      
      if (value) {
        // Authenticate before enabling
        const authenticated = await biometricAuth.authenticate(
          `Authenticate to enable ${biometricName}`
        );
        
        if (authenticated) {
          await biometricAuth.setBiometricEnabled(true);
          setBiometricEnabled(true);
        } else {
          // Authentication failed, don't enable
          return;
        }
      } else {
        // Disable biometric
        await biometricAuth.setBiometricEnabled(false);
        setBiometricEnabled(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update biometric settings');
    } finally {
      stopLoading();
    }
  };

  // Update session timeout
  const updateSessionTimeout = async (minutes: number) => {
    try {
      startLoading();
      await sessionManager.setTimeout(minutes);
      setSessionTimeout(minutes);
    } catch (error) {
      Alert.alert('Error', 'Failed to update session timeout');
    } finally {
      stopLoading();
    }
  };

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
          textStyle={styles.backButtonText}
        />
        <Text style={styles.headerTitle}>Security Settings</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Biometric Authentication */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Biometric Authentication</Text>
          
          {biometricAvailable ? (
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Use {biometricName}</Text>
                <Text style={styles.settingDescription}>
                  Use your biometrics to quickly and securely access the app
                </Text>
              </View>
              <Switch
                value={biometricEnabled}
                onValueChange={toggleBiometric}
                trackColor={{ false: '#D1D5DB', true: '#BFDBFE' }}
                thumbColor={biometricEnabled ? '#3B82F6' : '#F3F4F6'}
              />
            </View>
          ) : (
            <View style={styles.notAvailableContainer}>
              <Ionicons name="lock-closed" size={24} color="#9CA3AF" />
              <Text style={styles.notAvailableText}>
                Biometric authentication is not available on this device
              </Text>
            </View>
          )}
        </View>

        {/* Session Timeout */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Session Timeout</Text>
          <Text style={styles.sectionDescription}>
            Choose how long the app should stay logged in when not in use
          </Text>
          
          <View style={styles.timeoutOptions}>
            {[1, 5, 10, 30].map((minutes) => (
              <Button
                key={minutes}
                title={`${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`}
                onPress={() => updateSessionTimeout(minutes)}
                variant={sessionTimeout === minutes ? 'primary' : 'outline'}
                size="small"
                style={styles.timeoutButton}
              />
            ))}
          </View>
        </View>

        {/* Security Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security Tips</Text>
          
          <View style={styles.tipContainer}>
            <Ionicons name="shield-checkmark" size={24} color="#10B981" style={styles.tipIcon} />
            <Text style={styles.tipText}>
              Enable biometric authentication for an extra layer of security
            </Text>
          </View>
          
          <View style={styles.tipContainer}>
            <Ionicons name="eye-off" size={24} color="#10B981" style={styles.tipIcon} />
            <Text style={styles.tipText}>
              Never share your login credentials with anyone
            </Text>
          </View>
          
          <View style={styles.tipContainer}>
            <Ionicons name="lock-closed" size={24} color="#10B981" style={styles.tipIcon} />
            <Text style={styles.tipText}>
              Set a shorter session timeout for better security
            </Text>
          </View>
        </View>
      </ScrollView>

      <LoadingOverlay visible={isLoading} message="Updating security settings..." />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
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
  backButtonText: {
    fontSize: 14,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
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
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
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
  notAvailableContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  notAvailableText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  timeoutOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  timeoutButton: {
    marginRight: 8,
    marginBottom: 8,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  tipIcon: {
    marginRight: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
});

export default SecuritySettingsScreen;
