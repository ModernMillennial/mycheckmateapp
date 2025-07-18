import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useChatStore } from '../state/chatStore';
import { cn } from '../utils/cn';

interface ChatScreenProps {
  navigation: any;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ navigation }) => {
  const { messages, isLoading, sendMessage, clearChat } = useChatStore();
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSend = async () => {
    if (inputText.trim() && !isLoading) {
      const message = inputText.trim();
      setInputText('');
      await sendMessage(message);
    }
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isUser = item.role === 'user';
    return (
      <View className={cn(
        "mx-4 mb-4 flex-row",
        isUser ? "justify-end" : "justify-start"
      )}>
        <View className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3",
          isUser 
            ? "bg-blue-500" 
            : "bg-gray-100"
        )}>
          <Text className={cn(
            "text-base",
            isUser ? "text-white" : "text-gray-900"
          )}>
            {item.content}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
        <Pressable
          onPress={() => navigation.goBack()}
          className="w-10 h-10 items-center justify-center rounded-full"
        >
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </Pressable>
        
        <Text className="text-xl font-semibold text-gray-900">AI Assistant</Text>
        
        <Pressable
          onPress={clearChat}
          className="w-10 h-10 items-center justify-center rounded-full"
        >
          <Ionicons name="trash-outline" size={20} color="#6B7280" />
        </Pressable>
      </View>

      <KeyboardAvoidingView 
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          className="flex-1"
          contentContainerStyle={{ paddingTop: 16 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center px-8">
              <Ionicons name="chatbubbles-outline" size={64} color="#D1D5DB" />
              <Text className="text-gray-500 text-center mt-4 text-base">
                Ask me anything about your account, budget, or financial goals!
              </Text>
              <Text className="text-gray-400 text-center mt-2 text-sm">
                I can help with transactions, spending insights, and financial tips.
              </Text>
            </View>
          }
        />

        {/* Loading indicator */}
        {isLoading && (
          <View className="flex-row items-center justify-center py-4">
            <ActivityIndicator size="small" color="#3B82F6" />
            <Text className="ml-2 text-gray-500">AI is thinking...</Text>
          </View>
        )}

        {/* Input */}
        <View className="flex-row items-center px-4 py-3 border-t border-gray-200">
          <View className="flex-1 flex-row items-center bg-gray-100 rounded-full px-4 py-2">
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask about your account..."
              placeholderTextColor="#9CA3AF"
              className="flex-1 text-base text-gray-900"
              multiline
              maxLength={500}
              onSubmitEditing={handleSend}
              blurOnSubmit={false}
            />
          </View>
          
          <Pressable
            onPress={handleSend}
            disabled={!inputText.trim() || isLoading}
            className={cn(
              "ml-3 w-10 h-10 rounded-full items-center justify-center",
              inputText.trim() && !isLoading
                ? "bg-blue-500"
                : "bg-gray-300"
            )}
          >
            <Ionicons 
              name="send" 
              size={20} 
              color={inputText.trim() && !isLoading ? "white" : "#9CA3AF"} 
            />
          </Pressable>
        </View>
        
        <View style={{ height: insets.bottom }} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatScreen;