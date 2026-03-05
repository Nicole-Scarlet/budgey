import { create } from 'zustand';

export interface Category {
    id: string; // Ensure unique identifier
    name: string; // e.g. "Food", "Dog Food"
    type: string; // "Expense", "Income", "Savings", "Investment", "Debt"
    group?: string; // e.g. "Food", "Bills"
    limit?: number; // Spending Limit (e.g. 1500)
    icon: string; // Feather icon name
    color: string; // Hex color
}

export interface Transaction {
    id: string;
    title: string;
    amount: number;
    categoryId: string; // Links to Category
    type: string; // "Expense", "Income", "Debt", etc.
    date: string; // ISO String (Required)
    categoryIcon?: string; // Optional icon override
}

export interface AppState {
    budget: number;
    categories: Category[];
    transactions: Transaction[];
    setBudget: (amount: number) => void;
    addCategory: (category: Omit<Category, 'id'>) => void;
    addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
}

export const useStore = create<AppState>((set) => ({
    budget: 0,
    setBudget: (amount: number) => set({ budget: amount }),
    categories: [
        // Pre-populate defaults
        { id: '1', name: 'Food', type: 'Expense', limit: 3000, icon: 'coffee', color: '#F97316' },
        { id: '2', name: 'Personal', type: 'Expense', limit: 2000, icon: 'user', color: '#A855F7' },
        { id: '3', name: 'Transport', type: 'Expense', limit: 1500, icon: 'layout', color: '#10B981' },
        { id: '4', name: 'Bills', type: 'Expense', limit: 5000, icon: 'youtube', color: '#EF4444' },
    ],
    transactions: [
        // Pre-populate some mock data matching the previous UI
    ],
    addCategory: (category: Omit<Category, 'id'>) =>
        set((state: AppState) => ({
            categories: [...state.categories, { ...category, id: Date.now().toString() }],
        })),
    addTransaction: (transaction: Omit<Transaction, 'id'>) =>
        set((state: AppState) => ({
            transactions: [...state.transactions, { ...transaction, id: Date.now().toString() }],
        })),
}));
