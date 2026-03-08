import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as React from "react";
import { useState, useEffect } from "react";
import { Pressable, ScrollView, Text, View, Dimensions, Image, Alert, Linking, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useWishlist, WishlistItem } from "../context/WishlistContext";
import { formatPHP, stripNonNumeric } from "../utils/formatters";
import CalendarModal from "../components/CalendarModal";
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 64) / 2;

const WishlistScreen = () => {
    const router = useRouter();
    const { wishlistItems, addItem, updateItem, deleteItem } = useWishlist();

    const [view, setView] = useState<'list' | 'add' | 'detail'>('list');
    const [selectedId, setSelectedId] = useState<number | null>(null);

    // Form states
    const [name, setName] = useState("");
    const [cost, setCost] = useState("");
    const [targetDate, setTargetDate] = useState("");
    const [image, setImage] = useState<string | null>(null);
    const [url, setUrl] = useState("");
    const [calendarVisible, setCalendarVisible] = useState(false);

    const item = selectedId ? wishlistItems.find(i => i.id === selectedId) : null;

    useEffect(() => {
        if (view === 'detail' && item) {
            setName(item.name);
            const formattedCost = item.cost ? item.cost.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "";
            setCost(formattedCost);
            setTargetDate(item.targetDate);
            setUrl(item.url || "");
            setImage(item.image || null);
        } else if (view === 'add') {
            setName("");
            setCost("");
            setTargetDate("");
            setUrl("");
            setImage(null);
        }
    }, [view, selectedId, item]);

    const handleOpenURL = (url?: string) => {
        if (!url) {
            Alert.alert("Link unavailable", "No product URL has been provided for this item.");
            return;
        }
        const fullUrl = url.startsWith('http') ? url : `https://${url}`;
        Linking.canOpenURL(fullUrl).then(supported => {
            if (supported) Linking.openURL(fullUrl);
            else Alert.alert("Error", "Could not open this URL.");
        });
    };

    const handleImageChoice = () => {
        Alert.alert(
            "Item Photo",
            "Choose an option",
            [
                {
                    text: "Take Photo", onPress: async () => {
                        const { status } = await ImagePicker.requestCameraPermissionsAsync();
                        if (status !== 'granted') return Alert.alert('Error', 'Camera permission required');
                        const res = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [4, 5], quality: 1 });
                        if (!res.canceled) setImage(res.assets[0].uri);
                    }
                },
                {
                    text: "Choose from Gallery", onPress: async () => {
                        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                        if (status !== 'granted') return Alert.alert('Error', 'Library permission required');
                        const res = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [4, 5], quality: 1 });
                        if (!res.canceled) setImage(res.assets[0].uri);
                    }
                },
                { text: "Cancel", style: "cancel" }
            ]
        );
    };

    const handleSave = async () => {
        if (!name || !cost) {
            Alert.alert("Error", "Please fill in the item name and cost.");
            return;
        }
        const numericCost = stripNonNumeric(cost);
        let finalDate = targetDate;
        if (!finalDate || finalDate.length < 10) {
            finalDate = new Date().toISOString().split('T')[0].split('-').join(' - ');
        }

        if (view === 'add') {
            await addItem({
                name,
                cost: numericCost,
                price: formatPHP(numericCost),
                targetDate: finalDate,
                progress: 0,
                color: "#64748B",
                icon: "archive-outline",
                image: image || undefined,
                url: url || undefined,
                commitments: []
            });
            Alert.alert("Success", "Item added to wishlist!");
        } else if (view === 'detail' && selectedId) {
            await updateItem(selectedId, {
                name,
                cost: numericCost,
                targetDate: finalDate,
                url: url || undefined,
                price: formatPHP(numericCost),
                image: image || undefined
            });
            Alert.alert("Success", "Changes saved!");
        }
        setView('list');
    };

    const handleDelete = (id: number, name: string) => {
        Alert.alert(
            "Delete Item",
            `Are you sure you want to delete "${name}"?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        await deleteItem(id);
                        if (view === 'detail') setView('list');
                    }
                }
            ]
        );
    };

    const handleCostChange = (text: string) => {
        const numeric = stripNonNumeric(text);
        if (!numeric) {
            setCost("");
            return;
        }
        const formatted = numeric.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        setCost(formatted);
    };

    // --- Sub-renderers ---

    const renderHeader = () => {
        const title = view === 'list' ? "Your Wishlist" : view === 'add' ? "Add New Item" : "Item Details";
        return (
            <View className={`px-8 pt-8 pb-10 ${view === 'list' ? 'bg-[#334155] rounded-b-[40px]' : 'bg-[#334155]'}`}>
                <View className="flex-row justify-between items-center">
                    <Pressable
                        onPress={() => view === 'list' ? router.back() : setView('list')}
                        className={view === 'list' ? "mr-2" : "bg-slate-700/50 p-2 rounded-full border border-slate-500/30"}
                    >
                        <Ionicons name="chevron-back" size={24} color="white" />
                    </Pressable>
                    <Text className={`text-white font-bold flex-1 text-center ${view === 'list' ? 'text-4xl' : 'text-xl'}`}>
                        {title}
                    </Text>
                    {view === 'list' ? (
                        <Pressable onPress={() => setView('add')} className="ml-2">
                            <Ionicons name="add-circle" size={40} color="#4ADE80" />
                        </Pressable>
                    ) : (
                        <View style={{ width: 40 }} />
                    )}
                </View>
            </View>
        );
    };

    if (view === 'list') {
        return (
            <SafeAreaView className="flex-1 bg-[#1E293B]">
                {renderHeader()}
                <ScrollView
                    className="flex-1 px-8 pt-8"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 120 }}
                >
                    <View className="flex-row flex-wrap justify-between">
                        {wishlistItems.map((item) => (
                            <Pressable
                                key={item.id}
                                onPress={() => {
                                    setSelectedId(item.id);
                                    setView('detail');
                                }}
                                style={{ width: COLUMN_WIDTH }}
                                className="bg-[#334155] mb-6 p-4 rounded-[25px] border border-[#90A1B9]/30 shadow-lg active:opacity-70"
                            >
                                <View
                                    style={{ backgroundColor: item.color }}
                                    className="aspect-square rounded-2xl overflow-hidden mb-4 items-center justify-center border border-[#90A1B9]/20"
                                >
                                    {item.image ? (
                                        <Image source={{ uri: item.image }} className="w-full h-full" />
                                    ) : (
                                        <MaterialCommunityIcons name={item.icon as any} size={COLUMN_WIDTH * 0.45} color="white" style={{ opacity: 0.9 }} />
                                    )}
                                </View>
                                <View className="pr-12">
                                    <Text className="text-white font-bold text-sm leading-tight" numberOfLines={2}>{item.name}</Text>
                                    <Text className="text-[#4ADE80] font-bold text-[10px] mt-1">{item.price}</Text>
                                </View>
                                <View className="absolute bottom-4 right-4 flex-row items-center">
                                    <Pressable onPress={() => handleDelete(item.id, item.name)} className="mr-2">
                                        <MaterialCommunityIcons name="trash-can-outline" size={20} color="#EF4444" />
                                    </Pressable>
                                    <Pressable onPress={() => handleOpenURL(item.url)}>
                                        <MaterialCommunityIcons name="open-in-new" size={20} color={item.url ? "#6366F1" : "#475569"} />
                                    </Pressable>
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
            </SafeAreaView>
        );
    }

    // Detail or Add View
    return (
        <SafeAreaView className="flex-1 bg-[#1E293B]">
            {renderHeader()}
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
                <ScrollView className="flex-1 px-8" showsVerticalScrollIndicator={false}>
                    {/* Visual Section */}
                    <View className="items-center mt-6">
                        <Pressable
                            onPress={handleImageChoice}
                            style={view === 'detail' && item ? { backgroundColor: item.color } : {}}
                            className={`w-[280px] h-[320px] rounded-[40px] items-center justify-center relative overflow-hidden ${view === 'add' ? 'bg-[#334155] border-2 border-dashed border-[#90A1B9]/30' : 'shadow-2xl border border-[#90A1B9]/20'}`}
                        >
                            {image ? (
                                <Image source={{ uri: image }} className="w-full h-full" />
                            ) : view === 'add' ? (
                                <>
                                    <Ionicons name="image-outline" size={60} color="#90A1B9" />
                                    <Text className="text-[#90A1B9] mt-4 font-bold">Upload Image</Text>
                                </>
                            ) : (
                                <MaterialCommunityIcons name={item?.icon as any} size={120} color="white" style={{ opacity: 0.8 }} />
                            )}
                            <View className="absolute top-4 right-4 bg-[#6366F1] w-12 h-12 rounded-full items-center justify-center border-4 border-[#334155]">
                                <Ionicons name={image ? "create" : "add"} size={32} color="white" />
                            </View>
                        </Pressable>
                    </View>

                    {/* Inputs */}
                    <View className="mt-10 bg-[#334155] rounded-full px-6 py-4 flex-row items-center border border-[#90A1B9]/20">
                        <TextInput
                            className="text-white text-lg font-medium flex-1"
                            placeholder="Item Name..."
                            placeholderTextColor="rgba(255, 255, 255, 0.5)"
                            value={name}
                            onChangeText={setName}
                        />
                        {view === 'detail' && <Text className="text-[#94A3B8] font-bold">Edit</Text>}
                    </View>

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

                    <Pressable
                        onPress={handleSave}
                        className={`mt-10 py-5 rounded-full items-center justify-center shadow-xl ${view === 'add' ? 'bg-[#4ADE80] shadow-[#4ADE80]/30' : 'bg-[#6366F1] shadow-[#6366F1]/30'}`}
                    >
                        <Text className={`text-xl font-black ${view === 'add' ? 'text-[#0F172B]' : 'text-white'}`}>
                            {view === 'add' ? "SAVE TO WISHLIST" : "SAVE CHANGES"}
                        </Text>
                    </Pressable>

                    {view === 'detail' && (
                        <>
                            <Pressable
                                onPress={() => handleDelete(selectedId!, item?.name || "")}
                                className="mt-4 bg-transparent py-5 rounded-full items-center justify-center border border-[#EF4444]"
                            >
                                <Text className="text-[#EF4444] text-xl font-black">DELETE ITEM</Text>
                            </Pressable>

                            {/* Progress percentage */}
                            <View className="mt-10">
                                <Text className="text-white text-2xl font-black mb-4">Progress percentage:</Text>
                                <View className="bg-[#334155] rounded-full p-2 border border-[#4ADE80]/30 overflow-hidden relative h-16 justify-center">
                                    <View style={{ width: `${item?.progress || 0}%` }} className="bg-[#4ADE80]/20 h-full absolute left-0 rounded-l-full" />
                                    <View className="flex-row items-center px-4">
                                        <View className="bg-[#4ADE80] rounded-lg px-3 py-1 mr-4">
                                            <Text className="text-[#0F172B] text-2xl font-black">{item?.progress || 0}%</Text>
                                        </View>
                                        <View
                                            style={{ transform: [{ translateX: ((item?.progress || 0) / 100) * 150 }] }}
                                            className="h-6 w-16 bg-[#00C853] rounded-full shadow-lg"
                                        />
                                    </View>
                                </View>
                            </View>

                            {/* Commitment list */}
                            <View className="mt-10 mb-20">
                                <Text className="text-white text-2xl font-black mb-4">Contribution Commitment</Text>
                                <View className="bg-[#334155] rounded-[30px] p-8 border border-[#90A1B9]/20">
                                    {item?.commitments && item.commitments.length > 0 ? item.commitments.map((commit: any, idx: number) => (
                                        <View key={idx} className="flex-row justify-between items-center mb-4">
                                            <Text className="text-white font-bold opacity-80">{commit.date}</Text>
                                            <Text className="text-[#4ADE80] font-bold">{commit.amount}</Text>
                                        </View>
                                    )) : (
                                        <Text className="text-white/40 italic text-center">No commitments yet.</Text>
                                    )}
                                </View>
                            </View>
                        </>
                    )}
                    <View className="h-20" />
                </ScrollView>
            </KeyboardAvoidingView>

            <CalendarModal
                visible={calendarVisible}
                onClose={() => setCalendarVisible(false)}
                onSelectDate={setTargetDate}
                currentDate={targetDate}
            />
        </SafeAreaView>
    );
};

export default WishlistScreen;
