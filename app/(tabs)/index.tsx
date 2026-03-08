import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import CircularProgress from "../../components/CircularProgress";
import { GoalPeriod, useTransactions } from "../../contexts/TransactionContext";

const HomePage = () => {
  const router = useRouter();
  const { transactions, categories: globalCategories, getTotalBalance, getTotalByType, savingsGoal, savingsGoalPeriod, expenseGoal, expenseGoalPeriod, debtLimit, debtLimitPeriod, investmentLimit, investmentLimitPeriod, incomeGoal, budget } = useTransactions();
  const { bottom } = useSafeAreaInsets();

  const totalIncome = getTotalByType('income');
  const baseForPercentage = totalIncome > 0 ? totalIncome : 1;

  // Real data for Top 5 Expenses
  const expenseTransactions = transactions.filter(t => t.type === 'expense');
  const sortedExpenses = [...expenseTransactions].sort((a, b) => b.amount - a.amount);
  const topExpenses = sortedExpenses.slice(0, 5);

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
            <View className="flex-row items-center justify-between">
              <Text className="text-slate-300 text-lg font-medium">Overall Budget</Text>
            </View>
            <Text className="text-white text-5xl font-bold mt-2">
              ₱{(budget + getTotalBalance()).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>

            <View className="flex-row justify-between mt-10 pt-8 border-t border-[#90A1B9]/30">
              <View className="items-center">
                <View className="flex-row items-center gap-x-2">
                  <View className="bg-green-500/20 p-1.5 rounded-full">
                    <Ionicons name="arrow-up" size={14} color="#22c55e" />
                  </View>
                  <Text className="text-slate-300 text-sm">Income</Text>
                </View>
                <Text className="text-white text-xl font-bold mt-1">₱{getTotalByType('income').toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
              </View>
              <View className="items-center">
                <View className="flex-row items-center gap-x-2">
                  <View className="bg-red-500/20 p-1.5 rounded-full">
                    <Ionicons name="arrow-down" size={14} color="#ef4444" />
                  </View>
                  <Text className="text-slate-300 text-sm">Expenses</Text>
                </View>
                <Text className="text-white text-xl font-bold mt-1">₱{getTotalByType('expense').toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Top Expenses Section */}
        <View className="mt-12">
          <View className="flex-row justify-between items-center px-8 mb-6">
            <Text className="text-white text-2xl font-bold">Top 5 Expenses</Text>
          </View>

          {topExpenses.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: 32, paddingRight: 16 }}
            >
              {topExpenses.map((item, index) => {
                const category = globalCategories.find(c => c.id === item.categoryId);
                const iconFamily = category ? 'feather' : 'material';
                const iconName = category ? category.icon : 'cart-outline';
                const iconColor = category ? category.color : '#EF4444';

                return (
                  <View
                    key={item.id}
                    className="bg-[#334155] w-[130px] h-[160px] p-4 rounded-[25px] border border-[#90A1B9] mr-4 justify-between"
                  >
                    <View className="w-full items-center mt-1">
                      <View className="w-14 h-14 rounded-full bg-[#475569] items-center justify-center">
                        <Text className="text-white font-bold text-3xl">{index + 1}</Text>
                      </View>
                    </View>
                    <View className="items-center flex-1 w-full flex-col mt-4">
                      <View className="h-10 justify-center">
                        <Text className="text-white font-bold text-center" numberOfLines={2}>{item.title}</Text>
                      </View>
                      <Text className="text-[#94A3B8] mt-auto font-medium text-[13px] pb-1">₱{item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          ) : (
            <View className="items-center justify-center h-[160px] w-full">
              <Text className="text-slate-400">No expenses recorded yet.</Text>
            </View>
          )}
        </View>

        {/* Summary Section */}
        <View className="px-8 mt-12" style={{ marginBottom: bottom + 115 }}>
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-white text-2xl font-bold">Summary</Text>
            <Ionicons name="options-outline" size={24} color="#90A1B9" />
          </View>

          <View className="bg-[#334155] rounded-[25px] p-6 border border-[#90A1B9]">
            <SummaryItem
              icon="cart-outline"
              color="#F97316"
              title="Expenses"
              amount={getTotalByType('expense')}
              limit={expenseGoal}
              period={expenseGoalPeriod}
              category="expense"
              percentage={
                expenseGoal > 0
                  ? Math.min(100, (getTotalByType('expense') / expenseGoal) * 100)
                  : Math.min(100, (getTotalByType('expense') / baseForPercentage) * 100)
              }
              onPress={() => router.push('/add-expense' as any)}
            />
            <Divider />
            <SummaryItem
              icon="wallet-outline"
              color="#22C55E"
              title="Income"
              amount={totalIncome}
              limit={incomeGoal}
              period={null} // Income goal period is not tracked in useTransactions currently
              category="income"
              percentage={
                incomeGoal > 0
                  ? Math.min(100, (totalIncome / incomeGoal) * 100)
                  : Math.min(100, (totalIncome / baseForPercentage) * 100)
              }
              onPress={() => router.push('/add-income' as any)}
            />
            <Divider />
            <SummaryItem
              icon="piggy-bank-outline"
              color="#3B82F6"
              title="Savings"
              amount={getTotalByType('savings')}
              limit={savingsGoal}
              period={savingsGoalPeriod}
              category="savings"
              percentage={
                savingsGoal > 0
                  ? Math.min(100, (getTotalByType('savings') / savingsGoal) * 100)
                  : Math.min(100, (getTotalByType('savings') / baseForPercentage) * 100)
              }
              onPress={() => router.push('/add-savings' as any)}
            />
            <Divider />
            <SummaryItem
              icon="receipt-outline"
              color="#EF4444"
              title="Debt"
              amount={getTotalByType('debt')}
              limit={debtLimit}
              period={debtLimitPeriod}
              category="debt"
              percentage={
                debtLimit > 0
                  ? Math.min(100, (getTotalByType('debt') / debtLimit) * 100)
                  : Math.min(100, (getTotalByType('debt') / baseForPercentage) * 100)
              }
              onPress={() => router.push('/add-debt' as any)}
            />
            <Divider />
            <SummaryItem
              icon="trending-up"
              color="#A855F7"
              title="Investment"
              amount={getTotalByType('investment')}
              limit={investmentLimit}
              period={investmentLimitPeriod}
              category="income" // Keeping original category prop for logic
              percentage={
                investmentLimit > 0
                  ? Math.min(100, (getTotalByType('investment') / investmentLimit) * 100)
                  : Math.min(100, (getTotalByType('investment') / baseForPercentage) * 100)
              }
              onPress={() => router.push('/add-investment' as any)}
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
  amount,
  limit,
  period,
  category,
  percentage,
  onPress,
}: {
  icon: any,
  color: string,
  title: string,
  amount: number,
  limit: number,
  period: GoalPeriod | null,
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
      <View
        className="flex-row items-center gap-x-6 flex-1"
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
          <Text className="text-slate-400 text-sm">
            {limit > 0
              ? `₱${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} / ₱${limit.toLocaleString('en-US', { minimumFractionDigits: 2 })} ${period ? period : 'Goal'}`
              : `₱${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          </Text>
        </View>
      </View>
      <Pressable
        onPress={onPress}
        className="bg-[#1E293B] w-10 h-10 rounded-full items-center justify-center border border-[#90A1B9] active:opacity-70"
      >
        <Ionicons name="add" size={24} color="white" />
      </Pressable>
    </View>
  );
};

const Divider = () => <View className="h-[1px] bg-[#90A1B9]/20" />;

export default HomePage;
