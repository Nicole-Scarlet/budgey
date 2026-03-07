import {
    Feather,
    Ionicons,
    MaterialCommunityIcons,
    MaterialIcons,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFinance } from "../../context/FinanceContext";

export default function HomeScreen() {
  const router = useRouter();
  const { budget } = useFinance();

  const formatCurrency = (value: number) => {
    return `₱${Math.abs(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const topExpenses = [
    { id: 1, rank: 1, name: "Bukidnon Fresh Farm Milk", price: "₱676,767.67" },
    { id: 2, rank: 2, name: "GPU", price: "₱20,000.00" },
    { id: 3, rank: 3, name: "Very Cool Figurine Set", price: "₱4,500.00" },
    { id: 4, rank: 4, name: "V-Power Diesel 95", price: "₱1,000.00" },
    { id: 5, rank: 5, name: "Overwatch Battlepass", price: "₱500.00" },
  ];

  const summaryItems = [
    {
      id: 1,
      type: "Expenses",
      label: "Expenses",
      subtitle: "Details",
      iconBg: "#F97316",
      iconName: "cafe-outline" as const,
      iconLib: "Ionicons" as const,
      hasWarning: true,
      route: "/add-expenses",
    },
    {
      id: 2,
      type: "Income",
      label: "Income",
      subtitle: "Details",
      iconBg: "#22C55E",
      iconName: "grid-outline" as const,
      iconLib: "Ionicons" as const,
      hasWarning: false,
      route: null,
    },
    {
      id: 3,
      type: "Savings",
      label: "Savings",
      subtitle: "uh oh u a brokie",
      iconBg: "#3B82F6",
      iconName: "videocam-outline" as const,
      iconLib: "Ionicons" as const,
      hasWarning: true,
      route: "/savings",
    },
    {
      id: 4,
      type: "Debt",
      label: "Debt",
      subtitle: "Details??",
      iconBg: "#EAB308",
      iconName: "lock-closed-outline" as const,
      iconLib: "Ionicons" as const,
      hasWarning: false,
      route: "/debt",
    },
    {
      id: 5,
      type: "Investment",
      label: "Investment",
      subtitle: "Details??",
      iconBg: "#F97316",
      iconName: "trending-up-outline" as const,
      iconLib: "Ionicons" as const,
      hasWarning: false,
      route: "/investment",
    },
  ];

  return (
    <View className="flex-1 bg-[#1E293B]">
      <SafeAreaView className="flex-1" edges={["top"]}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View className="px-7 pt-7 pb-3 flex-row justify-between items-center">
            <Text className="text-white text-5xl font-bold">Today</Text>
            <View className="flex-row items-center gap-x-3">
              <View className="flex-row items-center gap-x-1">
                <Ionicons name="flash" size={20} color="#FBBF24" />
                <Text className="text-slate-300 font-semibold text-base">
                  67
                </Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/wishlist' as any)}>
                <Ionicons name="heart-outline" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Total Balance Card */}
          <View className="mx-7 mt-2">
            <View
              className="rounded-[24px] p-6"
              style={{
                backgroundColor: "#334155",
                borderWidth: 1,
                borderColor: "#90A1B9",
              }}
            >
              <Text className="text-slate-300 text-sm mb-1">Total Balance</Text>
              <TouchableOpacity onPress={() => router.push("/budget")}>
                <Text className="text-white text-3xl font-extrabold mb-5">
                  {formatCurrency(budget)}
                </Text>
              </TouchableOpacity>

              <View className="flex-row items-center gap-x-6">
                {/* Income & Savings */}
                <View className="flex-row items-center gap-x-2 flex-1">
                  <View className="bg-green-500/20 p-1 rounded-full">
                    <MaterialIcons
                      name="arrow-upward"
                      size={16}
                      color="#22C55E"
                    />
                  </View>
                  <View>
                    <Text className="text-slate-400 text-xs">
                      Income &amp; Savings
                    </Text>
                    <Text className="text-white font-bold text-sm">
                      ₱40,000.00
                    </Text>
                  </View>
                </View>

                {/* Expenses */}
                <View className="flex-row items-center gap-x-2 flex-1">
                  <View className="bg-red-500/20 p-1 rounded-full">
                    <MaterialIcons
                      name="arrow-downward"
                      size={16}
                      color="#EF4444"
                    />
                  </View>
                  <View>
                    <Text className="text-slate-400 text-xs">Expenses</Text>
                    <Text className="text-white font-bold text-sm">
                      ₱20,000.00
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Top 5 Expenses Section */}
          <View className="mt-7">
            <View className="px-7 flex-row items-center gap-x-2 mb-4">
              <Ionicons name="ribbon-outline" size={22} color="white" />
              <Text className="text-white text-xl font-bold">
                Top 5 Expenses
              </Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 28 }}
            >
              {topExpenses.map((expense) => (
                <View
                  key={expense.id}
                  className="mr-3 rounded-[25px] p-3 items-center justify-between"
                  style={{
                    width: 110,
                    height: 135,
                    backgroundColor: "#334155",
                    borderWidth: 1,
                    borderColor: "#475569",
                  }}
                >
                  {/* Rank circle */}
                  <View
                    className="w-8 h-8 rounded-full items-center justify-center self-start"
                    style={{ backgroundColor: "#475569" }}
                  >
                    <Text className="text-white font-bold text-xs">
                      {expense.rank}
                    </Text>
                  </View>

                  <Text
                    numberOfLines={2}
                    className="text-white text-center text-xs font-semibold leading-4"
                  >
                    {expense.name}
                  </Text>

                  <Text className="text-white text-[10px] font-bold opacity-90">
                    {expense.price}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Summary Section */}
          <View className="mt-7 px-7">
            {/* Section Header */}
            <View className="flex-row items-center gap-x-2 mb-4">
              <MaterialCommunityIcons name="monitor" size={22} color="white" />
              <Text className="text-white text-xl font-bold">Summary</Text>
              <MaterialIcons name="arrow-forward" size={22} color="#22C55E" />
            </View>

            {/* Summary Items */}
            {summaryItems.map((item) => (
              <View
                key={item.id}
                className="flex-row items-center justify-between mb-3 px-4 py-4 rounded-[20px]"
                style={{
                  backgroundColor: "#334155",
                  borderWidth: 1,
                  borderColor: "#475569",
                }}
              >
                <View className="flex-row items-center gap-x-4">
                  {/* Icon */}
                  <View
                    className="w-11 h-11 rounded-full items-center justify-center"
                    style={{
                      backgroundColor: "transparent",
                      borderWidth: 2.5,
                      borderColor: item.iconBg,
                    }}
                  >
                    <Ionicons
                      name={item.iconName}
                      size={20}
                      color={item.iconBg}
                    />
                  </View>

                  {/* Label + subtitle */}
                  <View>
                    <View className="flex-row items-center gap-x-1">
                      <Text className="text-white font-bold text-base">
                        {item.label}
                      </Text>
                      {item.hasWarning && (
                        <MaterialIcons
                          name="warning"
                          size={14}
                          color="#EF4444"
                        />
                      )}
                    </View>
                    <Text className="text-slate-400 text-xs">
                      {item.subtitle}
                    </Text>
                  </View>
                </View>

                {/* Plus button */}
                <TouchableOpacity
                  className="w-9 h-9 rounded-full items-center justify-center"
                  style={{ backgroundColor: "#475569" }}
                  onPress={() => {
                    if (item.route) router.push(item.route as any);
                  }}
                >
                  <Feather name="plus" size={20} color="white" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
