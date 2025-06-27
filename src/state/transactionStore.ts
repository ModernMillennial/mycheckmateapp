import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction, UserSettings, FilterType } from '../types';
import { generateSeedTransactions } from '../utils/seedData';
import {
  NotificationSettings,
  defaultNotificationSettings,
  scheduleDepositNotification,
  scheduleDebitNotification,
  scheduleOverdraftWarning,
  scheduleOverdraftAlert,
} from '../utils/notifications';

interface TransactionState {
  transactions: Transaction[];
  settings: UserSettings;
  notificationSettings: NotificationSettings;
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
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
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
      notificationSettings: defaultNotificationSettings,
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

      updateNotificationSettings: (settingsUpdate) => {
        set((state) => ({
          notificationSettings: { ...state.notificationSettings, ...settingsUpdate },
        }));
      },

      calculateRunningBalance: () => {
        const { transactions, settings, notificationSettings } = get();
        const sortedTransactions = [...transactions].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        let runningBalance = settings.lastBalance;
        let previousBalance = runningBalance;
        
        const updatedTransactions = sortedTransactions.map((transaction, index) => {
          previousBalance = runningBalance;
          runningBalance += transaction.amount;
          
          // Only trigger notifications for new bank transactions (source: 'bank' and recent)
          const isRecentBankTransaction = transaction.source === 'bank' && 
            new Date(transaction.date).getTime() > Date.now() - 86400000; // Within 24 hours
          
          if (isRecentBankTransaction) {
            // Trigger deposit notification
            if (transaction.amount > 0 && notificationSettings.depositsEnabled) {
              scheduleDepositNotification(transaction.amount, transaction.payee, runningBalance);
            }
            
            // Trigger debit notification
            if (transaction.amount < 0 && notificationSettings.debitsEnabled) {
              scheduleDebitNotification(transaction.amount, transaction.payee, runningBalance);
            }
          }
          
          return { ...transaction, runningBalance };
        });

        // Check for overdraft warnings after all transactions are processed
        const finalBalance = runningBalance;
        
        if (notificationSettings.overdraftWarningEnabled) {
          // Overdraft alert (balance is negative)
          if (finalBalance < 0 && previousBalance >= 0) {
            scheduleOverdraftAlert(finalBalance);
          }
          // Low balance warning (below threshold but positive)
          else if (finalBalance > 0 && finalBalance <= notificationSettings.overdraftThreshold && 
                   previousBalance > notificationSettings.overdraftThreshold) {
            scheduleOverdraftWarning(finalBalance, notificationSettings.overdraftThreshold);
          }
        }

        set({ transactions: updatedTransactions });
      },

      syncBankTransactions: (bankTransactions) => {
        const { transactions } = get();
        
        // Create new bank transactions that don't already exist
        const existingBankTransactions = transactions.filter(t => t.source === 'bank');
        const existingBankIds = new Set(existingBankTransactions.map(t => `${t.date}-${t.amount}-${t.payee}`));
        
        const newBankTransactions = bankTransactions
          .filter(t => !existingBankIds.has(`${t.date}-${t.amount}-${t.payee}`))
          .map(t => ({
            ...t,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            runningBalance: 0,
            reconciled: true, // Bank transactions are automatically reconciled
          }));

        // Auto-reconcile existing manual transactions that match bank data
        const updatedTransactions = transactions.map(transaction => {
          if (transaction.source === 'manual' && !transaction.reconciled) {
            // Check if this manual transaction matches any bank transaction
            const matchingBankTransaction = [...existingBankTransactions, ...newBankTransactions].find(bankTx => 
              Math.abs(new Date(bankTx.date).getTime() - new Date(transaction.date).getTime()) <= 86400000 * 3 && // Within 3 days
              Math.abs(bankTx.amount - transaction.amount) < 0.01 && // Same amount (within 1 cent)
              (bankTx.payee.toLowerCase().includes(transaction.payee.toLowerCase().split(' ')[0]) ||
               transaction.payee.toLowerCase().includes(bankTx.payee.toLowerCase().split(' ')[0]))
            );
            
            if (matchingBankTransaction) {
              return { ...transaction, reconciled: true };
            }
          }
          return transaction;
        });

        set({
          transactions: [...updatedTransactions, ...newBankTransactions],
        });
        
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
        notificationSettings: state.notificationSettings,
        isInitialized: state.isInitialized,
      }),
    }
  )
);