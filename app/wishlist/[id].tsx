import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as React from "react";
import { useState, useEffect } from "react";
import { Pressable, ScrollView, Text, View, TextInput, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useWishlist } from "../../context/WishlistContext";
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'react-native';

const WishlistDetailHeader = ({ onBack }: { onBack: () => void }) => (
    <View className="px-8 pt-6 pb-4 flex-row justify-between items-center">
        <Pressable onPress={onBack} className="bg-[#334155] p-2 rounded-full border border-[#90A1B9]/30">
            <Ionicons name="chevron-back" size={24} color="white" />
        </Pressable>
        <Text className="text-white text-xl font-bold">Item Details</Text>
        <View style={{ width: 40 }} />
    </View>
);

const WishlistItemDetail = () => {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { wishlistItems, updateItem } = useWishlist();

    // Find the item based on the ID from the route
    const item = wishlistItems.find(i => i.id === Number(id));

    const [name, setName] = useState(item?.name || "");
    const [cost, setCost] = useState(item?.cost || "");
    const [targetDate, setTargetDate] = useState(item?.targetDate || "");

    // Update state if the ID changes or item updates
    useEffect(() => {
        if (item) {
            setName(item.name);
            setCost(item.cost);
            setTargetDate(item.targetDate);
        }
    }, [id, item]);

    if (!item) {
        return (
            <SafeAreaView className="flex-1 bg-[#0F172B] items-center justify-center">
                <Text className="text-white">Item not found</Text>
                <Pressable onPress={() => router.back()} className="mt-4 bg-[#334155] px-6 py-2 rounded-full">
                    <Text className="text-white">Go Back</Text>
                </Pressable>
            </SafeAreaView>
        );
    }

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 5],
            quality: 1,
        });

        if (!result.canceled) {
            updateItem(item.id, { image: result.assets[0].uri });
        }
    };

    const handleSave = () => {
        updateItem(item.id, {
            name,
            cost,
            targetDate,
            price: `Php ${Number(cost).toLocaleString()}` // Standardized price update
        });
        Alert.alert("Success", "Changes saved successfully!");
    };

    return (
        <SafeAreaView className="flex-1 bg-[#0F172B]">
            <WishlistDetailHeader onBack={() => router.push('/wishlist' as any)} />

            <ScrollView className="flex-1 px-8" showsVerticalScrollIndicator={false}>
                {/* Image Section */}
                <View className="items-center mt-6">
                    <Pressable
                        onPress={pickImage}
                        style={{ backgroundColor: item.color }}
                        className="w-[280px] h-[320px] rounded-[40px] items-center justify-center relative overflow-hidden shadow-2xl border border-[#90A1B9]/20"
                    >
                        {item.image ? (
                            <Image source={{ uri: item.image }} className="w-full h-full" />
                        ) : (
                            <MaterialCommunityIcons name={item.icon as any} size={120} color="white" style={{ opacity: 0.8 }} />
                        )}

                        {/* Add overlay icon like screenshot */}
                        <View className="absolute top-4 right-4 bg-[#6366F1] w-16 h-16 rounded-full items-center justify-center border-4 border-[#334155]">
                            <Ionicons name={item.image ? "create" : "add"} size={40} color="white" />
                        </View>
                    </Pressable>
                </View>

                {/* Edit Name Bar */}
                <View className="mt-10 bg-[#334155] rounded-full px-6 py-3 flex-row justify-between items-center border border-[#90A1B9]/20">
                    <TextInput
                        className="text-white text-lg font-medium flex-1 mr-4"
                        placeholder="Name..."
                        placeholderTextColor="rgba(255, 255, 255, 0.5)"
                        value={name}
                        onChangeText={setName}
                    />
                    <Text className="text-white font-bold">Edit</Text>
                </View>

                {/* Info Fields */}
                <View className="mt-8 gap-y-6">
                    <View className="flex-row items-center justify-between">
                        <Text className="text-white text-2xl font-black">Cost :</Text>
                        <View className="bg-[#334155] rounded-full px-6 py-3 flex-1 ml-4 border border-[#90A1B9]/20 flex-row items-center">
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
                        <View className="bg-[#334155] rounded-full px-6 py-3 flex-1 ml-4 border border-[#90A1B9]/20 items-center">
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

                {/* Save Changes Button */}
                <Pressable
                    onPress={handleSave}
                    className="mt-10 bg-[#6366F1] py-5 rounded-full items-center justify-center shadow-xl shadow-[#6366F1]/30"
                >
                    <Text className="text-white text-xl font-black">SAVE CHANGES</Text>
                </Pressable>

                {/* Progress Section */}
                <View className="mt-10">
                    <Text className="text-white text-2xl font-black mb-4">Progress percentage:</Text>
                    <View className="bg-[#334155] rounded-full p-2 border border-[#4ADE80]/30 overflow-hidden relative h-16 justify-center">
                        <View
                            style={{ width: `${item.progress}%` }}
                            className="bg-[#4ADE80]/20 h-full absolute left-0 rounded-l-full"
                        />
                        <View className="flex-row items-center px-4">
                            <View className="bg-[#4ADE80] rounded-lg px-3 py-1 mr-4">
                                <Text className="text-[#0F172B] text-2xl font-black">{item.progress}%</Text>
                            </View>
                            <View
                                style={{ transform: [{ translateX: (item.progress / 100) * 150 }] }}
                                className="h-6 w-16 bg-[#00C853] rounded-full shadow-lg"
                            />
                        </View>
                    </View>
                </View>

                {/* Commitment Section */}
                <View className="mt-10 mb-20">
                    <Text className="text-white text-2xl font-black mb-4">Contribution Commitment</Text>
                    <View className="bg-[#334155] rounded-[30px] p-8 border border-[#90A1B9]/20">
                        {item.commitments.length > 0 ? item.commitments.map((commit, index) => (
                            <View key={index} className="flex-row justify-between items-center mb-4">
                                <Text className="text-white font-bold opacity-80">{commit.date}</Text>
                                <Text className="text-[#4ADE80] font-bold">{commit.amount}</Text>
                            </View>
                        )) : (
                            <Text className="text-white/40 italic text-center">No commitments yet.</Text>
                        )}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default WishlistItemDetail;
