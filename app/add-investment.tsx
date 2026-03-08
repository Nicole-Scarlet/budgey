import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTransactions } from '../contexts/TransactionContext';

export default function AddInvestmentScreen() {
    const router = useRouter();
    const { addTransaction } = useTransactions();
    const [amount, setAmount] = useState('');
    const [itemName, setItemName] = useState('');

    const handleSave = () => {
        // Parse the amount string to a number
        const amountValue = parseFloat(amount.replace(/[^0-9.-]+/g, ''));

        if (amountValue) {
            addTransaction({
                type: 'investment',
                amount: amountValue,
                title: itemName.trim() || 'Investment',
                date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
            });
            router.back();
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-[#1E293B]">
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
            >
                {/* Header */}
                <View className="px-6 py-4 flex-row items-center border-b border-[#334155]/50">
                    <Pressable onPress={() => router.back()} className="p-2 -ml-2 rounded-full active:bg-[#334155] absolute left-4 z-10">
                        <Ionicons name="arrow-back" size={28} color="white" />
                    </Pressable>
                    <View className="flex-1 items-center">
                        <Text className="text-white text-[22px] font-bold">Add Investment</Text>
                    </View>
                </View>

                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View className="flex-1">
                        <ScrollView className="flex-1 px-8 pt-8 pb-10" showsVerticalScrollIndicator={false}>
                            <Text className="text-white text-2xl font-bold mb-6">Details</Text>

                            {/* Form Fields */}
                            <View className="space-y-6">
                                {/* Item Name Field */}
                                <View className="bg-[#334155]/50 h-16 rounded-2xl px-5 flex-row items-center border border-[#90A1B9]/20">
                                    <TextInput
                                        className="text-white text-lg flex-1"
                                        placeholder="Investment Name"
                                        placeholderTextColor="#64748B"
                                        value={itemName}
                                        onChangeText={setItemName}
                                    />

                                </View>

                                {/* Amount Field */}
                                <View className="bg-[#334155]/50 h-16 rounded-2xl px-5 flex-row items-center border border-[#90A1B9]/20 mt-6">
                                    <TextInput
                                        className="text-white text-lg flex-1"
                                        placeholder="Amount"
                                        placeholderTextColor="#64748B"
                                        value={amount}
                                        onChangeText={(text) => setAmount(text.replace(/[^0-9.]/g, ''))}
                                        keyboardType="numeric"
                                    />
                                </View>
                                {parseFloat(amount) > 1000000000 && (
                                    <Text className="text-red-400 text-xs mt-2 ml-1">Maximum limit is ₱1,000,000,000</Text>
                                )}
                            </View>
                        </ScrollView>

                        {/* Footer Button Locations */}
                        <View className="px-8 py-6 pb-12 bg-[#1E293B]">
                            <Pressable
                                onPress={handleSave}
                                disabled={!amount || parseFloat(amount) > 1000000000}
                                className={`w-full h-16 rounded-full items-center justify-center shadow-lg 
                                    ${(amount && parseFloat(amount) <= 1000000000) ? "bg-[#A855F7] active:bg-[#9333EA]" : "bg-[#334155] opacity-50"}`}
                            >
                                <Text className={`text-xl font-bold ${(amount && parseFloat(amount) <= 1000000000) ? "text-white" : "text-[#94A3B8]"}`}>
                                    Save
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
