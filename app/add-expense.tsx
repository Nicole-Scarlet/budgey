import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ActivityIndicator, Keyboard, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTransactions } from '../contexts/TransactionContext';
import { useTheme } from '../contexts/ThemeContext';
import CalendarModal from '../components/CalendarModal';

const EXPENSE_CATEGORIES = [
    { id: 'food', name: 'Food & Dining', icon: 'coffee', color: '#F59E0B', type: 'Expense' },
    { id: 'transport', name: 'Transport', icon: 'navigation', color: '#3B82F6', type: 'Expense' },
    { id: 'shopping', name: 'Shopping', icon: 'shopping-bag', color: '#EC4899', type: 'Expense' },
    { id: 'entertainment', name: 'Entertainment', icon: 'film', color: '#8B5CF6', type: 'Expense' },
    { id: 'bills', name: 'Bills & Utilities', icon: 'file-text', color: '#10B981', type: 'Expense' },
    { id: 'health', name: 'Health', icon: 'heart', color: '#EF4444', type: 'Expense' },
    { id: 'education', name: 'Education', icon: 'book', color: '#6366F1', type: 'Expense' },
    { id: 'other', name: 'Other', icon: 'more-horizontal', color: '#64748B', type: 'Expense' },
];

export default function AddExpenseScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const passedCategoryId = params.category as string;
    const categoryName = params.categoryName as string;
    const activeModule = (params.module as string) || 'Expense'; // Fallback to Expense
    const { colors, isDark } = useTheme();

    const getModuleColor = (moduleName: string) => {
        switch (moduleName.toLowerCase()) {
            case 'income': return '#4ADE80';
            case 'investment': return '#A855F7';
            case 'savings': return '#38BDF8';
            case 'debt': return '#EF4444';
            default: return '#38BDF8'; // Expense fallback
        }
    };
    const moduleColor = getModuleColor(activeModule);

    const { addTransaction, categories, transactions } = useTransactions();

    const [itemName, setItemName] = useState('');
    const [amount, setAmount] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
    const [date, setDate] = useState(new Date());
    const [calendarVisible, setCalendarVisible] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const resolvedCategoryId = passedCategoryId || selectedCategoryId;
    const currentCategory = categories.find(c => c.id === resolvedCategoryId);
    const categoryLimit = currentCategory?.limit || 0;

    const amountValue = parseFloat(amount.replace(/[^0-9.-]+/g, '')) || 0;
    const spentInValue = transactions
        .filter(t => t.categoryId === resolvedCategoryId)
        .reduce((sum, t) => sum + t.amount, 0);

    const isLimitExceeded = categoryLimit > 0 && (spentInValue + amountValue) > categoryLimit;

    const isValid = Boolean(amount.trim() && (passedCategoryId || selectedCategoryId)) && amountValue <= 1000000000;

    return (
        <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View className="flex-1 px-6">
                        {/* Header */}
                        <View className="flex-row items-center justify-between pt-6 pb-6 mt-4">
                            <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
                                <Feather name="arrow-left" size={24} color={colors.foreground} />
                            </TouchableOpacity>
                            <Text className="text-[18px] font-bold tracking-widest uppercase" style={{ color: colors.foreground }}>
                                {categoryName ? categoryName : `ADD ${activeModule.toUpperCase()}`}
                            </Text>
                            <View className="p-2 -mr-2 w-[40px]" />
                        </View>

                        {/* Details Section */}
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text className="text-xl font-bold mb-4" style={{ color: colors.foreground }}>Details</Text>
                            <View 
                                style={{ backgroundColor: colors.card, borderColor: colors.border + '33' }}
                                className="rounded-[16px] flex-row items-center px-4 h-16 mb-4 border"
                            >
                                <TextInput
                                    className="flex-1 text-[16px]"
                                    style={{ color: colors.foreground }}
                                    placeholder="Input Title"
                                    placeholderTextColor={colors.muted}
                                    value={itemName}
                                    onChangeText={setItemName}
                                />

                            </View>

                            <View 
                                style={{ backgroundColor: colors.card, borderColor: parseFloat(amount) > 1000000000 ? '#ef4444' + '80' : colors.border + '33' }}
                                className={`rounded-[16px] flex-row items-center px-4 h-16 mb-6 border`}
                            >
                                <TextInput
                                    className="flex-1 text-[16px]"
                                    style={{ color: colors.foreground }}
                                    placeholder="Amount"
                                    placeholderTextColor={colors.muted}
                                    keyboardType="numeric"
                                    value={amount}
                                    onChangeText={(text) => setAmount(text.replace(/[^0-9.]/g, ''))}
                                />
                            </View>
                            {parseFloat(amount) > 1000000000 && (
                                <Text className="text-red-400 text-xs mt-2 ml-1">Maximum limit is ₱1,000,000,000</Text>
                            )}

                            {/* Show Categories Grid ONLY if a specific category wasn't pre-selected via navigation */}
                            {!passedCategoryId && (
                                <>
                                    <Text className="text-[20px] font-bold mb-6" style={{ color: colors.foreground }}>Categories</Text>
                                    <View className="flex-row flex-wrap" style={{ gap: 16 }}>
                                        {categories.filter(c => c.type.toLowerCase() === activeModule.toLowerCase()).length > 0 ? (
                                            categories.filter(c => c.type.toLowerCase() === activeModule.toLowerCase()).map(cat => {
                                                const isSelected = selectedCategoryId === cat.id;
                                                return (
                                                    <TouchableOpacity
                                                        key={cat.id}
                                                        onPress={() => setSelectedCategoryId(cat.id)}
                                                        className="items-center"
                                                        style={{ width: '21%' }}
                                                    >
                                                        <View
                                                            className="w-16 h-16 rounded-full items-center justify-center mb-2 shadow-sm transform"
                                                            style={{
                                                                backgroundColor: colors.card,
                                                                borderWidth: isSelected ? 2 : 0,
                                                                borderColor: isSelected ? cat.color : 'transparent',
                                                            }}
                                                        >
                                                            <Feather name={cat.icon as any} size={24} color={cat.color} />
                                                        </View>
                                                        <Text
                                                            className={`text-[13px] text-center ${isSelected ? 'font-bold' : ''}`}
                                                            style={{ color: isSelected ? colors.foreground : colors.muted }}
                                                            numberOfLines={1}
                                                        >
                                                            {cat.name}
                                                        </Text>
                                                    </TouchableOpacity>
                                                );
                                            })
                                        ) : (
                                            <TouchableOpacity
                                                onPress={() => router.push(`/add-category?module=${activeModule}` as any)}
                                                className="items-center mt-2"
                                                style={{ width: '21%' }}
                                            >
                                                <View
                                                    className="w-16 h-16 rounded-full items-center justify-center mb-2 shadow-sm transform border-2 border-dashed"
                                                    style={{
                                                        backgroundColor: colors.card,
                                                        borderColor: colors.muted + '80',
                                                    }}
                                                >
                                                    <Feather name="plus" size={28} color={colors.muted} />
                                                </View>
                                                <Text
                                                    className={`text-[13px] text-center`}
                                                    style={{ color: colors.muted }}
                                                    numberOfLines={1}
                                                >
                                                    Add
                                                </Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </>
                            )}

                            {/* Date Picker Trigger */}
                            <View className="flex-row items-center justify-between mt-4 px-2 mb-4">
                                <Text className="text-lg font-bold" style={{ color: colors.foreground }}>
                                    Created: {formatDate(date)}
                                </Text>
                                <TouchableOpacity onPress={() => setCalendarVisible(true)}>
                                    <MaterialCommunityIcons name="pencil" size={24} color={colors.foreground} />
                                </TouchableOpacity>
                            </View>
                        </ScrollView>

                        <View className="flex-1" />

                        {/* Limit Warning */}
                        {isLimitExceeded && (
                            <View 
                                className={`mb-4 mx-2 p-4 border rounded-2xl flex-row items-center ${
                                    activeModule === 'Income' || activeModule === 'Savings' || activeModule === 'Investment' 
                                        ? 'bg-green-500/10 border-green-500/20' 
                                        : 'bg-red-500/10 border-red-500/20'
                                }`}
                            >
                                <Feather 
                                    name={activeModule === 'Income' || activeModule === 'Savings' || activeModule === 'Investment' ? "check-circle" : "alert-circle"} 
                                    size={20} 
                                    color={activeModule === 'Income' || activeModule === 'Savings' || activeModule === 'Investment' ? "#4ADE80" : "#F87171"} 
                                />
                                <View className="ml-3 flex-1">
                                    <Text 
                                        className="font-bold text-sm"
                                        style={{ color: activeModule === 'Income' || activeModule === 'Savings' || activeModule === 'Investment' ? "#4ADE80" : "#F87171" }}
                                    >
                                        {activeModule === 'Income' || activeModule === 'Savings' || activeModule === 'Investment'
                                            ? `${activeModule} Goal Reached`
                                            : `${activeModule} Limit Exceeded`}
                                    </Text>
                                    <Text 
                                        className="text-[12px]"
                                        style={{ color: activeModule === 'Income' || activeModule === 'Savings' || activeModule === 'Investment' ? "rgba(74, 222, 128, 0.8)" : "rgba(248, 113, 113, 0.8)" }}
                                    >
                                        {activeModule === 'Income' || activeModule === 'Savings' || activeModule === 'Investment'
                                            ? `Target: ₱${categoryLimit.toLocaleString()}. Current: ₱${spentInValue.toLocaleString()}.`
                                            : `Limit: ₱${categoryLimit.toLocaleString()}. Spent: ₱${spentInValue.toLocaleString()}.`}
                                    </Text>
                                </View>
                            </View>
                        )}

                        {/* Save Button */}
                        <View className="mb-10 w-full items-center">
                            <TouchableOpacity
                                className={`px-6 py-4 rounded-[16px] w-full items-center ${isValid ? 'border-2' : ''}`}
                                style={isValid ? { backgroundColor: moduleColor, borderColor: moduleColor } : { backgroundColor: colors.card }}
                                onPress={async () => {
                                    if (isSaving) return;
                                    if (isValid) {
                                        const resolvedCategoryId = passedCategoryId
                                            ? passedCategoryId
                                            : selectedCategoryId || 'uncategorized';

                                        if (resolvedCategoryId === 'uncategorized') {
                                            Alert.alert(
                                                "No Category Selected",
                                                `Please add a category for ${activeModule} before adding a new transaction.`,
                                                [{ text: "OK" }]
                                            );
                                            return;
                                        }

                                        const amountValue = parseFloat(amount.replace(/[^0-9.-]+/g, ''));
                                        const fallbackTitle = categoryName || categories.find(c => c.id === selectedCategoryId)?.name || activeModule;

                                        setIsSaving(true);
                                        try {
                                            await addTransaction({
                                                title: itemName.trim() || fallbackTitle,
                                                amount: amountValue || 0,
                                                categoryId: resolvedCategoryId as string,
                                                type: activeModule.toLowerCase() as any,
                                                date: formatDate(date)
                                            });
                                            router.back();
                                        } finally {
                                            setIsSaving(false);
                                        }
                                    }
                                }}
                                disabled={!isValid || isSaving}
                            >
                                {isSaving ? (
                                    <ActivityIndicator color="#0F172A" />
                                ) : (
                                    <Text className={`text-[16px] font-bold`} style={{ color: isValid ? '#0F172A' : colors.muted }}>
                                        ADD {activeModule.toUpperCase()}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>

            <CalendarModal 
                visible={calendarVisible}
                onClose={() => setCalendarVisible(false)}
                onSelectDate={(selectedDate) => setDate(selectedDate)}
                currentDate={date}
                title={`Select ${activeModule} Date`}
            />
        </SafeAreaView>
    );
}
