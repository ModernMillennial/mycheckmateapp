import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PlaidAccount, PlaidTransaction, plaidAPI } from '../api/plaid';

// Types
export interface PlaidItem {
  id: string;
  accessToken: string;
  itemId: string;
  institutionId: string;
  institutionName: string;
  accounts: PlaidAccount[];
  lastUpdate: string;
  isActive: boolean;
}

export interface PlaidState {
  // Items and accounts
  items: PlaidItem[];
  selectedItem: PlaidItem | null;
  selectedAccount: PlaidAccount | null;
  
  // Transactions
  transactions: PlaidTransaction[];
  transactionsByAccount: Record<string, PlaidTransaction[]>;
  
  // UI state
  isLoading: boolean;
  error: string | null;
  isLinkingAccount: boolean;
  
  // Actions
  addItem: (item: PlaidItem) => void;
  removeItem: (itemId: string) => void;
  updateItem: (itemId: string, updates: Partial<PlaidItem>) => void;
  setSelectedItem: (item: PlaidItem | null) => void;
  setSelectedAccount: (account: PlaidAccount | null) => void;
  
  // Transaction actions
  setTransactions: (transactions: PlaidTransaction[]) => void;
  addTransactions: (transactions: PlaidTransaction[]) => void;
  setTransactionsByAccount: (accountId: string, transactions: PlaidTransaction[]) => void;
  
  // API actions
  linkAccount: (publicToken: string, institutionName: string) => Promise<void>;
  refreshAccounts: (itemId: string) => Promise<void>;
  refreshTransactions: (itemId: string, startDate?: string, endDate?: string) => Promise<void>;
  unlinkAccount: (itemId: string) => Promise<void>;
  
  // Utility actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setLinkingAccount: (linking: boolean) => void;
  clearError: () => void;
  reset: () => void;
}

// Helper functions
const generateItemId = () => `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const getDateRange = (days: number = 30): [string, string] => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return [formatDate(startDate), formatDate(endDate)];
};

// Initial state
const initialState = {
  items: [],
  selectedItem: null,
  selectedAccount: null,
  transactions: [],
  transactionsByAccount: {},
  isLoading: false,
  error: null,
  isLinkingAccount: false,
};

export const usePlaidStore = create<PlaidState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Basic setters
      addItem: (item) => set((state) => ({ 
        items: [...state.items, item] 
      })),

      removeItem: (itemId) => set((state) => ({
        items: state.items.filter(item => item.id !== itemId),
        selectedItem: state.selectedItem?.id === itemId ? null : state.selectedItem,
        selectedAccount: state.selectedItem?.id === itemId ? null : state.selectedAccount,
      })),

      updateItem: (itemId, updates) => set((state) => ({
        items: state.items.map(item => 
          item.id === itemId ? { ...item, ...updates } : item
        ),
        selectedItem: state.selectedItem?.id === itemId 
          ? { ...state.selectedItem, ...updates }
          : state.selectedItem,
      })),

      setSelectedItem: (item) => set({ selectedItem: item }),
      setSelectedAccount: (account) => set({ selectedAccount: account }),

      // Transaction setters
      setTransactions: (transactions) => set({ transactions }),
      addTransactions: (transactions) => set((state) => ({
        transactions: [...state.transactions, ...transactions]
      })),
      setTransactionsByAccount: (accountId, transactions) => set((state) => ({
        transactionsByAccount: {
          ...state.transactionsByAccount,
          [accountId]: transactions
        }
      })),

      // UI state setters
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      setLinkingAccount: (linking) => set({ isLinkingAccount: linking }),
      clearError: () => set({ error: null }),

      // API actions
      linkAccount: async (publicToken, institutionName) => {
        const { setLoading, setError, setLinkingAccount, addItem } = get();
        
        try {
          setLinkingAccount(true);
          setLoading(true);
          setError(null);

          // Exchange public token for access token
          const exchange = await plaidAPI.exchangePublicToken(publicToken);
          const { access_token, item_id } = exchange;

          // Get accounts
          const accountsResponse = await plaidAPI.getAccounts(access_token);
          const accounts = accountsResponse.accounts;

          // Create new item
          const newItem: PlaidItem = {
            id: generateItemId(),
            accessToken: access_token,
            itemId: item_id,
            institutionId: accounts[0]?.account_id || '',
            institutionName,
            accounts,
            lastUpdate: new Date().toISOString(),
            isActive: true,
          };

          addItem(newItem);

        } catch (error) {
          setError(error instanceof Error ? error.message : 'Failed to link account');
          throw error;
        } finally {
          setLoading(false);
          setLinkingAccount(false);
        }
      },

      refreshAccounts: async (itemId) => {
        const { setLoading, setError, updateItem, items } = get();
        
        try {
          setLoading(true);
          setError(null);

          const item = items.find(i => i.id === itemId);
          if (!item) throw new Error('Item not found');

          // Get updated accounts
          const accountsResponse = await plaidAPI.getAccounts(item.accessToken);
          const accounts = accountsResponse.accounts;

          updateItem(itemId, {
            accounts,
            lastUpdate: new Date().toISOString(),
          });

        } catch (error) {
          setError(error instanceof Error ? error.message : 'Failed to refresh accounts');
          throw error;
        } finally {
          setLoading(false);
        }
      },

      refreshTransactions: async (itemId, startDate, endDate) => {
        const { setLoading, setError, items, setTransactionsByAccount } = get();
        
        try {
          setLoading(true);
          setError(null);

          const item = items.find(i => i.id === itemId);
          if (!item) throw new Error('Item not found');

          // Use provided dates or default to last 30 days
          const [start, end] = startDate && endDate 
            ? [startDate, endDate] 
            : getDateRange(30);

          // Get transactions
          const transactionsResponse = await plaidAPI.getTransactions(
            item.accessToken,
            start,
            end
          );

          const transactions = transactionsResponse.transactions;

          // Group transactions by account
          const transactionsByAccount: Record<string, PlaidTransaction[]> = {};
          transactions.forEach(transaction => {
            if (!transactionsByAccount[transaction.account_id]) {
              transactionsByAccount[transaction.account_id] = [];
            }
            transactionsByAccount[transaction.account_id].push(transaction);
          });

          // Update store
          Object.keys(transactionsByAccount).forEach(accountId => {
            setTransactionsByAccount(accountId, transactionsByAccount[accountId]);
          });

        } catch (error) {
          setError(error instanceof Error ? error.message : 'Failed to refresh transactions');
          throw error;
        } finally {
          setLoading(false);
        }
      },

      unlinkAccount: async (itemId) => {
        const { setLoading, setError, removeItem, items } = get();
        
        try {
          setLoading(true);
          setError(null);

          const item = items.find(i => i.id === itemId);
          if (!item) throw new Error('Item not found');

          // Remove from Plaid
          await plaidAPI.removeItem(item.accessToken);

          // Remove from local state
          removeItem(itemId);

        } catch (error) {
          setError(error instanceof Error ? error.message : 'Failed to unlink account');
          throw error;
        } finally {
          setLoading(false);
        }
      },

      // Utility
      reset: () => set(initialState),
    }),
    {
      name: 'plaid-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        items: state.items,
        selectedItem: state.selectedItem,
        selectedAccount: state.selectedAccount,
        transactionsByAccount: state.transactionsByAccount,
      }),
    }
  )
);

// Selectors
export const usePlaidItems = () => usePlaidStore((state) => state.items);
export const useSelectedItem = () => usePlaidStore((state) => state.selectedItem);
export const useSelectedAccount = () => usePlaidStore((state) => state.selectedAccount);
export const usePlaidTransactions = () => usePlaidStore((state) => state.transactions);
export const usePlaidLoading = () => usePlaidStore((state) => state.isLoading);
export const usePlaidError = () => usePlaidStore((state) => state.error);
export const useIsLinkingAccount = () => usePlaidStore((state) => state.isLinkingAccount);

// Computed selectors
export const useAccountsByItem = (itemId: string) => 
  usePlaidStore((state) => state.items.find(item => item.id === itemId)?.accounts || []);

export const useTransactionsByAccount = (accountId: string) =>
  usePlaidStore((state) => state.transactionsByAccount[accountId] || []);

export const useTotalBalance = () => 
  usePlaidStore((state) => {
    return state.items.reduce((total, item) => {
      return total + item.accounts.reduce((itemTotal, account) => {
        return itemTotal + (account.balances.current || 0);
      }, 0);
    }, 0);
  });

export const useAccountBalance = (accountId: string) =>
  usePlaidStore((state) => {
    for (const item of state.items) {
      const account = item.accounts.find(acc => acc.account_id === accountId);
      if (account) {
        return account.balances.current || 0;
      }
    }
    return 0;
  });