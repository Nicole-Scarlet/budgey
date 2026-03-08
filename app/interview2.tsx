import React from 'react';
import { View, TouchableOpacity, Text, ScrollView } from 'react-native';
import InterviewQuestion2 from '@/components/figma/InterviewQuestion2';
import { useRouter } from 'expo-router';

export default function RouteInterviewQuestion2() {
  const router = useRouter();
  
  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1 bg-[#1E293B]">
      <InterviewQuestion2 />
      <View className="p-4 border-t border-slate-700 bg-slate-900">
        <Text className="text-white text-sm opacity-50 mb-2">30: InterviewQuestion2 -&gt; 31(Int3)</Text>
        <View className="flex-row flex-wrap gap-2">
          <TouchableOpacity onPress={() => router.push('/interview3')} className="bg-blue-600 px-4 py-2 rounded-full">
            <Text className="text-white font-bold">Next -&gt; Interview 3 (31)</Text>
          </TouchableOpacity>
          
        </View>
      </View>
    </ScrollView>
  );
}
