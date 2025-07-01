// Production-safe logging utility
const isDevelopment = process.env.EXPO_PUBLIC_APP_ENV !== 'production';

export const logger = {
  debug: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  },
  
  info: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.log(`[INFO] ${message}`, ...args);
    }
  },
  
  warn: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.warn(`[WARN] ${message}`, ...args);
    }
    // In production, you might want to send to error tracking service
  },
  
  error: (message: string, error?: any, ...args: any[]) => {
    if (isDevelopment) {
      console.error(`[ERROR] ${message}`, error, ...args);
    }
    // In production, send to error tracking service (Sentry, etc.)
    // You can implement error reporting here
  },
  
  // Financial operations should always be logged for security
  security: (message: string, userId?: string, ...args: any[]) => {
    console.log(`[SECURITY] ${message}`, { userId, timestamp: new Date().toISOString() }, ...args);
    // In production, send to security monitoring service
  }
};

export default logger;