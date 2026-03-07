import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as React from "react";
import { useState } from "react";
import { Pressable, ScrollView, Text, View, Dimensions, Modal, TextInput, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useWishlist, WishlistItem } from "../context/WishlistContext";

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 64) / 2;

const WishlistScreen = () => {
    const router = useRouter();
    const { wishlistItems, addItem, updateItem } = useWishlist();

    const [modalVisible, setModalVisible] = useState(false);
    const [viewMode, setViewMode] = useState<"add" | "detail">("add");
    const [selectedItem, setSelectedItem] = useState<WishlistItem | null>(null);

    // Form states
    const [name, setName] = useState("");
    const [cost, setCost] = useState("");
    const [targetDate, setTargetDate] = useState("");
    
    // Picked color/icon state for new items
    const defaultColor = "#6366F1";
    const defaultIcon = "star";

    const openAddModal = () => {
        setName("");
        setCost("");
        setTargetDate("");
        setSelectedItem(null);
        setViewMode("add");
        setModalVisible(true);
    };

    const openDetailModal = (item: WishlistItem) => {
        setSelectedItem(item);
        setName(item.name);
        setCost(item.cost);
        setTargetDate(item.targetDate);
        setViewMode("detail");
        setModalVisible(true);
    };

    const handleSaveAdd = async () => {
        if (!name || !cost) {
            Alert.alert("Error", "Please fill in the item name and cost.");
            return;
        }
        await addItem({
            name,
            cost,
            targetDate,
            price: `₱${cost}`,
            color: defaultColor, 
            icon: defaultIcon,
            progress: 0,
            commitments: []
        });
        setModalVisible(false);
    };

    const handleSaveDetail = async () => {
        if (!selectedItem) return;
        await updateItem(selectedItem.id, {
            name,
            cost,
            targetDate,
            price: `₱${cost}`
        });
        Alert.alert("Success", "Changes saved successfully!");
        setModalVisible(false);
    };

    return (
        <SafeAreaView className="flex-1 bg-[#1E293B]">
            {/* Header */}
            <View className="px-8 pt-8 pb-10 bg-[#334155] rounded-b-[40px]">
                <View className="flex-row justify-between items-center">
                    <Pressable onPress={() => router.back()} className="mr-2">
                        <Ionicons name="chevron-back" size={24} color="white" />
                    </Pressable>
                    <Text className="text-white text-4xl flex-1 text-center font-bold">Your Wishlist</Text>
                    <Pressable onPress={openAddModal} className="ml-2">
                        <Ionicons name="add" size={32} color="white" />
                    </Pressable>
                </View>
            </View>

            {/* List */}
            <ScrollView className="flex-1 px-8 pt-8" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
                <View className="flex-row flex-wrap justify-between">
                    {wishlistItems.map((item) => (
                        <Pressable
                            key={item.id}
                            onPress={() => openDetailModal(item)}
                            style={{ width: COLUMN_WIDTH }}
                            className="bg-[#334155] mb-6 p-4 rounded-[25px] border border-[#90A1B9]/30 shadow-lg active:opacity-70"
                        >
                            <View style={{ backgroundColor: item.color }} className="aspect-square rounded-2xl overflow-hidden mb-4 items-center justify-center border border-[#90A1B9]/20">
                                <MaterialCommunityIcons name={item.icon as any} size={COLUMN_WIDTH * 0.45} color="white" style={{ opacity: 0.9 }} />
                            </View>
                            <View className="pr-6">
                                <Text className="text-white font-bold text-sm leading-tight" numberOfLines={2}>{item.name}</Text>
                                <Text className="text-slate-300 text-[10px] mt-1">{item.price}</Text>
                            </View>
                            <View className="absolute bottom-4 right-4">
                                <MaterialCommunityIcons name="open-in-new" size={20} color="#CBD5E1" />
                            </View>
                        </Pressable>
                    ))}
                    {wishlistItems.length === 0 && (
                        <View className="flex-1 items-center justify-center pt-20">
                            <Ionicons name="heart-outline" size={64} color="#334155" />
                            <Text className="text-slate-400 mt-4 font-medium text-lg">No items in your wishlist yet!</Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Modal Overlay for Add/Edit */}
            <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setModalVisible(false)}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-[#0F172B]">
                    <ScrollView className="flex-1 px-8 pt-8" contentContainerStyle={{ paddingBottom: 80 }}>
                        <View className="flex-row justify-between items-center mb-8">
                            <Pressable onPress={() => setModalVisible(false)} className="bg-[#334155] p-2 rounded-full border border-[#90A1B9]/30">
                                <Ionicons name="close" size={24} color="white" />
                            </Pressable>
                            <Text className="text-white text-2xl font-bold">{viewMode === "add" ? "Add New Item" : "Item Details"}</Text>
                            <View style={{ width: 40 }} />
                        </View>

                        {/* Visual Display */}
                        {viewMode === "detail" && selectedItem ? (
                            <View className="items-center mt-2 mb-8">
                                <View style={{ backgroundColor: selectedItem.color }} className="w-[280px] h-[320px] rounded-[40px] items-center justify-center relative shadow-2xl border border-[#90A1B9]/20">
                                    <MaterialCommunityIcons name={selectedItem.icon as any} size={120} color="white" style={{ opacity: 0.8 }} />
                                </View>
                            </View>
                        ) : (
                            <View className="items-center mt-2 mb-8">
                                <View className="w-[280px] h-[320px] bg-[#334155] rounded-[40px] items-center justify-center border-2 border-dashed border-[#90A1B9]/30">
                                    <Ionicons name="image-outline" size={60} color="#90A1B9" />
                                    <Text className="text-[#90A1B9] mt-4 font-bold">Pick an Icon (coming soon)</Text>
                                </View>
                            </View>
                        )}

                        {/* Inputs */}
                        <View className="bg-[#334155] rounded-full px-6 py-4 flex-row justify-between items-center border border-[#90A1B9]/20">
                            <TextInput
                                className="text-white text-lg font-medium flex-1"
                                placeholder="Item Name..."
                                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                                value={name}
                                onChangeText={setName}
                            />
                        </View>

                        <View className="mt-6 gap-y-6">
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
                                        placeholder="YYYY-MM-DD"
                                        placeholderTextColor="rgba(255, 255, 255, 0.3)"
                                        value={targetDate}
                                        onChangeText={setTargetDate}
                                    />
                                </View>
                            </View>
                        </View>

                        {/* Save Button */}
                        <Pressable
                            onPress={viewMode === "add" ? handleSaveAdd : handleSaveDetail}
                            className={`mt-10 py-5 rounded-full items-center justify-center shadow-xl ${viewMode === 'add' ? 'bg-[#4ADE80] shadow-[#4ADE80]/30' : 'bg-[#6366F1] shadow-[#6366F1]/30'}`}
                        >
                            <Text className={`text-xl font-black ${viewMode === 'add' ? 'text-[#0F172B]' : 'text-white'}`}>
                                {viewMode === "add" ? "SAVE TO WISHLIST" : "SAVE CHANGES"}
                            </Text>
                        </Pressable>

                        {/* Sub Sections for Detail View */}
                        {viewMode === "detail" && selectedItem && (
                            <>
                                <View className="mt-10">
                                    <Text className="text-white text-2xl font-black mb-4">Progress percentage:</Text>
                                    <View className="bg-[#334155] rounded-full p-2 border border-[#4ADE80]/30 overflow-hidden h-16 justify-center">
                                        <View style={{ width: `${selectedItem.progress}%` }} className="bg-[#4ADE80]/20 h-full absolute left-0 rounded-l-full" />
                                        <View className="flex-row items-center px-4">
                                            <View className="bg-[#4ADE80] rounded-lg px-3 py-1 mr-4">
                                                <Text className="text-[#0F172B] text-2xl font-black">{selectedItem.progress}%</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>

                                <View className="mt-10">
                                    <Text className="text-white text-2xl font-black mb-4">Contribution Commitment</Text>
                                    <View className="bg-[#334155] rounded-[30px] p-8 border border-[#90A1B9]/20">
                                        {selectedItem.commitments && selectedItem.commitments.length > 0 ? selectedItem.commitments.map((commit, index) => (
                                            <View key={index} className="flex-row justify-between items-center mb-4">
                                                <Text className="text-white font-bold opacity-80">{commit.date}</Text>
                                                <Text className="text-[#4ADE80] font-bold">₱{commit.amount}</Text>
                                            </View>
                                        )) : (
                                            <Text className="text-white/40 italic text-center">No commitments yet.</Text>
                                        )}
                                    </View>
                                </View>
                            </>
                        )}
                    </ScrollView>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
};

export default WishlistScreen;
