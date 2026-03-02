import { useRouter } from "expo-router";
import * as React from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const WelcomePage = () => {
    const router = useRouter();

    return (
        <SafeAreaView className="flex-1 bg-[#1E293B] px-8 justify-between py-12">
            {/* Top Illustration Placeholder - Replacing that absolute positioned View */}
            <View className="items-center mt-10">
                <View className="w-72 h-72 bg-[#334155] rounded-[25px] items-center justify-center border border-[#90A1B9]">
                    <Text className="text-6xl">💰</Text>
                </View>
            </View>

            {/* Text Content */}
            <View>
                <Text className="text-white text-4xl font-bold mb-4">
                    Welcome to Budgey!
                </Text>
                <Text className="text-slate-300 text-xl leading-8">
                    Know yourself (and your wallet) better using our state-of-the-art features that will help you understand that budgeting does not have to be difficult.
                </Text>
            </View>

            {/* Bottom Button */}
            <View className="items-center">
                <Pressable
                    onPress={() => router.replace("/login")}
                    className="w-full bg-[#90A1B9] h-16 rounded-[25px] items-center justify-center active:opacity-80"
                >
                    <Text className="text-[#1E293B] text-2xl font-black">Get Started</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
};

export default WelcomePage;