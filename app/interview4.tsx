import React from 'react';
import { View, TouchableOpacity, Text, ScrollView } from 'react-native';
import InterviewQuestion4 from '@/components/figma/InterviewQuestion4';
import { useRouter } from 'expo-router';

export default function RouteInterviewQuestion4() {
  const router = useRouter();
  
  return (
    <ScrollView contentContainerStyle={{flexGrow: 1}} className="flex-1 bg-[#1E293B]">
      <InterviewQuestion4 />
      <View className="p-4 border-t border-slate-700 bg-slate-900">
        <Text className="text-white text-sm opacity-50 mb-2">32: InterviewQuestion4 -{'>'} 33(Int5)</Text>
        <View className="flex-row flex-wrap gap-2">
          <TouchableOpacity onPress={() => router.push('/interview5')} className="bg-blue-600 px-4 py-2 rounded-full">
            <Text className="text-white font-bold">Next -{'>'} Interview 5 (33)</Text>
          </TouchableOpacity>
          
        </View>
      </View>
    </ScrollView>
  );
}
