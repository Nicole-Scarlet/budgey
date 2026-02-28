import React from 'react';
import { View, TouchableOpacity, Text, ScrollView } from 'react-native';
import Debt3 from '@/components/figma/Debt3';
import { useRouter } from 'expo-router';

export default function RouteDebt3() {
  const router = useRouter();
  
  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1 bg-[#0f172a]">
      <Debt3 />
      <View className="p-4 border-t border-slate-700 bg-slate-900">
        <Text className="text-white text-sm opacity-50 mb-2">17: Debt3 -&gt; 1(AddDebt)</Text>
        <View className="flex-row flex-wrap gap-2">
          <TouchableOpacity onPress={() => router.push('/add-debt')} className="bg-blue-600 px-4 py-2 rounded-full">
            <Text className="text-white font-bold">Go to Add Debt (1)</Text>
          </TouchableOpacity>
          
        </View>
      </View>
    </ScrollView>
  );
}
