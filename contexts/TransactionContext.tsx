import React, { createContext, ReactNode, useContext, useState } from 'react';

// Define the structure of a transaction
export type TransactionType = 'income' | 'expense' | 'savings' | 'debt' | 'investment';

export interface Transaction {
    id: string;
    type: TransactionType;
    amount: number;
    title: string;
    date: string;
    categoryId?: string;
}

export type GoalPeriod = 'Daily' | 'Weekly' | 'Monthly';

export interface Category {
    id: string;
    name: string;
    type: string;
    group: string;
    limit: number;
    icon: string;
    color: string;
}

// Define what our context will provide
interface TransactionContextData {
    transactions: Transaction[];
    addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
    getTransactionsByType: (type: TransactionType) => Transaction[];
    getTotalBalance: () => number;
    getTotalByType: (type: TransactionType) => number;
    savingsGoal: number;
    setSavingsGoal: (goal: number) => void;
    savingsGoalPeriod: GoalPeriod;
    setSavingsGoalPeriod: (period: GoalPeriod) => void;
    expenseGoal: number;
    setExpenseGoal: (goal: number) => void;
    expenseGoalPeriod: GoalPeriod;
    setExpenseGoalPeriod: (period: GoalPeriod) => void;
    debtLimit: number;
    setDebtLimit: (limit: number) => void;
    debtLimitPeriod: GoalPeriod;
    setDebtLimitPeriod: (period: GoalPeriod) => void;
    investmentLimit: number;
    setInvestmentLimit: (limit: number) => void;
    investmentLimitPeriod: GoalPeriod;
    setInvestmentLimitPeriod: (period: GoalPeriod) => void;
    incomeGoal: number;
    setIncomeGoal: (goal: number) => void;
    incomeGoalPeriod: GoalPeriod;
    setIncomeGoalPeriod: (period: GoalPeriod) => void;
    categories: Category[];
    addCategory: (category: Omit<Category, 'id'>) => void;
    updateCategory: (id: string, category: Partial<Category>) => void;
    deleteCategory: (id: string) => void;
    updateCategoryOrder: (newCategories: Category[]) => void;
    deleteTransaction: (id: string) => void;
    budget: number;
    setBudget: (budget: number) => void;
    budgetPeriod: GoalPeriod;
    setBudgetPeriod: (period: GoalPeriod) => void;
    subtractSavingsFromBudget: boolean;
    setSubtractSavingsFromBudget: (value: boolean) => void;
    subtractInvestmentFromBudget: boolean;
    setSubtractInvestmentFromBudget: (value: boolean) => void;
    subtractDebtFromBudget: boolean;
    setSubtractDebtFromBudget: (value: boolean) => void;
}

// Create the context with a default undefined value
const TransactionContext = createContext<TransactionContextData | undefined>(undefined);

// Props for the Provider component
interface TransactionProviderProps {
    children: ReactNode;
}

export const TransactionProvider: React.FC<TransactionProviderProps> = ({ children }) => {
    // We'll start with an empty array. Later, this could be loaded from AsyncStorage/a database.
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [savingsGoal, setSavingsGoal] = useState<number>(0);
    const [savingsGoalPeriod, setSavingsGoalPeriod] = useState<GoalPeriod>('Monthly');
    const [expenseGoal, setExpenseGoal] = useState<number>(0);
    const [expenseGoalPeriod, setExpenseGoalPeriod] = useState<GoalPeriod>('Monthly');
    const [debtLimit, setDebtLimit] = useState<number>(0);
    const [debtLimitPeriod, setDebtLimitPeriod] = useState<GoalPeriod>('Monthly');
    const [investmentLimit, setInvestmentLimit] = useState<number>(0);
    const [investmentLimitPeriod, setInvestmentLimitPeriod] = useState<GoalPeriod>('Monthly');
    const [incomeGoal, setIncomeGoal] = useState<number>(0);
    const [incomeGoalPeriod, setIncomeGoalPeriod] = useState<GoalPeriod>('Monthly');
    const [categories, setCategories] = useState<Category[]>([]);
    const [budget, setBudget] = useState<number>(0);
    const [budgetPeriod, setBudgetPeriod] = useState<GoalPeriod>('Monthly');
    const [subtractSavingsFromBudget, setSubtractSavingsFromBudget] = useState<boolean>(true);
    const [subtractInvestmentFromBudget, setSubtractInvestmentFromBudget] = useState<boolean>(true);
    const [subtractDebtFromBudget, setSubtractDebtFromBudget] = useState<boolean>(true);

    const addTransaction = (transactionData: Omit<Transaction, 'id'>) => {
        const newTransaction: Transaction = {
            ...transactionData,
            id: Date.now().toString() + Math.random().toString(36).substring(7),
        };
        setTransactions((prev) => [newTransaction, ...prev]);
    };

    const deleteTransaction = (id: string) => {
        setTransactions((prev) => prev.filter(t => t.id !== id));
    };

    const addCategory = (categoryData: Omit<Category, 'id'>) => {
        const newCategory: Category = {
            ...categoryData,
            id: Date.now().toString() + Math.random().toString(36).substring(7),
        };
        setCategories((prev) => [newCategory, ...prev]);
    };

    const updateCategory = (id: string, updatedFields: Partial<Category>) => {
        setCategories((prev) => prev.map(c =>
            c.id === id ? { ...c, ...updatedFields } : c
        ));
    };

    const deleteCategory = (id: string) => {
        setCategories((prev) => prev.filter(c => c.id !== id));
        setTransactions((prev) => prev.filter(t => t.categoryId !== id));
    };

    const updateCategoryOrder = (newCategories: Category[]) => {
        setCategories(newCategories);
    };

    const getTransactionsByType = (type: TransactionType) => {
        return transactions.filter(t => t.type === type);
    };

    const getTotalByType = (type: TransactionType) => {
        return transactions
            .filter(t => t.type === type)
            .reduce((total, t) => total + t.amount, 0);
    };

    const getTotalBalance = () => {
        const totalIncome = getTotalByType('income');
        const totalExpense = getTotalByType('expense');
        const totalSavings = getTotalByType('savings');
        const totalDebt = getTotalByType('debt');
        const totalInvestment = getTotalByType('investment');

        let balance = totalIncome - totalExpense;
        if (subtractSavingsFromBudget) balance -= totalSavings;
        if (subtractDebtFromBudget) balance -= totalDebt;
        if (subtractInvestmentFromBudget) balance -= totalInvestment;

        return balance;
    };

    return (
        <TransactionContext.Provider
            value={{
                transactions,
                addTransaction,
                getTransactionsByType,
                getTotalBalance,
                getTotalByType,
                savingsGoal,
                setSavingsGoal,
                savingsGoalPeriod,
                setSavingsGoalPeriod,
                expenseGoal,
                setExpenseGoal,
                expenseGoalPeriod,
                setExpenseGoalPeriod,
                debtLimit,
                setDebtLimit,
                debtLimitPeriod,
                setDebtLimitPeriod,
                investmentLimit,
                setInvestmentLimit,
                investmentLimitPeriod,
                setInvestmentLimitPeriod,
                incomeGoal,
                setIncomeGoal,
                incomeGoalPeriod,
                setIncomeGoalPeriod,
                categories,
                addCategory,
                updateCategory,
                deleteCategory,
                updateCategoryOrder,
                deleteTransaction,
                budget,
                setBudget,
                budgetPeriod,
                setBudgetPeriod,
                subtractSavingsFromBudget,
                setSubtractSavingsFromBudget,
                subtractInvestmentFromBudget,
                setSubtractInvestmentFromBudget,
                subtractDebtFromBudget,
                setSubtractDebtFromBudget
            }}
        >
            {children}
        </TransactionContext.Provider>
    );
};

// Custom hook helper to simplify using the context
export const useTransactions = () => {
    const context = useContext(TransactionContext);
    if (context === undefined) {
        throw new Error('useTransactions must be used within a TransactionProvider');
    }
    return context;
};
