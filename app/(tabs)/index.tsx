import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useRef, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Svg, { Circle } from 'react-native-svg';
import { useStore, AppState, Category, Transaction } from '../../store/useStore';

// Helper Component for the Dynamic Math Wheel
const ProgressRing = ({ category, transactions }: { category: any, transactions: any[] }) => {
  const radius = 22;
  const strokeWidth = 4;
  const circumference = 2 * Math.PI * radius;

  // Calculate sum of all expenses tied to this category
  const categoryExpenses = transactions
    .filter((t: Transaction) => t.categoryId === category.id || (t as any).category === category.name) // fallback for legacy mock
    .reduce((sum: number, t: Transaction) => sum + Number(t.amount), 0);

  const limit = category.limit || 1; // Prevent div by 0
  const rawPercentage = (categoryExpenses / limit) * 100;
  const percentage = Math.min(rawPercentage, 100);
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  let progressColor = '#10B981'; // Green (0-50%)
  if (rawPercentage > 50 && rawPercentage <= 89) {
    progressColor = '#F59E0B'; // Orange (51-89%)
  } else if (rawPercentage > 89) {
    progressColor = '#EF4444'; // Red (90%+)
  }

  return (
    <View className="mr-4 items-center justify-center" style={{ width: 50, height: 50 }}>
      {/* Background Track Circle */}
      <Svg height="50" width="50" viewBox="0 0 50 50">
        <Circle
          cx="25"
          cy="25"
          r={radius}
          stroke="#475569"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeOpacity={0.3}
        />
        {/* Dynamic Math Foreground Circle */}
        <Circle
          cx="25"
          cy="25"
          r={radius}
          stroke={progressColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform="rotate(-90 25 25)"
        />
      </Svg>
      <View style={{ position: 'absolute', alignItems: 'center', justifyContent: 'center', width: 50, height: 50 }}>
        <Feather name={category.icon as any} size={20} color="#E2E8F0" />
      </View>
    </View>
  );
};

export default function HomeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const budget = useStore((state: AppState) => state.budget);
  const categories = useStore((state: AppState) => state.categories);
  const transactions = useStore((state: AppState) => state.transactions);

  const displayBudget = useMemo(() => {
    const totalExpenses = transactions
      .filter((t: Transaction) => t.type === 'Expense')
      .reduce((sum: number, t: Transaction) => sum + Number(t.amount), 0);
    const totalIncome = transactions
      .filter((t: Transaction) => t.type === 'Income')
      .reduce((sum: number, t: Transaction) => sum + Number(t.amount), 0);

    return (budget || 0) + totalIncome - totalExpenses;
  }, [budget, transactions]);

  const actions = [
    { label: 'Expenses', icon: 'coffee' },
    { label: 'Income', icon: 'dock' },
    { label: 'Savings', icon: 'youtube' },
    { label: 'Debt', icon: 'archive' },
    { label: 'Investment', icon: 'coffee' },
  ];

  const [activeModule, setActiveModule] = useState<'Summary' | 'Expense' | 'Investment' | 'Savings' | 'Income'>('Summary');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Filter States
  const [showFilter, setShowFilter] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('Monthly');
  const filterOptions = ['Daily', 'Weekly', 'Monthly', 'Yearly'];

  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  const formatTransactionStyles = (tx: any) => {
    if (tx.type === 'Expense') {
      return { prefix: '-', color: 'text-red-500' };
    } else if (tx.type === 'Debt') {
      return { prefix: '~', color: 'text-white' };
    }
    return { prefix: '+', color: 'text-green-500' };
  }

  // Master Summary should sort all transactions by recency
  const sortedTransactions = [...transactions]
    .sort((a, b) => new Date(b.date || Date.now()).getTime() - new Date(a.date || Date.now()).getTime());

  const currentData = {
    title: 'Summary',
    items: sortedTransactions.map((tx: Transaction) => {
      const { prefix, color } = formatTransactionStyles(tx);
      const cat = categories.find((c: Category) => c.id === tx.categoryId || (c as any).name === (tx as any).category); // Fallback for legacy
      return {
        label: tx.title,
        value: `${prefix}₱${new Intl.NumberFormat('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(tx.amount)} `,
        color: color,
        icon: cat?.icon || tx.categoryIcon || 'help-circle', // fallback to help-circle for uncategorized
      };
    }),
  };

  const moduleTransactions = activeModule === 'Summary'
    ? currentData.items
    : currentData.items.filter((item, idx) => sortedTransactions[idx].type === activeModule);


  return (
    <View className="flex-1 bg-[#242E42]">
      {/* Top Header Widget */}
      <View className="bg-[#303E55] w-full rounded-b-[40px] pt-16 pb-8 px-10 items-center mb-6 shadow-md z-10 relative">
        {activeModule !== 'Summary' && (
          <TouchableOpacity
            className="absolute top-16 right-8 z-[100]"
            onPress={() => {
              setShowCategoryMenu(!showCategoryMenu);
              if (!showCategoryMenu) setIsAddingCategory(false);
            }}
          >
            <Feather name="more-horizontal" size={24} color="#E2E8F0" />
          </TouchableOpacity>
        )}

        {/* Category Management Dropdown */}
        {activeModule !== 'Summary' && showCategoryMenu && (
          <TouchableOpacity
            className="absolute top-[85px] right-8 bg-[#64748B] rounded-[24px] px-4 py-2.5 z-[100] flex-row items-center"
            onPress={() => {
              setShowCategoryMenu(false);
              router.push({ pathname: '/add-category', params: { module: activeModule } } as any);
            }}
          >
            <Text className="text-white text-[15px] font-bold mr-3">Add a Category</Text>
            <Feather name="plus" size={18} color="#4ADE80" />
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={() => router.push('/enter-budget' as any)}>
          <Text className="text-white text-[48px] font-bold tracking-tight">
            ₱{new Intl.NumberFormat('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(displayBudget))}
          </Text>
        </TouchableOpacity>
        <Text className="text-slate-200 text-[18px] mt-2">Overall Budget</Text>
      </View>

      {/* Action Bar */}
      <View className="flex-row justify-between w-full px-5 mb-6 z-10">
        {actions.map((item, index) => {
          // Identify matching active state context
          const isActiveTab = (item.label === 'Expenses' && activeModule === 'Expense') ||
            (item.label === 'Investment' && activeModule === 'Investment') ||
            (item.label === 'Savings' && activeModule === 'Savings') ||
            (item.label === 'Income' && activeModule === 'Income');
          return (
            <TouchableOpacity
              key={index}
              className="items-center"
              onPress={() => {
                if (item.label === 'Expenses') {
                  setActiveModule(activeModule === 'Expense' ? 'Summary' : 'Expense');
                  if (activeModule !== 'Expense') setSelectedCategory(null);
                } else if (item.label === 'Investment') {
                  setActiveModule(activeModule === 'Investment' ? 'Summary' : 'Investment');
                  if (activeModule !== 'Investment') setSelectedCategory(null);
                } else if (item.label === 'Savings') {
                  setActiveModule(activeModule === 'Savings' ? 'Summary' : 'Savings');
                  if (activeModule !== 'Savings') setSelectedCategory(null);
                } else if (item.label === 'Income') {
                  setActiveModule(activeModule === 'Income' ? 'Summary' : 'Income');
                  if (activeModule !== 'Income') setSelectedCategory(null);
                }
              }}
            >
              <View className={`p-2 rounded-xl mb-1 ${isActiveTab ? 'bg-[#38BDF8]/20' : 'bg-transparent'}`}>
                <Feather
                  name={item.icon as any}
                  size={24}
                  color={isActiveTab ? "#38BDF8" : "#E2E8F0"}
                />
              </View>
              <Text className={`text-[13px] text-center ${isActiveTab ? 'text-[#38BDF8] font-bold' : 'text-slate-300'}`}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View className="flex-1">
        {activeModule === 'Summary' ? (
          <View className="bg-[#303E55] mx-5 mb-8 rounded-[20px] border border-slate-500 flex-1 shadow-lg overflow-hidden pb-4">
            <View className="flex-row justify-between items-start pt-6 px-6 pb-4">
              <View>
                <Text className="text-white text-[20px] font-bold mb-2">Summary</Text>
                <Text className="text-slate-300 text-[14px] font-bold">
                  {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </Text>
              </View>
              <View className="relative z-50">
                <TouchableOpacity onPress={() => setShowFilter(!showFilter)}>
                  <Feather name="filter" size={24} color="#E2E8F0" />
                </TouchableOpacity>
                {/* Filter Dropdown */}
                {showFilter && (
                  <View className="absolute top-8 right-0 bg-[#1E293B] rounded-[12px] p-2 shadow-xl border border-slate-600 min-w-[120px] z-[99]">
                    {filterOptions.map((f) => (
                      <TouchableOpacity
                        key={f}
                        className={`py-2 px-3 rounded-lg ${selectedFilter === f ? 'bg-[#303E55]' : ''}`}
                        onPress={() => {
                          setSelectedFilter(f);
                          setShowFilter(false);
                        }}
                      >
                        <Text className="text-white text-[14px]">{f}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>

            <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
              {currentData.items.length === 0 ? (
                <Text className="text-slate-400 text-center mt-6">No transactions found.</Text>
              ) : (
                currentData.items.map((item: any, idx: number) => (
                  <View key={idx} className="flex-row justify-between items-center mb-4">
                    <View className="flex-row items-center">
                      <Feather name={item.icon as any} size={20} color="#E2E8F0" className="mr-3" />
                      <Text className="text-slate-100 text-[16px]">{item.label}</Text>
                    </View>
                    <Text className={`text-[16px] font-bold flex-shrink-0 ml-2 ${item.color}`}>{item.value}</Text>
                  </View>
                ))
              )}
            </ScrollView>

            {/* Footer Section */}
            <View className="border-t border-slate-600/50 bg-[#1E293B]/50 px-6 py-4 flex-row items-center justify-between">
              <Text className="text-slate-300 text-[13px]">Looking for something specific?</Text>
              <TouchableOpacity
                className="bg-[#38BDF8]/10 px-3 py-1.5 rounded-full border border-[#38BDF8]/30"
                onPress={() => Alert.alert('Request History', 'PDF/CSV export feature coming soon!')}
              >
                <Text className="text-[#38BDF8] text-[11px] font-bold">Request History</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <ScrollView
            className="flex-1 px-5 mb-6 z-0 mx-5"
            contentContainerStyle={{ paddingBottom: 120 }}
            showsVerticalScrollIndicator={false}
          >
            {categories.filter((c: Category) => c.type === activeModule).length === 0 && (
              <View className="items-center mt-10">
                <Text className="text-slate-400 text-[16px]">No categories yet.</Text>
                <Text className="text-slate-500 text-[14px] mt-2 text-center px-4">Tap the menu icon (•••) at the top right to add a category.</Text>
              </View>
            )}
            {categories.filter((c: Category) => c.type === activeModule).map((sub: Category, idx: number) => {
              const isActive = selectedCategory === sub.name;

              // Compute math warnings automatically based on relevant transactions
              const moduleSpecificTransactions = transactions.filter((t: Transaction) => t.type === activeModule);
              const isWarningMode = moduleSpecificTransactions.filter((t: Transaction) => t.categoryId === sub.id).reduce((sum: number, t: Transaction) => sum + Number(t.amount), 0) >= ((sub.limit || 1) * 0.9);

              return (
                <View key={sub.id}>
                  <TouchableOpacity
                    className={`flex-row items-center justify-between py-1 ${isActive ? 'opacity-100' : 'opacity-80'}`}
                    onPress={() => {
                      setSelectedCategory(sub.name);
                      router.push({ pathname: '/add-expense', params: { category: sub.name, module: activeModule } } as any);
                    }}
                  >
                    <View className="flex-row items-center">
                      <ProgressRing category={sub} transactions={moduleSpecificTransactions} />
                      <View>
                        <View className="flex-row items-center">
                          <Text className="text-white text-[16px] font-bold mr-2">{sub.name}</Text>
                          {isWarningMode && <Feather name="alert-circle" size={16} color="#F97316" />}
                        </View>
                        <Text className="text-slate-400 text-[14px] mt-1">{sub.limit ? `Limit: ₱${sub.limit}` : sub.group || sub.type}</Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      className="bg-slate-300 rounded-full p-1.5 flex items-center justify-center"
                      onPress={() => router.push({ pathname: '/add-expense', params: { category: sub.name, module: activeModule } } as any)}
                    >
                      <Feather name="plus" size={20} color="#0F172A" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                  {/* Subtle Separator Line */}
                  <View className="h-[1px] bg-slate-600 w-full mt-4 mb-4" />
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>

    </View >
  );
}