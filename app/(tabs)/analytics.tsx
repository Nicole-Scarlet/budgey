import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTransactions } from '../../contexts/TransactionContext';
import { useTheme } from '../../contexts/ThemeContext';

// ─── Chart sizing ─────────────────────────────────────
const BAR_WIDTH = 28;
const BAR_SPACING = 10;
const Y_AXIS_W = 36;

// ─── Data types ───────────────────────
export type BarPoint = {
  value: number;
  label: string;
};

// ─── Simple bar card ──────────────────────────────────
interface SimpleBarCardProps {
  title: string;
  dateRange: string;
  data: BarPoint[];
  barColor: string;
  maxValue: number;
  yAxisLabelSuffix?: string;
  legend: { color: string; label: string }[];
}

function SimpleBarCard({
  title,
  dateRange,
  data,
  barColor,
  maxValue,
  yAxisLabelSuffix = '',
  legend,
}: SimpleBarCardProps) {
  const { colors } = useTheme();

  const commonBarProps = {
    barWidth: BAR_WIDTH,
    spacing: BAR_SPACING,
    initialSpacing: 10,
    endSpacing: 6,
    noOfSections: 4,
    rulesColor: colors.border + '26',
    rulesType: 'solid' as const,
    yAxisColor: 'transparent',
    xAxisColor: 'transparent',
    yAxisTextStyle: { color: colors.muted, fontSize: 9 },
    xAxisLabelTextStyle: { color: colors.muted, fontSize: 9 },
    yAxisLabelWidth: Y_AXIS_W,
    hideDataPoints: true,
    height: 130,
    backgroundColor: 'transparent',
    disableScroll: true,
    isAnimated: true,
  };

  const barData = data.map((pt) => ({
    value: pt.value,
    label: pt.label,
    frontColor: barColor,
  }));

  return (
    <View className="mb-5 pt-6 pb-5 rounded-[30px]" style={{ backgroundColor: colors.card }}>
      <Text className="text-xl font-bold text-center px-6" style={{ color: colors.foreground }}>{title}</Text>
      <Text className="text-sm text-center mt-0.5 px-6" style={{ color: colors.foreground + 'CC' }}>{dateRange}</Text>

      <View className="mt-4 px-3">
        <BarChart
          {...commonBarProps}
          data={barData}
          maxValue={maxValue}
          yAxisLabelSuffix={yAxisLabelSuffix}
          barBorderRadius={6}
        />
      </View>

      <View className="flex-row justify-center gap-x-5 mt-3 flex-wrap px-6">
        {legend.map((item, i) => (
          <View key={i} className="flex-row items-center gap-x-1.5">
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: item.color }} />
            <Text className="text-xs" style={{ color: colors.foreground + 'CC' }}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Stacked bar card ─────────────────────────────────
interface StackedBarCardProps {
  title: string;
  dateRange: string;
  stackData: any[];
  maxValue: number;
  yAxisLabelSuffix?: string;
  legend: { color: string; label: string }[];
}

function StackedBarCard({
  title,
  dateRange,
  stackData,
  maxValue,
  yAxisLabelSuffix = '',
  legend,
}: StackedBarCardProps) {
  const { colors } = useTheme();

  const commonBarProps = {
    barWidth: BAR_WIDTH,
    spacing: BAR_SPACING,
    initialSpacing: 10,
    endSpacing: 6,
    noOfSections: 4,
    rulesColor: colors.border + '26',
    rulesType: 'solid' as const,
    yAxisColor: 'transparent',
    xAxisColor: 'transparent',
    yAxisTextStyle: { color: colors.muted, fontSize: 9 },
    xAxisLabelTextStyle: { color: colors.muted, fontSize: 9 },
    yAxisLabelWidth: Y_AXIS_W,
    hideDataPoints: true,
    height: 130,
    backgroundColor: 'transparent',
    disableScroll: true,
    isAnimated: true,
  };

  return (
    <View className="mb-5 pt-6 pb-5 rounded-[30px]" style={{ backgroundColor: colors.card }}>
      <Text className="text-xl font-bold text-center px-6" style={{ color: colors.foreground }}>{title}</Text>
      <Text className="text-sm text-center mt-0.5 px-6" style={{ color: colors.foreground + 'CC' }}>{dateRange}</Text>

      <View className="mt-4 px-3">
        <BarChart
          {...commonBarProps}
          stackData={stackData}
          maxValue={maxValue}
          yAxisLabelSuffix={yAxisLabelSuffix}
          roundedTop
        />
      </View>

      <View className="flex-row justify-center gap-x-5 mt-3 flex-wrap px-6">
        {legend.map((item, i) => (
          <View key={i} className="flex-row items-center gap-x-1.5">
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: item.color }} />
            <Text className="text-xs" style={{ color: colors.foreground + 'CC' }}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────
export default function AnalyticsScreen() {
  const router = useRouter();
  const { transactions, categories } = useTransactions();
  const { colors, isDark } = useTheme();

  const chartData = useMemo(() => {
    // 1. Get last 7 days
    const days = [];
    const now = new Date();
    // Start from beginning of day to avoid time-of-day offsets
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      days.push(d);
    }

    const dayLabelsDict = ['Su', 'M', 'T', 'W', 'Th', 'F', 'Sa'];
    const dateStrings = days.map(d => d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }));
    const labels = days.map(d => dayLabelsDict[d.getDay()]);

    const dateRangeStr = `${dateStrings[0].split(',')[0]} - ${dateStrings[6].split(',')[0]}`;

    // 2. Filter transactions for these days
    const last7DaysTxs = transactions.filter(t => {
      try {
        // Robust matching: compare normalized date strings
        return dateStrings.some(ds => ds === t.date);
      } catch (e) {
        return false;
      }
    });

    // 3. Find top 3 expense categories for these days
    const expenseTxs = last7DaysTxs.filter(t => t.type === 'expense');
    const categoryTotals: Record<string, number> = {};
    expenseTxs.forEach(t => {
      const cid = t.categoryId || 'other';
      categoryTotals[cid] = (categoryTotals[cid] || 0) + t.amount;
    });

    const top3CatIds = Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([id]) => id);

    const legend = top3CatIds.map(id => {
      const cat = categories.find(c => c.id === id);
      return {
        id,
        label: cat?.name || 'Other',
        color: cat?.color || '#94A3B8'
      };
    });

    if (legend.length === 0) {
        legend.push({ id: 'none', label: 'No Expenses', color: '#94A3B8' });
    }

    // 4. Build StackData for Transaction Activity (Expenses)
    const stackData = days.map((day, idx) => {
      const dateStr = dateStrings[idx];
      const stacks = legend.map(l => {
        const val = last7DaysTxs
          .filter(t => t.date === dateStr && (t.categoryId || 'other') === l.id && t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);
        return { value: val, color: l.color };
      });

      return {
        label: labels[idx],
        stacks
      };
    });

    // 5. Build Savings (Savings + Investment) and Expenses data
    const dailySavings = days.map((day, idx) => {
      const dateStr = dateStrings[idx];
      const val = last7DaysTxs
        .filter(t => t.date === dateStr && (t.type === 'savings' || t.type === 'investment'))
        .reduce((sum, t) => sum + t.amount, 0);
      return { value: val, label: labels[idx] };
    });

    const dailyExpenses = days.map((day, idx) => {
      const dateStr = dateStrings[idx];
      const val = last7DaysTxs
        .filter(t => t.date === dateStr && t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      return { value: val, label: labels[idx] };
    });

    const dailyIncome = days.map((day, idx) => {
      const dateStr = dateStrings[idx];
      const val = last7DaysTxs
        .filter(t => t.date === dateStr && t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      return { value: val, label: labels[idx] };
    });

    // 6. Max values for scaling
    const calcMax = (data: any[], key: string = 'value') => {
        const currentMax = Math.max(...data.map(d => d[key] || 0), 1000);
        return Math.ceil((currentMax * 1.2) / 1000) * 1000;
    };

    const stackMaxVal = Math.max(...stackData.map(d => d.stacks.reduce((s, i) => s + i.value, 0)), 1000);
    const scaledStackMax = Math.ceil((stackMaxVal * 1.2) / 1000) * 1000;

    return {
      dateRange: dateRangeStr,
      stackData,
      legend,
      savingsData: dailySavings,
      expensesData: dailyExpenses,
      incomeData: dailyIncome,
      stackMax: scaledStackMax,
      savingsMax: calcMax(dailySavings),
      expensesMax: calcMax(dailyExpenses),
      incomeMax: calcMax(dailyIncome),
    };
  }, [transactions, categories]);

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <SafeAreaView className="flex-1" edges={['top']}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120, paddingTop: 8 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View className="mb-6">
            <Text className="text-3xl font-bold" style={{ color: colors.foreground }}>Analytics</Text>
            <Text className="mt-1" style={{ color: colors.muted }}>Real-time financial metrics</Text>
          </View>

          {/* Transaction Activity – stacked bars */}
          <StackedBarCard
            title="Transaction Activity"
            dateRange={chartData.dateRange}
            stackData={chartData.stackData}
            maxValue={chartData.stackMax}
            legend={chartData.legend}
          />

          {/* Savings Activity (Savings + Investments) */}
          <SimpleBarCard
            title="Savings Activity"
            dateRange={chartData.dateRange}
            data={chartData.savingsData}
            barColor="#818CF8"
            maxValue={chartData.savingsMax}
            legend={[{ color: '#818CF8', label: 'Savings & Investments' }]}
          />

          {/* Income Activity */}
          <SimpleBarCard
            title="Income Activity"
            dateRange={chartData.dateRange}
            data={chartData.incomeData}
            barColor="#10B981"
            maxValue={chartData.incomeMax}
            legend={[{ color: '#10B981', label: 'Total Income' }]}
          />

          {/* Total Expenses Activity */}
          <SimpleBarCard
            title="Total Expenses Activity"
            dateRange={chartData.dateRange}
            data={chartData.expensesData}
            barColor="#F87171"
            maxValue={chartData.expensesMax}
            legend={[{ color: '#F87171', label: 'Expenses' }]}
          />

          {/* Want To Know More? */}
          <View className="mb-5 p-6 rounded-[30px]" style={{ backgroundColor: colors.card }}>
            <Text className="text-xl font-bold mb-3" style={{ color: colors.foreground }}>
              Want To Know More?
            </Text>
            <Text className="text-sm leading-6 mb-6" style={{ color: colors.foreground + 'CC' }}>
              Get a clear picture of how your finances are performing. Dive into spending
              trends, saving rates, and category metrics to see the real
              impact on your budget.
            </Text>
            <TouchableOpacity
              className="rounded-full py-4 items-center bg-[#6366F1]"
              activeOpacity={0.8}
              onPress={() => router.push('/aichatbot' as any)}
            >
              <Text className="text-white font-bold text-base">Chat with Assistant</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
