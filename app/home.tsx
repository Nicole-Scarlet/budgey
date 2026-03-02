import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CircularProgress from "../components/CircularProgress";

const HomePage = () => {
    const router = useRouter();
    // Sample data for the Top Expenses
    const topExpenses = [
        { id: 1, name: "Bukidnon Fresh Farm Milk", price: "₱676.67", icon: "bottle-wine-outline" },
        { id: 2, name: "GPU", price: "₱20,000.00", icon: "card-outline" },
        { id: 3, name: "Cool Figurine Set", price: "₱4,500.00", icon: "cube-outline" },
        { id: 4, name: "V-Power Diesel 95", price: "₱1,000.00", icon: "gas-station-outline" },
        { id: 5, name: "Overwatch Pass", price: "₱500.00", icon: "gamepad-variant-outline" },
    ];

    return (
        <SafeAreaView className="flex-1 bg-[#1E293B]">
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>

                {/* Header */}
                <View className="px-8 pt-8 flex-row justify-between items-center">
                    <View>
                        <Text className="text-white text-5xl font-bold">Today</Text>
                    </View>
                    <View className="flex-row items-center gap-x-4">
                        <View className="flex-row items-center bg-[#334155] px-3 py-1.5 rounded-full border border-[#90A1B9]">
                            <Ionicons name="flash" size={20} color="#EAB308" />
                            <Text className="text-white font-bold ml-1">67</Text>
                        </View>
                        <Pressable className="bg-[#334155] p-2 rounded-full border border-[#90A1B9]">
                            <Ionicons name="heart-outline" size={24} color="white" />
                        </Pressable>
                    </View>
                </View>

                {/* Balance Card */}
                <View className="px-8 mt-10">
                    <View className="bg-[#334155] p-8 rounded-[25px] border border-[#90A1B9] shadow-2xl">
                        <Text className="text-slate-300 text-lg font-medium">Total Balance</Text>
                        <Text className="text-white text-5xl font-bold mt-2">₱50,000.00</Text>

                        <View className="flex-row justify-between mt-10 pt-8 border-t border-[#90A1B9]/30">
                            <View className="items-center">
                                <View className="flex-row items-center gap-x-2">
                                    <View className="bg-green-500/20 p-1.5 rounded-full">
                                        <Ionicons name="arrow-up" size={14} color="#22c55e" />
                                    </View>
                                    <Text className="text-slate-300 text-sm">Income</Text>
                                </View>
                                <Text className="text-white text-xl font-bold mt-1">₱40,000</Text>
                            </View>
                            <View className="items-center">
                                <View className="flex-row items-center gap-x-2">
                                    <View className="bg-red-500/20 p-1.5 rounded-full">
                                        <Ionicons name="arrow-down" size={14} color="#ef4444" />
                                    </View>
                                    <Text className="text-slate-300 text-sm">Expenses</Text>
                                </View>
                                <Text className="text-white text-xl font-bold mt-1">₱20,000</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Top Expenses Section */}
                <View className="mt-12">
                    <View className="flex-row justify-between items-center px-8 mb-6">
                        <Text className="text-white text-2xl font-bold">Top 5 Expenses</Text>
                        <Pressable>
                            <Text className="text-slate-400 font-medium">View All</Text>
                        </Pressable>
                    </View>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingLeft: 32, paddingRight: 16 }}
                    >
                        {topExpenses.map((item) => (
                            <View
                                key={item.id}
                                className="bg-[#334155] w-[130px] h-[160px] p-4 rounded-[25px] border border-[#90A1B9] mr-4 justify-between"
                            >
                                <View className="w-12 h-12 bg-[#1E293B] rounded-2xl items-center justify-center self-center">
                                    <MaterialCommunityIcons name={item.icon as any} size={28} color="#90A1B9" />
                                </View>
                                <View className="items-center">
                                    <Text className="text-white font-bold text-center" numberOfLines={2}>{item.name}</Text>
                                    <Text className="text-slate-300 mt-1 font-medium">{item.price}</Text>
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                </View>

                {/* Summary Section */}
                <View className="px-8 mt-12 mb-12">
                    <View className="flex-row items-center justify-between mb-6">
                        <Text className="text-white text-2xl font-bold">Summary</Text>
                        <Ionicons name="options-outline" size={24} color="#90A1B9" />
                    </View>

                    <View className="bg-[#334155] rounded-[25px] p-6 border border-[#90A1B9]">
                        <SummaryItem
                            icon="cart-outline"
                            color="#F97316"
                            title="Expenses"
                            subtitle="Details"
                            percentage={75}
                            category="expense"
                            onPress={() => router.push('/expenses' as any)}
                        />
                        <Divider />
                        <SummaryItem
                            icon="wallet-outline"
                            color="#22C55E"
                            title="Income"
                            subtitle="Details"
                            percentage={90}
                            category="income"
                            onPress={() => router.push('/income' as any)}
                        />
                        <Divider />
                        <SummaryItem
                            icon="piggy-bank-outline"
                            color="#3B82F6"
                            title="Savings"
                            subtitle="Details"
                            percentage={15}
                            category="savings"
                            onPress={() => router.push('/savings' as any)}
                        />
                        <Divider />
                        <SummaryItem
                            icon="receipt-outline"
                            color="#EF4444"
                            title="Debt"
                            subtitle="Details"
                            percentage={25}
                            category="debt"
                            onPress={() => router.push('/debt' as any)}
                        />
                        <Divider />
                        <SummaryItem
                            icon="trending-up"
                            color="#A855F7"
                            title="Investment"
                            subtitle="Details"
                            percentage={60}
                            category="income"
                            onPress={() => router.push('/investment' as any)}
                        />
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

// Sub-components for cleaner code
const SummaryItem = ({
    icon,
    color,
    title,
    subtitle,
    category,
    percentage,
    onPress,
}: {
    icon: any,
    color: string,
    title: string,
    subtitle: string,
    category: 'expense' | 'savings' | 'debt' | 'income',
    percentage: number,
    onPress?: () => void,
}) => {
    const getProgressColor = () => {
        if (category === 'expense' || category === 'debt') {
            // Small curve (low percentage) -> Green, Fuller curve (high percentage) -> Red/Orange
            if (percentage < 30) return '#4ADE80';
            if (percentage < 70) return '#EAB308';
            return '#F97316';
        } else if (category === 'savings') {
            // Bigger curve (high percentage) -> Green, Smaller curve (low percentage) -> Red
            if (percentage >= 70) return '#4ADE80';
            if (percentage >= 30) return '#EAB308';
            return '#DC2626';
        } else {
            // Default (Income/Investment) -> Green
            return '#4ADE80';
        }
    };

    const isDanger = () => {
        if (category === 'expense' || category === 'debt') return percentage > 70;
        if (category === 'savings') return percentage < 30;
        return false;
    };

    return (
        <View className="flex-row items-center justify-between py-4">
            <Pressable
                onPress={onPress}
                className="flex-row items-center gap-x-6 flex-1 active:opacity-70"
            >
                <CircularProgress
                    size={60}
                    strokeWidth={4}
                    percentage={percentage}
                    color={getProgressColor()}
                >
                    <View style={{ backgroundColor: color }} className="w-10 h-10 rounded-full items-center justify-center">
                        <MaterialCommunityIcons name={icon} size={22} color="#fff" />
                    </View>

                    {isDanger() && (
                        <View className="absolute -top-1 -right-1 bg-red-500 w-5 h-5 rounded-full items-center justify-center border-2 border-[#334155]">
                            <Text className="text-white text-[10px] font-bold">!</Text>
                        </View>
                    )}
                </CircularProgress>

                <View>
                    <Text className="text-white font-bold text-lg">{title}</Text>
                    <Text className="text-slate-400 text-sm">{subtitle}</Text>
                </View>
            </Pressable>
            <Pressable className="bg-[#1E293B] w-10 h-10 rounded-full items-center justify-center border border-[#90A1B9]">
                <Ionicons name="add" size={24} color="white" />
            </Pressable>
        </View>
    );
};

const Divider = () => <View className="h-[1px] bg-[#90A1B9]/20" />;

export default HomePage;