import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getOpenAIChatResponse } from '../api/chat-service';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  sendMessage: (content: string) => Promise<void>;
  clearChat: () => void;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

export const useChatStore = create<ChatState>()(persist(
  (set, get) => ({
    messages: [],
    isLoading: false,
    _hasHydrated: false,

    setHasHydrated: (state: boolean) => {
      set({ _hasHydrated: state });
    },

    addMessage: (message) => {
      const newMessage: ChatMessage = {
        ...message,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        timestamp: new Date(),
      };
      set((state) => ({
        messages: [...state.messages, newMessage],
      }));
    },

    sendMessage: async (content: string) => {
      const { addMessage } = get();
      
      // Add user message
      addMessage({ role: 'user', content });
      
      set({ isLoading: true });
      
      try {
        // Create context about the user's account for the AI
        const accountContext = `You are a helpful AI assistant for a personal finance app. The user is asking about their account. 
You can help with questions about:
- Account balances and transactions
- Budget planning and spending patterns
- Financial advice and tips
- App features and navigation

Be friendly, helpful, and provide practical financial guidance. If you need specific account data that you don't have access to, let the user know they can check their dashboard or transactions screen.

User question: ${content}`;
        
        const response = await getOpenAIChatResponse(accountContext);
        
        // Add AI response
        addMessage({ role: 'assistant', content: response.content });
      } catch (error) {
        addMessage({ 
          role: 'assistant', 
          content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment." 
        });
      } finally {
        set({ isLoading: false });
      }
    },

    clearChat: () => {
      set({ messages: [] });
    },
  }),
  {
    name: 'chat-storage',
    storage: createJSONStorage(() => AsyncStorage),
    onRehydrateStorage: () => (state) => {
      state?.setHasHydrated(true);
    },
  }
));