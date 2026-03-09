import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTransactions } from '../../contexts/TransactionContext';
import { useTheme } from '../../contexts/ThemeContext';

export default function SummaryScreen() {
    const router = useRouter();
    const { bottom } = useSafeAreaInsets();
    const { colors, isDark } = useTheme();
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
        setSubtractDebtFromBudget,
        activeGroupId,
        groups,
        updateGroup,
        profiles,
        currentUserId
    } = useTransactions();

    const activeGroup = groups.find(g => g.id === activeGroupId);
    const displayBudget = activeGroup ? activeGroup.budgetLimit : budget;
    const displayPeriod = activeGroup ? activeGroup.budgetPeriod : budgetPeriod;

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
            // Robustly parse "Month Day, Year"
            const parts = t.date.replace(',', '').split(' ');
            const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            const monthIndex = monthNames.indexOf(parts[0]);
            const day = parseInt(parts[1]);
            const year = parseInt(parts[2]);
            const tDate = new Date(year, monthIndex, day);

            if (filterPeriod === 'Daily') {
                return t.date === todayStr;
            } else if (filterPeriod === 'Weekly') {
                const diffTime = Math.abs(now.getTime() - tDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays <= 7;
            } else if (filterPeriod === 'Monthly') {
                return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
            }
            return true;
        });
    };

    const filteredTransactions = filterTransactionsByPeriod(transactions).filter(t => {
        if (activeGroupId) {
            return t.groupId === activeGroupId;
        } else {
            return !t.groupId;
        }
    });

    const categories = [
        { name: 'Expenses', icon: 'cart-outline', type: 'material' },
        { name: 'Income', icon: 'wallet-outline', type: 'material' },
        { name: 'Savings', icon: 'piggy-bank-outline', type: 'material' },
        { name: 'Debt', icon: 'receipt-text-outline', type: 'material' },
        { name: 'Investment', icon: 'chart-line-variant', type: 'material' },
    ];

    return (
        <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
            {/* Header with Set Budget */}
            <View style={{ backgroundColor: colors.card }} className="rounded-b-[40px] pt-8 pb-10 shadow-lg">
                <View className="items-center mt-2 relative">
                    <Text className="text-[42px] font-bold tracking-tight" style={{ color: colors.foreground }}>₱{(displayBudget + getTotalBalance()).toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
                    <Text className="text-lg font-medium mt-2" style={{ color: colors.foreground + 'CC' }}>{activeGroup ? `${activeGroup.name} Budget` : 'Overall Budget'}</Text>

                    <Pressable
                        onPress={() => {
                            setTempBudget(displayBudget > 0 ? displayBudget.toString() : '');
                            setTempPeriod(displayBudget > 0 ? (displayPeriod as any) : 'Monthly');
                            setTempSubtractSavings(subtractSavingsFromBudget);
                            setTempSubtractInvestment(subtractInvestmentFromBudget);
                            setTempSubtractDebt(subtractDebtFromBudget);
                            setIsBudgetModalVisible(true)
                        }}
                    >
                        {displayBudget > 0 ? (
                            <Text 
                                className="font-medium text-sm mt-3 px-4 py-2 rounded-full border"
                                style={{ color: '#38BDF8', backgroundColor: colors.background, borderColor: colors.border + '4D' }}
                            >
                                Limit: ₱{displayBudget.toLocaleString('en-US', { minimumFractionDigits: 2 })} / {displayPeriod} (Edit)
                            </Text>
                        ) : (
                            <Text 
                                className="font-medium text-sm mt-3 px-4 py-2 rounded-full border"
                                style={{ color: '#38BDF8', backgroundColor: colors.background, borderColor: colors.border + '4D' }}
                            >
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
                                className="p-3 rounded-2xl"
                            >
                                <MaterialCommunityIcons
                                    name={cat.icon as any}
                                    size={32}
                                    color={colors.muted}
                                />
                            </Pressable>
                            <Text className="text-[10px] mt-1 font-medium" style={{ color: colors.muted }}>
                                {cat.name}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Main Summary Section */}
            <View className="flex-1 px-6 mt-2">
                <View 
                    style={{ backgroundColor: colors.card + '4D', borderColor: colors.border + '1A' }}
                    className="rounded-[32px] border flex-1 overflow-hidden"
                >
                    <View 
                        className="z-50 px-6 py-5 flex-row items-center justify-between border-b relative"
                        style={{ borderBottomColor: colors.border + '1A' }}
                    >
                        <Text className="text-xl font-bold" style={{ color: colors.foreground }}>
                            Summary {filterPeriod !== 'All' ? `(${filterPeriod})` : ''}
                        </Text>
                        
                        <View className="relative z-[100]">
                            <Pressable
                                onPress={() => setIsFilterModalVisible(!isFilterModalVisible)}
                                className={`p-2 rounded-lg`}
                                style={isFilterModalVisible ? { backgroundColor: colors.card } : {}}
                            >
                                <Ionicons name="funnel" size={20} color={isFilterModalVisible ? "#38BDF8" : colors.foreground} />
                            </Pressable>

                            {isFilterModalVisible && (
                                <View 
                                    style={{ backgroundColor: colors.background, borderColor: colors.card }}
                                    className="absolute top-[115%] right-0 rounded-xl border shadow-2xl z-[100] w-40 overflow-hidden"
                                >
                                    {['All', 'Daily', 'Weekly', 'Monthly'].map((period, index) => (
                                        <Pressable
                                            key={`${period}-filter`}
                                            onPress={() => {
                                                setFilterPeriod(period as any);
                                                setIsFilterModalVisible(false);
                                            }}
                                            className={`flex-row items-center justify-between px-4 py-3`}
                                            style={[
                                                index !== 3 ? { borderBottomWidth: 1, borderBottomColor: colors.card + '80' } : {},
                                                filterPeriod === period ? { backgroundColor: colors.card + '4D' } : {}
                                            ]}
                                        >
                                            <Text className={`font-semibold text-sm`} style={{ color: filterPeriod === period ? '#38BDF8' : colors.foreground + 'CC' }}>
                                                {period === 'All' ? 'All Time' : period}
                                            </Text>
                                            {filterPeriod === period && <Ionicons name="checkmark" size={16} color="#38BDF8" />}
                                        </Pressable>
                                    ))}
                                </View>
                            )}
                        </View>
                    </View>

                    <ScrollView
                        className="flex-1 py-2 px-6"
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: bottom + 115 }}
                        scrollEnabled={!isFilterModalVisible}
                    >
                        {filteredTransactions.length > 0 ? (
                            filteredTransactions.map(transaction => {
                                const category = globalCategories.find(c => c.id === transaction.categoryId);

                                let icon: any = category ? category.icon : 'cart-outline';
                                let iconFamily: 'material' | 'feather' = category ? 'feather' : 'material';
                                let iconBgColor = category ? category.color : colors.card;
                                let amountColor = '#EF4444';
                                let sign = '-';

                                switch (transaction.type) {
                                    case 'income':
                                        if (!category) { icon = 'wallet-outline'; iconBgColor = '#10B981'; }
                                        amountColor = '#10B981';
                                        sign = '+';
                                        break;
                                    case 'savings':
                                        if (!category) { icon = 'piggy-bank-outline'; iconBgColor = '#3B82F6'; }
                                        amountColor = '#3B82F6';
                                        sign = '+';
                                        break;
                                    case 'debt':
                                        if (!category) { icon = 'receipt-text-outline'; iconBgColor = '#F97316'; }
                                        amountColor = '#F97316';
                                        sign = '-';
                                        break;
                                    case 'investment':
                                        if (!category) { icon = 'chart-line-variant'; iconBgColor = '#A855F7'; }
                                        amountColor = '#A855F7';
                                        sign = '+';
                                        break;
                                    case 'expense':
                                    default:
                                        if (!category) { icon = 'cart-outline'; iconBgColor = '#EF4444'; }
                                        amountColor = '#EF4444';
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
                                        titleColor={colors.foreground}
                                        subtitle={`${transaction.date}${activeGroupId && transaction.userId && transaction.userId !== currentUserId ? ` • by ${profiles.find(p => p.id === transaction.userId)?.firstName || 'Member'}` : ''}`}
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
                                                        onPress: async () => await deleteTransaction(transaction.id)
                                                    }
                                                ]
                                            );
                                        }}
                                    />
                                );
                            })
                        ) : (
                            <View className="items-center justify-center pt-8">
                                <Text style={{ color: colors.muted }} className="text-center">No transactions yet.</Text>
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
                        <View 
                            style={{ backgroundColor: colors.background, borderColor: colors.card }}
                            className="w-full p-6 rounded-[25px] border"
                        >
                            <Text className="text-xl font-bold mb-4" style={{ color: colors.foreground }}>Set Overall Budget</Text>

                            <View 
                                style={{ backgroundColor: isDark ? '#0F172A' : colors.card, borderColor: colors.border }}
                                className="flex-row items-center rounded-xl px-4 py-3 mb-4 border"
                            >
                                <Text className="text-lg mr-2" style={{ color: colors.muted }}>₱</Text>
                                <TextInput
                                    className="flex-1 text-lg font-medium"
                                    style={{ color: colors.foreground }}
                                    placeholder="0.00"
                                    placeholderTextColor={colors.muted}
                                    keyboardType="numeric"
                                    value={tempBudget}
                                    onChangeText={setTempBudget}
                                />
                            </View>

                            <Text className="text-sm mb-3" style={{ color: colors.muted }}>Does this limit apply Daily, Weekly, or Monthly?</Text>
                            <View 
                                style={{ backgroundColor: isDark ? '#0F172A' : colors.card, borderColor: colors.border }}
                                className="flex-row rounded-xl p-1 mb-6 border"
                            >
                                {['Daily', 'Weekly', 'Monthly'].map((period) => (
                                    <Pressable
                                        key={`${period}-budget`}
                                        onPress={() => setTempPeriod(period as any)}
                                        className={`flex-1 py-2.5 rounded-lg items-center`}
                                        style={tempPeriod === period ? { backgroundColor: colors.card } : {}}
                                    >
                                        <Text className="font-medium" style={{ color: tempPeriod === period ? colors.foreground : colors.muted }}>
                                            {period}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>

                            <View className="mb-8">
                                <Text className="text-sm mb-4" style={{ color: colors.muted }}>Subtract calculations from Overall Budget:</Text>

                                <Pressable
                                    onPress={() => setTempSubtractSavings(!tempSubtractSavings)}
                                    className="flex-row items-center justify-between py-2"
                                >
                                    <View className="flex-row items-center gap-x-3">
                                        <View className="bg-[#3B82F6]/20 p-2 rounded-lg">
                                            <MaterialCommunityIcons name="piggy-bank" size={20} color="#3B82F6" />
                                        </View>
                                        <Text className="font-medium" style={{ color: colors.foreground }}>Subtract Savings</Text>
                                    </View>
                                    <View className={`w-12 h-6 rounded-full px-1 justify-center`} style={{ backgroundColor: tempSubtractSavings ? '#4ADE80' : colors.card }}>
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
                                        <Text className="font-medium" style={{ color: colors.foreground }}>Subtract Debt</Text>
                                    </View>
                                    <View className={`w-12 h-6 rounded-full px-1 justify-center`} style={{ backgroundColor: tempSubtractDebt ? '#4ADE80' : colors.card }}>
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
                                        <Text className="font-medium" style={{ color: colors.foreground }}>Subtract Investment</Text>
                                    </View>
                                    <View className={`w-12 h-6 rounded-full px-1 justify-center`} style={{ backgroundColor: tempSubtractInvestment ? '#4ADE80' : colors.card }}>
                                        <View className={`w-4 h-4 rounded-full bg-white ${tempSubtractInvestment ? 'ml-6' : 'ml-0'}`} />
                                    </View>
                                </Pressable>
                            </View>

                            <View className="flex-row justify-end space-x-3 gap-x-3">
                                <Pressable
                                    onPress={() => setIsBudgetModalVisible(false)}
                                    className="px-6 py-3 rounded-xl"
                                    style={{ backgroundColor: colors.card }}
                                >
                                    <Text className="font-medium" style={{ color: colors.foreground }}>Cancel</Text>
                                </Pressable>
                                <Pressable
                                    onPress={async () => {
                                        const parsedBudget = parseFloat(tempBudget.replace(/[^0-9.-]+/g, ''));
                                        if (!isNaN(parsedBudget) && parsedBudget >= 0) {
                                            if (activeGroupId) {
                                                await updateGroup(activeGroupId, {
                                                    budgetLimit: parsedBudget,
                                                    budgetPeriod: tempPeriod as any
                                                });
                                            } else {
                                                await setBudget(parsedBudget);
                                                await setBudgetPeriod(tempPeriod as any);
                                            }
                                        }
                                        await setSubtractSavingsFromBudget(tempSubtractSavings);
                                        await setSubtractInvestmentFromBudget(tempSubtractInvestment);
                                        await setSubtractDebtFromBudget(tempSubtractDebt);
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

// Cleaner list component
const SummaryListItem = ({
    icon,
    iconFamily = 'material',
    iconBgColor = '#334155',
    title,
    titleColor = '#FFFFFF',
    subtitle,
    amount,
    amountColor,
    onDelete,
}: {
    icon: any;
    iconFamily?: 'material' | 'feather';
    iconBgColor?: string;
    title: string;
    titleColor?: string;
    subtitle?: string;
    amount: string;
    amountColor: string;
    onDelete: () => void;
}) => {
    const { colors } = useTheme();
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
                    <Text className="font-bold text-[16px]" style={{ color: titleColor }}>{title}</Text>
                    {subtitle && <Text className="text-[12px] mt-0.5" style={{ color: colors.muted }}>{subtitle}</Text>}
                </View>
            </View>
            <Text className="font-bold text-lg" style={{ color: amountColor }}>{amount}</Text>
        </Pressable>
    );
};
