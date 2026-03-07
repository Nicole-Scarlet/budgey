import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BarChart } from 'react-native-gifted-charts';

// ─── Chart sizing ─────────────────────────────────────
// Bar charts size themselves by barWidth + spacing, not by a width prop,
// so they never overflow. We still pass width as a cap.
const BAR_WIDTH = 28;
const BAR_SPACING = 10;
const NUM_BARS = 7;
// Y-axis label column width (gifted-charts renders this outside the plot width)
const Y_AXIS_W = 36;

// ─── Data types (backend-ready) ───────────────────────
export type BarPoint = {
  value: number;
  label: string;
};

export type BarDataset = {
  color: string;
  label: string;
  data: BarPoint[];
};

// ─── Mock data ────────────────────────────────────────
const xLabels = ['M', 'T', 'W', 'Th', 'F', 'S', 'Su'];

// Transaction Activity – 3 categories, rendered as stacked bars
const transactionByDay: { food: number; transport: number; bills: number }[] = [
  { food: 6000,  transport: 10000, bills: 3000 },
  { food: 11000, transport: 6000,  bills: 4000 },
  { food: 8000,  transport: 12000, bills: 3600 },
  { food: 13000, transport: 5000,  bills: 7000 },
  { food: 16000, transport: 9000,  bills: 4400 },
  { food: 10000, transport: 14000, bills: 2000 },
  { food: 7000,  transport: 11000, bills: 5600 },
];

// gifted-charts stackData shape
const transactionStackData = transactionByDay.map((day, i) => ({
  label: xLabels[i],
  stacks: [
    { value: day.food,      color: '#FDBA74' },
    { value: day.transport, color: '#F87171' },
    { value: day.bills,     color: '#34D399' },
  ],
}));

const savingsData: BarPoint[] = [
  { value: 5000,  label: 'M'  },
  { value: 7000,  label: 'T'  },
  { value: 9000,  label: 'W'  },
  { value: 7600,  label: 'Th' },
  { value: 11000, label: 'F'  },
  { value: 14000, label: 'S'  },
  { value: 17000, label: 'Su' },
];

const expensesData: BarPoint[] = [
  { value: 12000, label: 'M'  },
  { value: 22000, label: 'T'  },
  { value: 16800, label: 'W'  },
  { value: 24000, label: 'Th' },
  { value: 14000, label: 'F'  },
  { value: 19200, label: 'S'  },
  { value: 28800, label: 'Su' },
];

// ─── Shared chart style props ─────────────────────────
const commonBarProps = {
  barWidth: BAR_WIDTH,
  spacing: BAR_SPACING,
  initialSpacing: 10,
  endSpacing: 6,
  noOfSections: 4,
  rulesColor: 'rgba(148,163,184,0.15)',
  rulesType: 'solid' as const,
  yAxisColor: 'transparent',
  xAxisColor: 'transparent',
  yAxisTextStyle: { color: '#94A3B8', fontSize: 9 },
  xAxisLabelTextStyle: { color: '#94A3B8', fontSize: 9 },
  yAxisLabelWidth: Y_AXIS_W,
  hideDataPoints: true,
  height: 130,
  backgroundColor: 'transparent',
  disableScroll: true,
  isAnimated: true,
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
  yAxisLabelSuffix = 'K',
  legend,
}: SimpleBarCardProps) {
  const barData = data.map((pt) => ({
    value: pt.value,
    label: pt.label,
    frontColor: barColor,
  }));

  return (
    <View className="mb-5 pt-6 pb-5 rounded-[30px]" style={{ backgroundColor: '#334155' }}>
      <Text className="text-white text-xl font-bold text-center px-6">{title}</Text>
      <Text className="text-slate-300 text-sm text-center mt-0.5 px-6">{dateRange}</Text>

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
            <Text className="text-slate-300 text-xs">{item.label}</Text>
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
  stackData: typeof transactionStackData;
  maxValue: number;
  yAxisLabelSuffix?: string;
  legend: { color: string; label: string }[];
}

function StackedBarCard({
  title,
  dateRange,
  stackData,
  maxValue,
  yAxisLabelSuffix = 'K',
  legend,
}: StackedBarCardProps) {
  return (
    <View className="mb-5 pt-6 pb-5 rounded-[30px]" style={{ backgroundColor: '#334155' }}>
      <Text className="text-white text-xl font-bold text-center px-6">{title}</Text>
      <Text className="text-slate-300 text-sm text-center mt-0.5 px-6">{dateRange}</Text>

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
            <Text className="text-slate-300 text-xs">{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────
export default function AnalyticsScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-[#1E293B]">
      <SafeAreaView className="flex-1" edges={['top']}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120, paddingTop: 8 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Transaction Activity – stacked bars */}
          <StackedBarCard
            title="Transaction Activity"
            dateRange="February 2 - February 8"
            stackData={transactionStackData}
            maxValue={30000}
            yAxisLabelSuffix="K"
            legend={[
              { color: '#FDBA74', label: 'Food' },
              { color: '#F87171', label: 'Transportation' },
              { color: '#34D399', label: 'Bills' },
            ]}
          />

          {/* Savings Activity */}
          <SimpleBarCard
            title="Savings Activity"
            dateRange="February 2 - February 8"
            data={savingsData}
            barColor="#818CF8"
            maxValue={20000}
            yAxisLabelSuffix="K"
            legend={[{ color: '#818CF8', label: 'Total Savings' }]}
          />

          {/* Total Expenses Activity */}
          <SimpleBarCard
            title="Total Expenses Activity"
            dateRange="February 2 - February 8"
            data={expensesData}
            barColor="#F87171"
            maxValue={40000}
            yAxisLabelSuffix="K"
            legend={[{ color: '#F87171', label: 'Expenses' }]}
          />

          {/* Want To Know More? */}
          <View className="mb-5 p-6 rounded-[30px]" style={{ backgroundColor: '#334155' }}>
            <Text className="text-white text-xl font-bold mb-3">
              Want To Know More?
            </Text>
            <Text className="text-slate-300 text-sm leading-6 mb-6">
              Get a clear picture of how your AI is performing. Dive into usage
              trends, accuracy rates, and time-saved metrics to see the real
              impact on your workflow.
            </Text>
            <TouchableOpacity
              className="rounded-full py-4 items-center bg-[#6366F1]"
              activeOpacity={0.8}
              onPress={() => router.push('/aichatbot' as any)}
            >
              <Text className="text-white font-bold text-base">Chat with AI Assistant</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
