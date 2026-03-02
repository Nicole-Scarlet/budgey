import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as React from "react";
import { useState } from "react";
import { Pressable, ScrollView, Text, View, TextInput, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useWishlist } from "../../context/WishlistContext";

const WishlistAddHeader = ({ onBack }: { onBack: () => void }) => (
    <View className="px-8 pt-6 pb-4 flex-row justify-between items-center">
        <Pressable onPress={onBack} className="bg-[#334155] p-2 rounded-full border border-[#90A1B9]/30">
            <Ionicons name="chevron-back" size={24} color="white" />
        </Pressable>
        <Text className="text-white text-xl font-bold">Add New Item</Text>
        <View style={{ width: 40 }} />
    </View>
);

const WishlistAddPage = () => {
    const router = useRouter();
    const { addItem: _addItem } = useWishlist(); // Destructured with underscore to mark as unused

    const [name, setName] = useState("");
    const [cost, setCost] = useState("");
    const [targetDate, setTargetDate] = useState("");

    const handleSave = () => {
        if (!name || !cost) {
            Alert.alert("Error", "Please fill in the item name and cost.");
            return;
        }

        // Item addition is disabled as per user request
        // The UI and Alerts are kept for demonstration purposes

        Alert.alert("Success", "Item added to wishlist!", [
            { text: "OK", onPress: () => router.back() }
        ]);
    };

    return (
        <SafeAreaView className="flex-1 bg-[#0F172B]">
            <WishlistAddHeader onBack={() => router.push('/wishlist' as any)} />

            <ScrollView className="flex-1 px-8" showsVerticalScrollIndicator={false}>
                {/* Image Upload Placeholder */}
                <View className="items-center mt-6">
                    <Pressable className="w-[280px] h-[320px] bg-[#334155] rounded-[40px] items-center justify-center border-2 border-dashed border-[#90A1B9]/30">
                        <Ionicons name="image-outline" size={60} color="#90A1B9" />
                        <Text className="text-[#90A1B9] mt-4 font-bold">Upload Image</Text>

                        <View className="absolute top-4 right-4 bg-[#6366F1] w-16 h-16 rounded-full items-center justify-center border-4 border-[#334155]">
                            <Ionicons name="add" size={40} color="white" />
                        </View>
                    </Pressable>
                </View>

                {/* Input Fields */}
                <View className="mt-10 bg-[#334155] rounded-full px-6 py-4 border border-[#90A1B9]/20">
                    <TextInput
                        className="text-white text-lg font-medium"
                        placeholder="Item Name..."
                        placeholderTextColor="rgba(255, 255, 255, 0.5)"
                        value={name}
                        onChangeText={setName}
                    />
                </View>

                <View className="mt-8 gap-y-6">
                    <View className="flex-row items-center justify-between">
                        <Text className="text-white text-2xl font-black">Cost :</Text>
                        <View className="bg-[#334155] rounded-full px-6 py-4 flex-1 ml-4 border border-[#90A1B9]/20 flex-row items-center">
                            <Text className="text-white text-lg font-bold">₱</Text>
                            <View className="w-[1px] h-4 bg-white/20 mx-2" />
                            <TextInput
                                className="text-white text-lg flex-1"
                                placeholder="0.00"
                                placeholderTextColor="rgba(255, 255, 255, 0.3)"
                                keyboardType="numeric"
                                value={cost}
                                onChangeText={setCost}
                            />
                        </View>
                    </View>

                    <View className="flex-row items-center justify-between">
                        <Text className="text-white text-2xl font-black">Target Date:</Text>
                        <View className="bg-[#334155] rounded-full px-6 py-4 flex-1 ml-4 border border-[#90A1B9]/20 items-center">
                            <TextInput
                                className="text-white text-lg font-medium w-full text-center"
                                placeholder="YYYY - MM - DD"
                                placeholderTextColor="rgba(255, 255, 255, 0.3)"
                                value={targetDate}
                                onChangeText={setTargetDate}
                            />
                        </View>
                    </View>
                </View>

                {/* Save Button */}
                <Pressable
                    onPress={handleSave}
                    className="mt-16 bg-[#4ADE80] py-5 rounded-full items-center justify-center shadow-xl shadow-[#4ADE80]/30"
                >
                    <Text className="text project-text text-[#0F172B] text-xl font-black">SAVE TO WISHLIST</Text>
                </Pressable>

                <View className="h-20" />
            </ScrollView>
        </SafeAreaView>
    );
};

export default WishlistAddPage;
