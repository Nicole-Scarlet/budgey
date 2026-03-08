import React from 'react';
import { View, TouchableOpacity, Text, ScrollView } from 'react-native';
import InterviewQuestion1 from '@/components/figma/InterviewQuestion1';
import { useRouter } from 'expo-router';

export default function RouteInterviewQuestion1() {
  const router = useRouter();
  
  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1 bg-[#1E293B]">
      <InterviewQuestion1 />
      <View className="p-4 border-t border-slate-700 bg-slate-900">
        <Text className="text-white text-sm opacity-50 mb-2">29: InterviewQuestion1 -&gt; 30(Int2)</Text>
        <View className="flex-row flex-wrap gap-2">
          <TouchableOpacity onPress={() => router.push('/interview2')} className="bg-blue-600 px-4 py-2 rounded-full">
            <Text className="text-white font-bold">Next -&gt; Interview 2 (30)</Text>
          </TouchableOpacity>
          
        </View>
      </View>
    </ScrollView>
  );
}
