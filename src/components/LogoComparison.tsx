import React from 'react';
import { View, Text, Image } from 'react-native';
import { TransparentLogo } from './TransparentLogo';

/**
 * Component to demonstrate the difference between the original logo with background
 * and the new transparent logo
 */
export const LogoComparison: React.FC = () => {
  return (
    <View className="p-4 bg-gray-100">
      <Text className="text-lg font-bold text-center mb-4">Logo Comparison</Text>
      
      <View className="flex-row justify-around items-center mb-6">
        <View className="items-center">
          <Text className="text-sm text-gray-600 mb-2">Original (with background)</Text>
          <View className="bg-white p-2 rounded-lg shadow">
            <Image 
              source={require('../../assets/logo-original.png')} 
              className="w-16 h-16"
              resizeMode="contain"
            />
          </View>
        </View>
        
        <View className="items-center">
          <Text className="text-sm text-gray-600 mb-2">New (transparent)</Text>
          <View className="bg-white p-2 rounded-lg shadow">
            <TransparentLogo size={64} color="#1F2937" />
          </View>
        </View>
      </View>
      
      <Text className="text-center text-sm text-gray-600 mb-4">On colored backgrounds:</Text>
      
      <View className="flex-row justify-around">
        <View className="items-center">
          <View className="bg-blue-500 p-3 rounded-lg">
            <TransparentLogo size={48} color="#FFFFFF" />
          </View>
          <Text className="text-xs text-gray-600 mt-1">Blue background</Text>
        </View>
        
        <View className="items-center">
          <View className="bg-green-500 p-3 rounded-lg">
            <TransparentLogo size={48} color="#FFFFFF" />
          </View>
          <Text className="text-xs text-gray-600 mt-1">Green background</Text>
        </View>
        
        <View className="items-center">
          <View className="bg-purple-500 p-3 rounded-lg">
            <TransparentLogo size={48} color="#FFFFFF" />
          </View>
          <Text className="text-xs text-gray-600 mt-1">Purple background</Text>
        </View>
      </View>
      
      <View className="mt-4 p-3 bg-gray-800 rounded-lg">
        <View className="items-center">
          <TransparentLogo size={64} color="#FFFFFF" variant="minimal" />
          <Text className="text-white text-xs mt-2">Minimal variant on dark background</Text>
        </View>
      </View>
    </View>
  );
};