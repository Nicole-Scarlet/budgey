import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as React from "react";
import { Pressable, ScrollView, Text, View, Dimensions, Image, Alert, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useWishlist } from "../context/WishlistContext";

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 64) / 2; // px-8 padding

const WishlistPage = () => {
    const router = useRouter();
    const { wishlistItems, deleteItem } = useWishlist();

    const handleDelete = (id: number, name: string) => {
        Alert.alert(
            "Delete Item",
            `Are you sure you want to delete "${name}"?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => deleteItem(id)
                }
            ]
        );
    };

    const handleOpenURL = (url?: string) => {
        if (!url) {
            Alert.alert("Link unavailable", "No product URL has been provided for this item.");
            return;
        }

        // Ensure the URL has a protocol
        const fullUrl = url.startsWith('http') ? url : `https://${url}`;

        Linking.canOpenURL(fullUrl).then(supported => {
            if (supported) {
                Linking.openURL(fullUrl);
            } else {
                Alert.alert("Error", "Could not open this URL.");
            }
        });
    };

    return (
        <SafeAreaView className="flex-1 bg-[#0F172B]">
            {/* Header Area from Screenshot */}
            <View className="px-8 pt-8 pb-10 bg-[#334155] rounded-b-[40px]">
                <View className="flex-row justify-center items-center">
                    <Text className="text-white text-4xl font-bold">Your Wishlist</Text>
                    <Pressable onPress={() => router.push('/wishlist/add')} className="ml-2">
                        <Ionicons name="add" size={32} color="white" />
                    </Pressable>
                </View>
            </View>

            <ScrollView
                className="flex-1 px-8 pt-8"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }}
            >
                <View className="flex-row flex-wrap justify-between">
                    {wishlistItems.map((item) => (
                        <Pressable
                            key={item.id}
                            onPress={() => router.push(`/wishlist/${item.id}` as any)}
                            style={{ width: COLUMN_WIDTH }}
                            className="bg-[#334155] mb-6 p-4 rounded-[25px] border border-[#90A1B9]/30 shadow-lg active:opacity-70"
                        >
                            {/* Visual Container (Image or Icon) */}
                            <View
                                style={{ backgroundColor: item.color }}
                                className="aspect-square rounded-2xl overflow-hidden mb-4 items-center justify-center border border-[#90A1B9]/20"
                            >
                                {item.image ? (
                                    <Image source={{ uri: item.image }} className="w-full h-full" />
                                ) : (
                                    <MaterialCommunityIcons
                                        name={item.icon as any}
                                        size={COLUMN_WIDTH * 0.45}
                                        color="white"
                                        style={{ opacity: 0.9 }}
                                    />
                                )}
                            </View>

                            {/* Info */}
                            <View className="pr-6">
                                <Text className="text-white font-bold text-sm leading-tight" numberOfLines={2}>
                                    {item.name}
                                </Text>
                                <Text className="text-slate-300 text-[10px] mt-1">
                                    {item.price}
                                </Text>
                            </View>

                            {/* Action Icons */}
                            <View className="absolute bottom-4 right-4 flex-row items-center">
                                <Pressable
                                    onPress={() => handleDelete(item.id, item.name)}
                                    className="mr-2"
                                >
                                    <MaterialCommunityIcons name="trash-can-outline" size={20} color="#EF4444" />
                                </Pressable>
                                <Pressable
                                    onPress={() => handleOpenURL(item.url)}
                                >
                                    <MaterialCommunityIcons
                                        name="open-in-new"
                                        size={20}
                                        color={item.url ? "#6366F1" : "#475569"}
                                    />
                                </Pressable>
                            </View>
                        </Pressable>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default WishlistPage;
