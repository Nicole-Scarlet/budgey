import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { useStore } from '../store/useStore';

export default function AddExpenseScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const categoryName = params.category as string;
    const activeModule = (params.module as string) || 'Expense'; // Fallback to Expense

    const categories = useStore((state) => state.categories);
    const addTransaction = useStore((state) => state.addTransaction);

    const activeCategories = categories.filter(c => c.type === activeModule);

    const [itemName, setItemName] = useState('');
    const [amount, setAmount] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

    const isValid = itemName.trim() && amount.trim();

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
                                <TouchableOpacity className="ml-2">
                                    <Feather name="mic" size={20} color="#94A3B8" />
                                </TouchableOpacity>
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
                            {!categoryName && (
                                <>
                                    <Text className="text-white text-[20px] font-bold mb-6">Categories</Text>
                                    <View className="flex-row flex-wrap" style={{ gap: 20 }}>
                                        {activeCategories.map(cat => {
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
                                        })}
                                    </View>
                                </>
                            )}
                        </ScrollView>

                        <View className="flex-1" />

                        {/* Save Button */}
                        <View className="mb-10 w-full items-center">
                            <TouchableOpacity
                                className={`px-6 py-4 rounded-[16px] w-full items-center ${isValid ? 'bg-[#38BDF8]' : 'bg-[#303E55]'}`}
                                onPress={() => {
                                    if (isValid) {
                                        // Find ID for passed category name, fallback to directly selected ID
                                        const resolvedCategoryId = categoryName
                                            ? activeCategories.find(c => c.name === categoryName)?.id || categoryName
                                            : selectedCategoryId || 'uncategorized';

                                        addTransaction({
                                            title: itemName.trim(),
                                            amount: parseFloat(amount),
                                            categoryId: resolvedCategoryId as string,
                                            type: activeModule,
                                            date: new Date().toISOString()
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
