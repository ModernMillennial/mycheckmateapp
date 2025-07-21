import { AppState, AppStateStatus } from 'react-native';
import secureStorage from './secureStorage';

// Constants
const SESSION_TIMEOUT_KEY = 'session_timeout_ms';
const DEFAULT_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
const LAST_ACTIVE_KEY = 'last_active_timestamp';

/**
 * Session manager to handle app timeouts for security
 */
class SessionManager {
  private timeoutMs: number = DEFAULT_TIMEOUT_MS;
  private appState: AppStateStatus = 'active';
  private listeners: Set<() => void> = new Set();
  private appStateSubscription: any = null;
  private initialized: boolean = false;

  /**
   * Initialize the session manager
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    // Load timeout setting
    const storedTimeout = await secureStorage.getItem(SESSION_TIMEOUT_KEY);
    if (storedTimeout) {
      this.timeoutMs = parseInt(storedTimeout, 10);
    }
    
    // Set up app state listener
    this.appStateSubscription = AppState.addEventListener('change', this.handleAppStateChange);
    
    // Mark as active now
    this.updateLastActiveTime();
    
    this.initialized = true;
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
    }
  }

  /**
   * Handle app state changes
   */
  private handleAppStateChange = async (nextAppState: AppStateStatus): Promise<void> => {
    // App is coming back to foreground
    if (this.appState.match(/inactive|background/) && nextAppState === 'active') {
      const isSessionExpired = await this.checkSessionExpired();
      if (isSessionExpired) {
        this.notifySessionExpired();
      }
    }
    
    this.appState = nextAppState;
    
    // Update last active time when app becomes active
    if (nextAppState === 'active') {
      this.updateLastActiveTime();
    }
  };

  /**
   * Update the last active timestamp
   */
  updateLastActiveTime(): void {
    const now = Date.now();
    secureStorage.setItem(LAST_ACTIVE_KEY, now.toString());
  }

  /**
   * Check if the session has expired
   */
  async checkSessionExpired(): Promise<boolean> {
    const lastActiveStr = await secureStorage.getItem(LAST_ACTIVE_KEY);
    if (!lastActiveStr) return false;
    
    const lastActive = parseInt(lastActiveStr, 10);
    const now = Date.now();
    
    return now - lastActive > this.timeoutMs;
  }

  /**
   * Set the session timeout duration
   * @param minutes - Timeout in minutes
   */
  async setTimeout(minutes: number): Promise<void> {
    this.timeoutMs = minutes * 60 * 1000;
    await secureStorage.setItem(SESSION_TIMEOUT_KEY, this.timeoutMs.toString());
  }

  /**
   * Get the current timeout in minutes
   */
  getTimeoutMinutes(): number {
    return this.timeoutMs / (60 * 1000);
  }

  /**
   * Add a listener for session expiration
   * @param listener - Function to call when session expires
   * @returns Function to remove the listener
   */
  addSessionExpiredListener(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners that the session has expired
   */
  private notifySessionExpired(): void {
    this.listeners.forEach(listener => {
      try {
        listener();
      } catch (error) {
        console.error('Error in session expired listener:', error);
      }
    });
  }
}

export default new SessionManager();
