import { Platform } from 'react-native';
import * as Device from 'expo-device';
import secureStorage from './secureStorage';

// Define event types for better type safety
export enum EventType {
  // Screen events
  SCREEN_VIEW = 'screen_view',
  
  // User actions
  USER_LOGIN = 'user_login',
  USER_SIGNUP = 'user_signup',
  USER_LOGOUT = 'user_logout',
  
  // Feature usage
  FEATURE_USED = 'feature_used',
  
  // Bank connection events
  BANK_CONNECTED = 'bank_connected',
  BANK_SYNC = 'bank_sync',
  
  // Transaction events
  TRANSACTION_ADDED = 'transaction_added',
  TRANSACTION_EDITED = 'transaction_edited',
  TRANSACTION_DELETED = 'transaction_deleted',
  
  // Error events
  ERROR = 'error',
  
  // Custom events
  CUSTOM = 'custom',
}

// Define user properties
export interface UserProperties {
  userId?: string;
  accountType?: 'free' | 'premium';
  hasConnectedBank?: boolean;
  deviceType?: string;
  osVersion?: string;
  appVersion?: string;
}

/**
 * Analytics service for tracking user behavior and app performance
 */
class AnalyticsService {
  private isInitialized: boolean = false;
  private userProperties: UserProperties = {};
  private sessionId: string = '';
  private isEnabled: boolean = true;
  private queue: Array<{event: string, properties: any}> = [];
  private readonly MAX_QUEUE_SIZE = 100;

  /**
   * Initialize the analytics service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      // Generate a new session ID
      this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      // Set default user properties
      this.userProperties = {
        deviceType: Device.deviceName || 'unknown',
        osVersion: `${Platform.OS} ${Platform.Version}`,
        appVersion: '1.0.0', // Replace with your app version
      };
      
      // Check if analytics is enabled
      const analyticsEnabled = await secureStorage.getItem('analytics_enabled');
      this.isEnabled = analyticsEnabled !== 'false';
      
      this.isInitialized = true;
      
      // Send any queued events
      this.flushQueue();
      
      // Log session start
      this.logEvent(EventType.CUSTOM, { event_name: 'session_start', session_id: this.sessionId });
    } catch (error) {
      console.error('Failed to initialize analytics:', error);
    }
  }

  /**
   * Set user properties
   * @param properties - User properties to set
   */
  setUserProperties(properties: UserProperties): void {
    this.userProperties = { ...this.userProperties, ...properties };
  }

  /**
   * Set user ID
   * @param userId - User ID to set
   */
  setUserId(userId: string): void {
    this.userProperties.userId = userId;
  }

  /**
   * Log a screen view event
   * @param screenName - Name of the screen
   * @param screenClass - Class of the screen (optional)
   */
  logScreenView(screenName: string, screenClass?: string): void {
    this.logEvent(EventType.SCREEN_VIEW, {
      screen_name: screenName,
      screen_class: screenClass || screenName,
    });
  }

  /**
   * Log a custom event
   * @param eventType - Type of event
   * @param properties - Event properties
   */
  logEvent(eventType: EventType, properties: any = {}): void {
    if (!this.isInitialized) {
      // Queue the event if not initialized
      this.queueEvent(eventType, properties);
      return;
    }
    
    if (!this.isEnabled) return;
    
    try {
      const eventData = {
        event_type: eventType,
        timestamp: new Date().toISOString(),
        session_id: this.sessionId,
        user_properties: this.userProperties,
        event_properties: properties,
      };
      
      // In a real app, you would send this to your analytics service
      // For now, we'll just log it to the console in development
      if (__DEV__) {
        console.log('Analytics event:', eventData);
      } else {
        // Send to your analytics service
        this.sendToAnalyticsService(eventData);
      }
    } catch (error) {
      console.error('Failed to log event:', error);
    }
  }

  /**
   * Enable or disable analytics
   * @param enabled - Whether analytics should be enabled
   */
  async setEnabled(enabled: boolean): Promise<void> {
    this.isEnabled = enabled;
    await secureStorage.setItem('analytics_enabled', enabled ? 'true' : 'false');
  }

  /**
   * Check if analytics is enabled
   * @returns Whether analytics is enabled
   */
  isAnalyticsEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Queue an event to be sent later
   * @param eventType - Type of event
   * @param properties - Event properties
   */
  private queueEvent(eventType: EventType, properties: any): void {
    if (this.queue.length >= this.MAX_QUEUE_SIZE) {
      // Remove the oldest event if queue is full
      this.queue.shift();
    }
    
    this.queue.push({
      event: eventType,
      properties,
    });
  }

  /**
   * Send queued events
   */
  private flushQueue(): void {
    if (!this.isInitialized || !this.isEnabled) return;
    
    while (this.queue.length > 0) {
      const event = this.queue.shift();
      if (event) {
        this.logEvent(event.event as EventType, event.properties);
      }
    }
  }

  /**
   * Send event to analytics service
   * @param eventData - Event data to send
   */
  private sendToAnalyticsService(eventData: any): void {
    // In a real app, you would implement this to send data to your analytics service
    // For example, Firebase Analytics, Amplitude, Mixpanel, etc.
    
    // This is a placeholder for the actual implementation
    // fetch('https://your-analytics-api.com/events', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(eventData),
    // }).catch(error => {
    //   console.error('Failed to send analytics event:', error);
    // });
  }
}

export default new AnalyticsService();
