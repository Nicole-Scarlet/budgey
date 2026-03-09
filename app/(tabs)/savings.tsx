import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTransactions } from '../../contexts/TransactionContext';
import { useTheme } from '../../contexts/ThemeContext';

export default function SavingsScreen() {
    const router = useRouter();
    const {
        getTransactionsByType,
        getTotalByType,
        savingsGoal,
        setSavingsGoal,
        savingsGoalPeriod,
        setSavingsGoalPeriod,
        categories: globalCategories,
        deleteTransaction,
        activeGroupId,
        profiles,
        currentUserId,
        groups
    } = useTransactions();
    const [isGoalModalVisible, setIsGoalModalVisible] = useState(false);
    const [isCategoryMenuVisible, setIsCategoryMenuVisible] = useState(false);
    const [isTimeFilterVisible, setIsTimeFilterVisible] = useState(false);
    const { colors, isDark } = useTheme();

    useFocusEffect(
        useCallback(() => {
            return () => setIsCategoryMenuVisible(false);
        }, [])
    );
    const [tempGoal, setTempGoal] = useState('');
    const [tempPeriod, setTempPeriod] = useState<'Daily' | 'Weekly' | 'Monthly'>(savingsGoalPeriod || 'Monthly');
    const [headerHeight, setHeaderHeight] = useState(360);
    const [containerHeight, setContainerHeight] = useState(800);
    const [activeFilter, setActiveFilter] = useState<'Daily' | 'Weekly' | 'Monthly' | 'All'>('All');

    const navCategories = [
        { name: 'Expenses', icon: 'cart-outline', type: 'material' },
        { name: 'Income', icon: 'wallet-outline', type: 'material' },
        { name: 'Savings', icon: 'piggy-bank-outline', type: 'material', active: true },
        { name: 'Debt', icon: 'receipt-text-outline', type: 'material' },
        { name: 'Investment', icon: 'chart-line-variant', type: 'material' },
    ];

    const isTransactionInActiveFilter = (transactionDateRaw: string) => {
        if (activeFilter === 'All') return true;
        const now = new Date();
        
        // Robustly parse "Month Day, Year"
        const parts = transactionDateRaw.replace(',', '').split(' ');
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const monthIndex = monthNames.indexOf(parts[0]);
        const day = parseInt(parts[1]);
        const year = parseInt(parts[2]);
        const transactionDate = new Date(year, monthIndex, day);

        switch (activeFilter) {
            case 'Daily':
                return transactionDateRaw === now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
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

    const savingsTransactions = getTransactionsByType('savings').filter(t => isTransactionInActiveFilter(t.date));
    const totalSavings = savingsTransactions.reduce((acc, curr) => acc + curr.amount, 0);

    const { bottom, top } = useSafeAreaInsets();
    const { height } = useWindowDimensions();
    const bottomSheetRef = useRef<BottomSheet>(null);

    const firstSnap = Math.max(220, bottom + 180);
    const secondSnap = Math.max(firstSnap + 50, containerHeight - headerHeight - 20);
    const snapPoints = useMemo(() => [firstSnap, secondSnap], [firstSnap, secondSnap, containerHeight, headerHeight]);

    const handleSheetChanges = useCallback((index: number) => {
        setIsCategoryMenuVisible(false);
    }, []);

    return (
        <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }} onLayout={(e) => setContainerHeight(e.nativeEvent.layout.height)}>
            <View onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}>
                <View 
                    style={{ backgroundColor: colors.card }}
                    className="rounded-b-[40px] pt-8 pb-10 shadow-lg relative z-50"
                >
                    <View className="absolute top-8 right-6 items-end z-50">
                        <Pressable
                            className="p-2 -mr-2"
                            onPress={() => setIsCategoryMenuVisible(!isCategoryMenuVisible)}
                        >
                            <MaterialCommunityIcons name="dots-horizontal" size={28} color={colors.muted} />
                        </Pressable>

                        {isCategoryMenuVisible && (
                            <View
                                style={{ backgroundColor: colors.card, borderColor: colors.border }}
                                className="absolute top-12 right-0 shadow-xl rounded-[16px] border overflow-hidden min-w-[200px] z-[100]"
                            >
                                <Pressable
                                    onPress={() => {
                                        setIsCategoryMenuVisible(false);
                                        router.push({ pathname: '/add-category', params: { module: 'Savings' } } as any);
                                    }}
                                    className="flex-row items-center justify-between px-4 py-3 border-b active:opacity-50"
                                    style={{ borderBottomColor: colors.border + '33' }}
                                >
                                    <Text className="font-bold text-sm" style={{ color: colors.foreground }}>Add Category</Text>
                                    <Ionicons name="add" size={20} color="#4ADE80" />
                                </Pressable>
                                <Pressable
                                    onPress={() => {
                                        setIsCategoryMenuVisible(false);
                                        router.push({ pathname: '/category-list', params: { module: 'Savings' } } as any);
                                    }}
                                    className="flex-row items-center justify-between px-4 py-3 active:opacity-50"
                                >
                                    <Text className="font-bold text-sm" style={{ color: colors.foreground }}>Manage Categories</Text>
                                    <Feather name="settings" size={18} color={colors.muted} />
                                </Pressable>
                            </View>
                        )}
                    </View>

                    <Pressable
                        onPress={() => isCategoryMenuVisible && setIsCategoryMenuVisible(false)}
                        className="items-center mt-2"
                    >
                        <Text className="text-[42px] font-bold tracking-tight" style={{ color: colors.foreground }}>₱{totalSavings.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
                        <Text className="text-lg font-medium mt-2 mb-2" style={{ color: colors.foreground + 'CC' }}>Overall Savings</Text>
                        {savingsGoal > 0 ? (
                            <Pressable 
                                onPress={() => { setIsCategoryMenuVisible(false); setTempGoal(savingsGoal.toString()); setTempPeriod(savingsGoalPeriod); setIsGoalModalVisible(true); }} 
                                className="px-4 py-2 rounded-full border"
                                style={{ backgroundColor: colors.background, borderColor: colors.border }}
                            >
                                <Text className="text-[#38BDF8] font-medium text-sm">Goal: ₱{savingsGoal.toLocaleString('en-US', { minimumFractionDigits: 2 })} / {savingsGoalPeriod} (Edit)</Text>
                            </Pressable>
                        ) : (
                            <Pressable 
                                onPress={() => { setIsCategoryMenuVisible(false); setTempGoal(''); setTempPeriod('Monthly'); setIsGoalModalVisible(true); }} 
                                className="px-4 py-2 rounded-full border"
                                style={{ backgroundColor: colors.background, borderColor: colors.border }}
                            >
                                <Text className="text-[#38BDF8] font-medium text-sm">+ Set Savings Goal</Text>
                            </Pressable>
                        )}
                    </Pressable>
                </View>

                <Pressable onPress={() => setIsCategoryMenuVisible(false)} className="px-4 py-6">
                    <View className="flex-row justify-between w-full px-2">
                        {navCategories.map((cat, index) => (
                            <View key={index} className="items-center">
                                <Pressable
                                    onPress={() => {
                                        setIsCategoryMenuVisible(false);
                                        if (cat.name === 'Expenses') router.push('/expenses' as any);
                                        if (cat.name === 'Income') router.push('/income' as any);
                                        if (cat.name === 'Savings') router.push('/savings' as any);
                                        if (cat.name === 'Debt') router.push('/debt' as any);
                                        if (cat.name === 'Investment') router.push('/investment' as any);
                                    }}
                                    className={`p-3 rounded-2xl border ${cat.active ? 'border-[#90A1B9]/30' : 'border-transparent'}`}
                                    style={{ backgroundColor: cat.active ? colors.card : 'transparent' }}
                                >
                                    <MaterialCommunityIcons
                                        name={cat.icon as any}
                                        size={32}
                                        color={cat.active ? colors.foreground : colors.muted}
                                    />
                                </Pressable>
                                <Text
                                    className={`text-[10px] mt-1 font-medium`}
                                    style={{ color: cat.active ? colors.foreground : colors.muted }}
                                >
                                    {cat.name}
                                </Text>
                            </View>
                        ))}
                    </View>
                </Pressable>
            </View>

            <ScrollView className="px-6 flex-1" contentContainerStyle={{ paddingBottom: 250 }} showsVerticalScrollIndicator={false}>
                <Pressable onPress={() => setIsCategoryMenuVisible(false)}>
                    {globalCategories.filter(c => c.type === 'Savings').length === 0 ? (
                        <View className="flex-1 items-center justify-center pt-20">
                            <Text className="text-xl font-bold font-['Inter_700Bold'] mb-2" style={{ color: colors.foreground }}>No categories yet.</Text>
                            <Text className="text-center text-[15px] px-4 leading-6" style={{ color: colors.muted }}>
                                Tap the menu icon (•••) at the top right{'\n'}to add a category.
                            </Text>
                        </View>
                    ) : (
                        globalCategories.filter(c => c.type === 'Savings').map((cat) => {
                            const categoryTransactions = savingsTransactions.filter(t => t.categoryId === cat.id);
                            const categorySaved = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);

                            return (
                                <Pressable
                                    key={cat.id}
                                    onPress={() => router.push({ pathname: '/add-expense', params: { category: cat.id, categoryName: cat.name, module: 'Savings' } })}
                                    className="flex-row items-center justify-between py-4 border-b active:opacity-50"
                                    style={{ borderBottomColor: colors.border + '33' }}
                                >
                                    <View className="flex-row items-center flex-1">
                                        <View
                                            className="w-14 h-14 rounded-full border-2 items-center justify-center mr-4"
                                            style={{ backgroundColor: `${cat.color}20`, borderColor: cat.color }}
                                        >
                                            <Feather name={cat.icon as any} size={24} color={cat.color} />
                                        </View>

                                        <View>
                                            <Text className="text-[18px] font-bold mb-1" style={{ color: colors.foreground }}>{cat.name}</Text>
                                            <Text className="text-[14px]" style={{ color: colors.muted }}>
                                                Saved: ₱{categorySaved.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </Text>
                                        </View>
                                    </View>

                                    <View className="w-10 h-10 items-center justify-center">
                                        <Feather name="chevron-right" size={24} color={colors.muted} />
                                    </View>
                                </Pressable>
                            );
                        })
                    )}
                </Pressable>
            </ScrollView>

            <BottomSheet
                ref={bottomSheetRef}
                index={1}
                snapPoints={snapPoints}
                onChange={handleSheetChanges}
                backgroundStyle={{ backgroundColor: colors.background, borderRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 10 }}
                handleIndicatorStyle={{ backgroundColor: colors.muted, width: 40 }}
            >
                <View className="px-6 pt-4 pb-2 flex-row justify-between items-center relative z-50">
                    <View>
                        <View className="flex-row items-center mb-1 z-50">
                            <Text className="text-2xl font-bold font-['Inter_700Bold'] mr-3" style={{ color: colors.foreground }}>
                                {activeGroupId ? `${groups.find(g => g.id === activeGroupId)?.name || 'Group'} Savings` : 'Savings'}
                            </Text>

                            <View className="relative z-[100]">
                                <Pressable
                                    onPress={() => setIsTimeFilterVisible(!isTimeFilterVisible)}
                                    className="px-3 py-1.5 rounded-full flex-row items-center border"
                                    style={{ backgroundColor: colors.card, borderColor: colors.border }}
                                >
                                    <Text className="text-xs font-bold mr-1" style={{ color: colors.muted }}>{activeFilter}</Text>
                                    <Feather name="chevron-down" size={14} color={colors.muted} />
                                </Pressable>

                                {isTimeFilterVisible && (
                                    <View
                                        className="absolute shadow-2xl rounded-xl border overflow-hidden w-32 z-[100] left-0 top-[115%]"
                                        style={{ backgroundColor: colors.card, borderColor: colors.border }}
                                    >
                                        {['All', 'Daily', 'Weekly', 'Monthly'].map((filter) => (
                                            <Pressable
                                                key={`${filter}-filter`}
                                                onPress={() => {
                                                    setActiveFilter(filter as any);
                                                    setIsTimeFilterVisible(false);
                                                }}
                                                className={`px-4 py-3 border-b flex-row items-center justify-between ${activeFilter === filter ? (isDark ? 'bg-[#334155]' : 'bg-slate-100') : ''}`}
                                                style={{ borderBottomColor: colors.border + '33' }}
                                            >
                                                <Text className={`text-sm ${activeFilter === filter ? 'text-white font-bold' : ''}`} style={{ color: activeFilter === filter ? colors.foreground : colors.muted }}>{filter}</Text>
                                                {activeFilter === filter && <Feather name="check" size={14} color="#4ADE80" />}
                                            </Pressable>
                                        ))}
                                    </View>
                                )}
                            </View>
                        </View>
                        <Text className="text-sm" style={{ color: colors.muted }}>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</Text>
                    </View>
                    <Pressable onPress={() => router.push({ pathname: '/add-expense', params: { module: 'Savings' } })} className="p-2">
                        <Ionicons name="add" size={28} color={colors.foreground} />
                    </Pressable>
                </View>

                <BottomSheetScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40, paddingTop: 20 }}>
                    {savingsTransactions.length === 0 ? (
                        <View className="items-center justify-center pt-10 pb-20">
                            <Ionicons name="wallet-outline" size={48} color={colors.muted} />
                            <Text className="text-lg mt-4 text-center px-4" style={{ color: colors.muted }}>No savings recorded yet.</Text>
                        </View>
                    ) : (
                        savingsTransactions.map((item, index) => {
                            const category = globalCategories.find(c => c.id === item.categoryId);
                            return (
                                <Pressable
                                    key={item.id}
                                    className="flex-row items-center py-3 active:opacity-50 rounded-xl px-2 -mx-2"
                                    onLongPress={() => {
                                        Alert.alert(
                                            "Delete Savings",
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
                                        style={{ backgroundColor: category ? `${category.color}20` : colors.card }}
                                    >
                                        <Feather name={(category?.icon as any) || "activity"} size={18} color={category?.color || "#10B981"} />
                                    </View>

                                    <View className="flex-1 justify-center">
                                        <Text className="font-medium text-[16px] mb-1" style={{ color: colors.foreground }}>{item.title}</Text>
                                        <Text className="text-[12px]" style={{ color: colors.muted }}>
                                            {item.date}{activeGroupId && item.userId && item.userId !== currentUserId ? ` • by ${profiles.find(p => p.id === item.userId)?.full_name || 'Member'}` : ''}
                                        </Text>
                                    </View>

                                    <Text className="font-bold text-[16px]" style={{ color: colors.foreground }}>
                                        +₱{item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </Text>
                                </Pressable>
                            );
                        })
                    )}
                </BottomSheetScrollView>
            </BottomSheet>

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
                        <View 
                            style={{ backgroundColor: colors.card, borderColor: colors.border }}
                            className="w-full rounded-3xl p-6 border shadow-2xl"
                        >
                            <Text className="text-xl font-bold mb-4" style={{ color: colors.foreground }}>Set Savings Goal</Text>
                            <Text className="text-sm mb-4" style={{ color: colors.muted }}>Enter your target savings amount below:</Text>

                            {parseFloat(tempGoal.replace(/[^0-9.-]+/g, '')) > 1000000000 && (
                                <Text className="text-red-500 text-xs mb-2 font-bold">
                                    Maximum limit is ₱1,000,000,000
                                </Text>
                            )}

                            <View 
                                className={`rounded-2xl flex-row items-center px-4 h-14 border mb-6`}
                                style={{ backgroundColor: colors.background, borderColor: parseFloat(tempGoal.replace(/[^0-9.-]+/g, '')) > 1000000000 ? '#ef4444' : colors.border }}
                            >
                                <Text className="text-lg mr-2" style={{ color: colors.muted }}>₱</Text>
                                <TextInput
                                    className="flex-1 text-lg font-medium"
                                    style={{ color: colors.foreground }}
                                    placeholder="0.00"
                                    placeholderTextColor={colors.muted}
                                    keyboardType="numeric"
                                    value={tempGoal}
                                    onChangeText={setTempGoal}
                                />
                            </View>

                            <Text className="text-sm mb-3" style={{ color: colors.muted }}>Does this goal apply Daily, Weekly, or Monthly?</Text>
                            <View 
                                className="flex-row rounded-xl p-1 mb-8 border"
                                style={{ backgroundColor: colors.background, borderColor: colors.border }}
                            >
                                {['Daily', 'Weekly', 'Monthly'].map((period) => (
                                    <Pressable
                                        key={`${period}-goal`}
                                        onPress={() => setTempPeriod(period as any)}
                                        className={`flex-1 py-2.5 rounded-lg items-center ${tempPeriod === period ? (isDark ? 'bg-[#334155]' : 'bg-slate-200') : ''}`}
                                    >
                                        <Text className={`font-medium ${tempPeriod === period ? (isDark ? 'text-white' : 'text-slate-900') : ''}`} style={{ color: tempPeriod === period ? (isDark ? 'white' : 'text-slate-900') : colors.muted }}>
                                            {period}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>

                            <View className="flex-row justify-end space-x-3 gap-x-3">
                                <Pressable
                                    onPress={() => setIsGoalModalVisible(false)}
                                    className="px-6 py-3 rounded-xl"
                                    style={{ backgroundColor: colors.background }}
                                >
                                    <Text className="font-medium" style={{ color: colors.foreground }}>Cancel</Text>
                                </Pressable>
                                <Pressable
                                    onPress={async () => {
                                        const parsedGoal = parseFloat(tempGoal.replace(/[^0-9.-]+/g, ''));
                                        if (!isNaN(parsedGoal) && parsedGoal > 0 && parsedGoal <= 1000000000) {
                                            await setSavingsGoal(parsedGoal);
                                            await setSavingsGoalPeriod(tempPeriod);
                                            setIsGoalModalVisible(false);
                                        } else if (tempGoal === '' || parsedGoal === 0) {
                                            await setSavingsGoal(0);
                                            setIsGoalModalVisible(false);
                                        }
                                    }}
                                    disabled={parseFloat(tempGoal.replace(/[^0-9.-]+/g, '')) > 1000000000}
                                    className={`px-6 py-3 rounded-xl ${parseFloat(tempGoal.replace(/[^0-9.-]+/g, '')) > 1000000000 ? 'bg-gray-500' : 'bg-[#38BDF8]'}`}
                                >
                                    <Text className="text-white font-bold text-center">Save Goal</Text>
                                </Pressable>
                            </View>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </SafeAreaView >
    );
}
