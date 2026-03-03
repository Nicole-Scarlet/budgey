import { Feather } from '@expo/vector-icons';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export default function SummaryScreen() {
    const router = useRouter();
    const { type } = useLocalSearchParams<{ type: string }>();

    // Use a default title if type is missing for any reason
    const title = type || 'Category';

    return (
        <View className="flex-1 bg-[#0F172A] pt-16 px-6 relative">

            {/* Header */}
            <View className="flex-row justify-between items-center w-full mt-4 mb-8">
                <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
                    <Feather name="arrow-left" size={28} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-[20px] font-semibold">{title}</Text>
                <TouchableOpacity className="p-2 -mr-2">
                    <Feather name="more-horizontal" size={28} color="white" />
                </TouchableOpacity>
            </View>

            {/* Main Content Area (Dark Card) */}
            <View className="bg-[#1E293B] rounded-[30px] p-6 flex-1 w-full mb-6 items-center">

                {/* Placeholder for future specific category data */}
                <Text className="text-slate-400 text-[16px] mt-10">
                    Tracking data for {title} will appear here.
                </Text>

            </View>

            {/* Floating Action Button (+) */}
            <Link href={"/add-expense" as any} asChild>
                <TouchableOpacity
                    className="absolute bottom-10 right-6 w-16 h-16 bg-[#38bdf8] rounded-full justify-center items-center shadow-lg"
                    activeOpacity={0.8}
                >
                    <Feather name="plus" size={32} color="white" />
                </TouchableOpacity>
            </Link>

        </View>
    );
}
