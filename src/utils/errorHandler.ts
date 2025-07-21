// src/utils/errorHandler.ts
import { Alert } from 'react-native';

// Error types
export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTHENTICATION = 'AUTHENTICATION',
  PLAID = 'PLAID',
  DATA = 'DATA',
  UNKNOWN = 'UNKNOWN',
}

// Error severity levels
export enum ErrorSeverity {
  INFO = 'INFO',       // Non-critical, just informational
  WARNING = 'WARNING', // Potential issue but not blocking
  ERROR = 'ERROR',     // Serious issue that affects functionality
  CRITICAL = 'CRITICAL', // App-breaking issue
}

interface ErrorOptions {
  severity?: ErrorSeverity;
  showUser?: boolean;
  context?: any;
  retry?: () => void;
}

export class AppError extends Error {
  type: ErrorType;
  severity: ErrorSeverity;
  showUser: boolean;
  context?: any;
  retry?: () => void;

  constructor(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN,
    options: ErrorOptions = {}
  ) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.severity = options.severity || ErrorSeverity.ERROR;
    this.showUser = options.showUser !== undefined ? options.showUser : true;
    this.context = options.context;
    this.retry = options.retry;
  }
}

// Network error handler
export const handleNetworkError = (error: any, retry?: () => void) => {
  const message = 'Network connection issue. Please check your internet connection and try again.';
  
  console.error('Network Error:', error);
  
  return new AppError(message, ErrorType.NETWORK, {
    severity: ErrorSeverity.WARNING,
    showUser: true,
    retry,
  });
};

// Plaid error handler
export const handlePlaidError = (error: any, context?: any) => {
  let message = 'There was an issue connecting to your bank.';
  let severity = ErrorSeverity.ERROR;
  
  // Check for specific Plaid error codes
  if (error?.error_code) {
    switch (error.error_code) {
      case 'ITEM_LOGIN_REQUIRED':
        message = 'Your bank connection needs to be updated. Please reconnect your account.';
        break;
      case 'INSTITUTION_DOWN':
        message = 'Your bank is currently unavailable. Please try again later.';
        severity = ErrorSeverity.WARNING;
        break;
      case 'RATE_LIMIT_EXCEEDED':
        message = 'Too many requests. Please try again in a few minutes.';
        severity = ErrorSeverity.WARNING;
        break;
      default:
        message = error.error_message || message;
    }
  }
  
  console.error('Plaid Error:', error);
  
  return new AppError(message, ErrorType.PLAID, {
    severity,
    showUser: true,
    context,
  });
};

// Authentication error handler
export const handleAuthError = (error: any) => {
  let message = 'Authentication failed. Please log in again.';
  
  console.error('Auth Error:', error);
  
  return new AppError(message, ErrorType.AUTHENTICATION, {
    severity: ErrorSeverity.ERROR,
    showUser: true,
  });
};

// Data error handler
export const handleDataError = (error: any, context?: any) => {
  let message = 'There was an issue processing your data.';
  
  console.error('Data Error:', error, context);
  
  return new AppError(message, ErrorType.DATA, {
    severity: ErrorSeverity.ERROR,
    showUser: true,
    context,
  });
};

// Generic error handler
export const handleError = (error: any, showUser = true) => {
  // If it's already an AppError, just return it
  if (error instanceof AppError) {
    return error;
  }
  
  // Handle network errors
  if (error?.message?.includes('Network request failed') || error?.name === 'NetworkError') {
    return handleNetworkError(error);
  }
  
  // Handle Plaid errors
  if (error?.error_code || error?.message?.includes('Plaid')) {
    return handlePlaidError(error);
  }
  
  // Handle authentication errors
  if (error?.status === 401 || error?.message?.includes('authentication')) {
    return handleAuthError(error);
  }
  
  // Default error handling
  console.error('Unhandled Error:', error);
  
  return new AppError(
    error?.message || 'An unexpected error occurred.',
    ErrorType.UNKNOWN,
    {
      severity: ErrorSeverity.ERROR,
      showUser,
    }
  );
};

// Show error to user
export const showErrorToUser = (error: AppError | Error | string) => {
  let title = 'Error';
  let message = 'An unexpected error occurred.';
  
  if (typeof error === 'string') {
    message = error;
  } else if (error instanceof AppError) {
    if (!error.showUser) return;
    
    switch (error.severity) {
      case ErrorSeverity.INFO:
        title = 'Notice';
        break;
      case ErrorSeverity.WARNING:
        title = 'Warning';
        break;
      case ErrorSeverity.CRITICAL:
        title = 'Critical Error';
        break;
      default:
        title = 'Error';
    }
    
    message = error.message;
  } else {
    message = error.message || message;
  }
  
  Alert.alert(title, message);
};

// Main error handler function
export const handleErrorWithFallback = async (
  operation: () => Promise<any>,
  fallback: any = null,
  showUserError = true
) => {
  try {
    return await operation();
  } catch (error) {
    const appError = handleError(error, showUserError);
    
    if (showUserError && appError.showUser) {
      showErrorToUser(appError);
    }
    
    return fallback;
  }
};

export default {
  handleError,
  handleNetworkError,
  handlePlaidError,
  handleAuthError,
  handleDataError,
  showErrorToUser,
  handleErrorWithFallback,
  AppError,
  ErrorType,
  ErrorSeverity,
};
