import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { useTransactions } from '../contexts/TransactionContext';

export default function EnterBudgetScreen() {
    const router = useRouter();
    const [amountStr, setAmountStr] = useState<string>('');
    const { setBudget } = useTransactions();

    // Handles raw string appends
    const handlePress = (val: string) => {
        // Prevent multiple decimals
        if (val === '.' && amountStr.includes('.')) return;

        // Prevent typing if length exceeds a reasonable limit (e.g. 10 chars)
        if (amountStr.length >= 10) return;

        // Handle starting decimal
        if (val === '.' && amountStr === '') {
            setAmountStr('0.');
            return;
        }

        setAmountStr((prev) => prev + val);
    };

    const handleDelete = () => {
        setAmountStr((prev) => prev.slice(0, -1));
    };

    const handleEnterBudget = () => {
        // Parse the final string to a number for state/storage
        const numericAmount = parseFloat(amountStr);

        if (isNaN(numericAmount) || numericAmount < 0) {
            console.log("Invalid amount");
            if (amountStr !== "0") return;
        }

        console.log("Entered Budget:", isNaN(numericAmount) ? 0 : numericAmount);

        setBudget(isNaN(numericAmount) ? 0 : numericAmount);

        // Send a Direct Overwrite to the home screen
        router.replace('/(tabs)');
    };

    // Format the raw string for display
    const formatDisplay = (rawStr: string) => {
        if (!rawStr) return '0';

        // If it ends with decimal, keep the decimal for visual typing feedback
        if (rawStr.endsWith('.')) {
            const wholePart = parseInt(rawStr.slice(0, -1), 10);
            return isNaN(wholePart) ? '0.' : new Intl.NumberFormat('en-PH').format(wholePart) + '.';
        }

        const parts = rawStr.split('.');
        const whole = parts[0] ? parseInt(parts[0], 10) : 0;
        const decimal = parts[1] !== undefined ? `.${parts[1]}` : '';

        return `${new Intl.NumberFormat('en-PH').format(whole)}${decimal}`;
    };

    const keys = [
        ['1', '2', '3'],
        ['4', '5', '6'],
        ['7', '8', '9'],
        ['.', '0', 'delete']
    ];

    return (
        <View className="flex-1 bg-[#242E42]">
            <SafeAreaView className="flex-1">
                {/* Header & Display Area */}
                <View className="flex-[0.35] bg-[#303E55] px-6 pt-10 rounded-b-[20px] shadow-sm z-10">
                    <View className="flex-row justify-between items-center w-full mb-8">
                        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
                            <Feather name="arrow-left" size={28} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity className="p-2 -mr-2">
                            <Feather name="calendar" size={24} color="white" />
                        </TouchableOpacity>
                    </View>

                    <View className="items-center justify-center mt-2">
                        <Text className="text-slate-300 text-[18px] mb-2 font-medium">Enter an Amount</Text>
                        <Text className="text-white text-[56px] font-bold tracking-tight">
                            ₱{formatDisplay(amountStr)}
                        </Text>
                    </View>
                </View>

                {/* Numpad Area */}
                <View className="flex-[0.65] bg-[#242E42] px-6 pt-8 pb-4 justify-between -mt-4 z-0">
                    <View className="flex-1 justify-around mt-4">
                        {keys.map((row, rowIndex) => (
                            <View key={rowIndex} className="flex-row justify-around w-full mb-4">
                                {row.map((key) => {
                                    if (key === 'delete') {
                                        return (
                                            <TouchableOpacity
                                                key={key}
                                                style={{ width: 80, height: 80 }}
                                                className="items-center justify-center"
                                                onPress={handleDelete}
                                            >
                                                <Feather name="delete" size={32} color="white" />
                                            </TouchableOpacity>
                                        );
                                    }
                                    return (
                                        <TouchableOpacity
                                            key={key}
                                            style={{ width: 80, height: 80 }}
                                            className="items-center justify-center"
                                            onPress={() => handlePress(key)}
                                        >
                                            <Text className="text-white text-[38px] font-normal">{key}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        ))}
                    </View>

                    {/* Enter Budget Button */}
                    <TouchableOpacity
                        className="w-full bg-[#8BA0B8] py-5 rounded-[20px] items-center justify-center mt-4 mb-4"
                        onPress={handleEnterBudget}
                    >
                        <Text className="text-white text-[18px] font-bold">Enter Budget</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}
