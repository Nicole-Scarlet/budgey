import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as React from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ScannerPage = () => {
    return (
        <SafeAreaView className="flex-1 bg-[#0F172B]">
            <View className="flex-1 items-center justify-center px-8">
                <View className="w-64 h-64 border-2 border-white/30 rounded-3xl items-center justify-center border-dashed">
                    <MaterialCommunityIcons name="crop-free" size={80} color="white" />
                </View>
                <Text className="text-white text-2xl font-bold mt-10">Scan Receipt</Text>
                <Text className="text-slate-400 text-center mt-2">Align the receipt within the frame to automatically parse your expenses.</Text>
            </View>
        </SafeAreaView>
    );
};

export default ScannerPage;
