import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as React from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const InterviewQuestion1 = () => {
    const router = useRouter();

    return (
        <SafeAreaView className="flex-1 bg-[#1E293B] px-8 py-12 justify-between">
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
                    className="w-full bg-[#90A1B9] h-20 rounded-[25px] items-center justify-center active:opacity-80 shadow-2xl"
                >
                    <Text className="text-[#1E293B] text-xl font-black">For Personal Use</Text>
                </Pressable>

                <Pressable
                    onPress={() => router.replace("/home")}
                    className="w-full bg-[#90A1B9] h-20 rounded-[25px] items-center justify-center active:opacity-80 shadow-2xl"
                >
                    <Text className="text-[#1E293B] text-xl font-black">With A Group</Text>
                </Pressable>
            </View>

            {/* Footer / Progression Icons */}
            <View className="flex-row justify-between items-center">
                <View className="flex-row gap-x-2">
                    <View className="w-8 h-2 bg-[#90A1B9] rounded-full" />
                    <View className="w-2 h-2 bg-[#334155] rounded-full" />
                    <View className="w-2 h-2 bg-[#334155] rounded-full" />
                </View>

                <Pressable
                    onPress={() => router.back()}
                    className="bg-[#334155] p-4 rounded-full border border-[#90A1B9]"
                >
                    <Ionicons name="arrow-back" size={24} color="white" />
                </Pressable>
            </View>
        </SafeAreaView>
    );
};

export default InterviewQuestion1;