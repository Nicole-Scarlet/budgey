import React from 'react';
import { View, TouchableOpacity, Text, ScrollView } from 'react-native';
import InterviewQuestion5 from '@/components/figma/InterviewQuestion5';
import { useRouter } from 'expo-router';

export default function RouteInterviewQuestion5() {
  const router = useRouter();
  
  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1 bg-[#1E293B]">
      <InterviewQuestion5 />
      <View className="p-4 border-t border-slate-700 bg-slate-900">
        <Text className="text-white text-sm opacity-50 mb-2">33: InterviewQuestion5 -&gt; 27(HomePage)</Text>
        <View className="flex-row flex-wrap gap-2">
          <TouchableOpacity onPress={() => router.push('/(tabs)')} className="bg-blue-600 px-4 py-2 rounded-full">
            <Text className="text-white font-bold">Finish -&gt; Home (27)</Text>
          </TouchableOpacity>
          
        </View>
      </View>
    </ScrollView>
  );
}
