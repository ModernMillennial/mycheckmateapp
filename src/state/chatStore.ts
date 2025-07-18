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
        // Import transaction store to get actual data
        const { useTransactionStore } = await import('./transactionStore');
        const transactionStore = useTransactionStore.getState();
        
        // Get actual account data
        const activeAccount = transactionStore.getActiveAccount();
        const transactions = transactionStore.getActiveTransactions();
        const currentBalance = transactionStore.getCurrentBalance();
        const totalIncome = transactionStore.getTotalIncome();
        const totalExpenses = transactionStore.getTotalExpenses();
        
        // Sort transactions by date (most recent first)
        const recentTransactions = transactions
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 10); // Get last 10 transactions
        
        // Calculate recent spending patterns
        const last30Days = new Date();
        last30Days.setDate(last30Days.getDate() - 30);
        
        const recentTransactions30Days = transactions.filter(t => 
          new Date(t.date) >= last30Days
        );
        
        const recentIncome = recentTransactions30Days
          .filter(t => t.amount > 0)
          .reduce((sum, t) => sum + t.amount, 0);
          
        const recentExpenses = Math.abs(recentTransactions30Days
          .filter(t => t.amount < 0)
          .reduce((sum, t) => sum + t.amount, 0));
        
        // Create context with actual account data
        const accountContext = `You are a helpful AI assistant for a personal finance app. The user is asking about their account and you have access to their actual financial data. Always provide specific, exact answers using the real data provided below.

CURRENT ACCOUNT DATA:
- Account Name: ${activeAccount?.name || 'Unknown'}
- Current Balance: ${currentBalance.toFixed(2)}
- Account Type: ${activeAccount?.type || 'Unknown'}
- Bank: ${activeAccount?.bankName || 'Unknown'}

FINANCIAL SUMMARY:
- Total Income (All Time): ${totalIncome.toFixed(2)}
- Total Expenses (All Time): ${totalExpenses.toFixed(2)}
- Recent Income (Last 30 days): ${recentIncome.toFixed(2)}
- Recent Expenses (Last 30 days): ${recentExpenses.toFixed(2)}

RECENT TRANSACTIONS (Last 10):
${recentTransactions.map(t => 
  `- ${t.date}: ${t.payee} - ${t.amount >= 0 ? '+' : ''}${t.amount.toFixed(2)} (Balance: ${t.runningBalance.toFixed(2)})`
).join('\n')}

IMPORTANT INSTRUCTIONS:
- Always provide exact dollar amounts from the data above
- When asked about account balance, give the specific current balance: ${currentBalance.toFixed(2)}
- When asked about recent transactions, reference the actual transactions listed above
- When asked about spending patterns, use the actual income/expense data provided
- Be specific and factual - never say "check your dashboard" when you have the actual data
- If asked about specific transactions or payees, search through the transaction list provided
- Provide actionable insights based on the real data patterns you see

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