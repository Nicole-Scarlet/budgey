import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTransactions } from '../../contexts/TransactionContext';

export default function SummaryScreen() {
    const router = useRouter();
    const { bottom } = useSafeAreaInsets();
    const {
        transactions,
        getTotalBalance,
        categories: globalCategories,
        budget,
        budgetPeriod,
        setBudget,
        setBudgetPeriod,
        deleteTransaction,
        subtractSavingsFromBudget,
        setSubtractSavingsFromBudget,
        subtractInvestmentFromBudget,
        setSubtractInvestmentFromBudget,
        subtractDebtFromBudget,
        setSubtractDebtFromBudget
    } = useTransactions();

    const [filterPeriod, setFilterPeriod] = useState<'All' | 'Daily' | 'Weekly' | 'Monthly'>('All');
    const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

    const [isBudgetModalVisible, setIsBudgetModalVisible] = useState(false);
    const [tempBudget, setTempBudget] = useState('');
    const [tempPeriod, setTempPeriod] = useState<'Daily' | 'Weekly' | 'Monthly'>('Monthly');
    const [tempSubtractSavings, setTempSubtractSavings] = useState(true);
    const [tempSubtractInvestment, setTempSubtractInvestment] = useState(true);
    const [tempSubtractDebt, setTempSubtractDebt] = useState(true);

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
                <View className="items-center mt-2 relative">
                    <Text className="text-white text-[42px] font-bold tracking-tight">₱{budget.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
                    <Text className="text-white/80 text-lg font-medium mt-2">Overall Budget</Text>

                    <Pressable
                        onPress={() => {
                            setTempBudget(budget > 0 ? budget.toString() : '');
                            setTempPeriod(budget > 0 ? budgetPeriod : 'Monthly');
                            setTempSubtractSavings(subtractSavingsFromBudget);
                            setTempSubtractInvestment(subtractInvestmentFromBudget);
                            setTempSubtractDebt(subtractDebtFromBudget);
                            setIsBudgetModalVisible(true)
                        }}
                    >
                        {budget > 0 ? (
                            <Text className="text-[#38BDF8] font-medium text-sm mt-3 bg-[#1E293B] px-4 py-2 rounded-full border border-[#90A1B9]/30">
                                Limit: ₱{budget.toLocaleString('en-US', { minimumFractionDigits: 2 })} / {budgetPeriod} (Edit)
                            </Text>
                        ) : (
                            <Text className="text-[#38BDF8] font-medium text-sm mt-3 bg-[#1E293B] px-4 py-2 rounded-full border border-[#90A1B9]/30">
                                + Set Budget
                            </Text>
                        )}
                    </Pressable>
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

                        <Modal
                            visible={isFilterModalVisible}
                            transparent
                            animationType="none"
                            statusBarTranslucent={true}
                            onRequestClose={() => setIsFilterModalVisible(false)}
                        >
                            <Pressable
                                className="flex-1 bg-black/40"
                                onPress={() => setIsFilterModalVisible(false)}
                            >
                                <View className="absolute top-64 right-6 bg-[#1E293B] rounded-xl border border-[#334155] shadow-2xl z-[100] w-40 overflow-hidden">
                                    {['All', 'Daily', 'Weekly', 'Monthly'].map((period, index) => (
                                        <Pressable
                                            key={`${period}-filter`}
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
                            </Pressable>
                        </Modal>
                    </View>

                    <ScrollView
                        className="flex-1 py-2 px-6"
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: bottom + 115 }}
                        scrollEnabled={!isFilterModalVisible} // prevent scrolling while dropdown is open
                    >
                        {/* No longer need the inline Pressable overlay since we use a real Modal */}
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

            {/* Budget Modal */}
            <Modal
                visible={isBudgetModalVisible}
                transparent
                animationType="fade"
                statusBarTranslucent={true}
                onRequestClose={() => setIsBudgetModalVisible(false)}
            >
                <Pressable
                    className="flex-1 bg-black/60 justify-center items-center px-4"
                    onPress={() => setIsBudgetModalVisible(false)}
                >
                    <Pressable onPress={() => { }} className="w-full">
                        <View className="bg-[#1E293B] w-full p-6 rounded-[25px] border border-[#334155]">
                            <Text className="text-white text-xl font-bold mb-4">Set Overall Budget</Text>

                            <View className="flex-row items-center bg-[#0F172A] rounded-xl px-4 py-3 mb-4 border border-[#334155]">
                                <Text className="text-slate-400 text-lg mr-2">₱</Text>
                                <TextInput
                                    className="flex-1 text-white text-lg font-medium"
                                    placeholder="0.00"
                                    placeholderTextColor="#475569"
                                    keyboardType="numeric"
                                    value={tempBudget}
                                    onChangeText={setTempBudget}
                                />
                            </View>

                            <Text className="text-slate-400 text-sm mb-3">Does this limit apply Daily, Weekly, or Monthly?</Text>
                            <View className="flex-row bg-[#0F172A] rounded-xl p-1 mb-6 border border-[#334155]">
                                {['Daily', 'Weekly', 'Monthly'].map((period) => (
                                    <Pressable
                                        key={`${period}-budget`}
                                        onPress={() => setTempPeriod(period as any)}
                                        className={`flex-1 py-2.5 rounded-lg items-center ${tempPeriod === period ? 'bg-[#334155]' : ''}`}
                                    >
                                        <Text className={`font-medium ${tempPeriod === period ? 'text-white' : 'text-slate-400'}`}>
                                            {period}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>

                            <View className="mb-8">
                                <Text className="text-slate-400 text-sm mb-4">Subtract calculations from Overall Budget:</Text>

                                <Pressable
                                    onPress={() => setTempSubtractSavings(!tempSubtractSavings)}
                                    className="flex-row items-center justify-between py-2"
                                >
                                    <View className="flex-row items-center gap-x-3">
                                        <View className="bg-[#3B82F6]/20 p-2 rounded-lg">
                                            <MaterialCommunityIcons name="piggy-bank" size={20} color="#3B82F6" />
                                        </View>
                                        <Text className="text-white font-medium">Subtract Savings</Text>
                                    </View>
                                    <View className={`w-12 h-6 rounded-full px-1 justify-center ${tempSubtractSavings ? 'bg-[#4ADE80]' : 'bg-[#334155]'}`}>
                                        <View className={`w-4 h-4 rounded-full bg-white ${tempSubtractSavings ? 'ml-6' : 'ml-0'}`} />
                                    </View>
                                </Pressable>

                                <Pressable
                                    onPress={() => setTempSubtractDebt(!tempSubtractDebt)}
                                    className="flex-row items-center justify-between py-2 mt-2"
                                >
                                    <View className="flex-row items-center gap-x-3">
                                        <View className="bg-[#EF4444]/20 p-2 rounded-lg">
                                            <MaterialCommunityIcons name="receipt-text-outline" size={20} color="#EF4444" />
                                        </View>
                                        <Text className="text-white font-medium">Subtract Debt</Text>
                                    </View>
                                    <View className={`w-12 h-6 rounded-full px-1 justify-center ${tempSubtractDebt ? 'bg-[#4ADE80]' : 'bg-[#334155]'}`}>
                                        <View className={`w-4 h-4 rounded-full bg-white ${tempSubtractDebt ? 'ml-6' : 'ml-0'}`} />
                                    </View>
                                </Pressable>

                                <Pressable
                                    onPress={() => setTempSubtractInvestment(!tempSubtractInvestment)}
                                    className="flex-row items-center justify-between py-2 mt-2"
                                >
                                    <View className="flex-row items-center gap-x-3">
                                        <View className="bg-[#A855F7]/20 p-2 rounded-lg">
                                            <MaterialCommunityIcons name="trending-up" size={20} color="#A855F7" />
                                        </View>
                                        <Text className="text-white font-medium">Subtract Investment</Text>
                                    </View>
                                    <View className={`w-12 h-6 rounded-full px-1 justify-center ${tempSubtractInvestment ? 'bg-[#4ADE80]' : 'bg-[#334155]'}`}>
                                        <View className={`w-4 h-4 rounded-full bg-white ${tempSubtractInvestment ? 'ml-6' : 'ml-0'}`} />
                                    </View>
                                </Pressable>
                            </View>

                            <View className="flex-row justify-end space-x-3 gap-x-3">
                                <Pressable
                                    onPress={() => setIsBudgetModalVisible(false)}
                                    className="px-6 py-3 rounded-xl bg-[#334155]"
                                >
                                    <Text className="text-white font-medium">Cancel</Text>
                                </Pressable>
                                <Pressable
                                    onPress={() => {
                                        const parsedBudget = parseFloat(tempBudget.replace(/[^0-9.-]+/g, ''));
                                        if (!isNaN(parsedBudget) && parsedBudget >= 0) {
                                            setBudget(parsedBudget);
                                            setBudgetPeriod(tempPeriod as any);
                                        }
                                        setSubtractSavingsFromBudget(tempSubtractSavings);
                                        setSubtractInvestmentFromBudget(tempSubtractInvestment);
                                        setSubtractDebtFromBudget(tempSubtractDebt);
                                        setIsBudgetModalVisible(false);
                                    }}
                                    className="px-6 py-3 rounded-xl bg-[#4ADE80]"
                                >
                                    <Text className="text-[#0F172A] font-bold">Save</Text>
                                </Pressable>
                            </View>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
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
