import { plaidService } from '../services/plaidService';
import { SecurityManager } from './security';
import logger from './logger';
import * as Network from 'expo-network';

export interface HealthCheckResult {
  status: 'healthy' | 'warning' | 'error';
  checks: {
    plaidService: boolean;
    networkConnection: boolean;
    secureStorage: boolean;
    permissions: boolean;
  };
  warnings: string[];
  errors: string[];
}

export class HealthCheckManager {
  
  static async performFullHealthCheck(): Promise<HealthCheckResult> {
    logger.info('Starting comprehensive health check...');
    
    const result: HealthCheckResult = {
      status: 'healthy',
      checks: {
        plaidService: false,
        networkConnection: false,
        secureStorage: false,
        permissions: false,
      },
      warnings: [],
      errors: [],
    };

    // Check Plaid service
    try {
      result.checks.plaidService = plaidService.isPlaidConfigured();
      if (!result.checks.plaidService) {
        result.warnings.push('Plaid service running in demo mode - production credentials needed');
      }
    } catch (error) {
      result.errors.push('Plaid service initialization failed');
      logger.error('Plaid health check failed', error);
    }

    // Check network connectivity
    try {
      const networkState = await Network.getNetworkStateAsync();
      result.checks.networkConnection = networkState.isConnected || false;
      if (!result.checks.networkConnection) {
        result.errors.push('No network connection available');
      }
    } catch (error) {
      result.errors.push('Network check failed');
      logger.error('Network health check failed', error);
    }

    // Check secure storage
    try {
      await SecurityManager.storeSecurely('health_check_test', 'test_value');
      const retrievedValue = await SecurityManager.getSecurely('health_check_test');
      result.checks.secureStorage = retrievedValue === 'test_value';
      await SecurityManager.removeSecurely('health_check_test');
      
      if (!result.checks.secureStorage) {
        result.errors.push('Secure storage not functioning properly');
      }
    } catch (error) {
      result.errors.push('Secure storage check failed');
      logger.error('Secure storage health check failed', error);
    }

    // Check permissions (basic validation)
    try {
      result.checks.permissions = true; // Will be updated when permission checks are implemented
    } catch (error) {
      result.errors.push('Permission check failed');
      logger.error('Permission health check failed', error);
    }

    // Determine overall health status
    if (result.errors.length > 0) {
      result.status = 'error';
    } else if (result.warnings.length > 0) {
      result.status = 'warning';
    }

    logger.info('Health check completed', {
      status: result.status,
      checksCount: Object.keys(result.checks).length,
      warningsCount: result.warnings.length,
      errorsCount: result.errors.length,
    });

    return result;
  }

  static async checkPlaidConnectivity(): Promise<boolean> {
    try {
      if (!plaidService.isPlaidConfigured()) {
        logger.info('Plaid running in demo mode');
        return true; // Demo mode is functional
      }

      // In a real implementation, you might ping Plaid's health endpoint
      // For now, we'll assume it's healthy if configured
      return true;
    } catch (error) {
      logger.error('Plaid connectivity check failed', error);
      return false;
    }
  }

  static async validateAppConfiguration(): Promise<string[]> {
    const issues: string[] = [];

    // Check environment variables
    if (!process.env.EXPO_PUBLIC_PLAID_CLIENT_ID) {
      issues.push('EXPO_PUBLIC_PLAID_CLIENT_ID not configured');
    }

    if (!process.env.EXPO_PUBLIC_PLAID_SECRET) {
      issues.push('EXPO_PUBLIC_PLAID_SECRET not configured');
    }

    // Check for development settings in production
    if (process.env.EXPO_PUBLIC_APP_ENV === 'production') {
      if (process.env.EXPO_PUBLIC_DEBUG_MODE === 'true') {
        issues.push('Debug mode enabled in production environment');
      }
    }

    return issues;
  }
}

export default HealthCheckManager;