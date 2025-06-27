import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction, UserSettings, FilterType, Account } from '../types';
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
  accounts: Account[];
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
  
  // Account management
  addAccount: (account: Omit<Account, 'id'>) => void;
  updateAccount: (id: string, updates: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  switchAccount: (accountId: string) => void;
  getActiveAccount: () => Account | null;
  getActiveTransactions: () => Transaction[];
  calculateAllAccountBalances: () => void;
  processManualToBankConversion: (
    currentTransactions: Transaction[], 
    newBankTransactions: Transaction[]
  ) => {
    convertedTransactions: Transaction[];
    remainingBankTransactions: Transaction[];
  };
  calculatePayeeSimilarity: (payee1: string, payee2: string) => number;
  clearAndReinitialize: () => void;
}

const defaultAccounts: Account[] = [
  {
    id: 'checking-1',
    name: 'Primary Checking',
    type: 'checking',
    bankName: 'First National Bank',
    accountNumber: '1234',
    isActive: true,
    startingBalance: 1000.00,
    startingBalanceDate: new Date(Date.now() - 86400000 * 30).toISOString().split('T')[0], // 30 days ago
    currentBalance: 1000.00,
    color: '#3B82F6',
  },
  {
    id: 'savings-1',
    name: 'Emergency Savings',
    type: 'savings',
    bankName: 'First National Bank',
    accountNumber: '5678',
    isActive: true,
    startingBalance: 9500.00,
    startingBalanceDate: new Date(Date.now() - 86400000 * 60).toISOString().split('T')[0], // 60 days ago
    currentBalance: 9500.00,
    color: '#10B981',
  },
];

const initialSettings: UserSettings = {
  startDate: new Date().toISOString().split('T')[0],
  monthlyResetEnabled: false,
  lastBalance: 0,
  bankLinked: false,
  activeAccountId: 'checking-1',
};

export const useTransactionStore = create<TransactionState>()(
  persist(
    (set, get) => ({
      transactions: [],
      accounts: defaultAccounts,
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
        const { transactions } = get();
        const transactionToDelete = transactions.find(t => t.id === id);
        
        // Prevent deletion of bank transactions
        if (transactionToDelete && transactionToDelete.source === 'bank') {
          console.warn('Attempted to delete bank transaction - operation blocked');
          return;
        }

        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        }));
        get().calculateRunningBalance();
      },

      toggleReconciled: (id) => {
        set((state) => ({
          transactions: state.transactions.map((t) => {
            // Only allow toggling reconciliation for bank transactions
            if (t.id === id && t.source === 'bank') {
              return { ...t, reconciled: !t.reconciled };
            }
            return t;
          }),
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
        const { transactions, accounts, settings, notificationSettings } = get();
        const activeAccount = accounts.find(a => a.id === settings.activeAccountId);
        
        if (!activeAccount) return;

        // Get transactions for active account only
        const accountTransactions = transactions.filter(t => t.accountId === settings.activeAccountId);
        const sortedTransactions = [...accountTransactions].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        let runningBalance = activeAccount.startingBalance;
        let previousBalance = runningBalance;
        
        const updatedAccountTransactions = sortedTransactions.map((transaction) => {
          previousBalance = runningBalance;
          runningBalance += transaction.amount;
          
          // Only trigger notifications for new bank transactions (source: 'bank' and recent)
          const isRecentBankTransaction = transaction.source === 'bank' && 
            new Date(transaction.date).getTime() > Date.now() - 86400000; // Within 24 hours
          
          if (isRecentBankTransaction && transaction.accountId === settings.activeAccountId) {
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

        // Update account balance
        const finalBalance = runningBalance;
        
        // Update all transactions (keeping non-active account transactions unchanged)
        const allUpdatedTransactions = transactions.map(t => {
          const updatedTransaction = updatedAccountTransactions.find(ut => ut.id === t.id);
          return updatedTransaction || t;
        });

        // Update account current balance
        const updatedAccounts = accounts.map(a => 
          a.id === settings.activeAccountId 
            ? { ...a, currentBalance: finalBalance }
            : a
        );

        // Check for overdraft warnings after all transactions are processed
        if (notificationSettings.overdraftWarningEnabled && settings.activeAccountId === activeAccount.id) {
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

        set({ 
          transactions: allUpdatedTransactions,
          accounts: updatedAccounts,
        });

        // Also update other accounts if needed
        get().calculateAllAccountBalances();
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

        // Convert manual transactions to bank transactions when matches are found
        const { convertedTransactions, remainingBankTransactions } = get().processManualToBankConversion(
          transactions, 
          newBankTransactions
        );

        set({
          transactions: [...convertedTransactions, ...remainingBankTransactions],
        });
        
        get().calculateRunningBalance();
      },

      processManualToBankConversion: (currentTransactions, newBankTransactions) => {
        const convertedTransactions = [...currentTransactions];
        const remainingBankTransactions = [];
        const usedBankTransactionIds = new Set();

        // Process each new bank transaction
        newBankTransactions.forEach(bankTransaction => {
          // Find matching manual transaction
          const matchingManualIndex = convertedTransactions.findIndex(transaction => 
            transaction.source === 'manual' &&
            transaction.accountId === bankTransaction.accountId &&
            Math.abs(new Date(bankTransaction.date).getTime() - new Date(transaction.date).getTime()) <= 86400000 * 3 && // Within 3 days
            Math.abs(bankTransaction.amount - transaction.amount) < 0.01 && // Same amount (within 1 cent)
            (
              // Fuzzy payee matching
              bankTransaction.payee.toLowerCase().includes(transaction.payee.toLowerCase().split(' ')[0]) ||
              transaction.payee.toLowerCase().includes(bankTransaction.payee.toLowerCase().split(' ')[0]) ||
              get().calculatePayeeSimilarity(bankTransaction.payee, transaction.payee) > 0.6
            )
          );

          if (matchingManualIndex !== -1) {
            // Convert manual transaction to bank transaction
            const manualTransaction = convertedTransactions[matchingManualIndex];
            const convertedTransaction = {
              ...manualTransaction,
              source: 'bank' as const,
              payee: bankTransaction.payee, // Use bank's more accurate payee name
              amount: bankTransaction.amount, // Use bank's exact amount
              date: bankTransaction.date, // Use bank's exact date
              reconciled: false, // Start as unreconciled so user can see yellow check
              notes: manualTransaction.notes 
                ? `${manualTransaction.notes} [Converted from manual entry]`
                : 'Converted from manual entry',
            };
            
            convertedTransactions[matchingManualIndex] = convertedTransaction;
            usedBankTransactionIds.add(bankTransaction.id);
          } else {
            // No matching manual transaction found, add as new bank transaction
            remainingBankTransactions.push(bankTransaction);
          }
        });

        return {
          convertedTransactions,
          remainingBankTransactions,
        };
      },

      calculatePayeeSimilarity: (payee1, payee2) => {
        const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
        const normalized1 = normalize(payee1);
        const normalized2 = normalize(payee2);
        
        // Simple similarity calculation - can be enhanced
        if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
          return 1.0;
        }
        
        // Calculate Jaccard similarity using word sets
        const words1 = new Set(normalized1.split(/\s+/));
        const words2 = new Set(normalized2.split(/\s+/));
        const intersection = new Set([...words1].filter(x => words2.has(x)));
        const union = new Set([...words1, ...words2]);
        
        return intersection.size / union.size;
      },

      initializeWithSeedData: () => {
        const { isInitialized, transactions } = get();
        
        // Force reinitialize if no transactions exist or not initialized
        if (!isInitialized || transactions.length === 0) {
          console.log('Initializing seed data...');
          const seedTransactions = generateSeedTransactions();
          const transactionsWithIds = seedTransactions.map((t, index) => ({
            ...t,
            id: Date.now().toString() + index + Math.random().toString(36).substr(2, 9),
            accountId: t.accountId || 'checking-1', // Default to checking account
            runningBalance: 0,
          }));

          console.log('Created transactions:', transactionsWithIds.length);

          set({
            transactions: transactionsWithIds,
            isInitialized: true,
          });
          
          // Calculate running balance for all accounts
          get().calculateAllAccountBalances();
        } else {
          console.log('Already initialized with', transactions.length, 'transactions');
        }
      },

      // Account management functions
      addAccount: (account) => {
        const newAccount: Account = {
          ...account,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        };

        set((state) => ({
          accounts: [...state.accounts, newAccount],
        }));
      },

      updateAccount: (id, updates) => {
        set((state) => ({
          accounts: state.accounts.map((a) =>
            a.id === id ? { ...a, ...updates } : a
          ),
        }));
      },

      deleteAccount: (id) => {
        const { settings } = get();
        
        // Don't allow deleting the active account if it has transactions
        const accountTransactions = get().transactions.filter(t => t.accountId === id);
        if (accountTransactions.length > 0) {
          throw new Error('Cannot delete account with existing transactions');
        }

        set((state) => ({
          accounts: state.accounts.filter((a) => a.id !== id),
        }));

        // If we deleted the active account, switch to the first available account
        if (settings.activeAccountId === id) {
          const remainingAccounts = get().accounts;
          if (remainingAccounts.length > 0) {
            get().switchAccount(remainingAccounts[0].id);
          }
        }
      },

      switchAccount: (accountId) => {
        set((state) => ({
          settings: { ...state.settings, activeAccountId: accountId },
        }));
        // Ensure balances are calculated for the new active account
        get().calculateAllAccountBalances();
      },

      getActiveAccount: () => {
        const { accounts, settings } = get();
        return accounts.find(a => a.id === settings.activeAccountId) || null;
      },

      getActiveTransactions: () => {
        const { transactions, settings } = get();
        console.log('All transactions:', transactions.length);
        console.log('Active account ID:', settings.activeAccountId);
        const filtered = transactions.filter(t => t.accountId === settings.activeAccountId);
        console.log('Filtered transactions:', filtered.length);
        return filtered;
      },

      calculateAllAccountBalances: () => {
        const { transactions, accounts } = get();
        
        // Calculate balances for each account
        const updatedAccounts = accounts.map(account => {
          const accountTransactions = transactions
            .filter(t => t.accountId === account.id)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

          let runningBalance = account.startingBalance;
          const updatedTransactions = accountTransactions.map(transaction => {
            runningBalance += transaction.amount;
            return { ...transaction, runningBalance };
          });

          return {
            ...account,
            currentBalance: runningBalance,
          };
        });

        // Update all transactions with correct running balances
        const allUpdatedTransactions = transactions.map(transaction => {
          const account = updatedAccounts.find(a => a.id === transaction.accountId);
          if (!account) return transaction;

          const accountTransactions = transactions
            .filter(t => t.accountId === account.id)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

          let runningBalance = account.startingBalance;
          for (const t of accountTransactions) {
            runningBalance += t.amount;
            if (t.id === transaction.id) {
              return { ...transaction, runningBalance };
            }
          }
          return transaction;
        });

        set({
          accounts: updatedAccounts,
          transactions: allUpdatedTransactions,
        });
      },

      clearAndReinitialize: () => {
        console.log('Clearing and reinitializing...');
        set({
          transactions: [],
          accounts: defaultAccounts,
          settings: initialSettings,
          isInitialized: false,
        });
        
        // Force reinitialize
        get().initializeWithSeedData();
      },
    }),
    {
      name: 'transaction-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        transactions: state.transactions,
        accounts: state.accounts,
        settings: state.settings,
        notificationSettings: state.notificationSettings,
        isInitialized: state.isInitialized,
      }),
    }
  )
);