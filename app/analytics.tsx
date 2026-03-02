import { Ionicons } from "@expo/vector-icons";
import * as React from "react";
import { Text, View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const AnalyticsPage = () => {
    return (
        <SafeAreaView className="flex-1 bg-[#1E293B]">
            <View className="px-8 pt-8 pb-4">
                <Text className="text-white text-5xl font-bold">Analytics</Text>
            </View>
            <ScrollView className="flex-1 px-8 mt-4">
                <View className="bg-[#334155] p-8 rounded-[25px] border border-[#90A1B9] shadow-2xl items-center">
                    <Ionicons name="bar-chart-outline" size={64} color="#90A1B9" />
                    <Text className="text-white text-xl font-bold mt-4">Insights coming soon</Text>
                    <Text className="text-slate-400 text-center mt-2">We are calculating your financial trends and AI-driven recommendations.</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default AnalyticsPage;
