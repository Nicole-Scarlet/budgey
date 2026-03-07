import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFinance } from "../../context/FinanceContext";

const quickActions = [
  {
    id: "expenses",
    label: "Expenses",
    icon: "cafe-outline" as const,
    route: "/expenses",
  },
  {
    id: "income",
    label: "Income",
    icon: "grid-outline" as const,
    route: "/income",
  },
  {
    id: "savings",
    label: "Savings",
    icon: "videocam-outline" as const,
    route: "/savings",
  },
  {
    id: "debt",
    label: "Debt",
    icon: "lock-closed-outline" as const,
    route: "/debt",
  },
  {
    id: "investment",
    label: "Investment",
    icon: "trending-up-outline" as const,
    route: "/investment",
  },
];

const transactions = [
  {
    id: 1,
    name: "Budget",
    icon: "cafe-outline" as const,
    amount: "-₱20,000.00",
    isNegative: true,
  },
  {
    id: 2,
    name: "Job",
    icon: "grid-outline" as const,
    amount: "+₱20,000.00",
    isNegative: false,
  },
  {
    id: 3,
    name: "Budget",
    icon: "videocam-outline" as const,
    amount: "+₱20,000.00",
    isNegative: false,
  },
  {
    id: 4,
    name: "Utang kay Nigel",
    icon: "lock-closed-outline" as const,
    amount: "~₱5,000.00",
    isNegative: true,
  },
  {
    id: 5,
    name: "Corporation ni Jedrick",
    icon: "trending-up-outline" as const,
    amount: "+₱5,000.00",
    isNegative: false,
  },
];

export default function SummaryScreen() {
  const router = useRouter();
  const { budget } = useFinance();

  const formatCurrency = (value: number) => {
    return `₱${Math.abs(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <View className="flex-1 bg-[#1E293B]">
      <SafeAreaView className="flex-1" edges={["top"]}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Overall Budget Section */}
          <TouchableOpacity
            className="items-center pt-10 pb-8 px-7"
            onPress={() => router.push("../budget")}
          >
            <Text className="text-white text-5xl font-extrabold tracking-tight mb-1">
              {formatCurrency(budget)}
            </Text>
            <Text className="text-slate-300 text-xl font-medium">
              Overall Budget
            </Text>
          </TouchableOpacity>

          {/* Quick Actions Row */}
          <View
            className="mx-7 mb-6 rounded-[20px] px-4 py-4"
            style={{
              backgroundColor: "#334155",
              borderWidth: 1,
              borderColor: "#475569",
            }}
          >
            <View className="flex-row justify-between items-center">
              {quickActions.map((action) => (
                <TouchableOpacity
                  key={action.id}
                  className="items-center gap-y-1.5"
                  style={{ minWidth: 52 }}
                  onPress={() => router.push(action.route as any)}
                >
                  <View
                    className="w-11 h-11 rounded-full items-center justify-center"
                    style={{ backgroundColor: "#475569" }}
                  >
                    <Ionicons name={action.icon} size={22} color="white" />
                  </View>
                  <Text
                    className="text-white text-[10px] font-medium text-center"
                    numberOfLines={1}
                  >
                    {action.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Summary Card */}
          <View className="mx-7">
            <View
              className="rounded-[20px] px-5 py-4"
              style={{
                backgroundColor: "#334155",
                borderWidth: 1,
                borderColor: "#475569",
              }}
            >
              {/* Card Header */}
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-white text-xl font-bold">Summary</Text>
                <TouchableOpacity>
                  <Ionicons name="funnel-outline" size={20} color="#94A3B8" />
                </TouchableOpacity>
              </View>

              {/* Date Label */}
              <Text className="text-slate-400 text-sm font-semibold mb-3">
                February 4, 2026
              </Text>

              {/* Transaction List */}
              <View>
                {transactions.map((tx, index) => (
                  <View
                    key={tx.id}
                    className="flex-row items-center justify-between py-3"
                    style={
                      index < transactions.length - 1
                        ? {
                            borderBottomWidth: 1,
                            borderBottomColor: "#475569",
                          }
                        : undefined
                    }
                  >
                    {/* Icon + Name */}
                    <View className="flex-row items-center gap-x-3 flex-1">
                      <View
                        className="w-8 h-8 rounded-full items-center justify-center"
                        style={{ backgroundColor: "#475569" }}
                      >
                        <Ionicons name={tx.icon} size={16} color="#94A3B8" />
                      </View>
                      <Text
                        className="text-white text-sm font-medium flex-1"
                        numberOfLines={1}
                      >
                        {tx.name}
                      </Text>
                    </View>

                    {/* Amount */}
                    <Text
                      className="text-sm font-bold ml-2"
                      style={{
                        color: tx.isNegative ? "#F87171" : "#4ADE80",
                      }}
                    >
                      {tx.amount}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
