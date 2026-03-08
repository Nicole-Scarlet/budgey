import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTransactions } from '../../contexts/TransactionContext';


export default function ExpensesScreen() {
    const router = useRouter();
    const {
        getTransactionsByType,
        getTotalByType,
        transactions,
        categories: globalCategories,
        expenseGoal,
        setExpenseGoal,
        expenseGoalPeriod,
        setExpenseGoalPeriod,
        deleteTransaction
    } = useTransactions();
    const [isCategoryMenuVisible, setIsCategoryMenuVisible] = useState(false);
    const [isTimeFilterVisible, setIsTimeFilterVisible] = useState(false);
    const [isGoalModalVisible, setIsGoalModalVisible] = useState(false);

    useFocusEffect(
        useCallback(() => {
            // Close the category menu when the screen loses focus
            return () => setIsCategoryMenuVisible(false);
        }, [])
    );
    const [tempGoal, setTempGoal] = useState('');
    const [tempPeriod, setTempPeriod] = useState<'Daily' | 'Weekly' | 'Monthly'>(expenseGoalPeriod || 'Monthly');
    const [headerHeight, setHeaderHeight] = useState(360); // Default fallback height
    const [containerHeight, setContainerHeight] = useState(800);
    const [activeFilter, setActiveFilter] = useState<'Daily' | 'Weekly' | 'Monthly' | 'All'>('All');

    const navCategories = [
        { name: 'Expenses', icon: 'cart-outline', type: 'material', active: true },
        { name: 'Income', icon: 'wallet-outline', type: 'material' },
        { name: 'Savings', icon: 'piggy-bank-outline', type: 'material' },
        { name: 'Debt', icon: 'receipt-text-outline', type: 'material' },
        { name: 'Investment', icon: 'chart-line-variant', type: 'material' },
    ];

    const isTransactionInActiveFilter = (transactionDateRaw: string) => {
        if (activeFilter === 'All') return true;

        const now = new Date();
        const transactionDate = new Date(transactionDateRaw);

        switch (activeFilter) {
            case 'Daily':
                return transactionDate.toDateString() === now.toDateString();
            case 'Weekly':
                const diffTime = Math.abs(now.getTime() - transactionDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays <= 7;
            case 'Monthly':
                return transactionDate.getMonth() === now.getMonth() &&
                    transactionDate.getFullYear() === now.getFullYear();
            default:
                return true;
        }
    };

    const expenseTransactions = getTransactionsByType('expense').filter(t => isTransactionInActiveFilter(t.date));
    const totalExpense = expenseTransactions.reduce((acc, curr) => acc + curr.amount, 0);

    // Bottom sheet setup
    const { bottom, top } = useSafeAreaInsets();
    const { height } = useWindowDimensions();
    const bottomSheetRef = useRef<BottomSheet>(null);

    const firstSnap = Math.max(220, bottom + 180);
    // Expand to exactly the space below the header, minus 20px so it stays clear of the icon text 
    const secondSnap = Math.max(firstSnap + 50, containerHeight - headerHeight - 20);
    const snapPoints = useMemo(() => [firstSnap, secondSnap], [firstSnap, secondSnap, containerHeight, headerHeight]);

    const handleSheetChanges = useCallback((index: number) => {
        setIsCategoryMenuVisible(false);
        console.log('handleSheetChanges', index);
    }, []);

    // Formatter
    const formatCurrency = (amount: number) => {
        return `₱${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    };

    return (
        <SafeAreaView className="flex-1 bg-[#1E293B]" onLayout={(e) => setContainerHeight(e.nativeEvent.layout.height)}>
            <View onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}>
                {/* Header with Navigation */}
                <View className="bg-[#334155] rounded-b-[40px] pt-8 pb-10 shadow-lg relative z-50">
                    <View className="absolute top-8 right-6 items-end z-50">
                        <Pressable
                            className="p-2 -mr-2"
                            onPress={() => setIsCategoryMenuVisible(!isCategoryMenuVisible)}
                        >
                            <MaterialCommunityIcons name="dots-horizontal" size={28} color="#94A3B8" />
                        </Pressable>

                        {isCategoryMenuVisible && (
                            <View
                                className="absolute top-12 right-0 bg-[#475569] shadow-xl rounded-[16px] border border-[#64748B] overflow-hidden min-w-[200px] z-[100]"
                            >
                                <Pressable
                                    onPress={() => {
                                        setIsCategoryMenuVisible(false);
                                        router.push({ pathname: '/add-category', params: { module: 'Expense' } } as any);
                                    }}
                                    className="flex-row items-center justify-between px-4 py-3 border-b border-[#64748B] active:bg-[#334155]/50"
                                >
                                    <Text className="text-white font-bold text-sm">Add Category</Text>
                                    <Ionicons name="add" size={20} color="#4ADE80" />
                                </Pressable>
                                <Pressable
                                    onPress={() => {
                                        setIsCategoryMenuVisible(false);
                                        router.push({ pathname: '/category-list', params: { module: 'Expense' } } as any);
                                    }}
                                    className="flex-row items-center justify-between px-4 py-3 active:bg-[#334155]/50"
                                >
                                    <Text className="text-white font-bold text-sm">Manage Categories</Text>
                                    <Feather name="settings" size={18} color="#94A3B8" />
                                </Pressable>
                            </View>
                        )}
                    </View>

                    <Pressable
                        onPress={() => isCategoryMenuVisible && setIsCategoryMenuVisible(false)}
                        className="items-center mt-2"
                    >
                        <Text className="text-white text-[42px] font-bold tracking-tight">{formatCurrency(totalExpense)}</Text>
                        <Text className="text-white/80 text-lg font-medium mt-2 mb-2">Overall Expenses</Text>
                        {expenseGoal > 0 ? (
                            <Pressable onPress={() => { setIsCategoryMenuVisible(false); setTempGoal(expenseGoal.toString()); setTempPeriod(expenseGoalPeriod); setIsGoalModalVisible(true); }} className="bg-[#1E293B] px-4 py-2 rounded-full border border-[#90A1B9]/30">
                                <Text className="text-[#F97316] font-medium text-sm">Limit: ₱{expenseGoal.toLocaleString('en-US', { minimumFractionDigits: 2 })} / {expenseGoalPeriod} (Edit)</Text>
                            </Pressable>
                        ) : (
                            <Pressable onPress={() => { setIsCategoryMenuVisible(false); setTempGoal(''); setTempPeriod('Monthly'); setIsGoalModalVisible(true); }} className="bg-[#1E293B] px-4 py-2 rounded-full border border-[#90A1B9]/30">
                                <Text className="text-[#F97316] font-medium text-sm">+ Set Expense Limit</Text>
                            </Pressable>
                        )}
                    </Pressable>
                </View>

                {/* Category Icons Row */}
                <Pressable onPress={() => setIsCategoryMenuVisible(false)} className="px-4 py-6">
                    <View className="flex-row justify-between w-full px-2">
                        {navCategories.map((cat, index) => (
                            <View key={index} className="items-center">
                                <Pressable
                                    onPress={() => {
                                        setIsCategoryMenuVisible(false);
                                        if (cat.name === 'Income') router.push('/income' as any);
                                        if (cat.name === 'Savings') router.push('/savings' as any);
                                        if (cat.name === 'Debt') router.push('/debt' as any);
                                        if (cat.name === 'Investment') router.push('/investment' as any);
                                    }}
                                    className={`p-3 rounded-2xl border ${cat.active ? 'bg-[#334155] border-[#90A1B9]/30' : 'bg-transparent border-transparent'}`}
                                >
                                    <MaterialCommunityIcons
                                        name={cat.icon as any}
                                        size={32}
                                        color={cat.active ? 'white' : '#94A3B8'}
                                    />
                                </Pressable>
                                <Text
                                    className={`text-[10px] mt-1 font-medium ${cat.active ? 'text-white' : 'text-[#94A3B8]'}`}
                                >
                                    {cat.name}
                                </Text>
                            </View>
                        ))}
                    </View>
                </Pressable>
            </View>

            {/* Expense Categories List */}
            <ScrollView className="px-6 flex-1" contentContainerStyle={{ paddingBottom: 250 }} showsVerticalScrollIndicator={false}>
                <Pressable onPress={() => setIsCategoryMenuVisible(false)}>
                    {globalCategories.filter(c => c.type === 'Expense').length === 0 ? (
                        <View className="flex-1 items-center justify-center pt-20">
                            <Text className="text-white text-xl font-bold font-['Inter_700Bold'] mb-2">No categories yet.</Text>
                            <Text className="text-[#94A3B8] text-center text-[15px] px-4 leading-6">
                                Tap the menu icon (•••) at the top right{'\n'}to add a category.
                            </Text>
                        </View>
                    ) : (
                        globalCategories.filter(c => c.type === 'Expense').map((cat) => {
                            const categoryTransactions = expenseTransactions.filter(t => t.categoryId === cat.id);
                            const categorySpent = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);

                            return (
                                <Pressable
                                    key={cat.id}
                                    onPress={() => router.push({ pathname: '/add-expense', params: { category: cat.id, categoryName: cat.name, module: 'Expense' } })}
                                    className="flex-row items-center justify-between py-4 border-b border-[#334155] active:bg-[#334155]/30"
                                >
                                    <View className="flex-row items-center flex-1">
                                        {/* Icon */}
                                        <View
                                            className="w-14 h-14 rounded-full border-2 items-center justify-center mr-4"
                                            style={{ backgroundColor: `${cat.color}20`, borderColor: cat.color }}
                                        >
                                            <Feather name={cat.icon as any} size={24} color={cat.color} />
                                        </View>

                                        {/* Info */}
                                        <View>
                                            <Text className="text-white text-[18px] font-bold mb-1">{cat.name}</Text>
                                            <Text className="text-[#94A3B8] text-[14px]">
                                                Spent: ₱{categorySpent.toLocaleString('en-US', { minimumFractionDigits: 2 })} / Limit: ₱{cat.limit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Add button instead of Chevron since entire row adds expense */}
                                    <View className="w-10 h-10 items-center justify-center bg-[#475569] rounded-full">
                                        <Ionicons name="add" size={24} color="white" />
                                    </View>
                                </Pressable>
                            );
                        })
                    )}
                </Pressable>
            </ScrollView>

            {/* Bottom Sheet for Expenses Summary */}
            <BottomSheet
                ref={bottomSheetRef}
                index={1}
                snapPoints={snapPoints}
                onChange={handleSheetChanges}
                backgroundStyle={{ backgroundColor: '#1E293B', borderRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 10 }}
                handleIndicatorStyle={{ backgroundColor: '#64748B', width: 40 }}
            >
                <View className="px-6 pt-4 pb-2 flex-row justify-between items-center relative z-50">
                    <View>
                        <View className="flex-row items-center mb-1">
                            <Text className="text-white text-2xl font-bold font-['Inter_700Bold'] mr-3">Expenses</Text>

                            {/* Filter Dropdown Trigger Option 2 */}
                            <Pressable
                                onPress={() => setIsTimeFilterVisible(!isTimeFilterVisible)}
                                className="bg-[#334155] px-3 py-1.5 rounded-full flex-row items-center border border-[#475569]"
                            >
                                <Text className="text-slate-300 text-xs font-bold mr-1">{activeFilter}</Text>
                                <Feather name="chevron-down" size={14} color="#CBD5E1" />
                            </Pressable>

                            <Modal
                                visible={isTimeFilterVisible}
                                transparent
                                animationType="none"
                                statusBarTranslucent={true}
                                onRequestClose={() => setIsTimeFilterVisible(false)}
                            >
                                <Pressable
                                    className="flex-1 bg-black/40"
                                    onPress={() => setIsTimeFilterVisible(false)}
                                >
                                    <View
                                        className="absolute bg-[#475569] shadow-2xl rounded-xl border border-[#64748B] overflow-hidden w-32 z-50"
                                        style={{ top: height - firstSnap - 10, left: 135 }}
                                    >
                                        {['All', 'Daily', 'Weekly', 'Monthly'].map((filter) => (
                                            <Pressable
                                                key={`${filter}-filter`}
                                                onPress={() => {
                                                    setActiveFilter(filter as any);
                                                    setIsTimeFilterVisible(false);
                                                }}
                                                className={`px-4 py-3 border-b border-[#334155]/30 flex-row items-center justify-between ${activeFilter === filter ? 'bg-[#334155]' : ''}`}
                                            >
                                                <Text className={`text-sm ${activeFilter === filter ? 'text-white font-bold' : 'text-slate-300'}`}>{filter}</Text>
                                                {activeFilter === filter && <Feather name="check" size={14} color="#4ADE80" />}
                                            </Pressable>
                                        ))}
                                    </View>
                                </Pressable>
                            </Modal>
                        </View>
                        <Text className="text-[#94A3B8] text-sm">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</Text>
                    </View>
                    <Pressable onPress={() => router.push('/add-expense' as any)} className="p-2">
                        <Ionicons name="add" size={28} color="white" />
                    </Pressable>
                </View>

                <BottomSheetScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40, paddingTop: 20 }}>
                    {expenseTransactions.length === 0 ? (
                        <View className="items-center justify-center pt-10 pb-20">
                            <Ionicons name="cart-outline" size={48} color="#64748B" />
                            <Text className="text-[#94A3B8] text-lg mt-4 text-center px-4">No expenses recorded yet.</Text>
                        </View>
                    ) : (
                        expenseTransactions.map((item, index) => {
                            const category = globalCategories.find(c => c.id === item.categoryId);
                            return (
                                <Pressable
                                    key={item.id}
                                    className="flex-row items-center py-3 active:bg-[#334155]/50 rounded-xl px-2 -mx-2"
                                    onLongPress={() => {
                                        Alert.alert(
                                            "Delete Expense",
                                            `Are you sure you want to delete "${item.title}"?`,
                                            [
                                                { text: "Cancel", style: "cancel" },
                                                {
                                                    text: "Delete",
                                                    style: "destructive",
                                                    onPress: () => deleteTransaction(item.id)
                                                }
                                            ]
                                        );
                                    }}
                                    delayLongPress={500}
                                >
                                    <View
                                        className="w-10 h-10 rounded-full items-center justify-center mr-4"
                                        style={{ backgroundColor: category ? `${category.color}20` : '#334155' }}
                                    >
                                        <Feather name={(category?.icon as any) || "shopping-bag"} size={18} color={category?.color || "#94A3B8"} />
                                    </View>

                                    <View className="flex-1 justify-center">
                                        <Text className="text-white font-medium text-[16px] mb-1">{item.title}</Text>
                                        <Text className="text-[#94A3B8] text-[12px]">{item.date}</Text>
                                    </View>

                                    <Text className="text-white font-bold text-[16px]">
                                        -₱{item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </Text>
                                </Pressable>
                            );
                        })
                    )}
                </BottomSheetScrollView>
            </BottomSheet>
            {/* Expense Limit Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={isGoalModalVisible}
                statusBarTranslucent={true}
                onRequestClose={() => setIsGoalModalVisible(false)}
            >
                <Pressable
                    className="flex-1 bg-black/60 justify-center items-center px-6"
                    onPress={() => setIsGoalModalVisible(false)}
                >
                    <Pressable onPress={() => { }} className="w-full">
                        <View className="bg-[#1E293B] w-full rounded-3xl p-6 border border-[#334155] shadow-2xl">
                            <Text className="text-white text-xl font-bold mb-4">Set Expense Limit</Text>
                            <Text className="text-slate-400 text-sm mb-4">Enter your target expense limit below:</Text>

                            {parseFloat(tempGoal.replace(/[^0-9.-]+/g, '')) > 1000000000 && (
                                <Text className="text-red-500 text-xs mb-2 font-bold">
                                    Maximum limit is ₱1,000,000,000
                                </Text>
                            )}

                            <View className={`bg-[#0F172A] rounded-2xl flex-row items-center px-4 h-14 border ${parseFloat(tempGoal.replace(/[^0-9.-]+/g, '')) > 1000000000 ? 'border-red-500' : 'border-[#334155]'} mb-6`}>
                                <Text className="text-slate-400 text-lg mr-2">₱</Text>
                                <TextInput
                                    className="flex-1 text-white text-lg font-medium"
                                    placeholder="0.00"
                                    placeholderTextColor="#475569"
                                    keyboardType="numeric"
                                    value={tempGoal}
                                    onChangeText={setTempGoal}
                                />
                            </View>

                            <Text className="text-slate-400 text-sm mb-3">Does this limit apply Daily, Weekly, or Monthly?</Text>
                            <View className="flex-row bg-[#0F172A] rounded-xl p-1 mb-8 border border-[#334155]">
                                {['Daily', 'Weekly', 'Monthly'].map((period) => (
                                    <Pressable
                                        key={`${period}-goal`}
                                        onPress={() => setTempPeriod(period as any)}
                                        className={`flex-1 py-2.5 rounded-lg items-center ${tempPeriod === period ? 'bg-[#334155]' : ''}`}
                                    >
                                        <Text className={`font-medium ${tempPeriod === period ? 'text-white' : 'text-slate-400'}`}>
                                            {period}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>

                            <View className="flex-row justify-end space-x-3 gap-x-3">
                                <Pressable
                                    onPress={() => setIsGoalModalVisible(false)}
                                    className="px-6 py-3 rounded-xl bg-[#334155]"
                                >
                                    <Text className="text-white font-medium">Cancel</Text>
                                </Pressable>
                                <Pressable
                                    onPress={() => {
                                        const parsedGoal = parseFloat(tempGoal.replace(/[^0-9.-]+/g, ''));
                                        if (!isNaN(parsedGoal) && parsedGoal > 0 && parsedGoal <= 1000000000) {
                                            setExpenseGoal(parsedGoal);
                                            setExpenseGoalPeriod(tempPeriod);
                                            setIsGoalModalVisible(false);
                                        } else if (tempGoal === '' || parsedGoal === 0) {
                                            setExpenseGoal(0); // clear if empty
                                            setIsGoalModalVisible(false);
                                        }
                                    }}
                                    disabled={parseFloat(tempGoal.replace(/[^0-9.-]+/g, '')) > 1000000000}
                                    className={`px-6 py-3 rounded-xl ${parseFloat(tempGoal.replace(/[^0-9.-]+/g, '')) > 1000000000 ? 'bg-gray-500' : 'bg-[#F97316]'}`}
                                >
                                    <Text className="text-white font-bold text-center">Save Limit</Text>
                                </Pressable>
                            </View>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </SafeAreaView >
    );
}
