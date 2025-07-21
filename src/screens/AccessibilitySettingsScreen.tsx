import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Slider,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AccessibleButton from '../components/AccessibleButton';
import accessibility from '../utils/accessibility';
import secureStorage from '../utils/secureStorage';

interface Props {
  navigation: any;
}

const AccessibilitySettingsScreen: React.FC<Props> = ({ navigation }) => {
  const [isScreenReaderEnabled, setIsScreenReaderEnabled] = useState(false);
  const [isReducedMotionEnabled, setIsReducedMotionEnabled] = useState(false);
  const [fontSizeMultiplier, setFontSizeMultiplier] = useState(1);
  const [highContrast, setHighContrast] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Check if screen reader is enabled
        const screenReaderEnabled = await accessibility.isScreenReaderEnabled();
        setIsScreenReaderEnabled(screenReaderEnabled);

        // Check if reduced motion is enabled
        const reducedMotionEnabled = await accessibility.isReducedMotionEnabled();
        setIsReducedMotionEnabled(reducedMotionEnabled);

        // Load saved settings
        const savedFontSize = await secureStorage.getItem('accessibility_font_size');
        if (savedFontSize) {
          setFontSizeMultiplier(parseFloat(savedFontSize));
        }

        const savedHighContrast = await secureStorage.getItem('accessibility_high_contrast');
        if (savedHighContrast) {
          setHighContrast(savedHighContrast === 'true');
        }

        setLoading(false);
      } catch (error) {
        console.error('Error loading accessibility settings:', error);
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Save font size setting
  const saveFontSize = async (value: number) => {
    try {
      await secureStorage.setItem('accessibility_font_size', value.toString());
      setFontSizeMultiplier(value);
      // In a real app, you would update a global font size context here
    } catch (error) {
      console.error('Error saving font size:', error);
    }
  };

  // Save high contrast setting
  const saveHighContrast = async (value: boolean) => {
    try {
      await secureStorage.setItem('accessibility_high_contrast', value.toString());
      setHighContrast(value);
      // In a real app, you would update a global theme context here
    } catch (error) {
      console.error('Error saving high contrast setting:', error);
    }
  };

  // Test screen reader announcement
  const testScreenReader = () => {
    accessibility.announceForAccessibility('This is a test announcement for screen readers');
    Alert.alert(
      'Screen Reader Test',
      'If you have a screen reader enabled, you should hear "This is a test announcement for screen readers"'
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading accessibility settings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <AccessibleButton
          title="Back"
          onPress={() => navigation.goBack()}
          variant="outline"
          size="small"
          style={styles.backButton}
          accessibilityLabel="Go back"
        />
        <Text style={styles.headerTitle}>Accessibility</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* System Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Settings</Text>
          <Text style={styles.sectionDescription}>
            These settings are controlled by your device and are shown here for reference.
          </Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Screen Reader</Text>
              <Text style={styles.settingDescription}>
                {isScreenReaderEnabled ? 'Enabled' : 'Disabled'}
              </Text>
            </View>
            <Ionicons
              name={isScreenReaderEnabled ? 'checkmark-circle' : 'close-circle'}
              size={24}
              color={isScreenReaderEnabled ? '#10B981' : '#9CA3AF'}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Reduced Motion</Text>
              <Text style={styles.settingDescription}>
                {isReducedMotionEnabled ? 'Enabled' : 'Disabled'}
              </Text>
            </View>
            <Ionicons
              name={isReducedMotionEnabled ? 'checkmark-circle' : 'close-circle'}
              size={24}
              color={isReducedMotionEnabled ? '#10B981' : '#9CA3AF'}
            />
          </View>

          <AccessibleButton
            title="Test Screen Reader"
            onPress={testScreenReader}
            variant="outline"
            style={styles.testButton}
            accessibilityLabel="Test screen reader announcement"
            accessibilityHint="Triggers a test announcement for screen readers"
          />
        </View>

        {/* App Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          <Text style={styles.sectionDescription}>
            Customize the app's appearance to improve readability and visibility.
          </Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>High Contrast</Text>
              <Text style={styles.settingDescription}>
                Increase contrast for better readability
              </Text>
            </View>
            <Switch
              value={highContrast}
              onValueChange={saveHighContrast}
              trackColor={{ false: '#D1D5DB', true: '#BFDBFE' }}
              thumbColor={highContrast ? '#3B82F6' : '#F3F4F6'}
            />
          </View>

          <View style={styles.settingBlock}>
            <Text style={styles.settingTitle}>Text Size</Text>
            <Text style={styles.settingDescription}>
              Adjust the size of text throughout the app
            </Text>
            
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>A</Text>
              <Slider
                style={styles.slider}
                minimumValue={0.8}
                maximumValue={1.4}
                step={0.1}
                value={fontSizeMultiplier}
                onValueChange={setFontSizeMultiplier}
                onSlidingComplete={saveFontSize}
                minimumTrackTintColor="#3B82F6"
                maximumTrackTintColor="#D1D5DB"
                thumbTintColor="#3B82F6"
                accessibilityLabel="Text size slider"
                accessibilityHint="Adjust to change text size throughout the app"
              />
              <Text style={styles.sliderLabelLarge}>A</Text>
            </View>
            
            <Text style={[styles.sampleText, { fontSize: 16 * fontSizeMultiplier }]}>
              Sample text at current size
            </Text>
          </View>
        </View>

        {/* Accessibility Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Accessibility Tips</Text>
          
          <View style={styles.tipContainer}>
            <Ionicons name="eye-outline" size={24} color="#3B82F6" style={styles.tipIcon} />
            <Text style={styles.tipText}>
              Enable VoiceOver (iOS) or TalkBack (Android) in your device settings for screen reading.
            </Text>
          </View>
          
          <View style={styles.tipContainer}>
            <Ionicons name="contrast-outline" size={24} color="#3B82F6" style={styles.tipIcon} />
            <Text style={styles.tipText}>
              High contrast mode makes text and UI elements more visible against backgrounds.
            </Text>
          </View>
          
          <View style={styles.tipContainer}>
            <Ionicons name="text-outline" size={24} color="#3B82F6" style={styles.tipIcon} />
            <Text style={styles.tipText}>
              Larger text sizes can make reading easier if you have vision impairments.
            </Text>
          </View>
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
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingBlock: {
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
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  slider: {
    flex: 1,
    height: 40,
    marginHorizontal: 8,
  },
  sliderLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  sliderLabelLarge: {
    fontSize: 20,
    fontWeight: '500',
    color: '#6B7280',
  },
  sampleText: {
    marginTop: 8,
    color: '#111827',
  },
  testButton: {
    marginTop: 16,
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

export default AccessibilitySettingsScreen;
