import React from 'react';
import { View, TouchableOpacity, Text, ScrollView } from 'react-native';
import LogIn from '@/components/figma/LogIn';
import { useRouter } from 'expo-router';

export default function RouteLogIn() {
  const router = useRouter();
  
  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1 bg-[#0f172a]">
      <LogIn />
      <View className="p-4 border-t border-slate-700 bg-slate-900">
        <Text className="text-white text-sm opacity-50 mb-2">36: LogIn -&gt; 27(HomePage)</Text>
        <View className="flex-row flex-wrap gap-2">
          <TouchableOpacity onPress={() => router.push('/(tabs)')} className="bg-blue-600 px-4 py-2 rounded-full">
            <Text className="text-white font-bold">Submit -&gt; Home (27)</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/register')} className="bg-blue-600 px-4 py-2 rounded-full">
            <Text className="text-white font-bold">Go to Register (39)</Text>
          </TouchableOpacity>
          
        </View>
      </View>
    </ScrollView>
  );
}
