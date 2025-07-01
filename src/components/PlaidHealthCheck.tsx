import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HealthCheckManager, HealthCheckResult } from '../utils/healthCheck';
import { plaidService } from '../services/plaidService';

interface Props {
  onHealthCheckComplete?: (result: HealthCheckResult) => void;
}

const PlaidHealthCheck: React.FC<Props> = ({ onHealthCheckComplete }) => {
  const [healthResult, setHealthResult] = useState<HealthCheckResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runHealthCheck = async () => {
    setIsRunning(true);
    try {
      const result = await HealthCheckManager.performFullHealthCheck();
      setHealthResult(result);
      onHealthCheckComplete?.(result);
    } catch (error) {
      console.error('Health check failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    runHealthCheck();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return '#10B981';
      case 'warning': return '#F59E0B';
      case 'error': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return 'checkmark-circle';
      case 'warning': return 'warning';
      case 'error': return 'close-circle';
      default: return 'help-circle';
    }
  };

  if (isRunning) {
    return (
      <View className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <View className="flex-row items-center">
          <ActivityIndicator size="small" color="#3B82F6" />
          <Text className="ml-2 text-gray-600">Running health check...</Text>
        </View>
      </View>
    );
  }

  if (!healthResult) {
    return (
      <View className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <Pressable onPress={runHealthCheck} className="flex-row items-center">
          <Ionicons name="refresh" size={20} color="#3B82F6" />
          <Text className="ml-2 text-blue-600 font-medium">Run Health Check</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      {/* Overall Status */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <Ionicons 
            name={getStatusIcon(healthResult.status)} 
            size={24} 
            color={getStatusColor(healthResult.status)} 
          />
          <Text className="ml-2 text-lg font-semibold" style={{ color: getStatusColor(healthResult.status) }}>
            {healthResult.status.charAt(0).toUpperCase() + healthResult.status.slice(1)}
          </Text>
        </View>
        <Pressable onPress={runHealthCheck}>
          <Ionicons name="refresh" size={20} color="#6B7280" />
        </Pressable>
      </View>

      {/* Individual Checks */}
      <View className="space-y-2 mb-3">
        <CheckItem 
          label="Plaid Service" 
          status={healthResult.checks.plaidService} 
          details={plaidService.isPlaidConfigured() ? 'Production Ready' : 'Demo Mode'}
        />
        <CheckItem 
          label="Network Connection" 
          status={healthResult.checks.networkConnection} 
        />
        <CheckItem 
          label="Secure Storage" 
          status={healthResult.checks.secureStorage} 
        />
        <CheckItem 
          label="Permissions" 
          status={healthResult.checks.permissions} 
        />
      </View>

      {/* Warnings */}
      {healthResult.warnings.length > 0 && (
        <View className="mb-3">
          <Text className="text-yellow-600 font-medium mb-1">Warnings:</Text>
          {healthResult.warnings.map((warning, index) => (
            <Text key={index} className="text-yellow-600 text-sm">• {warning}</Text>
          ))}
        </View>
      )}

      {/* Errors */}
      {healthResult.errors.length > 0 && (
        <View className="mb-3">
          <Text className="text-red-600 font-medium mb-1">Errors:</Text>
          {healthResult.errors.map((error, index) => (
            <Text key={index} className="text-red-600 text-sm">• {error}</Text>
          ))}
        </View>
      )}

      {/* Production Readiness Indicator */}
      <View className="border-t border-gray-200 pt-3">
        <Text className="text-sm text-gray-600">
          Production Ready: {' '}
          <Text className={plaidService.isPlaidConfigured() ? 'text-green-600 font-medium' : 'text-yellow-600 font-medium'}>
            {plaidService.isPlaidConfigured() ? 'Yes' : 'Demo Mode'}
          </Text>
        </Text>
      </View>
    </View>
  );
};

interface CheckItemProps {
  label: string;
  status: boolean;
  details?: string;
}

const CheckItem: React.FC<CheckItemProps> = ({ label, status, details }) => (
  <View className="flex-row items-center justify-between">
    <Text className="text-gray-700">{label}</Text>
    <View className="flex-row items-center">
      {details && <Text className="text-xs text-gray-500 mr-2">{details}</Text>}
      <Ionicons 
        name={status ? 'checkmark-circle' : 'close-circle'} 
        size={16} 
        color={status ? '#10B981' : '#EF4444'} 
      />
    </View>
  </View>
);

export default PlaidHealthCheck;