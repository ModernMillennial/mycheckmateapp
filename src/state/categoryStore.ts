import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Category {
  id: string;
  name: string;
  color: string;
  isDefault: boolean;
}

interface CategoryState {
  categories: Category[];
  
  // Actions
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  getCategories: () => Category[];
  initializeDefaults: () => void;
}

const defaultCategories: Category[] = [
  { id: '1', name: 'Groceries', color: '#10B981', isDefault: true },
  { id: '2', name: 'Dining', color: '#F59E0B', isDefault: true },
  { id: '3', name: 'Transportation', color: '#EF4444', isDefault: true },
  { id: '4', name: 'Bills', color: '#3B82F6', isDefault: true },
  { id: '5', name: 'Shopping', color: '#8B5CF6', isDefault: true },
  { id: '6', name: 'Entertainment', color: '#EC4899', isDefault: true },
  { id: '7', name: 'Income', color: '#14B8A6', isDefault: true },
  { id: '8', name: 'Other', color: '#6B7280', isDefault: true },
];

export const useCategoryStore = create<CategoryState>()(
  persist(
    (set, get) => ({
      categories: [],
      
      addCategory: (categoryData) => {
        const newCategory: Category = {
          ...categoryData,
          id: Date.now().toString(),
        };
        
        set((state) => ({
          categories: [...state.categories, newCategory],
        }));
      },
      
      updateCategory: (id, updates) => {
        set((state) => ({
          categories: state.categories.map((category) =>
            category.id === id ? { ...category, ...updates } : category
          ),
        }));
      },
      
      deleteCategory: (id) => {
        set((state) => ({
          categories: state.categories.filter((category) => 
            category.id !== id && category.isDefault !== true
          ),
        }));
      },
      
      getCategories: () => {
        return get().categories;
      },
      
      initializeDefaults: () => {
        const { categories } = get();
        if (categories.length === 0) {
          set({ categories: defaultCategories });
        }
      },
    }),
    {
      name: 'category-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);