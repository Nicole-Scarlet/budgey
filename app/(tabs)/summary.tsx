import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTransactions } from '../../contexts/TransactionContext';

export default function SummaryScreen() {
    const router = useRouter();
    const { bottom } = useSafeAreaInsets();
    const { transactions, getTotalBalance, categories: globalCategories, budget, deleteTransaction } = useTransactions();

    const [filterPeriod, setFilterPeriod] = useState<'All' | 'Daily' | 'Weekly' | 'Monthly'>('All');
    const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

    const filterTransactionsByPeriod = (trans: any[]) => {
        if (filterPeriod === 'All') return trans;

        const now = new Date();
        const todayStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

        return trans.filter(t => {
            const tDate = new Date(t.date);
            if (filterPeriod === 'Daily') {
                return t.date === todayStr;
            } else if (filterPeriod === 'Weekly') {
                // Calculate difference in days
                const diffTime = Math.abs(now.getTime() - tDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays <= 7;
            } else if (filterPeriod === 'Monthly') {
                return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
            }
            return true;
        });
    };

    const filteredTransactions = filterTransactionsByPeriod(transactions);

    const categories = [
        { name: 'Expenses', icon: 'cart-outline', type: 'material' },
        { name: 'Income', icon: 'wallet-outline', type: 'material' },
        { name: 'Savings', icon: 'piggy-bank-outline', type: 'material' },
        { name: 'Debt', icon: 'receipt-text-outline', type: 'material' },
        { name: 'Investment', icon: 'chart-line-variant', type: 'material' },
    ];

    return (
        <SafeAreaView className="flex-1 bg-[#1E293B]">
            {/* Header with Set Budget */}
            <View className="bg-[#334155] rounded-b-[40px] pt-8 pb-10 shadow-lg">
                <View className="items-center mt-2">
                    <Text className="text-white text-[42px] font-bold tracking-tight">₱{budget.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
                    <Text className="text-white/80 text-lg font-medium mt-2">Overall Budget</Text>

                    {budget === 0 ? (
                        <Pressable onPress={() => router.push('/add-budget')} className="bg-[#1E293B] px-4 py-2 rounded-full border border-[#90A1B9]/30 mt-3">
                            <Text className="text-[#38BDF8] font-medium text-sm">+ Set Budget</Text>
                        </Pressable>
                    ) : (
                        <Pressable onPress={() => router.push('/add-budget')} className="bg-[#1E293B] px-4 py-2 rounded-full border border-[#90A1B9]/30 mt-3">
                            <Text className="text-[#38BDF8] font-medium text-sm">Edit Budget</Text>
                        </Pressable>
                    )}
                </View>
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
                                    if (cat.name === 'Debt') router.push('/debt' as any);
                                    if (cat.name === 'Investment') router.push('/investment' as any);
                                }}
                                className={`p-3 rounded-2xl bg-transparent`}
                            >
                                <MaterialCommunityIcons
                                    name={cat.icon as any}
                                    size={32}
                                    color={'#94A3B8'}
                                />
                            </Pressable>
                            <Text className={`text-[10px] mt-1 font-medium text-[#94A3B8]`}>
                                {cat.name}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Main Summary Section */}
            <View className="flex-1 px-6 mt-2">
                <View className="bg-[#334155]/30 rounded-[32px] border border-[#90A1B9]/10 flex-1 overflow-hidden">
                    <View className="z-50 px-6 py-5 flex-row items-center justify-between border-b border-[#90A1B9]/10 relative">
                        <Text className="text-white text-xl font-bold">
                            Summary {filterPeriod !== 'All' ? `(${filterPeriod})` : ''}
                        </Text>
                        <Pressable
                            onPress={() => setIsFilterModalVisible(!isFilterModalVisible)}
                            className={`p-2 -mr-2 rounded-lg ${isFilterModalVisible ? 'bg-[#334155]' : ''}`}
                        >
                            <Ionicons name="funnel" size={20} color={isFilterModalVisible ? "#38BDF8" : "white"} />
                        </Pressable>

                        {/* Inline Dropdown */}
                        {isFilterModalVisible && (
                            <View className="absolute top-[60px] right-6 bg-[#1E293B] rounded-xl border border-[#334155] shadow-2xl z-[100] w-40 overflow-hidden">
                                {['All', 'Daily', 'Weekly', 'Monthly'].map((period, index) => (
                                    <Pressable
                                        key={period}
                                        onPress={() => {
                                            setFilterPeriod(period as any);
                                            setIsFilterModalVisible(false);
                                        }}
                                        className={`flex-row items-center justify-between px-4 py-3 ${index !== 3 ? 'border-b border-[#334155]/50' : ''} ${filterPeriod === period ? 'bg-[#334155]/30' : ''}`}
                                    >
                                        <Text className={`font-semibold text-sm ${filterPeriod === period ? 'text-[#38BDF8]' : 'text-slate-300'}`}>
                                            {period === 'All' ? 'All Time' : period}
                                        </Text>
                                        {filterPeriod === period && <Ionicons name="checkmark" size={16} color="#38BDF8" />}
                                    </Pressable>
                                ))}
                            </View>
                        )}
                    </View>

                    <ScrollView
                        className="flex-1 py-2 px-6"
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: bottom + 115 }}
                        scrollEnabled={!isFilterModalVisible} // prevent scrolling while dropdown is open
                    >
                        {isFilterModalVisible && (
                            <Pressable
                                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 90 }}
                                onPress={() => setIsFilterModalVisible(false)}
                            />
                        )}
                        {filteredTransactions.length > 0 ? (
                            filteredTransactions.map(transaction => {
                                const category = globalCategories.find(c => c.id === transaction.categoryId);

                                let icon: any = category ? category.icon : 'cart-outline';
                                let iconFamily: 'material' | 'feather' = category ? 'feather' : 'material';
                                let iconBgColor = category ? category.color : '#334155';
                                let amountColor = 'text-[#EF4444]'; // red default
                                let sign = '-';

                                // Determine sign based on transaction type (and default colors if no custom category)
                                switch (transaction.type) {
                                    case 'income':
                                        if (!category) { icon = 'wallet-outline'; iconBgColor = '#10B981'; }
                                        amountColor = 'text-[#10B981]'; // green
                                        sign = '+';
                                        break;
                                    case 'savings':
                                        if (!category) { icon = 'piggy-bank-outline'; iconBgColor = '#3B82F6'; }
                                        amountColor = 'text-[#3B82F6]'; // blue
                                        sign = '+';
                                        break;
                                    case 'debt':
                                        if (!category) { icon = 'receipt-text-outline'; iconBgColor = '#F97316'; }
                                        amountColor = 'text-[#F97316]'; // orange
                                        sign = '-';
                                        break;
                                    case 'investment':
                                        if (!category) { icon = 'chart-line-variant'; iconBgColor = '#A855F7'; }
                                        amountColor = 'text-[#A855F7]'; // purple
                                        sign = '+';
                                        break;
                                    case 'expense':
                                    default:
                                        if (!category) { icon = 'cart-outline'; iconBgColor = '#EF4444'; }
                                        amountColor = 'text-[#EF4444]'; // red
                                        sign = '-';
                                        break;
                                }

                                return (
                                    <SummaryListItem
                                        key={transaction.id}
                                        icon={icon}
                                        iconFamily={iconFamily}
                                        iconBgColor={iconBgColor}
                                        title={transaction.title}
                                        amount={`${sign}₱${transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                                        amountColor={amountColor}
                                        onDelete={() => {
                                            Alert.alert(
                                                "Delete Transaction",
                                                `Are you sure you want to delete "${transaction.title}"?`,
                                                [
                                                    { text: "Cancel", style: "cancel" },
                                                    {
                                                        text: "Delete",
                                                        style: "destructive",
                                                        onPress: () => deleteTransaction(transaction.id)
                                                    }
                                                ]
                                            );
                                        }}
                                    />
                                );
                            })
                        ) : (
                            <View className="items-center justify-center pt-8">
                                <Text className="text-[#94A3B8] text-center">No transactions yet.</Text>
                            </View>
                        )}
                    </ScrollView>
                </View>
            </View>
        </SafeAreaView>
    );
}

// Cleaner list component lacking the Home screen's progress rings and navigation arrows
const SummaryListItem = ({
    icon,
    iconFamily = 'material',
    iconBgColor = '#334155',
    title,
    amount,
    amountColor,
    onDelete,
}: {
    icon: any;
    iconFamily?: 'material' | 'feather';
    iconBgColor?: string;
    title: string;
    amount: string;
    amountColor: string;
    onDelete: () => void;
}) => {
    return (
        <Pressable
            onLongPress={onDelete}
            delayLongPress={500}
            className="flex-row items-center justify-between mb-6 active:opacity-60"
        >
            <View className="flex-row items-center">
                <View
                    className="w-10 h-10 items-center justify-center mr-3"
                >
                    {iconFamily === 'material' ? (
                        <MaterialCommunityIcons name={icon} size={24} color={iconBgColor} />
                    ) : (
                        <Feather name={icon} size={24} color={iconBgColor} />
                    )}
                </View>
                <View>
                    <Text className="text-white font-bold">{title}</Text>
                </View>
            </View>
            <Text className={`font-bold text-lg ${amountColor}`}>{amount}</Text>
        </Pressable>
    );
};
