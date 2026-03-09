import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTransactions } from '../contexts/TransactionContext';
import { useTheme } from '../contexts/ThemeContext';
import CalendarModal from '../components/CalendarModal';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

export default function AddIncomeScreen() {
    const router = useRouter();
    const { addTransaction, categories, activeGroupId } = useTransactions();
    const { colors, isDark } = useTheme();
    const [amount, setAmount] = useState('');
    const [itemName, setItemName] = useState('');
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

    const handleSave = async () => {
        if (isSaving) return;
        const amountValue = parseFloat(amount.replace(/[^0-9.-]+/g, ''));
        if (amountValue) {
            setIsSaving(true);
            try {
                await addTransaction({
                    type: 'income',
                    amount: amountValue,
                    categoryId: selectedCategoryId || 'uncategorized',
                    title: itemName.trim() || 'Income',
                    date: formatDate(date),
                    groupId: activeGroupId || undefined
                });
                router.back();
            } finally {
                setIsSaving(false);
            }
        }
    };

    return (
        <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
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
                                ADD INCOME
                            </Text>
                            <View className="p-2 -mr-2 w-[40px]" />
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text className="text-xl font-bold mb-4" style={{ color: colors.foreground }}>Details</Text>

                            <View>
                                <View 
                                    style={{ backgroundColor: colors.card + '80', borderColor: colors.border + '33' }}
                                    className="h-16 rounded-2xl px-5 flex-row items-center border mb-4"
                                >
                                    <TextInput
                                        className="text-lg flex-1"
                                        style={{ color: colors.foreground }}
                                        placeholder="Item Name"
                                        placeholderTextColor={colors.muted}
                                        value={itemName}
                                        onChangeText={setItemName}
                                    />
                                </View>

                                <View 
                                    style={{ backgroundColor: colors.card + '80', borderColor: colors.border + '33' }}
                                    className="h-16 rounded-2xl px-5 flex-row items-center border mb-6"
                                >
                                    <TextInput
                                        className="text-lg flex-1"
                                        style={{ color: colors.foreground }}
                                        placeholder="Amount"
                                        placeholderTextColor={colors.muted}
                                        value={amount}
                                        onChangeText={(text) => setAmount(text.replace(/[^0-9.]/g, ''))}
                                        keyboardType="numeric"
                                    />
                                </View>
                                {parseFloat(amount) > 1000000000 && (
                                    <Text className="text-red-400 text-xs mt-2 ml-1">Maximum limit is ₱1,000,000,000</Text>
                                )}

                                <Text className="text-[20px] font-bold mt-2 mb-4" style={{ color: colors.foreground }}>
                                    Categories
                                </Text>
                                <View className="flex-row flex-wrap" style={{ gap: 16 }}>
                                    {categories.filter(c => c.type.toLowerCase() === 'income').length > 0 ? (
                                        categories.filter(c => c.type.toLowerCase() === 'income').map(cat => {
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
                                            onPress={() => router.push(`/add-category?module=Income` as any)}
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

                                <View className="flex-row items-center justify-between mt-4 px-2 mb-4">
                                    <Text className="text-lg font-bold" style={{ color: colors.foreground }}>
                                        Created: {formatDate(date)}
                                    </Text>
                                    <TouchableOpacity onPress={() => setCalendarVisible(true)}>
                                        <MaterialCommunityIcons name="pencil" size={24} color={colors.foreground} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </ScrollView>

                        <View className="px-8 py-6 pb-12" style={{ backgroundColor: colors.background }}>
                            <Pressable
                                onPress={handleSave}
                                disabled={!amount || parseFloat(amount) > 1000000000 || isSaving}
                                className={`w-full h-16 rounded-full items-center justify-center shadow-lg`}
                                style={{ backgroundColor: (amount && parseFloat(amount) <= 1000000000 && !isSaving) ? '#38BDF8' : colors.card, opacity: (amount && parseFloat(amount) <= 1000000000) ? 1 : 0.5 }}
                            >
                                {isSaving ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text className="text-xl font-bold" style={{ color: (amount && parseFloat(amount) <= 1000000000) ? '#fff' : colors.muted }}>
                                        Save
                                    </Text>
                                )}
                            </Pressable>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>

            <CalendarModal 
                visible={calendarVisible}
                onClose={() => setCalendarVisible(false)}
                onSelectDate={(selectedDate) => setDate(selectedDate)}
                currentDate={date}
                title="Select Income Date"
            />
        </SafeAreaView>
    );
}
