import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
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
        deleteTransaction
    } = useTransactions();
    const [isCategoryMenuVisible, setIsCategoryMenuVisible] = useState(false);
    const [isLimitModalVisible, setIsLimitModalVisible] = useState(false);
    const [tempLimit, setTempLimit] = useState('');

    const categories = [
        { name: 'Expenses', icon: 'cart-outline', type: 'material' },
        { name: 'Income', icon: 'wallet-outline', type: 'material' },
        { name: 'Savings', icon: 'piggy-bank-outline', type: 'material' },
        { name: 'Debt', icon: 'receipt-text-outline', type: 'material', active: true },
        { name: 'Investment', icon: 'chart-line-variant', type: 'material' },
    ];

    const debtTransactions = getTransactionsByType('debt');
    const totalDebt = getTotalByType('debt');

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
                            className="mt-2 bg-[#475569] shadow-xl rounded-[16px] border border-[#64748B] overflow-hidden min-w-[200px]"
                        >
                            <Pressable
                                onPress={() => {
                                    setIsCategoryMenuVisible(false);
                                    // Not implemented yet, but keeping structure intact
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
                        <Pressable onPress={() => { setTempLimit(debtLimit.toString()); setIsLimitModalVisible(true); }} className="bg-[#1E293B] px-4 py-2 rounded-full border border-[#90A1B9]/30">
                            <Text className="text-[#F97316] font-medium text-sm">Limit: ₱{debtLimit.toLocaleString('en-US', { minimumFractionDigits: 2 })} (Edit)</Text>
                        </Pressable>
                    ) : (
                        <Pressable onPress={() => { setTempLimit(''); setIsLimitModalVisible(true); }} className="bg-[#1E293B] px-4 py-2 rounded-full border border-[#90A1B9]/30">
                            <Text className="text-[#F97316] font-medium text-sm">+ Set Debt Limit</Text>
                        </Pressable>
                    )}
                </Pressable>
            </View>

            {/* Category Icons Row */}
            <View className="px-4 py-6">
                <View className="flex-row justify-between w-full px-2">
                    {categories.map((cat, index) => (
                        <View key={index} className="items-center">
                            <Pressable
                                onPress={() => {
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
            </View>

            {/* Main Content Card */}
            <View className="flex-1 px-6 mt-2">
                <View className="bg-[#334155]/30 rounded-[32px] border border-[#90A1B9]/10 flex-1 overflow-hidden">
                    {/* Card Header */}
                    <View className="px-6 py-5 flex-row items-center justify-between border-b border-[#90A1B9]/10">
                        <Text className="text-white text-xl font-bold">Debt</Text>
                        <Pressable className="bg-white w-8 h-8 rounded-full items-center justify-center">
                            <Ionicons name="add" size={20} color="#1E293B" />
                        </Pressable>
                    </View>

                    <ScrollView className="flex-1 py-4" contentContainerStyle={{ paddingBottom: 120 }}>
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
                                        <Text className="text-[#F97316] font-bold text-lg">-₱{item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
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
                </View>
            </View>

            {/* Set Limit Modal */}
            <Modal
                visible={isLimitModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setIsLimitModalVisible(false)}
            >
                <View className="flex-1 justify-center items-center bg-black/60 px-6">
                    <View className="bg-[#1E293B] w-full rounded-3xl p-6 border border-[#334155] shadow-2xl">
                        <Text className="text-white text-xl font-bold mb-4">Set Debt Limit</Text>
                        <Text className="text-slate-400 text-sm mb-4">Enter your target debt limit below:</Text>

                        <View className="bg-[#0F172A] rounded-2xl flex-row items-center px-4 h-14 border border-[#334155] mb-6">
                            <Text className="text-slate-400 text-lg mr-2">₱</Text>
                            <TextInput
                                className="flex-1 text-white text-lg font-medium"
                                placeholder="0.00"
                                placeholderTextColor="#475569"
                                keyboardType="numeric"
                                value={tempLimit}
                                onChangeText={setTempLimit}
                                autoFocus
                            />
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
                                    if (!isNaN(parsedLimit) && parsedLimit > 0) {
                                        setDebtLimit(parsedLimit);
                                    } else {
                                        setDebtLimit(0); // clear if invalid/empty
                                    }
                                    setIsLimitModalVisible(false);
                                }}
                                className="px-6 py-3 rounded-xl bg-[#F97316]"
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
