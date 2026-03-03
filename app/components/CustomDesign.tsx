import { Feather } from '@expo/vector-icons';
import { Button } from 'antd-mobile';
import React from 'react';
import { Text, View } from 'react-native';

export default function CustomDesign() {
    const actions = [
        { label: 'Expenses', icon: <Feather name="coffee" size={28} color="#CBD5E1" /> },
        { label: 'Debt', icon: <Feather name="archive" size={28} color="#CBD5E1" /> },
        { label: 'Investment', icon: <Feather name="trending-up" size={28} color="#CBD5E1" /> },
        { label: 'Savings', icon: <Feather name="save" size={28} color="#CBD5E1" /> },
        { label: 'Income', icon: <Feather name="dollar-sign" size={28} color="#CBD5E1" /> },
    ];

    return (
        <View className="flex-1 p-4 w-full bg-slate-900 justify-center">
            {/* Main Container */}
            <View className="bg-slate-700 rounded-[25px] w-full pt-[46px] pb-[32px] px-[20px] items-center">
                {/* Amount */}
                <Text className="text-white text-[48px] font-bold leading-[65px] text-center">
                    ₱50,000.00
                </Text>

                {/* Subtitle */}
                <Text className="text-white text-[24px] mt-[4px] mb-[40px] text-center">
                    Overall Budget
                </Text>

                {/* Primary Buttons / Actions */}
                <View className="w-full flex-row justify-between px-[10px]">
                    {actions.map((item, index) => (
                        <Button
                            key={index}
                            fill="none"
                            className="flex-col items-center justify-center p-0 h-auto bg-transparent border-0"
                        >
                            <View className="mb-[10px] items-center justify-center">
                                {item.icon}
                            </View>
                            <Text className="text-white text-[15px] leading-[20px] text-center">
                                {item.label}
                            </Text>
                        </Button>
                    ))}
                </View>
            </View>
        </View>
    );
}
