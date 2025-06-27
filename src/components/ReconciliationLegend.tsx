import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ReconciliationLegend: React.FC = () => {
  return (
    <View className="bg-gray-50 p-4 rounded-lg mx-4 mb-4">
      <Text className="text-sm font-semibold text-gray-700 mb-3">
        Transaction Status Guide
      </Text>
      
      <View className="space-y-2">
        {/* Manual Entry */}
        <View className="flex-row items-center">
          <Ionicons name="ellipse-outline" size={16} color="#9CA3AF" />
          <Text className="text-sm text-gray-600 ml-2">
            Open Circle - Manual entry (not yet in bank)
          </Text>
        </View>
        
        {/* Bank Transaction */}
        <View className="flex-row items-center">
          <Ionicons name="checkmark-circle" size={16} color="#10B981" />
          <Text className="text-sm text-gray-600 ml-2">
            Green Check - Bank transaction (reconciled)
          </Text>
        </View>
        
        {/* Converted Transaction */}
        <View className="flex-row items-center">
          <View className="flex-row items-center mr-2">
            <Ionicons name="ellipse-outline" size={14} color="#9CA3AF" />
            <Ionicons name="checkmark-circle" size={16} color="#F59E0B" style={{ marginLeft: -6 }} />
          </View>
          <Text className="text-sm text-gray-600">
            Yellow Check - Manual entry converted to bank transaction
          </Text>
        </View>
      </View>
      
      <Text className="text-xs text-gray-500 mt-3">
        Manual entries automatically convert to bank transactions when matching entries are found during sync.
      </Text>
    </View>
  );
};

export default ReconciliationLegend;