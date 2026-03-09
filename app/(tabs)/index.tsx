import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as React from "react";
import { Keyboard, Modal, Pressable, ScrollView, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import CircularProgress from "../../components/CircularProgress";
import { GoalPeriod, useTransactions } from "../../contexts/TransactionContext";
import { useProfile } from "../../contexts/ProfileContext";
import { useTheme } from "../../contexts/ThemeContext";

const HomePage = () => {
  const router = useRouter();
  const {
    transactions,
    categories: globalCategories,
    getTotalBalance,
    getTotalByType,
    savingsGoal,
    savingsGoalPeriod,
    expenseGoal,
    expenseGoalPeriod,
    debtLimit,
    debtLimitPeriod,
    investmentLimit,
    investmentLimitPeriod,
    incomeGoal,
    budget,
    budgetPeriod,
    setBudget,
    setBudgetPeriod,
    subtractSavingsFromBudget,
    setSubtractSavingsFromBudget,
    subtractInvestmentFromBudget,
    setSubtractInvestmentFromBudget,
    subtractDebtFromBudget,
    setSubtractDebtFromBudget
  } = useTransactions();
  const { profile } = useProfile();
  const { colors, isDark } = useTheme();
  const { bottom } = useSafeAreaInsets();

  const [isBudgetModalVisible, setIsBudgetModalVisible] = React.useState(false);
  const [tempBudget, setTempBudget] = React.useState('');
  const [tempPeriod, setTempPeriod] = React.useState<GoalPeriod>('Monthly');
  const [tempSubtractSavings, setTempSubtractSavings] = React.useState(true);
  const [tempSubtractInvestment, setTempSubtractInvestment] = React.useState(true);
  const [tempSubtractDebt, setTempSubtractDebt] = React.useState(true);

  const totalIncome = getTotalByType('income');
  const baseForPercentage = totalIncome > 0 ? totalIncome : 1;

  // Real data for Top 5 Expenses
  const expenseTransactions = transactions.filter(t => t.type === 'expense');
  const sortedExpenses = [...expenseTransactions].sort((a, b) => b.amount - a.amount);
  const topExpenses = sortedExpenses.slice(0, 5);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>

        <View className="px-8 pt-8 flex-row justify-between items-center">
          <View>
            <Text className="text-5xl font-bold" style={{ color: colors.foreground }}>Hi, {profile.firstName}</Text>
          </View>
          <View className="flex-row items-center gap-x-4">
            <Pressable 
              onPress={() => router.push('/wishlist' as any)}
              className="p-2 rounded-full border"
              style={{ backgroundColor: colors.card, borderColor: colors.border }}
            >
              <Ionicons name="heart-outline" size={24} color={colors.foreground} />
            </Pressable>
            <Pressable
              onPress={() => {
                // TODO: Open multi-user menu
              }}
              className="p-2 rounded-full border"
              style={{ backgroundColor: colors.card, borderColor: colors.border }}
            >
              <Ionicons name="menu" size={24} color={colors.foreground} />
            </Pressable>
          </View>
        </View>

        {/* Balance Card */}
        <View className="px-8 mt-10">
          <View 
            style={{ backgroundColor: colors.card, borderColor: colors.border }}
            className="p-8 rounded-[25px] border shadow-2xl"
          >
            <Pressable
              onPress={() => {
                setTempBudget(budget > 0 ? budget.toString() : '');
                setTempPeriod(budget > 0 ? budgetPeriod : 'Monthly');
                setTempSubtractSavings(subtractSavingsFromBudget);
                setTempSubtractInvestment(subtractInvestmentFromBudget);
                setTempSubtractDebt(subtractDebtFromBudget);
                setIsBudgetModalVisible(true);
              }}
            >
              <View className="flex-row items-center justify-between">
                <Text className="text-lg font-medium" style={{ color: colors.muted }}>Overall Budget</Text>
              </View>
              <Text className="text-5xl font-bold mt-2" style={{ color: colors.foreground }}>
                ₱{(budget + getTotalBalance()).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </Text>

              {budget > 0 && (
                <Text className="text-[#4ADE80] font-medium text-sm mt-3">
                  Limit: ₱{budget.toLocaleString('en-US', { minimumFractionDigits: 2 })} / {budgetPeriod}
                </Text>
              )}
            </Pressable>

            <View 
                className="flex-row justify-between mt-10 pt-8 border-t"
                style={{ borderTopColor: colors.border + '33' }}
            >
              <View className="items-center">
                <View className="flex-row items-center gap-x-2">
                  <View className="bg-green-500/20 p-1.5 rounded-full">
                    <Ionicons name="arrow-up" size={14} color="#22c55e" />
                  </View>
                  <Text className="text-sm" style={{ color: colors.muted }}>Income</Text>
                </View>
                <Text className="text-xl font-bold mt-1" style={{ color: colors.foreground }}>₱{getTotalByType('income').toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
              </View>
              <View className="items-center">
                <View className="flex-row items-center gap-x-2">
                  <View className="bg-red-500/20 p-1.5 rounded-full">
                    <Ionicons name="arrow-down" size={14} color="#ef4444" />
                  </View>
                  <Text className="text-sm" style={{ color: colors.muted }}>Expenses</Text>
                </View>
                <Text className="text-xl font-bold mt-1" style={{ color: colors.foreground }}>₱{getTotalByType('expense').toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Top Expenses Section */}
        <View className="mt-12">
          <View className="flex-row justify-between items-center px-8 mb-6">
            <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>Top 5 Expenses</Text>
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
                    style={{ backgroundColor: colors.card, borderColor: colors.border }}
                    className="w-[130px] h-[160px] p-4 rounded-[25px] border mr-4 justify-between"
                  >
                    <View className="w-full items-center mt-1">
                      <View 
                        className="w-14 h-14 rounded-full items-center justify-center"
                        style={{ backgroundColor: colors.background }}
                      >
                        <Text className="font-bold text-3xl" style={{ color: colors.foreground }}>{index + 1}</Text>
                      </View>
                    </View>
                    <View className="items-center flex-1 w-full flex-col mt-4">
                      <View className="h-10 justify-center">
                        <Text className="font-bold text-center" style={{ color: colors.foreground }} numberOfLines={2}>{item.title}</Text>
                      </View>
                      <Text className="mt-auto font-medium text-[13px] pb-1" style={{ color: colors.muted }}>₱{item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
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
            <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>Summary</Text>
            <Ionicons name="options-outline" size={24} color={colors.muted} />
          </View>

          <View 
            className="rounded-[25px] p-6 border"
            style={{ backgroundColor: colors.card, borderColor: colors.border }}
          >
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
                  : 0
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
                  : 0
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
                  : 0
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
                  : 0
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
                  : 0
              }
              onPress={() => router.push('/add-investment' as any)}
            />
          </View>
        </View>
      </ScrollView>

      {/* Budget Modal */}
      <Modal
        visible={isBudgetModalVisible}
        transparent
        animationType="fade"
        statusBarTranslucent={true}
        onRequestClose={() => setIsBudgetModalVisible(false)}
      >
        <Pressable
          className="flex-1 bg-black/60 justify-center items-center px-4"
          onPress={() => {
            Keyboard.dismiss();
            setIsBudgetModalVisible(false);
          }}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View 
                className="w-full p-6 rounded-[25px] border"
                style={{ backgroundColor: colors.card, borderColor: colors.border }}
            >
              <Text className="text-xl font-bold mb-4" style={{ color: colors.foreground }}>Set Overall Budget</Text>

              <View 
                className="flex-row items-center rounded-xl px-4 py-3 mb-4 border"
                style={{ backgroundColor: colors.background, borderColor: colors.border }}
              >
                <Text style={{ color: colors.muted }} className="text-lg mr-2">₱</Text>
                <TextInput
                  className={`flex-1 text-lg font-medium`}
                  style={{ color: colors.foreground }}
                  placeholder="0.00"
                  placeholderTextColor={colors.muted}
                  keyboardType="numeric"
                  value={tempBudget}
                  onChangeText={(text) => setTempBudget(text.replace(/[^0-9.]/g, ''))}
                />
              </View>

              {parseFloat(tempBudget) > 1000000000 && (
                <Text className="text-red-400 text-xs mb-4 ml-1">Maximum limit is ₱1,000,000,000</Text>
              )}

              <Text className="text-sm mb-3" style={{ color: colors.muted }}>Does this limit apply Daily, Weekly, or Monthly?</Text>
              <View 
                className="flex-row rounded-xl p-1 mb-6 border"
                style={{ backgroundColor: colors.background, borderColor: colors.border }}
              >
                {['Daily', 'Weekly', 'Monthly'].map((period) => (
                  <Pressable
                    key={`${period}-budget`}
                    onPress={() => setTempPeriod(period as any)}
                    className={`flex-1 py-2.5 rounded-lg items-center ${tempPeriod === period ? (isDark ? 'bg-[#334155]' : 'bg-slate-200') : ''}`}
                  >
                    <Text className={`font-medium ${tempPeriod === period ? (isDark ? 'text-white' : 'text-slate-900') : 'text-slate-400'}`}>
                      {period}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <View className="mb-8">
                <Text className="text-slate-400 text-sm mb-4">Subtract calculations from Overall Budget:</Text>

                <Pressable
                  onPress={() => setTempSubtractSavings(!tempSubtractSavings)}
                  className="flex-row items-center justify-between py-2"
                >
                  <View className="flex-row items-center gap-x-3">
                    <View className="bg-[#3B82F6]/20 p-2 rounded-lg">
                      <MaterialCommunityIcons name="piggy-bank" size={20} color="#3B82F6" />
                    </View>
                    <Text className="text-white font-medium">Subtract Savings</Text>
                  </View>
                  <View className={`w-12 h-6 rounded-full px-1 justify-center ${tempSubtractSavings ? 'bg-[#4ADE80]' : 'bg-[#334155]'}`}>
                    <View className={`w-4 h-4 rounded-full bg-white ${tempSubtractSavings ? 'ml-6' : 'ml-0'}`} />
                  </View>
                </Pressable>

                <Pressable
                  onPress={() => setTempSubtractDebt(!tempSubtractDebt)}
                  className="flex-row items-center justify-between py-2 mt-2"
                >
                  <View className="flex-row items-center gap-x-3">
                    <View className="bg-[#EF4444]/20 p-2 rounded-lg">
                      <MaterialCommunityIcons name="receipt-outline" size={20} color="#EF4444" />
                    </View>
                    <Text className="text-white font-medium">Subtract Debt</Text>
                  </View>
                  <View className={`w-12 h-6 rounded-full px-1 justify-center ${tempSubtractDebt ? 'bg-[#4ADE80]' : 'bg-[#334155]'}`}>
                    <View className={`w-4 h-4 rounded-full bg-white ${tempSubtractDebt ? 'ml-6' : 'ml-0'}`} />
                  </View>
                </Pressable>

                <Pressable
                  onPress={() => setTempSubtractInvestment(!tempSubtractInvestment)}
                  className="flex-row items-center justify-between py-2 mt-2"
                >
                  <View className="flex-row items-center gap-x-3">
                    <View className="bg-[#A855F7]/20 p-2 rounded-lg">
                      <MaterialCommunityIcons name="trending-up" size={20} color="#A855F7" />
                    </View>
                    <Text className="text-white font-medium">Subtract Investment</Text>
                  </View>
                  <View className={`w-12 h-6 rounded-full px-1 justify-center ${tempSubtractInvestment ? 'bg-[#4ADE80]' : 'bg-[#334155]'}`}>
                    <View className={`w-4 h-4 rounded-full bg-white ${tempSubtractInvestment ? 'ml-6' : 'ml-0'}`} />
                  </View>
                </Pressable>
              </View>

              <View className="flex-row justify-end space-x-3 gap-x-3">
                <Pressable
                  onPress={() => setIsBudgetModalVisible(false)}
                  className="px-6 py-3 rounded-xl bg-[#334155]"
                >
                  <Text className="text-white font-medium">Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={async () => {
                    const parsedBudget = parseFloat(tempBudget.replace(/[^0-9.-]+/g, ''));
                    if (!isNaN(parsedBudget) && parsedBudget >= 0 && parsedBudget <= 1000000000) {
                      await setBudget(parsedBudget);
                      await setBudgetPeriod(tempPeriod);
                      await setSubtractSavingsFromBudget(tempSubtractSavings);
                      await setSubtractInvestmentFromBudget(tempSubtractInvestment);
                      await setSubtractDebtFromBudget(tempSubtractDebt);
                      setIsBudgetModalVisible(false);
                    }
                  }}
                  disabled={parseFloat(tempBudget) > 1000000000}
                  className={`px-6 py-3 rounded-xl ${parseFloat(tempBudget) > 1000000000 ? 'bg-[#4ADE80]/30' : 'bg-[#4ADE80]'}`}
                >
                  <Text className={`font-bold ${parseFloat(tempBudget) > 1000000000 ? 'text-[#0F172A]/50' : 'text-[#0F172A]'}`}>Save</Text>
                </Pressable>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Pressable>
      </Modal>
    </SafeAreaView >
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
  const { colors } = useTheme();
  const getProgressColor = () => {
    if (category === 'expense' || category === 'debt') {
      if (percentage < 25) return '#4ADE80'; // Green
      if (percentage < 50) return '#EAB308'; // Yellow
      if (percentage < 75) return '#F97316'; // Orange
      return '#EF4444'; // Red
    } else if (category === 'savings') {
      if (percentage >= 75) return '#4ADE80'; // Green
      if (percentage >= 50) return '#EAB308'; // Yellow
      if (percentage >= 25) return '#F97316'; // Orange
      return '#EF4444'; // Red
    } else {
      return '#4ADE80'; // Default Green (Income/Investment)
    }
  };

  const isDanger = () => {
    if (category === 'expense' || category === 'debt') return percentage >= 75;
    if (category === 'savings') return percentage < 25;
    return false;
  };

  return (
    <View className="flex-row items-center justify-between py-4">
      <View
        className="flex-row items-center gap-x-6 flex-1"
      >
        <CircularProgress
          size={60}
          strokeWidth={5}
          percentage={percentage}
          color={getProgressColor()}
        >
          <View style={{ backgroundColor: color }} className="w-10 h-10 rounded-full items-center justify-center">
            <MaterialCommunityIcons name={icon} size={22} color="#fff" />
          </View>

          {isDanger() && (
            <View 
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full items-center justify-center border-2"
                style={{ backgroundColor: '#EF4444', borderColor: colors.card }}
            >
              <Text className="text-white text-[10px] font-bold">!</Text>
            </View>
          )}
        </CircularProgress>

        <View>
          <Text className="font-bold text-lg" style={{ color: colors.foreground }}>{title}</Text>
          <Text className="text-sm" style={{ color: colors.muted }}>
            {limit > 0
              ? `₱${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} / ₱${limit.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
              : `₱${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          </Text>
        </View>
      </View>
      <Pressable
        onPress={onPress}
        style={{ backgroundColor: colors.background, borderColor: colors.border }}
        className="w-10 h-10 rounded-full items-center justify-center border active:opacity-70"
      >
        <Ionicons name="add" size={24} color={colors.foreground} />
      </Pressable>
    </View>
  );
};

const Divider = () => {
  const { colors } = useTheme();
  return <View className="h-[1px]" style={{ backgroundColor: colors.border + '33' }} />;
};

export default HomePage;
