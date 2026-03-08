import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTransactions } from '../contexts/TransactionContext';

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

    const resolvedCategoryId = passedCategoryId || selectedCategoryId;
    const currentCategory = categories.find(c => c.id === resolvedCategoryId);
    const categoryLimit = currentCategory?.limit || 0;

    const amountValue = parseFloat(amount.replace(/[^0-9.-]+/g, '')) || 0;
    const spentInValue = transactions
        .filter(t => t.categoryId === resolvedCategoryId)
        .reduce((sum, t) => sum + t.amount, 0);

    const isLimitExceeded = categoryLimit > 0 && (spentInValue + amountValue) > categoryLimit;

    const isValid = Boolean(amount.trim() && (itemName.trim() || passedCategoryId || selectedCategoryId));

    return (
        <SafeAreaView className="flex-1 bg-[#1E293B]">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View className="flex-1 px-6">
                        {/* Header */}
                        <View className="flex-row items-center justify-between pt-6 pb-6 mt-4">
                            <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
                                <Feather name="arrow-left" size={24} color="#E2E8F0" />
                            </TouchableOpacity>
                            <Text className="text-white text-[18px] font-bold tracking-widest uppercase">
                                {categoryName ? categoryName : `ADD ${activeModule.toUpperCase()}`}
                            </Text>
                            <View className="p-2 -mr-2 w-[40px]" />
                        </View>

                        {/* Details Section */}
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text className="text-white text-[20px] font-bold mt-4 mb-4">Details</Text>
                            <View className="bg-[#303E55] rounded-[16px] flex-row items-center px-4 h-[60px] mb-4">
                                <TextInput
                                    className="flex-1 text-white text-[16px]"
                                    placeholder="Input Title"
                                    placeholderTextColor="#94A3B8"
                                    value={itemName}
                                    onChangeText={setItemName}
                                />

                            </View>

                            <View className="bg-[#303E55] rounded-[16px] flex-row items-center px-4 h-[60px] mb-8">
                                <TextInput
                                    className="flex-1 text-white text-[16px]"
                                    placeholder="Amount"
                                    placeholderTextColor="#94A3B8"
                                    keyboardType="numeric"
                                    value={amount}
                                    onChangeText={setAmount}
                                />
                            </View>

                            {/* Show Categories Grid ONLY if a specific category wasn't pre-selected via navigation */}
                            {!passedCategoryId && (
                                <>
                                    <Text className="text-white text-[20px] font-bold mb-6">Categories</Text>
                                    <View className="flex-row flex-wrap" style={{ gap: 20 }}>
                                        {categories.filter(c => c.type.toLowerCase() === activeModule.toLowerCase()).length > 0 ? (
                                            categories.filter(c => c.type.toLowerCase() === activeModule.toLowerCase()).map(cat => {
                                                const isSelected = selectedCategoryId === cat.id;
                                                return (
                                                    <TouchableOpacity
                                                        key={cat.id}
                                                        onPress={() => setSelectedCategoryId(cat.id)}
                                                        className="items-center"
                                                        style={{ width: '20%' }}
                                                    >
                                                        <View
                                                            className="w-16 h-16 rounded-full items-center justify-center mb-2 bg-[#303E55] shadow-sm transform"
                                                            style={{
                                                                borderWidth: isSelected ? 2 : 0,
                                                                borderColor: isSelected ? cat.color : 'transparent',
                                                            }}
                                                        >
                                                            <Feather name={cat.icon as any} size={24} color={cat.color} />
                                                        </View>
                                                        <Text
                                                            className={`text-[13px] text-center ${isSelected ? 'text-white font-bold' : 'text-slate-400'}`}
                                                            numberOfLines={1}
                                                        >
                                                            {cat.name}
                                                        </Text>
                                                    </TouchableOpacity>
                                                );
                                            })
                                        ) : (
                                            <Text className="text-[#94A3B8] text-[14px]">No categories found. Please add a category first.</Text>
                                        )}
                                    </View>
                                </>
                            )}
                        </ScrollView>

                        <View className="flex-1" />

                        {/* Limit Warning */}
                        {isLimitExceeded && (
                            <View className="mb-4 mx-2 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex-row items-center">
                                <Feather name="alert-circle" size={20} color="#F87171" />
                                <View className="ml-3 flex-1">
                                    <Text className="text-[#F87171] font-bold text-sm">
                                        {activeModule === 'Income' || activeModule === 'Savings'
                                            ? `${activeModule} Goal Reached`
                                            : `${activeModule} Limit Exceeded`}
                                    </Text>
                                    <Text className="text-[#F87171]/80 text-[12px]">
                                        {activeModule === 'Income' || activeModule === 'Savings'
                                            ? `Target: ₱${categoryLimit.toLocaleString()}. Current: ₱${spentInValue.toLocaleString()}.`
                                            : `Limit: ₱${categoryLimit.toLocaleString()}. Spent: ₱${spentInValue.toLocaleString()}.`}
                                    </Text>
                                </View>
                            </View>
                        )}

                        {/* Save Button */}
                        <View className="mb-10 w-full items-center">
                            <TouchableOpacity
                                className={`px-6 py-4 rounded-[16px] w-full items-center ${isValid ? 'bg-transparent border-2' : 'bg-[#303E55]'}`}
                                style={isValid ? { backgroundColor: moduleColor, borderColor: moduleColor } : {}}
                                onPress={() => {
                                    if (isValid) {
                                        // Find ID for passed category name, fallback to directly selected ID
                                        const resolvedCategoryId = passedCategoryId
                                            ? passedCategoryId
                                            : selectedCategoryId || 'uncategorized';

                                        const amountValue = parseFloat(amount.replace(/[^0-9.-]+/g, ''));

                                        const fallbackTitle = categoryName || categories.find(c => c.id === selectedCategoryId)?.name || activeModule;

                                        addTransaction({
                                            title: itemName.trim() || fallbackTitle,
                                            amount: amountValue || 0,
                                            categoryId: resolvedCategoryId as string,
                                            type: activeModule.toLowerCase() as any,
                                            date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                                        });
                                        router.back();
                                    }
                                }}
                                disabled={!isValid}
                            >
                                <Text className={`text-[16px] font-bold ${isValid ? 'text-[#0F172A]' : 'text-slate-400'}`}>
                                    ADD {activeModule.toUpperCase()}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
