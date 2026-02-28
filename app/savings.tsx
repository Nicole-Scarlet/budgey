import React from 'react';
import { View, TouchableOpacity, Text, ScrollView } from 'react-native';
import Savings from '@/components/figma/Savings';
import { useRouter } from 'expo-router';

export default function RouteSavings() {
  const router = useRouter();
  
  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1 bg-[#0f172a]">
      <Savings />
      <View className="p-4 border-t border-slate-700 bg-slate-900">
        <Text className="text-white text-sm opacity-50 mb-2">40: Savings</Text>
        <View className="flex-row flex-wrap gap-2">
          
        </View>
      </View>
    </ScrollView>
  );
}
