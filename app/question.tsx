import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as React from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const InterviewQuestion1 = () => {
    const router = useRouter();

    return (
        <SafeAreaView className="flex-1 bg-slate-900 px-8 py-12 justify-between">
            {/* Header Section */}
            <View>
                <Text className="text-white text-5xl font-bold leading-tight">
                    How are you planning to use Budgey?
                </Text>
            </View>

            {/* Options Section */}
            <View className="gap-y-6">
                <Pressable
                    onPress={() => router.replace("/home")}
                    className="w-full bg-slate-400 h-20 rounded-3xl items-center justify-center active:bg-slate-500 shadow-lg"
                >
                    <Text className="text-slate-900 text-xl font-bold">For Personal Use</Text>
                </Pressable>

                <Pressable
                    onPress={() => router.replace("/home")}
                    className="w-full bg-slate-400 h-20 rounded-3xl items-center justify-center active:bg-slate-500 shadow-lg"
                >
                    <Text className="text-slate-900 text-xl font-bold">With A Group</Text>
                </Pressable>
            </View>

            {/* Footer / Progression Icons */}
            <View className="flex-row justify-between items-center">
                <View className="flex-row gap-x-2">
                    <View className="w-8 h-2 bg-slate-400 rounded-full" />
                    <View className="w-2 h-2 bg-slate-700 rounded-full" />
                    <View className="w-2 h-2 bg-slate-700 rounded-full" />
                </View>

                <Pressable
                    onPress={() => router.back()}
                    className="bg-slate-800 p-4 rounded-full border border-slate-700"
                >
                    <Ionicons name="arrow-back" size={24} color="white" />
                </Pressable>
            </View>
        </SafeAreaView>
    );
};

export default InterviewQuestion1;
