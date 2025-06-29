import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction, UserSettings, FilterType, Account } from '../types';
import { plaidService } from '../services/plaidService';
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
  
  // Plaid integration
  connectPlaidAccount: (accessToken: string, accountData: any, startingDate?: string, startingBalance?: number) => void;
  syncPlaidTransactions: (accessToken: string, accountId: string, startDate: string, endDate: string) => Promise<void>;
  
  // Single account management
  getActiveAccount: () => Account | null;
  getActiveTransactions: () => Transaction[];
  getFilteredTransactionsFromStartingPoint: () => Transaction[];
  updateAccountInfo: (updates: Partial<Account>) => void;
  clearUserData: () => void;
  processManualToBankConversion: (
    currentTransactions: Transaction[], 
    newBankTransactions: Transaction[]
  ) => {
    convertedTransactions: Transaction[];
    remainingBankTransactions: Transaction[];
  };
  calculatePayeeSimilarity: (payee1: string, payee2: string) => number;
  clearAndReinitialize: () => void;
  resetToFirstTimeUser: () => void;
}

const initialSettings: UserSettings = {
  startDate: new Date().toISOString().split('T')[0],
  monthlyResetEnabled: false,
  lastBalance: 0,
  bankLinked: false,
  activeAccountId: '',
  hasAcceptedTerms: false,
  termsAcceptedDate: undefined,
  hasAcceptedPrivacy: false,
  privacyAcceptedDate: undefined,
};

export const useTransactionStore = create<TransactionState>()(
  persist(
    (set, get) => ({
      transactions: [],
      accounts: [],
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
        
        // Ensure transactions is always an array
        const allTransactions = transactions || [];
        
        if (!activeAccount) return;

        // Get transactions for active account only
        const accountTransactions = allTransactions.filter(t => t.accountId === settings.activeAccountId);
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
        const allUpdatedTransactions = allTransactions.map(t => {
          const updatedTransaction = updatedAccountTransactions.find(ut => ut.id === t.id);
          return updatedTransaction || t;
        });

        // Update account current balance - but make sure it reflects the correct balance from starting point
        const updatedAccounts = accounts.map(a => {
          if (a.id === settings.activeAccountId) {
            // Final balance should be starting balance + all transaction amounts
            return { ...a, currentBalance: finalBalance };
          }
          return a;
        });

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

        // Balance calculation is handled above
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
        const conversionResult = get().processManualToBankConversion(
          transactions, 
          newBankTransactions
        );
        const { convertedTransactions, remainingBankTransactions } = conversionResult;

        set({
          transactions: [...convertedTransactions, ...remainingBankTransactions],
        });
        
        get().calculateRunningBalance();
      },

      processManualToBankConversion: (currentTransactions, newBankTransactions) => {
        const convertedTransactions = [...currentTransactions];
        const remainingBankTransactions: Transaction[] = [];
        const usedBankTransactionIds = new Set<string>();

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
        const { accounts } = get();
        
        // Ensure there's always exactly one account
        if (accounts.length === 0) {
          const defaultAccount: Account = {
            id: 'default-account-' + Date.now(),
            name: 'My Account',
            type: 'checking',
            bankName: 'Bank Account',
            accountNumber: '****',
            isActive: true,
            startingBalance: 0,
            startingBalanceDate: new Date().toISOString().split('T')[0],
            currentBalance: 0,
            color: '#3B82F6',
          };
          
          set((state) => ({
            accounts: [defaultAccount],
            settings: { ...state.settings, activeAccountId: defaultAccount.id },
            isInitialized: true,
          }));
        } else {
          // If there are multiple accounts, keep only the first one
          const firstAccount = accounts[0];
          set((state) => ({
            accounts: [firstAccount],
            settings: { ...state.settings, activeAccountId: firstAccount.id },
            isInitialized: true,
          }));
        }
      },

      // Single account management - simplified
      updateAccountInfo: (updates) => {
        set((state) => ({
          accounts: state.accounts.map((account) => 
            account.id === state.settings.activeAccountId 
              ? { ...account, ...updates }
              : account
          ),
        }));
      },

      getActiveAccount: () => {
        const { accounts, settings } = get();
        return accounts.find(a => a.id === settings.activeAccountId) || null;
      },

      getActiveTransactions: () => {
        const { transactions, settings } = get();
        
        // Ensure transactions is always an array
        const allTransactions = transactions || [];
        
        const filtered = allTransactions.filter(t => t.accountId === settings.activeAccountId);
        return filtered;
      },

      getFilteredTransactionsFromStartingPoint: () => {
        const { transactions, settings, accounts } = get();
        const activeAccount = accounts.find(a => a.id === settings.activeAccountId);
        
        // Ensure transactions is always an array
        const allTransactions = transactions || [];
        
        // Get transactions for active account
        const accountTransactions = allTransactions.filter(t => t.accountId === settings.activeAccountId);
        
        // If no starting date or account, return all transactions
        if (!activeAccount?.startingBalanceDate) {
          return accountTransactions;
        }
        
        // Filter transactions to only show those after the starting point date
        const filteredTransactions = accountTransactions.filter(transaction => {
          const transactionDate = new Date(transaction.date);
          const startingDate = new Date(activeAccount.startingBalanceDate);
          
          // Show transactions that are on or after the starting point date
          // Note: The RegisterScreen handles showing the starting balance separately
          return transactionDate >= startingDate;
        });
        
        return filteredTransactions;
      },



      clearAndReinitialize: () => {
        set({
          transactions: [],
          accounts: [],
          settings: { ...initialSettings, bankLinked: false },
          isInitialized: false,
        });
      },

      resetToFirstTimeUser: () => {
        set({
          transactions: [],
          accounts: [],
          settings: { ...initialSettings, bankLinked: false },
          isInitialized: false,
        });
      },

      clearUserData: () => {
        set({
          transactions: [],
          accounts: [],
          settings: { ...initialSettings, bankLinked: false },
          notificationSettings: defaultNotificationSettings,
          searchQuery: '',
          filterType: 'all',
          isInitialized: false,
        });
      },

      connectPlaidAccount: (accessToken, accountData, startingDate, startingBalance) => {
        const { accounts, transactions } = get();
        
        // Update the existing default account with Plaid data
        const updatedAccount = {
          id: accounts[0]?.id || 'default-account-' + Date.now(),
          name: accountData.name || accountData.official_name || 'Connected Account',
          type: accountData.subtype as 'checking' | 'savings' | 'credit',
          bankName: 'Connected via Plaid',
          accountNumber: accountData.mask || '****',
          isActive: true,
          startingBalance: startingBalance || accountData.balances?.current || 0,
          startingBalanceDate: startingDate || new Date().toISOString().split('T')[0],
          currentBalance: startingBalance || accountData.balances?.current || 0,
          color: accountData.subtype === 'savings' ? '#10B981' : '#3B82F6',
          plaidAccessToken: accessToken, // Store access token for future syncs
        };

        set((state) => ({
          accounts: [updatedAccount], // Replace with updated account
          settings: { ...state.settings, bankLinked: true, activeAccountId: updatedAccount.id },
        }));
      },

      syncPlaidTransactions: async (accessToken, accountId, startDate, endDate) => {
        try {
          const plaidTransactions = await plaidService.getTransactionsOrDemo(
            accessToken, 
            [accountId], 
            startDate, 
            endDate
          );

          const convertedTransactions = plaidTransactions.map(plaidTx => 
            plaidService.convertPlaidTransactionToApp(plaidTx, 'user-1')
          );

          // Use existing sync logic to avoid duplicates and handle conversions
          get().syncBankTransactions(convertedTransactions);
        } catch (error) {
          console.error('Error syncing Plaid transactions:', error);
          throw error;
        }
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