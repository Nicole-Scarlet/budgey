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
    groupId?: string; // Added for groups
}

export interface Group {
    id: string;
    name: string;
    description: string;
    inviteCode: string;
    budgetLimit: number;
    budgetPeriod: GoalPeriod;
    createdBy: string;
}

export interface GroupMember {
    groupId: string;
    userId: string;
    role: 'owner' | 'admin' | 'member';
    shareIncome: boolean;
    shareSavings: boolean;
    shareInvestments: boolean;
    shareDebts: boolean;
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
    groupId?: string; // Added for groups
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

    // Group System
    groups: Group[];
    activeGroupId: string | null;
    setActiveGroupId: (id: string | null) => void;
    groupMembers: GroupMember[];
    createGroup: (name: string, description: string) => Promise<void>;
    joinGroup: (inviteCode: string) => Promise<void>;
    updateGroupMemberSharing: (groupId: string, sharing: Partial<Omit<GroupMember, 'groupId' | 'userId' | 'role'>>) => Promise<void>;
    leaveGroup: (groupId: string) => Promise<void>;
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

    // Group System State
    const [groups, setGroups] = useState<Group[]>([]);
    const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
    const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);



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

            // 1. Load Groups (First, so we can use for transactions)
            const localGroupsRaw = await db.getAllAsync<any>('SELECT * FROM groups');
            const mappedGroups = localGroupsRaw.map(g => ({
                id: g.id,
                name: g.name,
                description: g.description,
                inviteCode: g.invite_code,
                budgetLimit: g.budget_limit || 0,
                budgetPeriod: (g.budget_period || 'Monthly') as GoalPeriod,
                createdBy: g.created_by
            }));
            setGroups(mappedGroups);

            const localMembersRaw = await db.getAllAsync<any>('SELECT * FROM group_members');
            const mappedMembers = localMembersRaw.map(m => ({
                groupId: m.group_id,
                userId: m.user_id,
                role: m.role as any,
                shareIncome: m.share_income === 1,
                shareSavings: m.share_savings === 1,
                shareInvestments: m.share_investments === 1,
                shareDebts: m.share_debts === 1
            }));
            setGroupMembers(mappedMembers);

            // 2. Load transactions (Mine + Group shared)
            const joinedGroupIds = mappedGroups.map(g => g.id);
            let rawTxs: any[] = [];
            
            if (user) {
                const placeholders = joinedGroupIds.map(() => '?').join(',');
                const query = joinedGroupIds.length > 0 
                  ? `SELECT * FROM transactions WHERE user_id = ? OR group_id IN (${placeholders}) ORDER BY rowid DESC`
                  : `SELECT * FROM transactions WHERE user_id = ? ORDER BY rowid DESC`;
                const params = joinedGroupIds.length > 0 ? [currentUserId, ...joinedGroupIds] : [currentUserId];
                rawTxs = await db.getAllAsync<any>(query, params);
            } else {
                rawTxs = await db.getAllAsync<any>('SELECT * FROM transactions WHERE user_id = ? ORDER BY rowid DESC', [currentUserId]);
            }
            
            const txs = rawTxs.map(t => ({ 
                ...t, 
                date: normalizeDate(t.date),
                groupId: t.group_id,
                userId: t.user_id 
            }));
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
            
            // 2. Sync Transactions (Mine + Groups)
            // Fetch personal transactions
            const { data: personalTxs } = await supabase.from('transactions').select('*').eq('user_id', user.id).is('group_id', null);
            // Fetch group transactions (RLS handles shared visibility)
            const { data: groupTxs } = await supabase.from('transactions').select('*').not('group_id', 'is', null);
            
            const allRemoteTxs = [...(personalTxs || []), ...(groupTxs || [])];
            
            if (allRemoteTxs.length > 0) {
                for (const tx of allRemoteTxs) {
                    const normalizedDate = normalizeDate(tx.date);
                    await db.runAsync(
                        'INSERT OR REPLACE INTO transactions (id, user_id, type, amount, title, date, categoryId, image, group_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                        [tx.id, tx.user_id, tx.type, tx.amount, tx.title, normalizedDate, tx.categoryId, tx.image, tx.group_id]
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
        const currentUserId = user?.id || 'local';
        
        // 1. Save locally (Instant UI update)
        await db.runAsync(
            'INSERT INTO transactions (id, user_id, type, amount, title, date, categoryId, image, group_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [id, currentUserId, newTransaction.type, newTransaction.amount, newTransaction.title, newTransaction.date, newTransaction.categoryId || null, newTransaction.image || null, newTransaction.groupId || null]
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
                image: newTransaction.image || null,
                group_id: newTransaction.groupId || null
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
        const currentUserId = user?.id || 'local';

        // 1. Save locally
        await db.runAsync(
            'INSERT INTO debts (id, user_id, person, description, date, initialAmount, remainingAmount, direction, status, categoryId, group_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [id, currentUserId, newDebt.person, newDebt.description, newDebt.date, newDebt.initialAmount, newDebt.remainingAmount, newDebt.direction, newDebt.status, newDebt.categoryId || null, newDebt.groupId || null]
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
                categoryId: newDebt.categoryId || null,
                group_id: newDebt.groupId || null
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
        return transactions.filter(t => {
            const isMatch = t.type === type;
            if (!isMatch) return false;

            if (activeGroupId) {
                // If a group is active, show only that group's transactions
                return t.groupId === activeGroupId;
            } else {
                // Personal: show transactions with no groupId
                return !t.groupId;
            }
        });
    };

    const getTotalByType = (type: TransactionType) => {
        return getTransactionsByType(type).reduce((total, t) => total + t.amount, 0);
    };

    const getTotalBalance = () => {
        if (activeGroupId) {
            // For groups, we show balance based on group expenses
            const groupExpenses = getTotalByType('expense');
            return -groupExpenses;
        }

        const totalExpense = getTotalByType('expense');
        const totalSavings = getTotalByType('savings');
        const totalDebtTxs = getTotalByType('debt');
        const totalInvestment = getTotalByType('investment');

        let balance = -totalExpense;
        if (subtractSavingsFromBudget) balance -= totalSavings;
        if (subtractDebtFromBudget) balance -= totalDebtTxs;
        if (subtractInvestmentFromBudget) balance -= totalInvestment;

        return balance;
    };

    // Group-related functions
    const createGroup = async (name: string, description: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Must be logged in to create a group");

        const id = Date.now().toString() + Math.random().toString(36).substring(7);
        const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

        const groupData = {
            id,
            name,
            description,
            invite_code: inviteCode,
            created_by: user.id,
            budget_limit: 0,
            budget_period: 'Monthly'
        };

        // 1. Save locally
        await db.runAsync(
            'INSERT INTO groups (id, name, description, invite_code, budget_limit, budget_period, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [id, name, description, inviteCode, 0, 'Monthly', user.id]
        );
        await db.runAsync(
            'INSERT INTO group_members (group_id, user_id, role) VALUES (?, ?, ?)',
            [id, user.id, 'owner']
        );

        // 2. Sync to Supabase
        await supabase.from('groups').insert([groupData]);
        await supabase.from('group_members').insert([{
            group_id: id,
            role: 'owner',
            user_id: user.id
        }]);

        await loadData();
    };

    const joinGroup = async (inviteCode: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Must be logged in to join a group");

        // Find group by invite code
        const { data: group, error } = await supabase
            .from('groups')
            .select('*')
            .eq('invite_code', inviteCode)
            .single();

        if (error || !group) throw new Error("Group not found");

        const memberData = {
            group_id: group.id,
            user_id: user.id,
            role: 'member'
        };

        // 1. Save locally
        await db.runAsync(
            'INSERT OR REPLACE INTO groups (id, name, description, invite_code, budget_limit, budget_period, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [group.id, group.name, group.description, group.invite_code, group.budget_limit, group.budget_period, group.created_by]
        );
        await db.runAsync(
            'INSERT OR REPLACE INTO group_members (group_id, user_id, role) VALUES (?, ?, ?)',
            [group.id, user.id, 'member']
        );

        // 2. Sync to Supabase
        await supabase.from('group_members').insert([memberData]);

        await loadData();
    };

    const updateGroupMemberSharing = async (groupId: string, sharing: Partial<Omit<GroupMember, 'groupId' | 'userId' | 'role'>>) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const updates: any = {};
        if (sharing.shareIncome !== undefined) updates.share_income = sharing.shareIncome ? 1 : 0;
        if (sharing.shareSavings !== undefined) updates.share_savings = sharing.shareSavings ? 1 : 0;
        if (sharing.shareInvestments !== undefined) updates.share_investments = sharing.shareInvestments ? 1 : 0;
        if (sharing.shareDebts !== undefined) updates.share_debts = sharing.shareDebts ? 1 : 0;

        const keys = Object.keys(updates);
        if (keys.length === 0) return;

        // Local
        const setClause = keys.map(k => `${k} = ?`).join(', ');
        await db.runAsync(
            `UPDATE group_members SET ${setClause} WHERE group_id = ? AND user_id = ?`,
            [...Object.values(updates), groupId, user.id] as any[]
        );

        // Supabase
        const supabaseUpdates = Object.fromEntries(
            Object.entries(updates).map(([k, v]) => [k, v === 1])
        );
        await supabase.from('group_members')
            .update(supabaseUpdates)
            .eq('group_id', groupId)
            .eq('user_id', user.id);

        await loadData();
    };

    const leaveGroup = async (groupId: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await db.runAsync('DELETE FROM group_members WHERE group_id = ? AND user_id = ?', [groupId, user.id]);
        await db.runAsync('DELETE FROM groups WHERE id = ?', [groupId]); // Usually we only delete the local copy

        await supabase.from('group_members').delete().eq('group_id', groupId).eq('user_id', user.id);

        if (activeGroupId === groupId) setActiveGroupId(null);
        await loadData();
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
                clearData,

                // Group System
                groups,
                activeGroupId,
                setActiveGroupId,
                groupMembers,
                createGroup,
                joinGroup,
                updateGroupMemberSharing,
                leaveGroup
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
