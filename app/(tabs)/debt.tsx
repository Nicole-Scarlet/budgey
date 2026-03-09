import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { Alert, Modal, ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTransactions, Debt } from '../../contexts/TransactionContext';
import { useTheme } from '../../contexts/ThemeContext';

export default function DebtScreen() {
    const router = useRouter();
    const {
        debts,
        addPayment,
        categories: globalCategories,
        debtLimit,
        setDebtLimit,
        debtLimitPeriod,
        setDebtLimitPeriod,
        deleteDebt,
        activeGroupId,
        profiles,
        currentUserId,
        groupMembers,
        groups
    } = useTransactions();
    const { colors, isDark } = useTheme();

    const [isCategoryMenuVisible, setIsCategoryMenuVisible] = useState(false);
    const [isStatusFilterVisible, setIsStatusFilterVisible] = useState(false);
    const [isLimitModalVisible, setIsLimitModalVisible] = useState(false);
    const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
    const [paymentAmount, setPaymentAmount] = useState("");
    const [isPaymentSaving, setIsPaymentSaving] = useState(false);
    
    const [tempLimit, setTempLimit] = useState('');
    const [tempPeriod, setTempPeriod] = useState<any>(debtLimitPeriod || 'Monthly');
    const [headerHeight, setHeaderHeight] = useState(360);
    const [containerHeight, setContainerHeight] = useState(800);
    const [activeFilter, setActiveFilter] = useState<'All' | 'Pending' | 'Paid'>('All');

    const { height: SCREEN_HEIGHT } = useWindowDimensions();
    const { bottom } = useSafeAreaInsets();
    const bottomSheetRef = useRef<BottomSheet>(null);

    useFocusEffect(
        useCallback(() => {
            return () => setIsCategoryMenuVisible(false);
        }, [])
    );

    useEffect(() => {
        if (selectedDebt) {
            const updated = debts.find((d) => d.id === selectedDebt.id);
            if (updated) setSelectedDebt(updated);
        }
    }, [debts]);

    const navCategories = [
        { name: 'Expenses', icon: 'cart-outline', type: 'material' },
        { name: 'Income', icon: 'wallet-outline', type: 'material' },
        { name: 'Savings', icon: 'piggy-bank-outline', type: 'material' },
        { name: 'Debt', icon: 'receipt-text-outline', type: 'material', active: true },
        { name: 'Investment', icon: 'chart-line-variant', type: 'material' },
    ];

    const filteredDebts = debts.filter(d => {
        // 1. Group View
        if (activeGroupId) {
            // Explicitly in the group
            if (d.groupId === activeGroupId) {
                // Direction filter logic can be added here if needed, but usually we show all group debts
            } else if (!d.groupId) {
                // Personal debt that is shared
                const member = groupMembers.find(m => m.groupId === activeGroupId && m.userId === d.userId);
                if (!member || !member.shareDebts) return false;
            } else {
                return false; // Belongs to a different group
            }
        } else {
            // 2. Personal View
            if (d.groupId) return false; // Hide group debts in personal view
        }

        // 3. Status filter
        if (activeFilter === 'All') return true;
        if (activeFilter === 'Pending') return d.status === 'pending';
        if (activeFilter === 'Paid') return d.status === 'paid';
        return true;
    });

    const totalDebtAmount = filteredDebts.reduce((acc, curr) => acc + curr.remainingAmount, 0);

    const firstSnap = Math.max(220, bottom + 180);
    const secondSnap = containerHeight > 0 ? Math.max(firstSnap + 50, containerHeight - headerHeight - 20) : '80%';
    const snapPoints = useMemo(() => [firstSnap, secondSnap], [firstSnap, secondSnap, containerHeight, headerHeight]);

    const formatCurrency = (amount: number) => {
        return `₱${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    };

    const handleAddPayment = async () => {
        if (isPaymentSaving || !selectedDebt || !paymentAmount) return;
        const amount = parseFloat(paymentAmount);
        if (isNaN(amount) || amount <= 0) return;
        setIsPaymentSaving(true);
        try {
            await addPayment(selectedDebt.id, amount);
            setPaymentAmount("");
        } finally {
            setIsPaymentSaving(false);
        }
    };

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
                                        router.push({ pathname: '/add-category', params: { module: 'Debt' } } as any);
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
                                        router.push({ pathname: '/category-list', params: { module: 'Debt' } } as any);
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
                        <Text className="text-[42px] font-bold tracking-tight" style={{ color: colors.foreground }}>{formatCurrency(totalDebtAmount)}</Text>
                        <Text className="text-lg font-medium mt-2 mb-2" style={{ color: colors.foreground + 'CC' }}>Overall Debt</Text>
                        {debtLimit > 0 ? (
                            <Pressable 
                                onPress={() => { setIsCategoryMenuVisible(false); setTempLimit(debtLimit.toString()); setTempPeriod(debtLimitPeriod); setIsLimitModalVisible(true); }} 
                                className="px-4 py-2 rounded-full border"
                                style={{ backgroundColor: colors.background, borderColor: colors.border }}
                            >
                                <Text className="text-[#EF4444] font-medium text-sm">Limit: ₱{debtLimit.toLocaleString('en-US', { minimumFractionDigits: 2 })} / {debtLimitPeriod} (Edit)</Text>
                            </Pressable>
                        ) : (
                            <Pressable 
                                onPress={() => { setIsCategoryMenuVisible(false); setTempLimit(''); setTempPeriod('Monthly'); setIsLimitModalVisible(true); }} 
                                className="px-4 py-2 rounded-full border"
                                style={{ backgroundColor: colors.background, borderColor: colors.border }}
                            >
                                <Text className="text-[#EF4444] font-medium text-sm">+ Set Debt Limit</Text>
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
                    {globalCategories.filter(c => c.type === 'Debt').length === 0 ? (
                        <View className="flex-1 items-center justify-center pt-20">
                            <Text className="text-xl font-bold font-['Inter_700Bold'] mb-2" style={{ color: colors.foreground }}>No categories yet.</Text>
                            <Text className="text-center text-[15px] px-4 leading-6" style={{ color: colors.muted }}>
                                Tap the menu icon (•••) at the top right{'\n'}to add a category.
                            </Text>
                        </View>
                    ) : (
                        globalCategories.filter(c => c.type === 'Debt').map((cat) => {
                            return (
                                <Pressable
                                    key={cat.id}
                                    onPress={() => router.push({ pathname: '/add-debt', params: { category: cat.id, categoryName: cat.name, module: 'Debt' } } as any)}
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
                                                Limit: ₱{cat.limit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </Text>
                                        </View>
                                    </View>
                                    <View 
                                        className="w-10 h-10 items-center justify-center rounded-full"
                                        style={{ backgroundColor: colors.card }}
                                    >
                                        <Ionicons name="add" size={24} color={colors.foreground} />
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
                backgroundStyle={{ backgroundColor: colors.background, borderRadius: 24 }}
                handleIndicatorStyle={{ backgroundColor: colors.muted, width: 40 }}
            >
                <View className="px-6 pt-4 pb-2 flex-row justify-between items-center relative z-50">
                    <View>
                        <View className="flex-row items-center mb-1 z-50">
                            <Text className="text-2xl font-bold mr-3" style={{ color: colors.foreground }}>
                                {activeGroupId ? `${groups.find(g => g.id === activeGroupId)?.name || 'Group'} Debts` : 'Debt Summary'}
                            </Text>
                            
                            <View className="relative z-[100]">
                                <Pressable
                                    onPress={() => setIsStatusFilterVisible(!isStatusFilterVisible)}
                                    className="px-3 py-1.5 rounded-full flex-row items-center border"
                                    style={{ backgroundColor: colors.card, borderColor: colors.border }}
                                >
                                    <Text className="text-xs font-bold mr-1" style={{ color: colors.muted }}>{activeFilter}</Text>
                                    <Feather name="chevron-down" size={14} color={colors.muted} />
                                </Pressable>

                                {isStatusFilterVisible && (
                                    <View
                                        className="absolute shadow-2xl rounded-xl border overflow-hidden w-32 z-[100] left-0 top-12"
                                        style={{ backgroundColor: colors.card, borderColor: colors.border }}
                                    >
                                        {['All', 'Pending', 'Paid'].map((filter) => (
                                            <Pressable
                                                key={`${filter}-filter`}
                                                onPress={() => {
                                                    setActiveFilter(filter as any);
                                                    setIsStatusFilterVisible(false);
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
                        <Text className="text-sm" style={{ color: colors.muted }}>Active trackings: {filteredDebts.length}</Text>
                    </View>
                    <Pressable onPress={() => router.push('/add-debt' as any)} className="p-2">
                        <Ionicons name="add" size={28} color={colors.foreground} />
                    </Pressable>
                </View>

                <BottomSheetScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40, paddingTop: 20 }}>
                    {filteredDebts.length === 0 ? (
                        <View className="items-center justify-center pt-10 pb-20">
                            <Ionicons name="receipt-outline" size={48} color={colors.muted} />
                            <Text className="text-lg mt-4 text-center px-4" style={{ color: colors.muted }}>No debts found.</Text>
                        </View>
                    ) : (
                        filteredDebts.map((item) => (
                            <Pressable
                                key={item.id}
                                onPress={() => setSelectedDebt(item)}
                                onLongPress={() => {
                                    Alert.alert(
                                        "Delete Debt",
                                        `Are you sure you want to delete this debt from "${item.person}"?`,
                                        [
                                            { text: "Cancel", style: "cancel" },
                                            {
                                                text: "Delete",
                                                style: "destructive",
                                                onPress: () => deleteDebt(item.id)
                                            }
                                        ]
                                    );
                                }}
                                className="flex-row items-center py-4 rounded-2xl px-4 mb-3 border active:opacity-50"
                                style={{ backgroundColor: colors.card, borderColor: colors.border }}
                            >
                                <View className="flex-row items-center flex-1">
                                    <View 
                                        className="w-10 h-10 rounded-full items-center justify-center relative mr-4"
                                        style={{ backgroundColor: colors.background }}
                                    >
                                        <Ionicons name="person-outline" size={20} color={colors.foreground} />
                                        <View
                                            className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full items-center justify-center"
                                            style={{ backgroundColor: item.direction === 'right' ? '#4ADE80' : '#F87171' }}
                                        >
                                            <Ionicons name={item.direction === 'right' ? 'arrow-forward' : 'arrow-back'} size={12} color="white" />
                                        </View>
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-base font-bold" style={{ color: colors.foreground }}>{item.person}</Text>
                                        <Text className="text-xs" style={{ color: colors.muted }}>
                                            {globalCategories.find(c => c.id === item.categoryId)?.name || item.description}{activeGroupId ? ` • ${item.userId === currentUserId ? 'You' : (profiles.find(p => p.id === item.userId)?.firstName || 'Member')}` : ''}
                                        </Text>
                                    </View>
                                </View>
                                <View className="items-end">
                                    <Text className="text-base font-bold" style={{ color: colors.foreground }}>{formatCurrency(item.remainingAmount)}</Text>
                                    <Text className={`text-[10px] font-bold uppercase mt-1 ${item.status === 'paid' ? 'text-[#4ADE80]' : 'text-[#F87171]'}`}>
                                        {item.status}
                                    </Text>
                                </View>
                            </Pressable>
                        ))
                    )}
                </BottomSheetScrollView>
            </BottomSheet>

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
                        <View 
                            style={{ backgroundColor: colors.card, borderColor: colors.border }}
                            className="w-full rounded-3xl p-6 border shadow-2xl"
                        >
                            <Text className="text-xl font-bold mb-4" style={{ color: colors.foreground }}>Set Debt Limit</Text>
                            <Text className="text-sm mb-4" style={{ color: colors.muted }}>Enter your target debt limit below:</Text>

                            <View 
                                className="rounded-2xl flex-row items-center px-4 h-14 border mb-6"
                                style={{ backgroundColor: colors.background, borderColor: colors.border }}
                            >
                                <Text className="text-lg mr-2" style={{ color: colors.muted }}>₱</Text>
                                <TextInput
                                    className="flex-1 text-lg font-medium"
                                    style={{ color: colors.foreground }}
                                    placeholder="0.00"
                                    placeholderTextColor={colors.muted}
                                    keyboardType="numeric"
                                    value={tempLimit}
                                    onChangeText={setTempLimit}
                                />
                            </View>

                            <Text className="text-sm mb-3" style={{ color: colors.muted }}>Does this limit apply Daily, Weekly, or Monthly?</Text>
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
                                    onPress={() => setIsLimitModalVisible(false)} 
                                    className="px-6 py-3 rounded-xl"
                                    style={{ backgroundColor: colors.background }}
                                >
                                    <Text className="font-medium" style={{ color: colors.foreground }}>Cancel</Text>
                                </Pressable>
                                <Pressable
                                    onPress={async () => {
                                        const parsedLimit = parseFloat(tempLimit);
                                        if (!isNaN(parsedLimit)) {
                                            await setDebtLimit(parsedLimit);
                                            await setDebtLimitPeriod(tempPeriod);
                                            setIsLimitModalVisible(false);
                                        }
                                    }}
                                    className="px-6 py-3 rounded-xl bg-[#EF4444]"
                                >
                                    <Text className="text-white font-bold text-center">Save Limit</Text>
                                </Pressable>
                            </View>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>

            <Modal
                visible={!!selectedDebt}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setSelectedDebt(null)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.foreground }]}>
                                {globalCategories.find(c => c.id === selectedDebt?.categoryId)?.name || "Debt Details"}
                            </Text>
                            <TouchableOpacity onPress={() => setSelectedDebt(null)} style={styles.closeButton}>
                                <Ionicons name="close" size={24} color={colors.foreground} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                            <View style={styles.infoSection}>
                                <View style={styles.infoRow}>
                                    <View style={[styles.iconContainer, { backgroundColor: colors.background }]}><Ionicons name="cash-outline" size={20} color={colors.foreground} /></View>
                                    <View>
                                        <Text style={[styles.infoValue, { color: colors.foreground }]}>{formatCurrency(selectedDebt?.remainingAmount || 0)}</Text>
                                        <Text style={[styles.infoLabel, { color: colors.muted }]}>Remaining Amount</Text>
                                    </View>
                                </View>
                                <View style={[styles.divider, { backgroundColor: colors.border + '33' }]} />
                                <View style={styles.infoRow}>
                                    <View style={[styles.iconContainer, { backgroundColor: colors.background }]}><Ionicons name="wallet-outline" size={20} color={colors.foreground} /></View>
                                    <View>
                                        <Text style={[styles.infoValue, { color: colors.foreground }]}>{formatCurrency(selectedDebt?.initialAmount || 0)}</Text>
                                        <Text style={[styles.infoLabel, { color: colors.muted }]}>Initial Amount</Text>
                                    </View>
                                </View>
                                <View style={[styles.divider, { backgroundColor: colors.border + '33' }]} />
                                <View style={styles.infoRow}>
                                    <View style={[styles.iconContainer, { backgroundColor: colors.background }]}><Ionicons name="person-outline" size={20} color={colors.foreground} /></View>
                                    <View>
                                        <Text style={[styles.infoValue, { color: colors.foreground }]}>{selectedDebt?.person}</Text>
                                        <Text style={[styles.infoLabel, { color: colors.muted }]}>{selectedDebt?.direction === 'left' ? "Creditor (You owe them)" : "Debtor (They owe you)"}</Text>
                                    </View>
                                </View>
                                <View style={[styles.divider, { backgroundColor: colors.border + '33' }]} />
                                <View style={styles.infoRow}>
                                    <View style={[styles.iconContainer, { backgroundColor: colors.background }]}><Ionicons name="chatbubble-outline" size={20} color={colors.foreground} /></View>
                                    <View>
                                        <Text style={[styles.infoValue, { color: colors.foreground }]}>{selectedDebt?.description}</Text>
                                        <Text style={[styles.infoLabel, { color: colors.muted }]}>Concept</Text>
                                    </View>
                                </View>
                            </View>

                            {selectedDebt?.status === 'pending' && (
                                <View style={styles.paymentSection}>
                                    <TextInput
                                        style={[styles.paymentInput, { backgroundColor: colors.background, color: colors.foreground }]}
                                        placeholder="Enter payment amount"
                                        placeholderTextColor={colors.muted}
                                        keyboardType="numeric"
                                        value={paymentAmount}
                                        onChangeText={setPaymentAmount}
                                    />
                                    <TouchableOpacity 
                                        onPress={handleAddPayment} 
                                        disabled={isPaymentSaving}
                                        style={[styles.paymentButton, { backgroundColor: isPaymentSaving ? colors.border : colors.muted }]}
                                    >
                                        {isPaymentSaving ? (
                                            <ActivityIndicator color="white" />
                                        ) : (
                                            <Text style={styles.paymentButtonText}>+ ADD PAYMENT</Text>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            )}

                            <View style={styles.historySection}>
                                <Text style={[styles.historyTitle, { color: colors.foreground }]}>Payments Made</Text>
                                {selectedDebt?.payments && selectedDebt.payments.length > 0 ? (
                                    selectedDebt.payments.map((p) => (
                                        <View key={p.id} style={[styles.historyItem, { borderBottomColor: colors.border + '1A' }]}>
                                            <Text style={[styles.historyDate, { color: colors.muted }]}>{p.date}</Text>
                                            <Text style={[styles.historyAmount, { color: colors.foreground }]}>{formatCurrency(p.amount)}</Text>
                                        </View>
                                    ))
                                ) : (
                                    <Text style={[styles.noHistory, { color: colors.muted }]}>No payments recorded yet</Text>
                                )}
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "flex-end" },
    modalContent: { borderTopLeftRadius: 30, borderTopRightRadius: 30, height: "90%", paddingTop: 20 },
    modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingHorizontal: 24, marginBottom: 24, position: "relative" },
    modalTitle: { fontSize: 22, fontWeight: "bold" },
    closeButton: { position: "absolute", right: 24 },
    infoSection: { paddingHorizontal: 24 },
    infoRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
    iconContainer: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", marginRight: 16 },
    infoValue: { fontSize: 16, fontWeight: "bold" },
    infoLabel: { fontSize: 12, marginTop: 2 },
    divider: { height: 1, marginLeft: 56 },
    paymentSection: { marginTop: 32, paddingHorizontal: 24, alignItems: "center" },
    paymentInput: { width: "100%", borderRadius: 15, paddingHorizontal: 20, paddingVertical: 14, fontSize: 16, marginBottom: 16 },
    paymentButton: { paddingVertical: 14, paddingHorizontal: 40, borderRadius: 15 },
    paymentButtonText: { color: "white", fontWeight: "bold", fontSize: 14 },
    historySection: { marginTop: 32, paddingHorizontal: 24 },
    historyTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 16 },
    historyItem: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 12, borderBottomWidth: 1 },
    historyDate: { },
    historyAmount: { fontWeight: "bold" },
    noHistory: { textAlign: "center", fontStyle: "italic", marginTop: 10 },
});
