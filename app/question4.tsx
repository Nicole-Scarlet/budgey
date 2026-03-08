import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as React from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function InterviewQuestion4() {
    const router = useRouter();
    const [selected, setSelected] = React.useState<string | null>(null);

    const options = [
        "Overspending",
        "Tracking where money goes",
        "Not saving enough",
        "Managing debt"
    ];

    return (
        <SafeAreaView className="flex-1 bg-[#1E293B] px-8 pt-6 pb-12">
            {/* Top Bar */}
            <Pressable onPress={() => router.replace("/question3" as any)} className="w-10 h-10 bg-slate-800 rounded-full items-center justify-center border border-slate-700 mb-6 active:bg-slate-700">
                <Ionicons name="arrow-back" size={20} color="white" />
            </Pressable>

            {/* Header Section */}
            <View>
                <Text className="text-[#94A3B8] text-sm font-bold mb-4 uppercase tracking-widest">Question 4 of 5</Text>
                <Text className="text-white text-4xl font-bold leading-tight mb-2">
                    What is your biggest financial struggle right now?
                </Text>
                <Text className="text-[#94A3B8] text-base mb-8">
                    Select one option.
                </Text>
            </View>

            {/* Options Section */}
            <View className="gap-y-4 flex-1">
                {options.map((option, index) => {
                    const isSelected = selected === option;
                    return (
                        <Pressable
                            key={index}
                            onPress={() => setSelected(option)}
                            className={`w-full h-16 rounded-2xl flex-row items-center justify-between px-6 border ${isSelected ? 'border-[#38BDF8] bg-[#3B82F6]/20' : 'border-slate-700 bg-slate-800'}`}
                        >
                            <Text className={`text-lg font-medium ${isSelected ? 'text-[#38BDF8]' : 'text-white'}`}>
                                {option}
                            </Text>
                            <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${isSelected ? 'border-[#38BDF8]' : 'border-slate-500'}`}>
                                {isSelected && <View className="w-3 h-3 rounded-full bg-[#38BDF8]" />}
                            </View>
                        </Pressable>
                    );
                })}
            </View>

            {/* Footer / Progression Icons */}
            <View className="flex-row justify-between items-center mt-4">
                <View className="flex-row gap-x-2">
                    <View className="w-2 h-2 bg-slate-700 rounded-full" />
                    <View className="w-2 h-2 bg-slate-700 rounded-full" />
                    <View className="w-2 h-2 bg-slate-700 rounded-full" />
                    <View className="w-8 h-2 bg-[#38BDF8] rounded-full" />
                    <View className="w-2 h-2 bg-slate-700 rounded-full" />
                </View>

                <Pressable
                    onPress={() => selected && router.replace("/question5" as any)}
                    className={`h-14 w-14 rounded-full items-center justify-center border ${selected ? 'bg-[#38BDF8] border-[#38BDF8] active:bg-[#0284C7]' : 'bg-slate-800 border-slate-700'}`}
                    disabled={!selected}
                >
                    <Ionicons name="arrow-forward" size={24} color={selected ? "#0F172A" : "#64748B"} />
                </Pressable>
            </View>
        </SafeAreaView>
    );
}
