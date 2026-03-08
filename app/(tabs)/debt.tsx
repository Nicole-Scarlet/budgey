import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTransactions } from '../../contexts/TransactionContext';

export default function DebtScreen() {
    const router = useRouter();
    const {
        getTransactionsByType,
        getTotalByType,
        debtLimit,
        setDebtLimit,
        debtLimitPeriod,
        setDebtLimitPeriod,
        deleteTransaction
    } = useTransactions();
    const [isCategoryMenuVisible, setIsCategoryMenuVisible] = useState(false);
    const [isTimeFilterVisible, setIsTimeFilterVisible] = useState(false);
    const [isLimitModalVisible, setIsLimitModalVisible] = useState(false);

    useFocusEffect(
        useCallback(() => {
            return () => setIsCategoryMenuVisible(false);
        }, [])
    );
    const [tempLimit, setTempLimit] = useState('');
    const [tempPeriod, setTempPeriod] = useState<'Daily' | 'Weekly' | 'Monthly'>(debtLimitPeriod || 'Monthly');
    const [activeFilter, setActiveFilter] = useState<'Daily' | 'Weekly' | 'Monthly' | 'All'>('All');

    const navCategories = [
        { name: 'Expenses', icon: 'cart-outline', type: 'material' },
        { name: 'Income', icon: 'wallet-outline', type: 'material' },
        { name: 'Savings', icon: 'piggy-bank-outline', type: 'material' },
        { name: 'Debt', icon: 'receipt-text-outline', type: 'material', active: true },
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

    const debtTransactions = getTransactionsByType('debt').filter(t => isTransactionInActiveFilter(t.date));
    const totalDebt = debtTransactions.reduce((acc, curr) => acc + curr.amount, 0);

    // Group transactions by date
    const groupedTransactions = debtTransactions.reduce((acc, transaction) => {
        const date = transaction.date;
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(transaction);
        return acc;
    }, {} as Record<string, typeof debtTransactions>);

    return (
        <SafeAreaView className="flex-1 bg-[#1E293B]">
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
                                    // Not implemented yet
                                }}
                                className="flex-row items-center justify-between px-4 py-3 border-b border-[#64748B] active:bg-[#334155]/50 opacity-50"
                            >
                                <Text className="text-white font-bold text-sm">Add Category</Text>
                                <Ionicons name="add" size={20} color="#4ADE80" />
                            </Pressable>
                            <Pressable
                                onPress={() => {
                                    setIsCategoryMenuVisible(false);
                                    router.push({ pathname: '/category-list', params: { module: 'Debt' } } as any);
                                }}
                                className="flex-row items-center justify-between px-4 py-3 active:bg-[#334155]/50"
                            >
                                <Text className="text-white font-bold text-sm">Manage Categories</Text>
                                <Feather name="settings" size={18} color="#94A3B8" />
                            </Pressable>
                        </View>
                    )}
                </View>

                {/* Close menu when tapping header body */}
                <Pressable
                    onPress={() => isCategoryMenuVisible && setIsCategoryMenuVisible(false)}
                    className="items-center mt-2"
                >
                    <Text className="text-white text-[42px] font-bold tracking-tight">₱{totalDebt.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
                    <Text className="text-white/80 text-lg font-medium mt-2 mb-2">Overall Debt</Text>
                    {debtLimit > 0 ? (
                        <Pressable onPress={() => { setIsCategoryMenuVisible(false); setTempLimit(debtLimit.toString()); setTempPeriod(debtLimitPeriod); setIsLimitModalVisible(true); }} className="bg-[#1E293B] px-4 py-2 rounded-full border border-[#90A1B9]/30">
                            <Text className="text-[#EF4444] font-medium text-sm">Limit: ₱{debtLimit.toLocaleString('en-US', { minimumFractionDigits: 2 })} / {debtLimitPeriod} (Edit)</Text>
                        </Pressable>
                    ) : (
                        <Pressable onPress={() => { setIsCategoryMenuVisible(false); setTempLimit(''); setTempPeriod('Monthly'); setIsLimitModalVisible(true); }} className="bg-[#1E293B] px-4 py-2 rounded-full border border-[#90A1B9]/30">
                            <Text className="text-[#EF4444] font-medium text-sm">+ Set Debt Limit</Text>
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
                                    if (cat.name === 'Expenses') router.push('/expenses' as any);
                                    if (cat.name === 'Income') router.push('/income' as any);
                                    if (cat.name === 'Savings') router.push('/savings' as any);
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

            {/* Main Content Card */}
            <View className="flex-1 px-6 mt-2">
                <Pressable onPress={() => setIsCategoryMenuVisible(false)} className="bg-[#334155]/30 rounded-[32px] border border-[#90A1B9]/10 flex-1 overflow-hidden">
                    {/* Card Header */}
                    <View className="px-6 py-5 flex-row items-center justify-between border-b border-[#90A1B9]/10 relative z-50">
                        <View className="flex-row items-center mb-1">
                            <Text className="text-white text-xl font-bold mr-3">Debt</Text>

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
                                        style={{ top: 250, left: 100 }}
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
                        <Pressable onPress={() => router.push('/add-debt' as any)} className="bg-white w-8 h-8 rounded-full items-center justify-center">
                            <Ionicons name="add" size={20} color="#1E293B" />
                        </Pressable>
                    </View>

                    <ScrollView
                        className="flex-1 py-4"
                        contentContainerStyle={{ paddingBottom: 120 }}
                        onScrollBeginDrag={() => setIsCategoryMenuVisible(false)}
                    >
                        {Object.entries(groupedTransactions).map(([date, transactions], groupIndex) => (
                            <View key={groupIndex} className="px-6 mb-6">
                                <Text className="text-[#94A3B8] text-sm font-bold mb-4">{date}</Text>

                                {transactions.map((item, itemIndex) => (
                                    <Pressable
                                        key={item.id || itemIndex}
                                        className="flex-row items-center justify-between mb-4 active:opacity-60"
                                        onLongPress={() => {
                                            Alert.alert(
                                                "Delete Debt Transaction",
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
                                        <Text className="text-white font-medium text-[16px]">{item.title}</Text>
                                        <Text className="text-[#EF4444] font-bold text-lg">-₱{item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
                                    </Pressable>
                                ))}
                            </View>
                        ))}
                        {debtTransactions.length === 0 && (
                            <View className="items-center justify-center pt-10">
                                <Ionicons name="receipt-outline" size={48} color="#64748B" />
                                <Text className="text-[#94A3B8] text-lg mt-4 text-center px-4">No debt recorded yet.</Text>
                            </View>
                        )}
                    </ScrollView>
                </Pressable>
            </View>

            {/* Set Limit Modal */}
            <Modal
                visible={isLimitModalVisible}
                transparent
                animationType="fade"
                statusBarTranslucent={true}
                onRequestClose={() => setIsLimitModalVisible(false)}
            >
                <Pressable
                    className="flex-1 bg-black/60 justify-center items-center px-6"
                    onPress={() => setIsLimitModalVisible(false)}
                >
                    <Pressable onPress={() => { }} className="w-full">
                        <View className="bg-[#1E293B] w-full rounded-3xl p-6 border border-[#334155] shadow-2xl">
                            <Text className="text-white text-xl font-bold mb-4">Set Debt Limit</Text>
                            <Text className="text-slate-400 text-sm mb-4">Enter your target debt limit below:</Text>

                            {parseFloat(tempLimit.replace(/[^0-9.-]+/g, '')) > 1000000000 && (
                                <Text className="text-red-500 text-xs mb-2 font-bold">
                                    Maximum limit is ₱1,000,000,000
                                </Text>
                            )}

                            <View className={`bg-[#0F172A] rounded-2xl flex-row items-center px-4 h-14 border ${parseFloat(tempLimit.replace(/[^0-9.-]+/g, '')) > 1000000000 ? 'border-red-500' : 'border-[#334155]'} mb-6`}>
                                <Text className="text-slate-400 text-lg mr-2">₱</Text>
                                <TextInput
                                    className="flex-1 text-white text-lg font-medium"
                                    placeholder="0.00"
                                    placeholderTextColor="#475569"
                                    keyboardType="numeric"
                                    value={tempLimit}
                                    onChangeText={setTempLimit}
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
                                    onPress={() => setIsLimitModalVisible(false)}
                                    className="px-6 py-3 rounded-xl bg-[#334155]"
                                >
                                    <Text className="text-white font-medium">Cancel</Text>
                                </Pressable>
                                <Pressable
                                    onPress={() => {
                                        const parsedLimit = parseFloat(tempLimit.replace(/[^0-9.-]+/g, ''));
                                        if (!isNaN(parsedLimit) && parsedLimit > 0 && parsedLimit <= 1000000000) {
                                            setDebtLimit(parsedLimit);
                                            setDebtLimitPeriod(tempPeriod);
                                            setIsLimitModalVisible(false);
                                        } else if (tempLimit === '' || parsedLimit === 0) {
                                            setDebtLimit(0); // clear if empty
                                            setIsLimitModalVisible(false);
                                        }
                                    }}
                                    disabled={parseFloat(tempLimit.replace(/[^0-9.-]+/g, '')) > 1000000000}
                                    className={`px-6 py-3 rounded-xl ${parseFloat(tempLimit.replace(/[^0-9.-]+/g, '')) > 1000000000 ? 'bg-gray-500' : 'bg-[#EF4444]'}`}
                                >
                                    <Text className="text-white font-bold text-center">Save Limit</Text>
                                </Pressable>
                            </View>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
}
