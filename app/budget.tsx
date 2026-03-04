import { Ionicons } from "@expo/vector-icons"; // Added missing import for Ionicons
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFinance } from "../context/FinanceContext";

export default function BudgetScreen() {
  const router = useRouter();
  const { budget, updateBudget } = useFinance();
  const [amount, setAmount] = useState(budget.toString());

  const handleKeyPress = (key: string) => {
    if (key === "backspace") {
      setAmount((prev) => (prev.length > 1 ? prev.slice(0, -1) : "0"));
    } else if (key === ".") {
      if (!amount.includes(".")) {
        setAmount((prev) => prev + ".");
      }
    } else {
      setAmount((prev) => (prev === "0" ? key : prev + key));
    }
  };

  const handleEnterBudget = async () => {
    const budgetVal = parseFloat(amount);
    if (!isNaN(budgetVal)) {
      await updateBudget(budgetVal);
      router.back();
    }
  };

  const formatDisplayAmount = (val: string) => {
    const num = parseFloat(val);
    if (isNaN(num)) return "₱0";
    return `₱${num.toLocaleString(undefined, {
      minimumFractionDigits: val.includes(".") ? 1 : 0,
    })}`;
  };

  const KeypadButton = ({
    value,
    icon,
  }: {
    value?: string;
    icon?: keyof typeof Ionicons.glyphMap;
  }) => (
    <TouchableOpacity
      className="w-1/3 py-8 items-center justify-center"
      onPress={() => handleKeyPress(value || "backspace")}
    >
      {icon ? (
        <Ionicons name={icon} size={28} color="white" />
      ) : (
        <Text className="text-white text-3xl font-medium">{value}</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#1E293B]" edges={["top", "bottom"]}>
      {/* Header */}
      <View className="flex-row justify-between items-center px-6 pt-2 pb-4">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold">Enter Budget</Text>
        <TouchableOpacity>
          <Ionicons name="calendar-outline" size={28} color="white" />
        </TouchableOpacity>
      </View>

      {/* Amount Display */}
      <View className="flex-1 justify-center items-center px-6">
        <Text className="text-slate-400 text-lg mb-2">Enter an Amount</Text>
        <Text className="text-white text-6xl font-extrabold tracking-tight">
          {formatDisplayAmount(amount)}
        </Text>
      </View>

      {/* Numeric Keypad */}
      <View className="px-6 pb-8">
        <View className="flex-row flex-wrap">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0"].map(
            (num) => (
              <KeypadButton key={num} value={num} />
            ),
          )}
          <KeypadButton icon="backspace-outline" />
        </View>

        {/* Enter Budget Button */}
        <TouchableOpacity
          className="bg-[#475569] rounded-2xl py-5 mt-8 items-center"
          onPress={handleEnterBudget}
        >
          <Text className="text-white text-lg font-bold uppercase tracking-widest">
            Enter Budget
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
