import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior with error handling
// Delay initialization to avoid NativeEventEmitter null argument issue
let isNotificationHandlerSet = false;

function initializeNotificationHandler() {
  if (isNotificationHandlerSet) return;
  
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
    isNotificationHandlerSet = true;
  } catch (error) {
    console.warn('Failed to configure notification handler:', error);
  }
}

export interface NotificationSettings {
  depositsEnabled: boolean;
  debitsEnabled: boolean;
  overdraftWarningEnabled: boolean;
  overdraftThreshold: number; // Amount below which to warn (e.g., 100 = warn when balance drops below $100)
}

export const defaultNotificationSettings: NotificationSettings = {
  depositsEnabled: true,
  debitsEnabled: true,
  overdraftWarningEnabled: true,
  overdraftThreshold: 100,
};

export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    // Initialize notification handler first
    initializeNotificationHandler();
    
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      return false;
    }

    // Configure notification channel for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('bank-transactions', {
        name: 'Bank Transactions',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#3B82F6',
      });

      await Notifications.setNotificationChannelAsync('overdraft-warnings', {
        name: 'Overdraft Warnings',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 500, 250, 500],
        lightColor: '#EF4444',
      });
    }

    return true;
  } catch (error) {
    console.warn('Error requesting notification permissions:', error);
    return false;
  }
}

export async function scheduleDepositNotification(
  amount: number,
  payee: string,
  balance: number
): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '💰 Deposit Received',
        body: `+${amount.toFixed(2)} from ${payee}\nNew balance: ${balance.toFixed(2)}`,
        sound: 'default',
        data: {
          type: 'deposit',
          amount,
          payee,
          balance,
        },
      },
      trigger: null, // Show immediately
      identifier: `deposit-${Date.now()}`,
    });
  } catch (error) {
    console.warn('Error scheduling deposit notification:', error);
  }
}

export async function scheduleDebitNotification(
  amount: number,
  payee: string,
  balance: number
): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '💳 Transaction Posted',
        body: `-${Math.abs(amount).toFixed(2)} to ${payee}\nNew balance: ${balance.toFixed(2)}`,
        sound: 'default',
        data: {
          type: 'debit',
          amount,
          payee,
          balance,
        },
      },
      trigger: null, // Show immediately
      identifier: `debit-${Date.now()}`,
    });
  } catch (error) {
    console.warn('Error scheduling debit notification:', error);
  }
}

export async function scheduleOverdraftWarning(
  balance: number,
  threshold: number
): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⚠️ Low Balance Warning',
        body: `Your balance is ${balance.toFixed(2)}, which is below your alert threshold of ${threshold.toFixed(2)}`,
        sound: 'default',
        data: {
          type: 'overdraft-warning',
          balance,
          threshold,
        },
      },
      trigger: null, // Show immediately
      identifier: `overdraft-${Date.now()}`,
    });
  } catch (error) {
    console.warn('Error scheduling overdraft warning:', error);
  }
}

export async function scheduleOverdraftAlert(balance: number): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🚨 OVERDRAFT ALERT',
        body: `Your account balance is ${balance.toFixed(2)}. You may incur overdraft fees.`,
        sound: 'default',
        data: {
          type: 'overdraft-alert',
          balance,
        },
      },
      trigger: null, // Show immediately
      identifier: `overdraft-alert-${Date.now()}`,
    });
  } catch (error) {
    console.warn('Error scheduling overdraft alert:', error);
  }
}

export function setupNotificationListeners() {
  try {
    // Initialize notification handler first
    initializeNotificationHandler();
    
    // Add a small delay to ensure native modules are ready
    setTimeout(() => {
      try {
        // Handle notification tap when app is running
        const notificationListener = Notifications.addNotificationReceivedListener(notification => {
          console.log('Notification received:', notification);
        });

        // Handle notification tap when app is closed/backgrounded
        const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
          console.log('Notification response:', response);
          // Here you could navigate to specific screens based on notification type
        });

        return () => {
          notificationListener.remove();
          responseListener.remove();
        };
      } catch (error) {
        console.warn('Failed to setup delayed notification listeners:', error);
        return () => {}; // Return empty cleanup function
      }
    }, 1000);

    return () => {}; // Return empty cleanup function for immediate return
  } catch (error) {
    console.warn('Failed to setup notification listeners:', error);
    return () => {}; // Return empty cleanup function
  }
}