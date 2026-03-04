import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  LayoutAnimation,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Debt, useFinance } from "../../context/FinanceContext";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

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

function CollapsibleDebtSection({
  title,
  items,
  isOpen,
  onToggle,
  onPressItem,
}: {
  title: string;
  items: Debt[];
  isOpen: boolean;
  onToggle: () => void;
  onPressItem: (debt: Debt) => void;
}) {
  return (
    <View className="mb-6">
      <TouchableOpacity
        onPress={() => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          onToggle();
        }}
        className="flex-row items-center gap-x-2 px-7 py-2"
        activeOpacity={0.7}
      >
        <Text className="text-white text-xl font-bold">{title}</Text>
        <Ionicons
          name={isOpen ? "caret-down" : "caret-forward"}
          size={18}
          color="white"
        />
      </TouchableOpacity>

      {isOpen && (
        <View className="px-7 mt-2">
          {items.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => onPressItem(item)}
              activeOpacity={0.7}
              className="flex-row items-center justify-between py-4 bg-[#334155]/30 rounded-2xl px-4 mb-3 border border-[#475569]/50"
            >
              <View className="flex-row items-center gap-x-4">
                <View className="w-10 h-10 rounded-full bg-[#475569] items-center justify-center relative">
                  <Ionicons name="person-outline" size={20} color="white" />
                  <View
                    className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full items-center justify-center"
                    style={{
                      backgroundColor:
                        item.direction === "right" ? "#4ADE80" : "#F87171",
                    }}
                  >
                    <Ionicons
                      name={
                        item.direction === "right"
                          ? "arrow-forward"
                          : "arrow-back"
                      }
                      size={12}
                      color="white"
                    />
                  </View>
                </View>
                <View>
                  <Text className="text-white text-base font-bold">
                    {item.person}
                  </Text>
                  <Text className="text-slate-400 text-xs">{item.date}</Text>
                </View>
              </View>
              <Text className="text-white text-base font-bold">
                ₱
                {item.remainingAmount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

export default function DebtScreen() {
  const router = useRouter();
  const { debts, addPayment } = useFinance();
  const [isYourDebtsOpen, setIsYourDebtsOpen] = useState(true);
  const [isOthersDebtsOpen, setIsOthersDebtsOpen] = useState(true);
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");

  const yourDebtsData = debts.filter((d) => d.direction === "right");
  const othersDebtsData = debts.filter((d) => d.direction === "left");

  const totalOwesMe = yourDebtsData.reduce(
    (acc, d) => acc + d.remainingAmount,
    0,
  );
  const totalIOwe = othersDebtsData.reduce(
    (acc, d) => acc + d.remainingAmount,
    0,
  );
  const netBalance = totalOwesMe - totalIOwe;

  const formatCurrency = (value: number) => {
    return `₱${Math.abs(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleAddPayment = () => {
    if (!selectedDebt || !paymentAmount) return;
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) return;

    addPayment(selectedDebt.id, amount);
    setPaymentAmount("");
    // Optionally close modal or keep open to show updated state
    const updatedDebt = debts.find((d) => d.id === selectedDebt.id);
    if (updatedDebt) setSelectedDebt(updatedDebt);
  };

  // Sync selectedDebt UI when debts array changes
  useEffect(() => {
    if (selectedDebt) {
      const updated = debts.find((d) => d.id === selectedDebt.id);
      if (updated) setSelectedDebt(updated);
    }
  }, [debts]);

  return (
    <View className="flex-1 bg-[#1E293B]">
      <SafeAreaView className="flex-1" edges={["top"]}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View className="items-center pt-10 pb-8 px-7">
            <Text className="text-white text-5xl font-extrabold tracking-tight mb-1 text-center">
              {formatCurrency(50000)}{" "}
              {/* Placeholder, maybe sync with actual budget later */}
            </Text>
            <Text className="text-slate-300 text-xl font-medium">
              Overall Budget
            </Text>
          </View>

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
                    style={{
                      backgroundColor:
                        action.id === "debt" ? "#1E293B" : "#475569",
                      borderWidth: action.id === "debt" ? 1 : 0,
                      borderColor: "#475569",
                    }}
                  >
                    <Ionicons
                      name={action.icon}
                      size={22}
                      color={action.id === "debt" ? "#94A3B8" : "white"}
                    />
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

          {/* Collapsible Sections */}
          <CollapsibleDebtSection
            title="Owes Me"
            items={yourDebtsData}
            isOpen={isYourDebtsOpen}
            onToggle={() => setIsYourDebtsOpen(!isYourDebtsOpen)}
            onPressItem={(debt) => setSelectedDebt(debt)}
          />

          <CollapsibleDebtSection
            title="I Owe"
            items={othersDebtsData}
            isOpen={isOthersDebtsOpen}
            onToggle={() => setIsOthersDebtsOpen(!isOthersDebtsOpen)}
            onPressItem={(debt) => setSelectedDebt(debt)}
          />

          {/* Bottom Card - Debt Summary */}
          <View className="mx-7 mt-4">
            <View
              className="rounded-[30px] px-6 py-6"
              style={{
                backgroundColor: "#334155",
                borderWidth: 1,
                borderColor: "#475569",
              }}
            >
              <View className="flex-row items-center justify-between mb-6">
                <Text className="text-white text-2xl font-bold">Summary</Text>
                <TouchableOpacity
                  onPress={() => router.push("/add-debt")}
                  className="w-8 h-8 rounded-full bg-[#475569] items-center justify-center text-center"
                >
                  <Ionicons name="add" size={24} color="white" />
                </TouchableOpacity>
              </View>

              <View className="gap-y-4">
                <View className="flex-row justify-between items-center">
                  <Text className="text-slate-400 text-base font-semibold">
                    Owes Me
                  </Text>
                  <Text className="text-[#4ADE80] text-lg font-bold">
                    {formatCurrency(totalOwesMe)}
                  </Text>
                </View>

                <View className="flex-row justify-between items-center">
                  <Text className="text-slate-400 text-base font-semibold">
                    I Owe
                  </Text>
                  <Text className="text-[#F87171] text-lg font-bold">
                    {formatCurrency(totalIOwe)}
                  </Text>
                </View>

                <View className="h-[1px] bg-[#475569] my-1" />

                <View className="flex-row justify-between items-center">
                  <Text className="text-white text-lg font-bold">
                    Net Balance
                  </Text>
                  <Text
                    className={`text-lg font-bold ${netBalance >= 0 ? "text-[#4ADE80]" : "text-[#F87171]"}`}
                  >
                    {netBalance < 0 ? "-" : ""}
                    {formatCurrency(netBalance)}
                  </Text>
                </View>
              </View>
            </View>
            <Text className="text-slate-500 text-center mt-6 text-xs uppercase tracking-widest">
              Version 1.0
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* ── Debt Detail Modal ── */}
      <Modal
        visible={!!selectedDebt}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedDebt(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedDebt?.description}</Text>
              <TouchableOpacity
                onPress={() => setSelectedDebt(null)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 40 }}
            >
              {/* Info Rows */}
              <View style={styles.infoSection}>
                {/* Remaining Amount */}
                <View style={styles.infoRow}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="cash-outline" size={20} color="white" />
                  </View>
                  <View>
                    <Text style={styles.infoValue}>
                      {formatCurrency(selectedDebt?.remainingAmount || 0)}
                    </Text>
                    <Text style={styles.infoLabel}>Remaining Amount</Text>
                  </View>
                </View>

                <View style={styles.divider} />

                {/* Initial Amount */}
                <View style={styles.infoRow}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="wallet-outline" size={20} color="white" />
                  </View>
                  <View>
                    <Text style={styles.infoValue}>
                      {formatCurrency(selectedDebt?.initialAmount || 0)}
                    </Text>
                    <Text style={styles.infoLabel}>Initial Amount</Text>
                  </View>
                </View>

                <View style={styles.divider} />

                {/* Concept */}
                <View style={styles.infoRow}>
                  <View style={styles.iconContainer}>
                    <Ionicons
                      name="document-text-outline"
                      size={20}
                      color="white"
                    />
                  </View>
                  <View>
                    <Text style={styles.infoValue}>
                      {selectedDebt?.description}
                    </Text>
                    <Text style={styles.infoLabel}>Debt Concept</Text>
                  </View>
                </View>

                <View style={styles.divider} />

                {/* Debtor/Creditor Info */}
                <View style={styles.infoRow}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="person-outline" size={20} color="white" />
                  </View>
                  <View>
                    <Text style={styles.infoValue}>{selectedDebt?.person}</Text>
                    <Text style={styles.infoLabel}>
                      {selectedDebt?.direction === "left"
                        ? "This person is the creditor"
                        : "This person is the debtor"}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                {/* Creation Date */}
                <View style={styles.infoRow}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="calendar-outline" size={20} color="white" />
                  </View>
                  <View>
                    <Text style={styles.infoValue}>{selectedDebt?.date}</Text>
                    <Text style={styles.infoLabel}>Creation Date</Text>
                  </View>
                </View>

                <View style={styles.divider} />

                {/* State */}
                <View style={styles.infoRow}>
                  <View style={styles.iconContainer}>
                    <Ionicons
                      name={
                        selectedDebt?.status === "paid"
                          ? "checkmark-circle"
                          : "alert-circle"
                      }
                      size={20}
                      color={
                        selectedDebt?.status === "paid" ? "#4ADE80" : "#F87171"
                      }
                    />
                  </View>
                  <View>
                    <Text
                      style={[
                        styles.infoValue,
                        {
                          color:
                            selectedDebt?.status === "paid"
                              ? "#4ADE80"
                              : "#F87171",
                        },
                      ]}
                    >
                      {selectedDebt?.status === "paid"
                        ? "This debt is paid"
                        : "This debt is pending in payment"}
                    </Text>
                    <Text style={styles.infoLabel}>State</Text>
                  </View>
                </View>
              </View>

              {/* Add Payment Section */}
              {selectedDebt?.status === "pending" && (
                <View style={styles.paymentSection}>
                  <TextInput
                    style={styles.paymentInput}
                    placeholder="Enter payment amount"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    value={paymentAmount}
                    onChangeText={setPaymentAmount}
                  />
                  <TouchableOpacity
                    onPress={handleAddPayment}
                    style={styles.paymentButton}
                  >
                    <Text style={styles.paymentButtonText}>+ ADD PAYMENT</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Payments History */}
              <View style={styles.historySection}>
                <Text style={styles.historyTitle}>Payments Made</Text>
                {selectedDebt?.payments && selectedDebt.payments.length > 0 ? (
                  selectedDebt.payments.map((p) => (
                    <View key={p.id} style={styles.historyItem}>
                      <Text style={styles.historyDate}>{p.date}</Text>
                      <Text style={styles.historyAmount}>
                        {formatCurrency(p.amount)}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noHistory}>
                    No payments have been made yet
                  </Text>
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#1E293B",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    height: "90%",
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    marginBottom: 24,
    position: "relative",
  },
  modalTitle: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
  },
  closeButton: {
    position: "absolute",
    right: 24,
  },
  infoSection: {
    paddingHorizontal: 24,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#334155",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  infoValue: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  infoLabel: {
    color: "#94A3B8",
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginLeft: 56,
  },
  paymentSection: {
    marginTop: 32,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  paymentInput: {
    backgroundColor: "#334155",
    width: "100%",
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingVertical: 14,
    color: "white",
    fontSize: 16,
    marginBottom: 16,
  },
  paymentButton: {
    backgroundColor: "#64748B",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 15,
  },
  paymentButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  historySection: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  historyTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between" as const,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  historyDate: {
    color: "#94A3B8",
    flex: 1,
  },
  historyAmount: {
    color: "white",
    fontWeight: "bold",
  },
  noHistory: {
    color: "#64748B",
    textAlign: "center",
    fontStyle: "italic",
    marginTop: 10,
  },
});
