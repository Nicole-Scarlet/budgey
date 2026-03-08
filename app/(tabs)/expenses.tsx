import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
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
        categories,
        expenseGoal,
        setExpenseGoal,
        deleteTransaction
    } = useTransactions();
    const [isCategoryMenuVisible, setIsCategoryMenuVisible] = useState(false);
    const [isGoalModalVisible, setIsGoalModalVisible] = useState(false);
    const [tempGoal, setTempGoal] = useState('');
    const [headerHeight, setHeaderHeight] = useState(360); // Default fallback height
    const [containerHeight, setContainerHeight] = useState(800);

    const mainCategories = [
        { name: 'Expenses', icon: 'cart-outline', type: 'material', active: true },
        { name: 'Income', icon: 'wallet-outline', type: 'material' },
        { name: 'Savings', icon: 'piggy-bank-outline', type: 'material' },
        { name: 'Debt', icon: 'receipt-text-outline', type: 'material' },
        { name: 'Investment', icon: 'chart-line-variant', type: 'material' },
    ];

    const expenseTransactions = getTransactionsByType('expense');
    const totalExpense = getTotalByType('expense');

    // Bottom sheet setup
    const { bottom, top } = useSafeAreaInsets();
    const { height } = useWindowDimensions();
    const bottomSheetRef = useRef<BottomSheet>(null);

    const firstSnap = Math.max(220, bottom + 180);
    // Expand to exactly the space below the header, minus 20px so it stays clear of the icon text 
    const secondSnap = Math.max(firstSnap + 50, containerHeight - headerHeight - 20);
    const snapPoints = useMemo(() => [firstSnap, secondSnap], [firstSnap, secondSnap, containerHeight, headerHeight]);

    const handleSheetChanges = useCallback((index: number) => {
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
                                className="mt-2 bg-[#475569] shadow-xl rounded-[16px] border border-[#64748B] overflow-hidden min-w-[200px]"
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
                            <Pressable onPress={() => { setTempGoal(expenseGoal.toString()); setIsGoalModalVisible(true); }} className="bg-[#1E293B] px-4 py-2 rounded-full border border-[#90A1B9]/30">
                                <Text className="text-[#EF4444] font-medium text-sm">Limit: ₱{expenseGoal.toLocaleString('en-US', { minimumFractionDigits: 2 })} (Edit)</Text>
                            </Pressable>
                        ) : (
                            <Pressable onPress={() => { setTempGoal(''); setIsGoalModalVisible(true); }} className="bg-[#1E293B] px-4 py-2 rounded-full border border-[#90A1B9]/30">
                                <Text className="text-[#EF4444] font-medium text-sm">+ Set Expense Limit</Text>
                            </Pressable>
                        )}
                    </Pressable>
                </View>

                {/* Category Icons Row */}
                <View className="px-4 py-6">
                    <View className="flex-row justify-between w-full px-2">
                        {mainCategories.map((cat, index) => (
                            <View key={index} className="items-center">
                                <Pressable
                                    onPress={() => {
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
                </View>
            </View>

            {/* Expense Categories List */}
            <ScrollView className="px-6 flex-1" contentContainerStyle={{ paddingBottom: 250 }} showsVerticalScrollIndicator={false}>
                {categories.filter(c => c.type === 'Expense').length === 0 ? (
                    <View className="flex-1 items-center justify-center pt-20">
                        <Text className="text-white text-xl font-bold font-['Inter_700Bold'] mb-2">No categories yet.</Text>
                        <Text className="text-[#94A3B8] text-center text-[15px] px-4 leading-6">
                            Tap the menu icon (•••) at the top right{'\n'}to add a category.
                        </Text>
                    </View>
                ) : (
                    categories.filter(c => c.type === 'Expense').map((cat) => {
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
                <View className="px-6 pt-4 pb-2 flex-row justify-between items-center">
                    <View>
                        <Text className="text-white text-2xl font-bold font-['Inter_700Bold']">Expenses</Text>
                        <Text className="text-[#94A3B8] text-sm mt-1">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</Text>
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
                            const category = categories.find(c => c.id === item.categoryId);
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
                onRequestClose={() => setIsGoalModalVisible(false)}
            >
                <View className="flex-1 justify-center items-center bg-black/60 px-6">
                    <View className="bg-[#1E293B] w-full rounded-3xl p-6 border border-[#334155] shadow-2xl">
                        <Text className="text-white text-xl font-bold mb-4">Set Expense Limit</Text>
                        <Text className="text-slate-400 text-sm mb-4">Enter your target expense limit below:</Text>

                        <View className="bg-[#0F172A] rounded-2xl flex-row items-center px-4 h-14 border border-[#334155] mb-6">
                            <Text className="text-slate-400 text-lg mr-2">₱</Text>
                            <TextInput
                                className="flex-1 text-white text-lg font-medium"
                                placeholder="0.00"
                                placeholderTextColor="#475569"
                                keyboardType="numeric"
                                value={tempGoal}
                                onChangeText={setTempGoal}
                                autoFocus
                            />
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
                                    if (!isNaN(parsedGoal) && parsedGoal > 0) {
                                        setExpenseGoal(parsedGoal);
                                    } else {
                                        setExpenseGoal(0); // clear if invalid/empty
                                    }
                                    setIsGoalModalVisible(false);
                                }}
                                className="px-6 py-3 rounded-xl bg-[#EF4444]"
                            >
                                <Text className="text-white font-bold">Save Limit</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
