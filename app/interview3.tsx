import React from 'react';
import { View, TouchableOpacity, Text, ScrollView } from 'react-native';
import InterviewQuestion3 from '@/components/figma/InterviewQuestion3';
import { useRouter } from 'expo-router';

export default function RouteInterviewQuestion3() {
  const router = useRouter();
  
  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1 bg-[#1E293B]">
      <InterviewQuestion3 />
      <View className="p-4 border-t border-slate-700 bg-slate-900">
        <Text className="text-white text-sm opacity-50 mb-2">31: InterviewQuestion3 -&gt; 32(Int4)</Text>
        <View className="flex-row flex-wrap gap-2">
          <TouchableOpacity onPress={() => router.push('/interview4')} className="bg-blue-600 px-4 py-2 rounded-full">
            <Text className="text-white font-bold">Next -&gt; Interview 4 (32)</Text>
          </TouchableOpacity>
          
        </View>
      </View>
    </ScrollView>
  );
}
