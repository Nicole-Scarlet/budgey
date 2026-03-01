import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons, MaterialIcons, MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useFinance } from '../context/FinanceContext';

export default function AddDebtScreen() {
  const router = useRouter();
  const { addDebt } = useFinance();
  const [debtType, setDebtType] = useState<'owes_me' | 'i_owe'>('owes_me');
  const [amount, setAmount] = useState('');
  const [contact, setContact] = useState('');
  const [concept, setConcept] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleAddDebt = () => {
    if (!amount || !contact || !concept) {
      alert('Please fill in all fields');
      return;
    }

    const direction = debtType === 'owes_me' ? 'right' : 'left';

    addDebt({
      person: contact,
      description: concept,
      date: formatDate(date),
      initialAmount: parseFloat(amount) || 0,
      direction: direction as 'left' | 'right',
    });
    
    router.back();
  };

  return (
    <View className="flex-1 bg-[#1E293B]">
      <Stack.Screen 
        options={{
          headerShown: true,
          title: 'Add Debt',
          headerStyle: { backgroundColor: '#1E293B' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: 'bold' },
          headerShadowVisible: false,
        }} 
      />
      <SafeAreaView className="flex-1" edges={['bottom']}>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <ScrollView
            className="flex-1 px-7"
            contentContainerStyle={{ paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Split View: Toggle on left, Icon representation on right */}
            <View className="flex-row items-center justify-between py-6">
              {/* Toggle Controls */}
              <View className="gap-y-4">
                <TouchableOpacity
                  onPress={() => setDebtType('owes_me')}
                  className="flex-row items-center gap-x-3"
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={debtType === 'owes_me' ? 'radio-button-on' : 'radio-button-off'}
                    size={24}
                    color="white"
                  />
                  <Text className="text-white text-lg font-medium">Owes Me</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setDebtType('i_owe')}
                  className="flex-row items-center gap-x-3"
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={debtType === 'i_owe' ? 'radio-button-on' : 'radio-button-off'}
                    size={24}
                    color="white"
                  />
                  <Text className="text-white text-lg font-medium">I owe</Text>
                </TouchableOpacity>
              </View>

              {/* Visual Indicator */}
              <View className="flex-row items-center gap-x-4">
                <AntDesign
                  name={debtType === 'owes_me' ? 'arrow-left' : 'arrow-right'}
                  size={32}
                  color={debtType === 'owes_me' ? '#22C55E' : '#EF4444'}
                />
                <View className="w-20 h-20 rounded-full border-2 border-white/20 items-center justify-center">
                  <MaterialIcons name="person-outline" size={48} color="white" />
                </View>
              </View>
            </View>

            {/* Inputs Container */}
            <View className="gap-y-4 mt-2">
              <View className="flex-row gap-x-3">
                {/* Amount Input */}
                <View className="flex-[2] bg-[#334155] rounded-2xl px-5 py-4">
                  <TextInput
                    placeholder="Amount"
                    placeholderTextColor="#94A3B8"
                    className="text-white text-lg font-bold"
                    keyboardType="numeric"
                    value={amount}
                    onChangeText={setAmount}
                  />
                </View>
                {/* Currency Dropdown Placeholder */}
                <TouchableOpacity className="flex-1 bg-[#334155] rounded-2xl px-4 py-4 flex-row items-center justify-between">
                  <Text className="text-white text-base font-bold">PHP (₱)</Text>
                  <Ionicons name="chevron-down" size={16} color="white" />
                </TouchableOpacity>
              </View>

              {/* Contact Input */}
              <View className="bg-[#334155] rounded-2xl px-5 py-4">
                <TextInput
                  placeholder="Contact"
                  placeholderTextColor="#94A3B8"
                  className="text-white text-base font-medium"
                  value={contact}
                  onChangeText={setContact}
                />
              </View>

              {/* Concept Input */}
              <View className="bg-[#334155] rounded-2xl px-5 py-4">
                <TextInput
                  placeholder="Concept"
                  placeholderTextColor="#94A3B8"
                  className="text-white text-base font-medium"
                  value={concept}
                  onChangeText={setConcept}
                />
              </View>
            </View>

            {/* Date Display */}
            <View className="flex-row items-center justify-between mt-8 px-2">
              <Text className="text-white text-lg font-bold">
                Created: {formatDate(date)}
              </Text>
              <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                <MaterialCommunityIcons name="pencil" size={24} color="white" />
              </TouchableOpacity>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onDateChange}
              />
            )}

            {/* Submit Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              className="bg-[#94A3B8] rounded-[15px] py-4 mt-10 items-center justify-center shadow-lg"
              onPress={handleAddDebt}
            >
              <Text className="text-white text-xl font-bold">+ Add Debt</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
