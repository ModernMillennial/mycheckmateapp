import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Application from 'expo-application';
import secureStorage from './secureStorage';

/**
 * Crash reporting service for tracking app crashes and errors
 */
class CrashReportingService {
  private isInitialized: boolean = false;
  private isEnabled: boolean = true;
  private userId: string | null = null;
  private appInfo: {
    appVersion: string;
    buildNumber: string;
    deviceName: string;
    deviceYearClass: number | null;
    osName: string;
    osVersion: string;
    platform: string;
  };

  constructor() {
    this.appInfo = {
      appVersion: '1.0.0', // Replace with your app version
      buildNumber: '1', // Replace with your build number
      deviceName: Device.deviceName || 'unknown',
      deviceYearClass: null,
      osName: Platform.OS,
      osVersion: String(Platform.Version),
      platform: Platform.OS,
    };
  }

  /**
   * Initialize the crash reporting service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      // Check if crash reporting is enabled
      const crashReportingEnabled = await secureStorage.getItem('crash_reporting_enabled');
      this.isEnabled = crashReportingEnabled !== 'false';
      
      // Get app info
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        this.appInfo.appVersion = Application.nativeApplicationVersion || '1.0.0';
        this.appInfo.buildNumber = Application.nativeBuildVersion || '1';
      }
      
      // Set up global error handler
      this.setupErrorHandler();
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize crash reporting:', error);
    }
  }

  /**
   * Set up global error handler
   */
  private setupErrorHandler(): void {
    // Save the original error handler
    const originalErrorHandler = ErrorUtils.getGlobalHandler();
    
    // Set up our custom error handler
    ErrorUtils.setGlobalHandler((error, isFatal) => {
      // Report the error
      this.reportError(error, { isFatal });
      
      // Call the original error handler
      originalErrorHandler(error, isFatal);
    });
  }

  /**
   * Set user ID for crash reports
   * @param userId - User ID to set
   */
  setUserId(userId: string): void {
    this.userId = userId;
  }

  /**
   * Report an error to the crash reporting service
   * @param error - Error to report
   * @param context - Additional context for the error
   */
  reportError(error: Error, context: any = {}): void {
    if (!this.isEnabled) return;
    
    try {
      const errorReport = {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
        context,
        timestamp: new Date().toISOString(),
        user: this.userId ? { id: this.userId } : undefined,
        app: this.appInfo,
      };
      
      // In a real app, you would send this to your crash reporting service
      // For now, we'll just log it to the console in development
      if (__DEV__) {
        console.log('Crash report:', errorReport);
      } else {
        // Send to your crash reporting service
        this.sendToCrashReportingService(errorReport);
      }
    } catch (reportError) {
      console.error('Failed to report error:', reportError);
    }
  }

  /**
   * Enable or disable crash reporting
   * @param enabled - Whether crash reporting should be enabled
   */
  async setEnabled(enabled: boolean): Promise<void> {
    this.isEnabled = enabled;
    await secureStorage.setItem('crash_reporting_enabled', enabled ? 'true' : 'false');
  }

  /**
   * Check if crash reporting is enabled
   * @returns Whether crash reporting is enabled
   */
  isCrashReportingEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Send error report to crash reporting service
   * @param errorReport - Error report to send
   */
  private sendToCrashReportingService(errorReport: any): void {
    // In a real app, you would implement this to send data to your crash reporting service
    // For example, Sentry, Crashlytics, etc.
    
    // This is a placeholder for the actual implementation
    // fetch('https://your-crash-reporting-api.com/reports', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(errorReport),
    // }).catch(error => {
    //   console.error('Failed to send crash report:', error);
    // });
  }
}

export default new CrashReportingService();
