import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  Modal,
  TextInput,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFinance, Debt } from '../../context/FinanceContext';

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { GestureDetector, Gesture, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useWindowDimensions } from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const quickActions = [
  { id: 'expenses', label: 'Expenses', icon: 'cafe-outline' as const, route: '/expenses' },
  { id: 'income', label: 'Income', icon: 'grid-outline' as const, route: '/income' },
  { id: 'savings', label: 'Savings', icon: 'videocam-outline' as const, route: '/savings' },
  { id: 'debt', label: 'Debt', icon: 'lock-closed-outline' as const, route: '/debt' },
  { id: 'investment', label: 'Investment', icon: 'trending-up-outline' as const, route: '/investment' },
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
        <Ionicons name={isOpen ? 'caret-down' : 'caret-forward'} size={18} color="white" />
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
                    style={{ backgroundColor: item.direction === 'right' ? '#4ADE80' : '#F87171' }}
                  >
                    <Ionicons
                      name={item.direction === 'right' ? 'arrow-forward' : 'arrow-back'}
                      size={12}
                      color="white"
                    />
                  </View>
                </View>
                <View>
                  <Text className="text-white text-base font-bold">{item.person}</Text>
                  <Text className="text-slate-400 text-xs">{item.date}</Text>
                </View>
              </View>
              <Text className="text-white text-base font-bold">
                ₱{item.remainingAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
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
  const { height: SCREEN_HEIGHT } = useWindowDimensions();
  const { debts, addPayment } = useFinance();
  const [isYourDebtsOpen, setIsYourDebtsOpen] = useState(true);
  const [isOthersDebtsOpen, setIsOthersDebtsOpen] = useState(true);
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');

  // Snap points defined from the top
  const SNAP_TOP = 250; // Just under QuickActions
  const SNAP_BOTTOM = SCREEN_HEIGHT - 220; // Showing part of the Summary card
  
  const translateY = useSharedValue(SNAP_BOTTOM);
  const context = useSharedValue({ y: 0 });

  const pan = Gesture.Pan()
    .onStart(() => {
      context.value = { y: translateY.value };
    })
    .onUpdate((event) => {
      translateY.value = event.translationY + context.value.y;
      
      // Boundaries
      if (translateY.value < SNAP_TOP) {
        translateY.value = SNAP_TOP;
      }
    })
    .onEnd((event) => {
      if (event.velocityY < -500) {
        translateY.value = withSpring(SNAP_TOP, { damping: 50, stiffness: 200 });
      } else if (event.velocityY > 500) {
        translateY.value = withSpring(SNAP_BOTTOM, { damping: 50, stiffness: 200 });
      } else {
        if (translateY.value < (SNAP_TOP + SNAP_BOTTOM) / 2) {
          translateY.value = withSpring(SNAP_TOP, { damping: 50, stiffness: 200 });
        } else {
          translateY.value = withSpring(SNAP_BOTTOM, { damping: 50, stiffness: 200 });
        }
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const yourDebtsData = debts.filter((d) => d.direction === 'right');
  const othersDebtsData = debts.filter((d) => d.direction === 'left');

  const formatCurrency = (value: number) => {
    return `₱${Math.abs(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleAddPayment = () => {
    if (!selectedDebt || !paymentAmount) return;
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) return;

    addPayment(selectedDebt.id, amount);
    setPaymentAmount('');
    const updatedDebt = debts.find(d => d.id === selectedDebt.id);
    if (updatedDebt) setSelectedDebt(updatedDebt);
  };

  useEffect(() => {
    if (selectedDebt) {
      const updated = debts.find(d => d.id === selectedDebt.id);
      if (updated) setSelectedDebt(updated);
    }
  }, [debts]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View className="flex-1 bg-[#1E293B]">
        <SafeAreaView className="flex-1" edges={['top']}>
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 250 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Header Section */}
            <View className="items-center pt-10 pb-8 px-7">
              <Text className="text-white text-5xl font-extrabold tracking-tight mb-1 text-center">
                {formatCurrency(50000)}
              </Text>
              <Text className="text-slate-300 text-xl font-medium">
                Overall Budget
              </Text>
            </View>

            {/* Quick Actions Row */}
            <View
              className="mx-7 mb-6 rounded-[20px] px-4 py-4"
              style={{
                backgroundColor: '#334155',
                borderWidth: 1,
                borderColor: '#475569',
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
                        backgroundColor: action.id === 'debt' ? '#1E293B' : '#475569',
                        borderWidth: action.id === 'debt' ? 1 : 0,
                        borderColor: '#475569',
                      }}
                    >
                      <Ionicons
                        name={action.icon}
                        size={22}
                        color={action.id === 'debt' ? '#94A3B8' : 'white'}
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
          </ScrollView>
        </SafeAreaView>

        {/* ── Bottom Sheet - Debt Summary ── */}
        <GestureDetector gesture={pan}>
          <Animated.View 
            style={[
              animatedStyle,
              {
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: SCREEN_HEIGHT,
                backgroundColor: '#1E293B', // Fully covers the view behind it
              }
            ]}
          >
            <View 
              className="mx-7 flex-1"
              style={{
                backgroundColor: '#334155',
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                borderWidth: 1,
                borderColor: '#475569',
                // Shadow to give it depth
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.25,
                shadowRadius: 10,
                elevation: 10,
              }}
            >
              {/* Drag Handle Container */}
              <View className="items-center pt-4 pb-2">
                <View className="w-12 h-1.5 rounded-full bg-[#475569]" />
              </View>

              <View className="px-6 pt-4">
                <View className="flex-row items-center justify-between mb-6">
                  <Text className="text-white text-2xl font-bold">Summary</Text>
                  <TouchableOpacity 
                    onPress={() => router.push('/add-debt')}
                    className="w-8 h-8 rounded-full bg-[#475569] items-center justify-center text-center"
                  >
                    <Ionicons name="add" size={24} color="white" />
                  </TouchableOpacity>
                </View>

                <ScrollView 
                  showsVerticalScrollIndicator={false}
                  style={{ maxHeight: SCREEN_HEIGHT - SNAP_TOP - 150 }}
                >
                  <View className="gap-y-4">
                    {debts.length > 0 ? (
                      debts.map((item) => (
                        <View key={item.id} className="flex-row justify-between items-center">
                          <View className="flex-row items-center gap-x-3">
                            <View 
                              className="w-2 h-2 rounded-full" 
                              style={{ backgroundColor: item.direction === 'right' ? '#4ADE80' : '#F87171' }} 
                            />
                            <Text className="text-slate-300 text-base font-medium">{item.person}</Text>
                          </View>
                          <Text className="text-white text-base font-bold">
                            {formatCurrency(item.remainingAmount)}
                          </Text>
                        </View>
                      ))
                    ) : (
                      <View className="py-4 items-center">
                        <Text className="text-slate-400 text-center text-base italic font-medium">
                          There are no debts as of the moment.
                        </Text>
                      </View>
                    )}
                  </View>
                </ScrollView>

                <Text className="text-slate-500 text-center mt-6 text-xs uppercase tracking-widest">
                  Version 1.0
                </Text>
              </View>
            </View>
          </Animated.View>
        </GestureDetector>

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
                <TouchableOpacity onPress={() => setSelectedDebt(null)} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Info Rows */}
                <View style={styles.infoSection}>
                  {/* Remaining Amount */}
                  <View style={styles.infoRow}>
                    <View style={styles.iconContainer}>
                      <Ionicons name="cash-outline" size={20} color="white" />
                    </View>
                    <View>
                      <Text style={styles.infoValue}>{formatCurrency(selectedDebt?.remainingAmount || 0)}</Text>
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
                      <Text style={styles.infoValue}>{formatCurrency(selectedDebt?.initialAmount || 0)}</Text>
                      <Text style={styles.infoLabel}>Initial Amount</Text>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  {/* Concept */}
                  <View style={styles.infoRow}>
                    <View style={styles.iconContainer}>
                      <Ionicons name="document-text-outline" size={20} color="white" />
                    </View>
                    <View>
                      <Text style={styles.infoValue}>{selectedDebt?.description}</Text>
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
                        {selectedDebt?.direction === 'left' ? "This person is the creditor" : "This person is the debtor"}
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
                        name={selectedDebt?.status === 'paid' ? "checkmark-circle" : "alert-circle"} 
                        size={20} 
                        color={selectedDebt?.status === 'paid' ? "#4ADE80" : "#F87171"} 
                      />
                    </View>
                    <View>
                      <Text style={[styles.infoValue, { color: selectedDebt?.status === 'paid' ? "#4ADE80" : "#F87171" }]}>
                        {selectedDebt?.status === 'paid' ? "This debt is paid" : "This debt is pending in payment"}
                      </Text>
                      <Text style={styles.infoLabel}>State</Text>
                    </View>
                  </View>
                </View>

                {/* Add Payment Section */}
                {selectedDebt?.status === 'pending' && (
                  <View style={styles.paymentSection}>
                    <TextInput
                      style={styles.paymentInput}
                      placeholder="Enter payment amount"
                      placeholderTextColor="#94A3B8"
                      keyboardType="numeric"
                      value={paymentAmount}
                      onChangeText={setPaymentAmount}
                    />
                    <TouchableOpacity onPress={handleAddPayment} style={styles.paymentButton}>
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
                        <Text style={styles.historyAmount}>{formatCurrency(p.amount)}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.noHistory}>No payments have been made yet</Text>
                  )}
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1E293B',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    height: '90%',
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    marginBottom: 24,
    position: 'relative',
  },
  modalTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  closeButton: {
    position: 'absolute',
    right: 24,
  },
  infoSection: {
    paddingHorizontal: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  infoValue: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoLabel: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginLeft: 56,
  },
  paymentSection: {
    marginTop: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  paymentInput: {
    backgroundColor: '#334155',
    width: '100%',
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingVertical: 14,
    color: 'white',
    fontSize: 16,
    marginBottom: 16,
  },
  paymentButton: {
    backgroundColor: '#64748B',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 15,
  },
  paymentButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  historySection: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  historyTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between' as const,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  historyDate: {
    color: '#94A3B8',
    flex: 1,
  },
  historyAmount: {
    color: 'white',
    fontWeight: 'bold',
  },
  noHistory: {
    color: '#64748B',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 10,
  },
});
