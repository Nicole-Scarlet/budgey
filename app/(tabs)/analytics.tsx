import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Mock data for the charts
const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const ChartCard = ({ title, dateRange, children, legend }: { 
  title: string, 
  dateRange: string, 
  children: React.ReactNode,
  legend?: { color: string, label: string }[] 
}) => (
  <View className="bg-[#1E293B] rounded-[24px] p-6 mb-6 border border-slate-700/50 shadow-lg">
    <View className="flex-row justify-between items-start mb-4">
      <View>
        <Text className="text-white text-xl font-bold">{title}</Text>
        <Text className="text-slate-400 text-sm mt-1">{dateRange}</Text>
      </View>
      <TouchableOpacity className="p-2 bg-slate-800/50 rounded-full">
        <Ionicons name="ellipsis-horizontal" size={20} color="#94A3B8" />
      </TouchableOpacity>
    </View>
    
    <View className="h-40 w-full mb-4">
      {children}
    </View>

    {legend && (
      <View className="flex-row flex-wrap gap-x-4 gap-y-2 mt-2">
        {legend.map((item, index) => (
          <View key={index} className="flex-row items-center">
            <View className={`w-3 h-3 rounded-full mr-2`} style={{ backgroundColor: item.color }} />
            <Text className="text-slate-300 text-xs">{item.label}</Text>
          </View>
        ))}
      </View>
    )}
  </View>
);

// Simple mock chart component
const MockLineChart = ({ colors, multi }: { colors: string[], multi?: boolean }) => {
  return (
    <View className="flex-1 justify-end">
      {/* Y-Axis Labels */}
      <View className="absolute left-0 top-0 bottom-6 justify-between items-start">
        <Text className="text-slate-500 text-[10px]">10K</Text>
        <Text className="text-slate-500 text-[10px]">5K</Text>
        <Text className="text-slate-500 text-[10px]">0</Text>
      </View>
      
      {/* Chart Area */}
      <View className="flex-1 ml-8 border-l border-b border-slate-700/50 relative">
        {/* Mock Lines/Bars */}
        <View className="flex-row items-end justify-between px-2 h-full">
          {days.map((day, i) => (
            <View key={i} className="items-center flex-1">
              <View className="flex-row gap-x-0.5 items-end h-full w-full justify-center">
                {colors.map((color, ci) => {
                  const height = multi ? (20 + Math.random() * 60) : (40 + Math.random() * 50);
                  return (
                    <View 
                      key={ci} 
                      className="w-1.5 rounded-t-sm" 
                      style={{ 
                        backgroundColor: color, 
                        height: `${height}%`,
                        opacity: multi ? 0.8 : 1
                      }} 
                    />
                  );
                })}
              </View>
              <Text className="text-slate-500 text-[10px] mt-2 absolute -bottom-6">{day}</Text>
            </View>
          ))}
        </View>
        
        {/* Horizontal Grid lines */}
        <View className="absolute left-0 right-0 top-[33%] border-t border-slate-700/20 w-full" />
        <View className="absolute left-0 right-0 top-[66%] border-t border-slate-700/20 w-full" />
      </View>
    </View>
  );
};

export default function AnalyticsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#0F172A]" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-full bg-slate-800/50"
        >
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text className="text-white text-2xl font-bold">Analytics</Text>
        <TouchableOpacity className="w-10 h-10 items-center justify-center rounded-full bg-slate-800/50">
          <Ionicons name="notifications-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100, paddingTop: 10 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Activity Summary Cards */}
        <ChartCard 
          title="Transaction Activity" 
          dateRange="Feb 2 - Feb 8"
          legend={[
            { color: '#FB923C', label: 'Food' },
            { color: '#F87171', label: 'Transport' },
            { color: '#34D399', label: 'Bills' },
          ]}
        >
          <MockLineChart colors={['#FB923C', '#F87171', '#34D399']} multi />
        </ChartCard>

        <ChartCard 
          title="Savings Activity" 
          dateRange="Feb 2 - Feb 8"
          legend={[{ color: '#6366F1', label: 'Total Savings' }]}
        >
          <MockLineChart colors={['#6366F1']} />
        </ChartCard>

        <ChartCard 
          title="Total Expenses" 
          dateRange="Feb 2 - Feb 8"
          legend={[{ color: '#F87171', label: 'Expenses' }]}
        >
          <MockLineChart colors={['#F87171']} />
        </ChartCard>

        {/* Extra Info or Stats */}
        <View className="bg-slate-800/40 rounded-[24px] p-6 mb-6">
          <Text className="text-white text-lg font-bold mb-4">Monthly Insights</Text>
          <View className="flex-row justify-between mb-4">
            <View>
              <Text className="text-slate-400 text-sm">Average Spending</Text>
              <Text className="text-white text-xl font-bold mt-1">$1,240.00</Text>
            </View>
            <View className="items-end">
              <Text className="text-emerald-400 text-sm flex-row items-center">
                <Ionicons name="arrow-down" size={14} /> 12%
              </Text>
              <Text className="text-slate-500 text-[10px] mt-1">vs last month</Text>
            </View>
          </View>
          <View className="h-[1px] bg-slate-700/50 my-2" />
          <View className="flex-row justify-between mt-2">
            <View>
              <Text className="text-slate-400 text-sm">Top Category</Text>
              <Text className="text-white text-xl font-bold mt-1">Rent & Bills</Text>
            </View>
            <View className="items-end justify-center">
              <View className="bg-slate-700/50 px-3 py-1 rounded-full">
                <Text className="text-slate-300 text-xs">View Details</Text>
              </View>
            </View>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
