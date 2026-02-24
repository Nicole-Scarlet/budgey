import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const HomePage = () => {
    // Sample data for the Top Expenses
    const topExpenses = [
        { id: 1, name: "Bukidnon Fresh Farm Milk", price: "₱676.67", icon: "bottle-wine-outline" },
        { id: 2, name: "GPU", price: "₱20,000.00", icon: "card-outline" },
        { id: 3, name: "Cool Figurine Set", price: "₱4,500.00", icon: "cube-outline" },
        { id: 4, name: "V-Power Diesel 95", price: "₱1,000.00", icon: "gas-station-outline" },
        { id: 5, name: "Overwatch Pass", price: "₱500.00", icon: "gamepad-variant-outline" },
    ];

    return (
        <SafeAreaView className="flex-1 bg-slate-900">
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>

                {/* Header */}
                <View className="px-8 pt-6 flex-row justify-between items-end">
                    <View>
                        <Text className="text-slate-400 text-lg font-medium">Today</Text>
                        <Text className="text-white text-5xl font-bold">Dashboard</Text>
                    </View>
                    <View className="flex-row gap-x-4 mb-2">
                        <Pressable className="bg-slate-800 p-2 rounded-full border border-slate-700">
                            <Ionicons name="notifications-outline" size={24} color="white" />
                        </Pressable>
                        <Pressable className="bg-slate-800 p-2 rounded-full border border-slate-700">
                            <Ionicons name="person-outline" size={24} color="white" />
                        </Pressable>
                    </View>
                </View>

                {/* Balance Card */}
                <View className="px-8 mt-8">
                    <View className="bg-slate-800 p-8 rounded-[40px] border border-slate-700 shadow-2xl">
                        <Text className="text-slate-400 text-lg font-medium">Total Balance</Text>
                        <Text className="text-white text-4xl font-bold mt-2">₱50,000.00</Text>

                        <View className="flex-row justify-between mt-8 pt-8 border-t border-slate-700">
                            <View>
                                <View className="flex-row items-center gap-x-2">
                                    <View className="bg-green-500/20 p-1.5 rounded-full">
                                        <Ionicons name="arrow-up" size={14} color="#22c55e" />
                                    </View>
                                    <Text className="text-slate-400 text-sm">Income</Text>
                                </View>
                                <Text className="text-white text-lg font-bold mt-1">₱40,000</Text>
                            </View>
                            <View>
                                <View className="flex-row items-center gap-x-2">
                                    <View className="bg-red-500/20 p-1.5 rounded-full">
                                        <Ionicons name="arrow-down" size={14} color="#ef4444" />
                                    </View>
                                    <Text className="text-slate-400 text-sm">Expenses</Text>
                                </View>
                                <Text className="text-white text-lg font-bold mt-1">₱20,000</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Top Expenses Section */}
                <View className="mt-10">
                    <View className="flex-row justify-between items-center px-8 mb-4">
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
                            <View key={item.id} className="bg-slate-800 w-40 p-5 rounded-3xl border border-slate-700 mr-4">
                                <View className="w-12 h-12 bg-slate-700 rounded-2xl items-center justify-center mb-4">
                                    <MaterialCommunityIcons name={item.icon as any} size={24} color="#94a3b8" />
                                </View>
                                <Text className="text-white font-bold h-10" numberOfLines={2}>{item.name}</Text>
                                <Text className="text-slate-400 mt-2 font-medium">{item.price}</Text>
                            </View>
                        ))}
                    </ScrollView>
                </View>

                {/* Summary Section */}
                <View className="px-8 mt-10 mb-10">
                    <View className="flex-row items-center gap-x-3 mb-6">
                        <Text className="text-white text-2xl font-bold">Summary</Text>
                        <Ionicons name="trending-up" size={24} color="#94a3b8" />
                    </View>

                    <View className="bg-slate-800 rounded-[40px] p-6 border border-slate-700">
                        {/* Summary Items */}
                        <SummaryItem icon="wallet-outline" color="blue" title="Income" value="₱60,000" />
                        <Divider />
                        <SummaryItem icon="cart-outline" color="red" title="Expenses" value="₱20,000" />
                        <Divider />
                        <SummaryItem icon="piggy-bank-outline" color="green" title="Savings" value="₱15,000" />
                        <Divider />
                        <SummaryItem icon="trending-up-outline" color="purple" title="Investment" value="₱10,000" />
                        <Divider />
                        <SummaryItem icon="archive-outline" color="slate" title="Archive" value="₱5,000" />
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

// Sub-components for cleaner code
const SummaryItem = ({ icon, color, title, value }: { icon: any, color: string, title: string, value: string }) => (
    <View className="flex-row items-center justify-between py-4 px-2">
        <View className="flex-row items-center gap-x-4">
            <View className={`w-12 h-12 bg-slate-700 rounded-2xl items-center justify-center`}>
                <MaterialCommunityIcons name={icon} size={24} color="#fff" />
            </View>
            <View>
                <Text className="text-white font-bold text-lg">{title}</Text>
                <Text className="text-slate-400 text-sm">Monthly Total</Text>
            </View>
        </View>
        <Text className="text-white font-bold text-lg">{value}</Text>
    </View>
);

const Divider = () => <View className="h-[1px] bg-slate-700 mx-2" />;

export default HomePage;
