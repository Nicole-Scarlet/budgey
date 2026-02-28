import React from 'react';
import { View, TouchableOpacity, Text, ScrollView } from 'react-native';
import Register from '@/components/figma/Register';
import { useRouter } from 'expo-router';

export default function RouteRegister() {
  const router = useRouter();
  
  return (
    <ScrollView contentContainerStyle={{flexGrow: 1}} className="flex-1 bg-[#0f172a]">
      <Register />
      <View className="p-4 border-t border-slate-700 bg-slate-900">
        <Text className="text-white text-sm opacity-50 mb-2">39: Register -&gt; 29(Interview1)</Text>
        <View className="flex-row flex-wrap gap-2">
          <TouchableOpacity onPress={() => router.push('/interview1')} className="bg-blue-600 px-4 py-2 rounded-full">
            <Text className="text-white font-bold">Submit -&gt; Interview 1 (29)</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/login')} className="bg-blue-600 px-4 py-2 rounded-full">
            <Text className="text-white font-bold">Go to Log In (36)</Text>
          </TouchableOpacity>
          
        </View>
      </View>
    </ScrollView>
  );
}
