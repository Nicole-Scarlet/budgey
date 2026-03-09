import React, { createContext, ReactNode, useContext, useState, useEffect } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { supabase } from '../services/supabase';

// Define the structure of a transaction
export type TransactionType = 'income' | 'expense' | 'savings' | 'debt' | 'investment';

export interface Transaction {
    id: string;
    type: TransactionType;
    amount: number;
    title: string;
    date: string;
    categoryId?: string;
    image?: string;
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
    order_index?: number;
}

export interface DebtPayment {
    id: string;
    debtId: string;
    amount: number;
    date: string;
}

export interface Debt {
    id: string;
    person: string;
    description: string;
    date: string;
    initialAmount: number;
    remainingAmount: number;
    direction: 'left' | 'right';
    status: 'pending' | 'paid';
    payments: DebtPayment[];
    categoryId?: string;
}

// Define what our context will provide
interface TransactionContextData {
    transactions: Transaction[];
    addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
    getTransactionsByType: (type: TransactionType) => Transaction[];
    getTotalBalance: () => number;
    getTotalByType: (type: TransactionType) => number;
    savingsGoal: number;
    setSavingsGoal: (goal: number) => Promise<void>;
    savingsGoalPeriod: GoalPeriod;
    setSavingsGoalPeriod: (period: GoalPeriod) => Promise<void>;
    expenseGoal: number;
    setExpenseGoal: (goal: number) => Promise<void>;
    expenseGoalPeriod: GoalPeriod;
    setExpenseGoalPeriod: (period: GoalPeriod) => Promise<void>;
    debtLimit: number;
    setDebtLimit: (limit: number) => Promise<void>;
    debtLimitPeriod: GoalPeriod;
    setDebtLimitPeriod: (period: GoalPeriod) => Promise<void>;
    investmentLimit: number;
    setInvestmentLimit: (limit: number) => Promise<void>;
    investmentLimitPeriod: GoalPeriod;
    setInvestmentLimitPeriod: (period: GoalPeriod) => Promise<void>;
    incomeGoal: number;
    setIncomeGoal: (goal: number) => Promise<void>;
    incomeGoalPeriod: GoalPeriod;
    setIncomeGoalPeriod: (period: GoalPeriod) => Promise<void>;
    categories: Category[];
    addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
    updateCategory: (id: string, category: Partial<Category>) => Promise<void>;
    deleteCategory: (id: string) => Promise<void>;
    updateCategoryOrder: (newCategories: Category[]) => Promise<void>;
    deleteTransaction: (id: string) => Promise<void>;
    budget: number;
    setBudget: (budget: number) => Promise<void>;
    budgetPeriod: GoalPeriod;
    setBudgetPeriod: (period: GoalPeriod) => Promise<void>;
    subtractSavingsFromBudget: boolean;
    setSubtractSavingsFromBudget: (value: boolean) => Promise<void>;
    subtractInvestmentFromBudget: boolean;
    setSubtractInvestmentFromBudget: (value: boolean) => Promise<void>;
    subtractDebtFromBudget: boolean;
    setSubtractDebtFromBudget: (value: boolean) => Promise<void>;
    
    // Advanced Debt System
    debts: Debt[];
    addDebt: (debt: Omit<Debt, 'id' | 'remainingAmount' | 'status' | 'payments'>) => Promise<void>;
    addPayment: (debtId: string, amount: number) => Promise<void>;
    deleteDebt: (id: string) => Promise<void>;
    syncData: () => Promise<void>;
    clearData: () => Promise<void>;
}

// Create the context with a default undefined value
const TransactionContext = createContext<TransactionContextData | undefined>(undefined);

// Props for the Provider component
interface TransactionProviderProps {
    children: ReactNode;
}

export const TransactionProvider: React.FC<TransactionProviderProps> = ({ children }) => {
    const db = useSQLiteContext();
    
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [debts, setDebts] = useState<Debt[]>([]);
    
    // Goals and settings
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
    const [budget, setBudget] = useState<number>(0);
    const [budgetPeriod, setBudgetPeriod] = useState<GoalPeriod>('Monthly');
    const [subtractSavingsFromBudget, setSubtractSavingsFromBudget] = useState<boolean>(true);
    const [subtractInvestmentFromBudget, setSubtractInvestmentFromBudget] = useState<boolean>(true);
    const [subtractDebtFromBudget, setSubtractDebtFromBudget] = useState<boolean>(true);

    // Normalizes any date string (ISO or locale) to 'March 9, 2026' format
    const normalizeDate = (dateStr: string): string => {
        if (!dateStr) return dateStr;
        // Already in locale format like "March 9, 2026" - check if it contains a comma
        // ISO format is like "2026-03-09" or "2026-03-09T00:00:00"
        try {
            // Parse robustly by splitting ISO dates manually to avoid timezone issues
            if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
                const [year, month, day] = dateStr.substring(0, 10).split('-').map(Number);
                const d = new Date(year, month - 1, day);
                return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
            }
            // Otherwise assume it's already in the correct locale format
            return dateStr;
        } catch {
            return dateStr;
        }
    };

    const loadData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const currentUserId = user?.id || 'local';

            // Load transactions
            const rawTxs = await db.getAllAsync<Transaction>(
                'SELECT * FROM transactions WHERE user_id = ? ORDER BY rowid DESC', 
                [currentUserId]
            );
            // Normalize dates in case some were stored in ISO format from Supabase sync
            const txs = rawTxs.map(t => ({ ...t, date: normalizeDate(t.date) }));
            setTransactions(txs);

            // Load categories
            const cats = await db.getAllAsync<any>(
                'SELECT * FROM categories WHERE user_id = ? ORDER BY order_index ASC',
                [currentUserId]
            );
            setCategories(cats.map(c => ({
                id: c.id,
                name: c.name,
                type: c.type,
                group: c.group_name,
                limit: c.limit_val,
                icon: c.icon,
                color: c.color,
                order_index: c.order_index
            })));

            // Load debts
            const debtRecords = await db.getAllAsync<any>(
                'SELECT * FROM debts WHERE user_id = ?',
                [currentUserId]
            );
            const allPayments = await db.getAllAsync<any>(
                'SELECT * FROM debt_payments WHERE user_id = ?',
                [currentUserId]
            );

            const mappedDebts: Debt[] = debtRecords.map(d => ({
                ...d,
                payments: allPayments.filter(p => p.debtId === d.id)
            }));
            setDebts(mappedDebts);

            // Load settings
            const settings = await db.getAllAsync<{ key: string, value: string }>(
                'SELECT * FROM settings WHERE user_id = ?',
                [currentUserId]
            );
            settings.forEach(s => {
                switch (s.key) {
                    case 'savingsGoal': setSavingsGoal(parseFloat(s.value)); break;
                    case 'savingsGoalPeriod': setSavingsGoalPeriod(s.value as GoalPeriod); break;
                    case 'expenseGoal': setExpenseGoal(parseFloat(s.value)); break;
                    case 'expenseGoalPeriod': setExpenseGoalPeriod(s.value as GoalPeriod); break;
                    case 'debtLimit': setDebtLimit(parseFloat(s.value)); break;
                    case 'debtLimitPeriod': setDebtLimitPeriod(s.value as GoalPeriod); break;
                    case 'investmentLimit': setInvestmentLimit(parseFloat(s.value)); break;
                    case 'investmentLimitPeriod': setInvestmentLimitPeriod(s.value as GoalPeriod); break;
                    case 'incomeGoal': setIncomeGoal(parseFloat(s.value)); break;
                    case 'incomeGoalPeriod': setIncomeGoalPeriod(s.value as GoalPeriod); break;
                    case 'budget': setBudget(parseFloat(s.value)); break;
                    case 'budgetPeriod': setBudgetPeriod(s.value as GoalPeriod); break;
                    case 'subtractSavingsFromBudget': setSubtractSavingsFromBudget(s.value === 'true'); break;
                    case 'subtractInvestmentFromBudget': setSubtractInvestmentFromBudget(s.value === 'true'); break;
                    case 'subtractDebtFromBudget': setSubtractDebtFromBudget(s.value === 'true'); break;
                }
            });
        } catch (error) {
            console.error("Error loading TransactionContext data:", error);
        }
    };

    const syncData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            console.log("Starting sync from remote for user:", user.id);
            
            // 1. Sync Categories
            const { data: remoteCats } = await supabase.from('categories').select('*').eq('user_id', user.id);
            if (remoteCats) {
                for (const cat of remoteCats) {
                    await db.runAsync(
                        'INSERT OR REPLACE INTO categories (id, user_id, name, type, group_name, limit_val, icon, color, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                        [cat.id, user.id, cat.name, cat.type, cat.group_name, cat.limit_val, cat.icon, cat.color, cat.order_index]
                    );
                }
            }
            
            // 2. Sync Transactions
            const { data: remoteTxs } = await supabase.from('transactions').select('*').eq('user_id', user.id);
            if (remoteTxs) {
                for (const tx of remoteTxs) {
                    // Normalize date from Supabase (may be ISO '2026-03-09') to locale format 'March 9, 2026'
                    const normalizedDate = normalizeDate(tx.date);
                    await db.runAsync(
                        'INSERT OR REPLACE INTO transactions (id, user_id, type, amount, title, date, categoryId, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                        [tx.id, user.id, tx.type, tx.amount, tx.title, normalizedDate, tx.categoryId, tx.image]
                    );
                }
            }
            
            // 3. Sync Debts
            const { data: remoteDebts } = await supabase.from('debts').select('*').eq('user_id', user.id);
            if (remoteDebts) {
                for (const debt of remoteDebts) {
                    await db.runAsync(
                        'INSERT OR REPLACE INTO debts (id, user_id, person, description, date, initialAmount, remainingAmount, direction, status, categoryId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                        [debt.id, user.id, debt.person, debt.description, debt.date, debt.initialAmount, debt.remainingAmount, debt.direction, debt.status, debt.categoryId]
                    );
                }
            }

            // 4. Sync Debt Payments
            const { data: remotePayments } = await supabase.from('debt_payments').select('*').eq('user_id', user.id);
            if (remotePayments) {
                for (const p of remotePayments) {
                    await db.runAsync(
                        'INSERT OR REPLACE INTO debt_payments (id, user_id, debtId, amount, date) VALUES (?, ?, ?, ?, ?)',
                        [p.id, user.id, p.debtId, p.amount, p.date]
                    );
                }
            }

            // 5. Sync Settings
            const { data: remoteSettings } = await supabase.from('settings').select('*').eq('user_id', user.id);
            if (remoteSettings) {
                for (const s of remoteSettings) {
                    await db.runAsync(
                        'INSERT OR REPLACE INTO settings (key, user_id, value) VALUES (?, ?, ?)',
                        [s.key, user.id, s.value]
                    );
                }
            }

            // Reload local state
            await loadData();
            console.log("Sync complete!");
        } catch (error) {
            console.error("Error syncing with Supabase:", error);
        }
    };

    const clearData = async () => {
        try {
            // Only clear React state memory, DO NOT clear the SQLite database
            // so we preserve multi-user offline data that hasn't synced yet.
            setTransactions([]);
            setCategories([]);
            setDebts([]);
            setSavingsGoal(0);
            setSavingsGoalPeriod('Monthly');
            setExpenseGoal(0);
            setExpenseGoalPeriod('Monthly');
            setDebtLimit(0);
            setDebtLimitPeriod('Monthly');
            setInvestmentLimit(0);
            setInvestmentLimitPeriod('Monthly');
            setIncomeGoal(0);
            setIncomeGoalPeriod('Monthly');
            setBudget(0);
            setBudgetPeriod('Monthly');
            setSubtractSavingsFromBudget(true);
            setSubtractInvestmentFromBudget(true);
            setSubtractDebtFromBudget(true);

            console.log("React state contexts cleared on memory (DB values maintained).");
        } catch (error) {
            console.error("Error clearing local data state:", error);
        }
    };

    useEffect(() => {
        loadData();
        syncData(); // Auto sync on load
    }, [db]);

    const updateSetting = async (key: string, value: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        const currentUserId = user?.id || 'local';

        // 1. Save locally
        await db.runAsync(
            'INSERT OR REPLACE INTO settings (key, user_id, value) VALUES (?, ?, ?)', 
            [key, currentUserId, value]
        );
        
        // 2. Push to Supabase
        if (user) {
            const { error } = await supabase.from('settings').upsert([
                { user_id: user.id, key, value }
            ], { onConflict: 'user_id,key' }); // Ensure unique per user
            if (error) console.log("Offline: Setting saved locally only.");
        }
    };

    const addTransaction = async (transactionData: Omit<Transaction, 'id'>) => {
        const id = Date.now().toString() + Math.random().toString(36).substring(7);
        const newTransaction: Transaction = { ...transactionData, id };
        
        const { data: { user } } = await supabase.auth.getUser();
        
        // 1. Save locally (Instant UI update)
        await db.runAsync(
            'INSERT INTO transactions (id, user_id, type, amount, title, date, categoryId, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [id, user?.id || 'local', newTransaction.type, newTransaction.amount, newTransaction.title, newTransaction.date, newTransaction.categoryId || null, newTransaction.image || null]
        );
        setTransactions((prev) => [newTransaction, ...prev]);

        // 2. Try to push to Supabase
        if (user) {
            await supabase.from('transactions').insert([{
                id,
                user_id: user.id,
                type: newTransaction.type,
                amount: newTransaction.amount,
                title: newTransaction.title,
                date: newTransaction.date,
                categoryId: newTransaction.categoryId || null,
                image: newTransaction.image || null
            }]);
        }
    };

    const deleteTransaction = async (id: string) => {
        await db.runAsync('DELETE FROM transactions WHERE id = ?', [id]);
        setTransactions((prev) => prev.filter(t => t.id !== id));
    };

    const addCategory = async (categoryData: Omit<Category, 'id'>) => {
        const id = Date.now().toString() + Math.random().toString(36).substring(7);
        const orderIndex = categories.length > 0 ? Math.max(...categories.map(c => c.order_index || 0)) + 1 : 0;
        const newCategory: Category = { ...categoryData, id, order_index: orderIndex };

        const { data: { user } } = await supabase.auth.getUser();

        // 1. Save locally
        await db.runAsync(
            'INSERT INTO categories (id, user_id, name, type, group_name, limit_val, icon, color, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [id, user?.id || 'local', newCategory.name, newCategory.type, newCategory.group, newCategory.limit, newCategory.icon, newCategory.color, orderIndex]
        );
        setCategories((prev) => [...prev, newCategory]);

        // 2. Push to Supabase
        if (user) {
            await supabase.from('categories').insert([{
                id,
                user_id: user.id,
                name: newCategory.name,
                type: newCategory.type,
                group_name: newCategory.group,
                limit_val: newCategory.limit,
                icon: newCategory.icon,
                color: newCategory.color,
                order_index: orderIndex
            }]);
        }
    };

    const updateCategory = async (id: string, updatedFields: Partial<Category>) => {
        const current = categories.find(c => c.id === id);
        if (!current) return;

        const updated = { ...current, ...updatedFields };
        await db.runAsync(
            'UPDATE categories SET name = ?, type = ?, group_name = ?, limit_val = ?, icon = ?, color = ? WHERE id = ?',
            [updated.name, updated.type, updated.group, updated.limit, updated.icon, updated.color, id]
        );

        setCategories((prev) => prev.map(c => c.id === id ? updated : c));
    };

    const deleteCategory = async (id: string) => {
        await db.runAsync('DELETE FROM categories WHERE id = ?', [id]);
        await db.runAsync('DELETE FROM transactions WHERE categoryId = ?', [id]);
        setCategories((prev) => prev.filter(c => c.id !== id));
        setTransactions((prev) => prev.filter(t => t.categoryId !== id));
    };

    const updateCategoryOrder = async (newCategories: Category[]) => {
        setCategories(newCategories);
        
        // Persist order to database
        for (let i = 0; i < newCategories.length; i++) {
            await db.runAsync('UPDATE categories SET order_index = ? WHERE id = ?', [i, newCategories[i].id]);
        }
    };

    // Advanced Debt Methods
    const addDebt = async (debtData: Omit<Debt, 'id' | 'remainingAmount' | 'status' | 'payments'>) => {
        const id = Date.now().toString() + Math.random().toString(36).substring(7);
        const newDebt: Debt = {
            ...debtData,
            id,
            remainingAmount: debtData.initialAmount,
            status: 'pending',
            payments: [],
            categoryId: debtData.categoryId
        };

        const { data: { user } } = await supabase.auth.getUser();

        // 1. Save locally
        await db.runAsync(
            'INSERT INTO debts (id, user_id, person, description, date, initialAmount, remainingAmount, direction, status, categoryId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [id, user?.id || 'local', newDebt.person, newDebt.description, newDebt.date, newDebt.initialAmount, newDebt.remainingAmount, newDebt.direction, newDebt.status, newDebt.categoryId || null]
        );
        setDebts((prev) => [...prev, newDebt]);

        // 2. Push to Supabase
        if (user) {
            await supabase.from('debts').insert([{
                id,
                user_id: user.id,
                person: newDebt.person,
                description: newDebt.description,
                date: newDebt.date,
                initialAmount: newDebt.initialAmount,
                remainingAmount: newDebt.remainingAmount,
                direction: newDebt.direction,
                status: newDebt.status,
                categoryId: newDebt.categoryId || null
            }]);
        }
    };

    const addPayment = async (debtId: string, amount: number) => {
        const debt = debts.find(d => d.id === debtId);
        if (!debt) return;

        const paymentId = Date.now().toString() + Math.random().toString(36).substring(7);
        const date = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        const newPayment: DebtPayment = { id: paymentId, debtId, amount, date };

        const newRemaining = Math.max(0, debt.remainingAmount - amount);
        const newStatus = newRemaining <= 0 ? 'paid' : 'pending';

        const { data: { user } } = await supabase.auth.getUser();

        // 1. Save locally
        await db.runAsync(
            'INSERT INTO debt_payments (id, user_id, debtId, amount, date) VALUES (?, ?, ?, ?, ?)',
            [paymentId, user?.id || 'local', debtId, amount, date]
        );

        await db.runAsync(
            'UPDATE debts SET remainingAmount = ?, status = ? WHERE id = ?',
            [newRemaining, newStatus, debtId]
        );

        setDebts((prev) => prev.map(d => d.id === debtId ? {
            ...d,
            remainingAmount: newRemaining,
            status: newStatus,
            payments: [...d.payments, newPayment]
        } : d));

        // 2. Push to Supabase
        if (user) {
            await supabase.from('debt_payments').insert([{
                id: paymentId,
                user_id: user.id,
                debtId,
                amount,
                date
            }]);

            await supabase.from('debts').update({
                remainingAmount: newRemaining,
                status: newStatus
            }).eq('id', debtId).eq('user_id', user.id);
        }
        
        // Also record this as an expense if it's "I owe" (paying it off)
        // OR as income if it's "Owes me" (receiving payment)
        if (debt.direction === 'left') { // I owe
            await addTransaction({
                title: `Debt Payment: ${debt.person}`,
                amount: amount,
                type: 'expense',
                date: date,
                categoryId: 'debt_payment' // Optional: create a hidden category
            });
        } else { // Owes me
            await addTransaction({
                title: `Debt Receipt: ${debt.person}`,
                amount: amount,
                type: 'income',
                date: date,
                categoryId: 'debt_receipt'
            });
        }
    };

    const deleteDebt = async (id: string) => {
        await db.runAsync('DELETE FROM debts WHERE id = ?', [id]);
        setDebts((prev) => prev.filter(d => d.id !== id));
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
        const totalDebtTxs = getTotalByType('debt'); // Original debt transactions
        const totalInvestment = getTotalByType('investment');

        let balance = totalIncome - totalExpense;
        if (subtractSavingsFromBudget) balance -= totalSavings;
        if (subtractDebtFromBudget) balance -= totalDebtTxs;
        if (subtractInvestmentFromBudget) balance -= totalInvestment;

        return balance;
    };

    // Setting wrappers
    const wrapSetSavingsGoal = async (v: number) => { setSavingsGoal(v); await updateSetting('savingsGoal', v.toString()); };
    const wrapSetSavingsGoalPeriod = async (v: GoalPeriod) => { setSavingsGoalPeriod(v); await updateSetting('savingsGoalPeriod', v); };
    const wrapSetExpenseGoal = async (v: number) => { setExpenseGoal(v); await updateSetting('expenseGoal', v.toString()); };
    const wrapSetExpenseGoalPeriod = async (v: GoalPeriod) => { setExpenseGoalPeriod(v); await updateSetting('expenseGoalPeriod', v); };
    const wrapSetDebtLimit = async (v: number) => { setDebtLimit(v); await updateSetting('debtLimit', v.toString()); };
    const wrapSetDebtLimitPeriod = async (v: GoalPeriod) => { setDebtLimitPeriod(v); await updateSetting('debtLimitPeriod', v); };
    const wrapSetInvestmentLimit = async (v: number) => { setInvestmentLimit(v); await updateSetting('investmentLimit', v.toString()); };
    const wrapSetInvestmentLimitPeriod = async (v: GoalPeriod) => { setInvestmentLimitPeriod(v); await updateSetting('investmentLimitPeriod', v); };
    const wrapSetIncomeGoal = async (v: number) => { setIncomeGoal(v); await updateSetting('incomeGoal', v.toString()); };
    const wrapSetIncomeGoalPeriod = async (v: GoalPeriod) => { setIncomeGoalPeriod(v); await updateSetting('incomeGoalPeriod', v); };
    const wrapSetBudget = async (v: number) => { setBudget(v); await updateSetting('budget', v.toString()); };
    const wrapSetBudgetPeriod = async (v: GoalPeriod) => { setBudgetPeriod(v); await updateSetting('budgetPeriod', v); };
    const wrapSetSubtractSavingsFromBudget = async (v: boolean) => { setSubtractSavingsFromBudget(v); await updateSetting('subtractSavingsFromBudget', v.toString()); };
    const wrapSetSubtractInvestmentFromBudget = async (v: boolean) => { setSubtractInvestmentFromBudget(v); await updateSetting('subtractInvestmentFromBudget', v.toString()); };
    const wrapSetSubtractDebtFromBudget = async (v: boolean) => { setSubtractDebtFromBudget(v); await updateSetting('subtractDebtFromBudget', v.toString()); };

    return (
        <TransactionContext.Provider
            value={{
                transactions,
                addTransaction,
                getTransactionsByType,
                getTotalBalance,
                getTotalByType,
                savingsGoal,
                setSavingsGoal: wrapSetSavingsGoal,
                savingsGoalPeriod,
                setSavingsGoalPeriod: wrapSetSavingsGoalPeriod,
                expenseGoal,
                setExpenseGoal: wrapSetExpenseGoal,
                expenseGoalPeriod,
                setExpenseGoalPeriod: wrapSetExpenseGoalPeriod,
                debtLimit,
                setDebtLimit: wrapSetDebtLimit,
                debtLimitPeriod,
                setDebtLimitPeriod: wrapSetDebtLimitPeriod,
                investmentLimit,
                setInvestmentLimit: wrapSetInvestmentLimit,
                investmentLimitPeriod,
                setInvestmentLimitPeriod: wrapSetInvestmentLimitPeriod,
                incomeGoal,
                setIncomeGoal: wrapSetIncomeGoal,
                incomeGoalPeriod,
                setIncomeGoalPeriod: wrapSetIncomeGoalPeriod,
                categories,
                addCategory,
                updateCategory,
                deleteCategory,
                updateCategoryOrder,
                deleteTransaction,
                budget,
                setBudget: wrapSetBudget,
                budgetPeriod,
                setBudgetPeriod: wrapSetBudgetPeriod,
                subtractSavingsFromBudget,
                setSubtractSavingsFromBudget: wrapSetSubtractSavingsFromBudget,
                subtractInvestmentFromBudget,
                setSubtractInvestmentFromBudget: wrapSetSubtractInvestmentFromBudget,
                subtractDebtFromBudget,
                setSubtractDebtFromBudget: wrapSetSubtractDebtFromBudget,
                
                // Advanced Debt System
                debts,
                addDebt,
                addPayment,
                deleteDebt,
                syncData,
                clearData
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
