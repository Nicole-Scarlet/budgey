import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTransactions } from './../contexts/TransactionContext';
import { useTheme } from '../contexts/ThemeContext';
import CalendarModal from '../components/CalendarModal';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

export default function AddSavingsScreen() {
    const router = useRouter();
    const { addTransaction } = useTransactions();
    const { colors, isDark } = useTheme();
    const [amount, setAmount] = useState('');
    const [itemName, setItemName] = useState('');
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
                    type: 'savings',
                    amount: amountValue,
                    title: itemName.trim() || 'Savings',
                    date: formatDate(date)
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
                {/* Header */}
                <View className="px-6 py-4 flex-row items-center border-b" style={{ borderBottomColor: colors.card + '80' }}>
                    <Pressable onPress={() => router.back()} className="p-2 -ml-2 rounded-full absolute left-4 z-10">
                        <Ionicons name="arrow-back" size={28} color={colors.foreground} />
                    </Pressable>
                    <View className="flex-1 items-center">
                        <Text className="text-[22px] font-bold" style={{ color: colors.foreground }}>Add Savings</Text>
                    </View>
                </View>

                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View className="flex-1">
                        <ScrollView className="flex-1 px-8 pt-8 pb-10" showsVerticalScrollIndicator={false}>
                            <Text className="text-2xl font-bold mb-6" style={{ color: colors.foreground }}>Details</Text>

                            <View className="space-y-6">
                                <View 
                                    style={{ backgroundColor: colors.card + '80', borderColor: colors.border + '33' }}
                                    className="h-16 rounded-2xl px-5 flex-row items-center border"
                                >
                                    <TextInput
                                        className="text-lg flex-1"
                                        style={{ color: colors.foreground }}
                                        placeholder="Savings Goal (e.g. New Laptop)"
                                        placeholderTextColor={colors.muted}
                                        value={itemName}
                                        onChangeText={setItemName}
                                    />
                                </View>

                                <View 
                                    style={{ backgroundColor: colors.card + '80', borderColor: colors.border + '33' }}
                                    className="h-16 rounded-2xl px-5 flex-row items-center border mt-6"
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

                                <View className="flex-row items-center justify-between mt-8 px-2 mb-4">
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
                                style={{ backgroundColor: (amount && parseFloat(amount) <= 1000000000 && !isSaving) ? '#3B82F6' : colors.card, opacity: (amount && parseFloat(amount) <= 1000000000) ? 1 : 0.5 }}
                            >
                                {isSaving ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text className="text-xl font-bold" style={{ color: (amount && parseFloat(amount) <= 1000000000) ? '#fff' : colors.muted }}>
                                        Save Savings
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
                title="Select Savings Date"
            />
        </SafeAreaView>
    );
}
