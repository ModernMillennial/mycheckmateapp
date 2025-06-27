import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction, UserSettings, FilterType } from '../types';
import { generateSeedTransactions } from '../utils/seedData';

interface TransactionState {
  transactions: Transaction[];
  settings: UserSettings;
  searchQuery: string;
  filterType: FilterType;
  isInitialized: boolean;
  
  // Actions
  addTransaction: (transaction: Omit<Transaction, 'id' | 'runningBalance'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  toggleReconciled: (id: string) => void;
  setSearchQuery: (query: string) => void;
  setFilterType: (filter: FilterType) => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
  calculateRunningBalance: () => void;
  syncBankTransactions: (bankTransactions: Omit<Transaction, 'id' | 'runningBalance'>[]) => void;
  initializeWithSeedData: () => void;
}

const initialSettings: UserSettings = {
  startDate: new Date().toISOString().split('T')[0],
  monthlyResetEnabled: false,
  lastBalance: 0,
  bankLinked: false,
};

export const useTransactionStore = create<TransactionState>()(
  persist(
    (set, get) => ({
      transactions: [],
      settings: initialSettings,
      searchQuery: '',
      filterType: 'all',
      isInitialized: false,

      addTransaction: (transaction) => {
        const newTransaction: Transaction = {
          ...transaction,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          runningBalance: 0, // Will be calculated after adding
        };

        set((state) => ({
          transactions: [...state.transactions, newTransaction],
        }));
        
        // Recalculate running balances
        get().calculateRunningBalance();
      },

      updateTransaction: (id, updates) => {
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        }));
        
        // Recalculate running balances if amount changed
        if (updates.amount !== undefined) {
          get().calculateRunningBalance();
        }
      },

      deleteTransaction: (id) => {
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        }));
        get().calculateRunningBalance();
      },

      toggleReconciled: (id) => {
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, reconciled: !t.reconciled } : t
          ),
        }));
      },

      setSearchQuery: (query) => {
        set({ searchQuery: query });
      },

      setFilterType: (filter) => {
        set({ filterType: filter });
      },

      updateSettings: (settingsUpdate) => {
        set((state) => ({
          settings: { ...state.settings, ...settingsUpdate },
        }));
      },

      calculateRunningBalance: () => {
        const { transactions, settings } = get();
        const sortedTransactions = [...transactions].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        let runningBalance = settings.lastBalance;
        const updatedTransactions = sortedTransactions.map((transaction) => {
          runningBalance += transaction.amount;
          return { ...transaction, runningBalance };
        });

        set({ transactions: updatedTransactions });
      },

      syncBankTransactions: (bankTransactions) => {
        const existingIds = new Set(get().transactions.map(t => t.id));
        const newTransactions = bankTransactions
          .filter(t => !existingIds.has(t.id))
          .map(t => ({
            ...t,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            runningBalance: 0,
          }));

        set((state) => ({
          transactions: [...state.transactions, ...newTransactions],
        }));
        
        get().calculateRunningBalance();
      },

      initializeWithSeedData: () => {
        const { isInitialized } = get();
        if (!isInitialized) {
          const seedTransactions = generateSeedTransactions();
          const transactionsWithIds = seedTransactions.map(t => ({
            ...t,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            runningBalance: 0,
          }));

          set({
            transactions: transactionsWithIds,
            isInitialized: true,
          });
          
          get().calculateRunningBalance();
        }
      },
    }),
    {
      name: 'transaction-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        transactions: state.transactions,
        settings: state.settings,
        isInitialized: state.isInitialized,
      }),
    }
  )
);