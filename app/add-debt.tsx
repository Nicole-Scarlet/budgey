import {
  AntDesign,
  Feather,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import CalendarModal from "../components/CalendarModal";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTransactions } from "../contexts/TransactionContext";
import { useTheme } from "../contexts/ThemeContext";

export default function AddDebtScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const passedCategoryId = params.category as string;
  const categoryName = params.categoryName as string;
  const activeModule = (params.module as string) || "Debt";
  const { addDebt, categories } = useTransactions();
  const { colors, isDark } = useTheme();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [debtType, setDebtType] = useState<"owes_me" | "i_owe">("owes_me");
  const [amount, setAmount] = useState("");
  const [contact, setContact] = useState("");
  const [concept, setConcept] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleAddDebt = async () => {
    const resolvedCategoryId = passedCategoryId || selectedCategoryId;

    if (!amount || !contact || !concept || !resolvedCategoryId) {
      alert("Please fill in all fields including category");
      return;
    }

    const direction = debtType === "owes_me" ? "right" : "left";

    await addDebt({
      person: contact,
      description: concept,
      date: formatDate(date),
      initialAmount: parseFloat(amount) || 0,
      direction: direction as "left" | "right",
      categoryId: resolvedCategoryId,
    });

    router.back();
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <SafeAreaView className="flex-1" edges={["bottom"]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <View className="flex-1 px-7">
            {/* Header */}
            <View className="flex-row items-center justify-between pt-6 pb-6 mt-4">
              <TouchableOpacity
                onPress={() => router.back()}
                className="p-2 -ml-2"
              >
                <Feather name="arrow-left" size={24} color={colors.foreground} />
              </TouchableOpacity>
              <Text className="text-[18px] font-bold tracking-widest uppercase" style={{ color: colors.foreground }}>
                {categoryName
                  ? categoryName
                  : `ADD ${activeModule.toUpperCase()}`}
              </Text>
              <View className="p-2 -mr-2 w-[40px]" />
            </View>

            <ScrollView
              className="flex-1"
              contentContainerStyle={{ paddingBottom: 40 }}
              showsVerticalScrollIndicator={false}
            >
            {/* Split View: Toggle on left, Icon representation on right */}
            <View className="flex-row items-center justify-between py-6">
              {/* Toggle Controls */}
              <View className="gap-y-4">
                <TouchableOpacity
                  onPress={() => setDebtType("owes_me")}
                  className="flex-row items-center gap-x-3"
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={
                      debtType === "owes_me"
                        ? "radio-button-on"
                        : "radio-button-off"
                    }
                    size={24}
                    color={colors.foreground}
                  />
                  <Text className="text-lg font-medium" style={{ color: colors.foreground }}>
                    Owes Me
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setDebtType("i_owe")}
                  className="flex-row items-center gap-x-3"
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={
                      debtType === "i_owe"
                        ? "radio-button-on"
                        : "radio-button-off"
                    }
                    size={24}
                    color={colors.foreground}
                  />
                  <Text className="text-lg font-medium" style={{ color: colors.foreground }}>I owe</Text>
                </TouchableOpacity>
              </View>

              {/* Visual Indicator */}
              <View className="flex-row items-center gap-x-4">
                <AntDesign
                  name={debtType === "owes_me" ? "arrow-left" : "arrow-right"}
                  size={32}
                  color={debtType === "owes_me" ? "#22C55E" : "#EF4444"}
                />
                <View className="w-20 h-20 rounded-full border-2 items-center justify-center" style={{ borderColor: colors.foreground + '33' }}>
                  <MaterialIcons
                    name="person-outline"
                    size={48}
                    color={colors.foreground}
                  />
                </View>
              </View>
            </View>

            {/* Inputs Container */}
            <View className="gap-y-4 mt-2">
              <View className="flex-row gap-x-3">
                {/* Amount Input */}
                <View className="flex-[2] rounded-2xl px-5 py-4" style={{ backgroundColor: colors.card }}>
                  <TextInput
                    placeholder="Amount"
                    placeholderTextColor={colors.muted}
                    className="text-lg font-bold"
                    style={{ color: colors.foreground }}
                    keyboardType="numeric"
                    value={amount}
                    onChangeText={setAmount}
                  />
                </View>
                {/* Currency Dropdown Placeholder */}
                <TouchableOpacity 
                  className="flex-1 rounded-2xl px-4 py-4 flex-row items-center justify-between"
                  style={{ backgroundColor: colors.card }}
                >
                  <Text className="text-base font-bold" style={{ color: colors.foreground }}>
                    PHP (₱)
                  </Text>
                  <Ionicons name="chevron-down" size={16} color={colors.foreground} />
                </TouchableOpacity>
              </View>

              {/* Contact Input */}
              <View className="rounded-2xl px-5 py-4" style={{ backgroundColor: colors.card }}>
                <TextInput
                  placeholder="Contact"
                  placeholderTextColor={colors.muted}
                  className="text-base font-medium"
                  style={{ color: colors.foreground }}
                  value={contact}
                  onChangeText={setContact}
                />
              </View>

              {/* Concept Input */}
              <View className="rounded-2xl px-5 py-4" style={{ backgroundColor: colors.card }}>
                <TextInput
                  placeholder="Concept"
                  placeholderTextColor={colors.muted}
                  className="text-base font-medium"
                  style={{ color: colors.foreground }}
                  value={concept}
                  onChangeText={setConcept}
                />
              </View>

              {/* Show Categories Grid ONLY if a specific category wasn't pre-selected via navigation */}
              {!passedCategoryId && (
                <>
                  <Text className="text-[20px] font-bold mt-4 mb-4" style={{ color: colors.foreground }}>
                    Categories
                  </Text>
                  <View className="flex-row flex-wrap" style={{ gap: 20 }}>
                    {categories.filter(
                      (c) => c.type.toLowerCase() === activeModule.toLowerCase()
                    ).length > 0 ? (
                      categories
                        .filter(
                          (c) =>
                            c.type.toLowerCase() === activeModule.toLowerCase()
                        )
                        .map((cat) => {
                          const isSelected = selectedCategoryId === cat.id;
                          return (
                            <TouchableOpacity
                              key={cat.id}
                              onPress={() => setSelectedCategoryId(cat.id)}
                              className="items-center"
                              style={{ width: "20%" }}
                            >
                              <View
                                className="w-16 h-16 rounded-full items-center justify-center mb-2 shadow-sm transform"
                                style={{
                                  backgroundColor: colors.card,
                                  borderWidth: isSelected ? 2 : 0,
                                  borderColor: isSelected
                                    ? cat.color
                                    : "transparent",
                                }}
                              >
                                <Feather
                                  name={cat.icon as any}
                                  size={24}
                                  color={cat.color}
                                />
                              </View>
                              <Text
                                className={`text-[13px] text-center ${
                                  isSelected
                                    ? "font-bold"
                                    : ""
                                }`}
                                style={{ color: isSelected ? colors.foreground : colors.muted }}
                                numberOfLines={1}
                              >
                                {cat.name}
                              </Text>
                            </TouchableOpacity>
                          );
                        })
                    ) : (
                      <View className="w-full items-center py-4">
                        <Text className="text-[15px] mb-4" style={{ color: colors.muted }}>
                          No debt categories found.
                        </Text>
                        <TouchableOpacity
                          onPress={() =>
                            router.push({
                              pathname: "/add-category",
                              params: { module: "Debt" },
                            })
                          }
                          className="px-4 py-2 border border-[#EF4444] rounded-xl"
                        >
                          <Text className="text-[#EF4444] font-bold">
                            + Create Debt Category
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </>
              )}
            </View>

            {/* Date Display */}
            <View className="flex-row items-center justify-between mt-8 px-2">
              <Text className="text-lg font-bold" style={{ color: colors.foreground }}>
                Created: {formatDate(date)}
              </Text>
              <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                <MaterialCommunityIcons name="pencil" size={24} color={colors.foreground} />
              </TouchableOpacity>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              className={`rounded-[15px] py-4 mt-10 items-center justify-center shadow-lg`}
              style={{
                backgroundColor: amount && contact && (passedCategoryId || selectedCategoryId)
                  ? "#EF4444"
                  : colors.card
              }}
              onPress={handleAddDebt}
              disabled={
                !amount || !contact || !(passedCategoryId || selectedCategoryId)
              }
            >
              <Text className="text-xl font-bold" style={{ color: amount && contact && (passedCategoryId || selectedCategoryId) ? '#fff' : colors.muted }}>+ Add Debt</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>

      <CalendarModal
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onSelectDate={(selectedDate) => setDate(selectedDate)}
        currentDate={date}
        title="Select Debt Date"
      />
    </View>
  );
}
