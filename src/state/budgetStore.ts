import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Budget, BudgetSpending } from '../types';

interface BudgetState {
  budgets: Budget[];
  
  // Actions
  addBudget: (budget: Omit<Budget, 'id' | 'createdDate'>) => void;
  updateBudget: (id: string, updates: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  getBudgetById: (id: string) => Budget | undefined;
  getActiveBudgets: () => Budget[];
  
  // Initialize with default budgets
  initializeDefaults: () => void;
}

export const useBudgetStore = create<BudgetState>()(
  persist(
    (set, get) => ({
      budgets: [],
      
      addBudget: (budgetData) => {
        const newBudget: Budget = {
          ...budgetData,
          id: Date.now().toString(),
          createdDate: new Date().toISOString(),
        };
        
        set((state) => ({
          budgets: [...state.budgets, newBudget],
        }));
      },
      
      updateBudget: (id, updates) => {
        set((state) => ({
          budgets: state.budgets.map((budget) =>
            budget.id === id ? { ...budget, ...updates } : budget
          ),
        }));
      },
      
      deleteBudget: (id) => {
        set((state) => ({
          budgets: state.budgets.filter((budget) => budget.id !== id),
        }));
      },
      
      getBudgetById: (id) => {
        return get().budgets.find((budget) => budget.id === id);
      },
      
      getActiveBudgets: () => {
        return get().budgets.filter((budget) => budget.isActive);
      },
      
      initializeDefaults: () => {
        const { budgets } = get();
        if (budgets.length === 0) {
          const defaultBudgets: Budget[] = [
            {
              id: '1',
              name: 'Groceries',
              category: 'Groceries',
              limit: 400,
              period: 'monthly',
              color: '#10B981',
              isActive: true,
              createdDate: new Date().toISOString(),
            },
            {
              id: '2',
              name: 'Dining Out',
              category: 'Dining',
              limit: 200,
              period: 'monthly',
              color: '#F59E0B',
              isActive: true,
              createdDate: new Date().toISOString(),
            },
            {
              id: '3',
              name: 'Transportation',
              category: 'Transportation',
              limit: 300,
              period: 'monthly',
              color: '#EF4444',
              isActive: true,
              createdDate: new Date().toISOString(),
            },
            {
              id: '4',
              name: 'Bills',
              category: 'Bills',
              limit: 1800,
              period: 'monthly',
              color: '#3B82F6',
              isActive: true,
              createdDate: new Date().toISOString(),
            },
          ];
          
          set({ budgets: defaultBudgets });
        }
      },
    }),
    {
      name: 'budget-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);