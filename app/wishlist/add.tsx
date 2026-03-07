import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as React from "react";
import { useState } from "react";
import { Pressable, ScrollView, Text, View, TextInput, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useWishlist } from "../../context/WishlistContext";
import { formatPHP, stripNonNumeric } from "../../utils/formatters";
import CalendarModal from "../../components/CalendarModal";
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'react-native';

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
    const { addItem } = useWishlist();

    const [name, setName] = useState("");
    const [cost, setCost] = useState(""); // This will store the number with commas for display
    const [targetDate, setTargetDate] = useState("");
    const [image, setImage] = useState<string | null>(null);
    const [url, setUrl] = useState("");
    const [calendarVisible, setCalendarVisible] = useState(false);

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
            setImage(result.assets[0].uri);
        }
    };

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Sorry, we need camera permissions to make this work!');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 5],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleImageChoice = () => {
        Alert.alert(
            "Add Item Photo",
            "Choose an option",
            [
                { text: "Take Photo", onPress: takePhoto },
                { text: "Choose from Gallery", onPress: pickImage },
                { text: "Cancel", style: "cancel" }
            ]
        );
    };

    const handleSave = () => {
        if (!name || !cost) {
            Alert.alert("Error", "Please fill in the item name and cost.");
            return;
        }

        const numericCost = stripNonNumeric(cost);

        // Standardize date format if it's incomplete or missing
        let finalDate = targetDate;
        if (!finalDate || finalDate.length < 10) {
            finalDate = new Date().toISOString().split('T')[0].split('-').join(' - ');
        }

        addItem({
            name,
            cost: numericCost,
            price: formatPHP(numericCost),
            targetDate: finalDate,
            progress: 0,
            color: "#64748B", // Default color
            icon: "archive-outline", // Default icon
            image: image || undefined,
            url: url || undefined,
            commitments: []
        });

        Alert.alert("Success", "Item added to wishlist!", [
            { text: "OK", onPress: () => router.back() }
        ]);
    };

    const handleCostChange = (text: string) => {
        // Only allow numbers, automatically add commas
        const numeric = stripNonNumeric(text);
        if (!numeric) {
            setCost("");
            return;
        }
        const formatted = parseInt(numeric).toLocaleString();
        setCost(formatted);
    };

    return (
        <SafeAreaView className="flex-1 bg-[#0F172B]">
            <WishlistAddHeader onBack={() => router.push('/wishlist' as any)} />

            <ScrollView className="flex-1 px-8" showsVerticalScrollIndicator={false}>
                {/* Image Upload Area */}
                <View className="items-center mt-6">
                    <Pressable
                        onPress={handleImageChoice}
                        className="w-[280px] h-[320px] bg-[#334155] rounded-[40px] items-center justify-center border-2 border-dashed border-[#90A1B9]/30 overflow-hidden"
                    >
                        {image ? (
                            <Image source={{ uri: image }} className="w-full h-full" />
                        ) : (
                            <>
                                <Ionicons name="image-outline" size={60} color="#90A1B9" />
                                <Text className="text-[#90A1B9] mt-4 font-bold">Upload Image</Text>
                            </>
                        )}

                        <View className="absolute top-4 right-4 bg-[#6366F1] w-16 h-16 rounded-full items-center justify-center border-4 border-[#334155]">
                            <Ionicons name={image ? "create" : "add"} size={40} color="white" />
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

                {/* URL Input */}
                <View className="mt-8 bg-[#334155] rounded-full px-6 py-4 border border-[#90A1B9]/20">
                    <TextInput
                        className="text-white text-lg font-medium"
                        placeholder="Product URL (Optional)..."
                        placeholderTextColor="rgba(255, 255, 255, 0.5)"
                        value={url}
                        onChangeText={setUrl}
                        autoCapitalize="none"
                        keyboardType="url"
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
                                placeholder="0"
                                placeholderTextColor="rgba(255, 255, 255, 0.3)"
                                keyboardType="numeric"
                                value={cost}
                                onChangeText={handleCostChange}
                            />
                        </View>
                    </View>

                    <View className="flex-row items-center justify-between">
                        <Text className="text-white text-2xl font-black">Target Date:</Text>
                        <Pressable
                            onPress={() => setCalendarVisible(true)}
                            className="bg-[#334155] rounded-full px-6 py-4 flex-1 ml-4 border border-[#90A1B9]/20 items-center justify-center"
                        >
                            <Text className={`text-lg font-medium ${targetDate ? 'text-white' : 'text-white/30'}`}>
                                {targetDate || "YYYY - MM - DD"}
                            </Text>
                        </Pressable>
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

            <CalendarModal
                visible={calendarVisible}
                onClose={() => setCalendarVisible(false)}
                onSelectDate={setTargetDate}
                currentDate={targetDate}
            />
        </SafeAreaView>
    );
};

export default WishlistAddPage;
