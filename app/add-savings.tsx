import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTransactions } from './../contexts/TransactionContext';

export default function AddSavingsScreen() {
    const router = useRouter();
    const { addTransaction } = useTransactions();
    const [amount, setAmount] = useState('');
    const [itemName, setItemName] = useState('');

    const handleSave = () => {
        // Parse the amount string to a number
        const amountValue = parseFloat(amount.replace(/[^0-9.-]+/g, ''));

        if (amountValue && itemName) {
            addTransaction({
                type: 'savings',
                amount: amountValue,
                title: itemName,
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
                        <Text className="text-white text-[22px] font-bold">Add Savings</Text>
                    </View>
                </View>

                <ScrollView className="flex-1 px-8 pt-8 pb-10" showsVerticalScrollIndicator={false}>
                    <Text className="text-white text-2xl font-bold mb-6">Details</Text>

                    {/* Form Fields */}
                    <View className="space-y-6">
                        {/* Item Name Field */}
                        <View className="bg-[#334155]/50 h-16 rounded-2xl px-5 flex-row items-center border border-[#90A1B9]/20">
                            <TextInput
                                className="text-white text-lg flex-1"
                                placeholder="Savings Goal (e.g. New Laptop)"
                                placeholderTextColor="#64748B"
                                value={itemName}
                                onChangeText={setItemName}
                            />
                            <Pressable className="ml-2">
                                <Ionicons name="mic-outline" size={24} color="#94A3B8" />
                            </Pressable>
                        </View>

                        {/* Amount Field */}
                        <View className="bg-[#334155]/50 h-16 rounded-2xl px-5 flex-row items-center border border-[#90A1B9]/20 mt-6">
                            <TextInput
                                className="text-white text-lg flex-1"
                                placeholder="Amount"
                                placeholderTextColor="#64748B"
                                value={amount}
                                onChangeText={setAmount}
                                keyboardType="numeric"
                            />
                        </View>
                    </View>
                </ScrollView>

                {/* Footer Button Locations */}
                <View className="px-8 py-6 pb-12 bg-[#1E293B]">
                    <Pressable
                        onPress={handleSave}
                        disabled={!amount || !itemName}
                        className={`w-full h-16 rounded-full items-center justify-center shadow-lg 
                            ${amount && itemName ? "bg-[#3B82F6] active:bg-[#2563EB]" : "bg-[#334155] opacity-50"}`}
                    >
                        <Text className={`text-xl font-bold ${amount && itemName ? "text-white" : "text-[#94A3B8]"}`}>
                            Save Savings
                        </Text>
                    </Pressable>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
