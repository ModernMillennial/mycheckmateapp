import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ReconciliationLegend: React.FC = () => {
  return (
    <View className="bg-gray-50 p-4 rounded-lg mx-4 mb-4">
      <Text className="text-sm font-semibold text-gray-700 mb-3">
        Transaction Status Guide
      </Text>
      
      <View className="space-y-3">
        {/* Manual Entry */}
        <View className="flex-row items-center">
          <View className="flex-row items-center mr-3">
            <Ionicons name="ellipse-outline" size={16} color="#9CA3AF" />
            <Ionicons name="ellipse-outline" size={16} color="#9CA3AF" style={{ marginLeft: -6 }} />
          </View>
          <Text className="text-sm text-gray-600 flex-1">
            Two Gray Circles - Manual entry (not yet posted to bank)
          </Text>
        </View>
        
        {/* Bank Transaction */}
        <View className="flex-row items-center">
          <Ionicons name="checkmark-circle" size={16} color="#10B981" style={{ marginRight: 12 }} />
          <Text className="text-sm text-gray-600 flex-1">
            Single Green Check - Direct bank transaction
          </Text>
        </View>
        
        {/* Converted Transaction */}
        <View className="flex-row items-center">
          <View className="flex-row items-center mr-3">
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Ionicons name="checkmark-circle" size={16} color="#F59E0B" style={{ marginLeft: -6 }} />
          </View>
          <Text className="text-sm text-gray-600 flex-1">
            Green + Yellow Checks - Manual entry converted when posted to bank
          </Text>
        </View>
      </View>
      
      <View className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
        <Text className="text-xs text-blue-700 font-medium mb-1">How it works:</Text>
        <Text className="text-xs text-blue-600">
          • Manual entries start with two gray circles{'\n'}
          • When bank sync finds a match, they convert to green + yellow checks{'\n'}
          • Green check = bank confirmed, Yellow check = was originally manual
        </Text>
      </View>
    </View>
  );
};

export default ReconciliationLegend;