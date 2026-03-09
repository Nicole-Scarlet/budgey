import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, Stack } from "expo-router";
import * as React from "react";
import { useState, useEffect } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View, Dimensions, Image, Alert, Linking, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useWishlist, WishlistItem } from "@/contexts/WishlistContext";
import { formatPHP, stripNonNumeric } from "@/utils/formatters";
import CalendarModal from "@/components/CalendarModal";
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from "@/contexts/ThemeContext";

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 64) / 2;

const WishlistScreen = () => {
    const router = useRouter();
    const { wishlistItems, addItem, updateItem, deleteItem } = useWishlist();
    const { colors, isDark } = useTheme();

    const [view, setView] = useState<'list' | 'add' | 'detail'>('list');
    const [selectedId, setSelectedId] = useState<number | null>(null);

    // Form states
    const [name, setName] = useState("");
    const [cost, setCost] = useState("");
    const [targetDate, setTargetDate] = useState("");
    const [image, setImage] = useState<string | null>(null);
    const [url, setUrl] = useState("");
    const [calendarVisible, setCalendarVisible] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

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
        if (isSaving) return;
        if (!name || !cost) {
            Alert.alert("Error", "Please fill in the item name and cost.");
            return;
        }
        const numericCost = stripNonNumeric(cost);
        let finalDate = targetDate;
        if (!finalDate || finalDate.length < 10) {
            finalDate = new Date().toISOString().split('T')[0].split('-').join(' - ');
        }

        setIsSaving(true);
        try {
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
        } finally {
            setIsSaving(false);
        }
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
            <View 
                style={{ backgroundColor: colors.card }}
                className={`px-8 pt-8 pb-10 ${view === 'list' ? 'rounded-b-[40px]' : ''}`}
            >
                <View className="flex-row justify-between items-center">
                    <Pressable
                        onPress={() => view === 'list' ? router.back() : setView('list')}
                        className={view === 'list' ? "mr-2" : "p-2 rounded-full border"}
                        style={view !== 'list' ? { backgroundColor: colors.background + '80', borderColor: colors.border + '4D' } : {}}
                    >
                        <Ionicons name="chevron-back" size={24} color={colors.foreground} />
                    </Pressable>
                    <Text 
                        className={`font-bold flex-1 text-center ${view === 'list' ? 'text-4xl' : 'text-xl'}`}
                        style={{ color: colors.foreground }}
                    >
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
            <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
                <Stack.Screen options={{ headerShown: false }} />
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
                                style={{ width: COLUMN_WIDTH, backgroundColor: colors.card, borderColor: colors.border + '4D' }}
                                className="mb-6 p-4 rounded-[25px] border shadow-lg active:opacity-70"
                            >
                                <View
                                    style={{ backgroundColor: item.color, borderColor: colors.border + '33' }}
                                    className="aspect-square rounded-2xl overflow-hidden mb-4 items-center justify-center border"
                                >
                                    {item.image ? (
                                        <Image source={{ uri: item.image }} className="w-full h-full" />
                                    ) : (
                                        <MaterialCommunityIcons name={item.icon as any} size={COLUMN_WIDTH * 0.45} color="white" style={{ opacity: 0.9 }} />
                                    )}
                                </View>
                                <View className="pr-12">
                                    <Text className="font-bold text-sm leading-tight" style={{ color: colors.foreground }} numberOfLines={2}>{item.name}</Text>
                                    <Text className="text-[#4ADE80] font-bold text-[10px] mt-1">{item.price}</Text>
                                </View>
                                <View className="absolute bottom-4 right-4 flex-row items-center">
                                    <Pressable onPress={() => handleDelete(item.id, item.name)} className="mr-2">
                                        <MaterialCommunityIcons name="trash-can-outline" size={20} color="#EF4444" />
                                    </Pressable>
                                    <Pressable onPress={() => handleOpenURL(item.url)}>
                                        <MaterialCommunityIcons name="open-in-new" size={20} color={item.url ? "#6366F1" : colors.muted} />
                                    </Pressable>
                                </View>
                            </Pressable>
                        ))}
                        {wishlistItems.length === 0 && (
                            <View className="flex-1 items-center justify-center pt-20">
                                <Ionicons name="heart-outline" size={64} style={{ color: colors.card }} />
                                <Text className="mt-4 font-medium text-lg" style={{ color: colors.muted }}>No items in your wishlist yet!</Text>
                            </View>
                        )}
                    </View>
                </ScrollView>
            </SafeAreaView>
        );
    }

    // Detail or Add View
    return (
        <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
            <Stack.Screen options={{ headerShown: false }} />
            {renderHeader()}
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
                <ScrollView className="flex-1 px-8" showsVerticalScrollIndicator={false}>
                    {/* Visual Section */}
                    <View className="items-center mt-6">
                        <Pressable
                            onPress={handleImageChoice}
                            style={[
                                view === 'detail' && item ? { backgroundColor: item.color } : { backgroundColor: colors.card },
                                view === 'add' ? { borderColor: colors.border + '4D', borderWidth: 2, borderStyle: 'dashed' } : { borderColor: colors.border + '33', borderWidth: 1 }
                            ]}
                            className={`w-[280px] h-[320px] rounded-[40px] items-center justify-center relative overflow-hidden shadow-2xl`}
                        >
                            {image ? (
                                <Image source={{ uri: image }} className="w-full h-full" />
                            ) : view === 'add' ? (
                                <>
                                    <Ionicons name="image-outline" size={60} color={colors.muted} />
                                    <Text className="mt-4 font-bold" style={{ color: colors.muted }}>Upload Image</Text>
                                </>
                            ) : (
                                <MaterialCommunityIcons name={item?.icon as any} size={120} color="white" style={{ opacity: 0.8 }} />
                            )}
                            <View 
                                style={{ backgroundColor: "#6366F1", borderColor: colors.card }}
                                className="absolute top-4 right-4 w-12 h-12 rounded-full items-center justify-center border-4"
                            >
                                <Ionicons name={image ? "create" : "add"} size={32} color="white" />
                            </View>
                        </Pressable>
                    </View>

                    {/* Inputs */}
                    <View 
                        style={{ backgroundColor: colors.card, borderColor: colors.border + '33' }}
                        className="mt-10 rounded-full px-6 py-4 flex-row items-center border"
                    >
                        <TextInput
                            className="text-lg font-medium flex-1"
                            style={{ color: colors.foreground }}
                            placeholder="Item Name..."
                            placeholderTextColor={colors.muted + '80'}
                            value={name}
                            onChangeText={setName}
                        />
                        {view === 'detail' && <Text className="font-bold" style={{ color: colors.muted }}>Edit</Text>}
                    </View>

                    <View 
                        style={{ backgroundColor: colors.card, borderColor: colors.border + '33' }}
                        className="mt-8 rounded-full px-6 py-4 border"
                    >
                        <TextInput
                            className="text-lg font-medium"
                            style={{ color: colors.foreground }}
                            placeholder="Product URL (Optional)..."
                            placeholderTextColor={colors.muted + '80'}
                            value={url}
                            onChangeText={setUrl}
                            autoCapitalize="none"
                            keyboardType="url"
                        />
                    </View>

                    <View className="mt-8 gap-y-6">
                        <View className="flex-row items-center justify-between">
                            <Text className="text-2xl font-black" style={{ color: colors.foreground }}>Cost :</Text>
                            <View 
                                style={{ backgroundColor: colors.card, borderColor: colors.border + '33' }}
                                className="rounded-full px-6 py-4 flex-1 ml-4 border flex-row items-center"
                            >
                                <Text className="text-lg font-bold" style={{ color: colors.foreground }}>₱</Text>
                                <View className="w-[1px] h-4 mx-2" style={{ backgroundColor: colors.muted + '33' }} />
                                <TextInput
                                    className="text-lg flex-1"
                                    style={{ color: colors.foreground }}
                                    placeholder="0"
                                    placeholderTextColor={colors.muted + '4D'}
                                    keyboardType="numeric"
                                    value={cost}
                                    onChangeText={handleCostChange}
                                />
                            </View>
                        </View>

                        <View className="flex-row items-center justify-between">
                            <Text className="text-2xl font-black" style={{ color: colors.foreground }}>Target Date:</Text>
                            <Pressable
                                onPress={() => setCalendarVisible(true)}
                                style={{ backgroundColor: colors.card, borderColor: colors.border + '33' }}
                                className="rounded-full px-6 py-4 flex-1 ml-4 border items-center justify-center"
                            >
                                <Text 
                                    className="text-lg font-medium"
                                    style={{ color: targetDate ? colors.foreground : colors.muted + '4D' }}
                                >
                                    {targetDate || "YYYY - MM - DD"}
                                </Text>
                            </Pressable>
                        </View>
                    </View>

                    <Pressable
                        onPress={handleSave}
                        disabled={isSaving}
                        className={`mt-10 py-5 rounded-full items-center justify-center shadow-xl ${view === 'add' ? 'bg-[#4ADE80] shadow-[#4ADE80]/30' : 'bg-[#6366F1] shadow-[#6366F1]/30'}`}
                        style={{ opacity: isSaving ? 0.7 : 1 }}
                    >
                        {isSaving ? (
                            <ActivityIndicator color={view === 'add' ? '#0F172B' : '#fff'} />
                        ) : (
                            <Text className={`text-xl font-black ${view === 'add' ? 'text-[#0F172B]' : 'text-white'}`}>
                                {view === 'add' ? "SAVE TO WISHLIST" : "SAVE CHANGES"}
                            </Text>
                        )}
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
                                <Text className="text-2xl font-black mb-4" style={{ color: colors.foreground }}>Progress percentage:</Text>
                                <View 
                                    style={{ backgroundColor: colors.card, borderColor: '#4ADE804D' }}
                                    className="rounded-full p-2 border overflow-hidden relative h-16 justify-center"
                                >
                                    <View style={{ width: `${item?.progress || 0}%`, backgroundColor: '#4ADE8033' }} className="h-full absolute left-0 rounded-l-full" />
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
                                <Text className="text-2xl font-black mb-4" style={{ color: colors.foreground }}>Contribution Commitment</Text>
                                <View 
                                    style={{ backgroundColor: colors.card, borderColor: colors.border + '33' }}
                                    className="rounded-[30px] p-8 border"
                                >
                                    {item?.commitments && item.commitments.length > 0 ? item.commitments.map((commit: any, idx: number) => (
                                        <View key={idx} className="flex-row justify-between items-center mb-4">
                                            <Text className="font-bold opacity-80" style={{ color: colors.foreground }}>{commit.date}</Text>
                                            <Text className="text-[#4ADE80] font-bold">{commit.amount}</Text>
                                        </View>
                                    )) : (
                                        <Text className="italic text-center" style={{ color: colors.muted + '66' }}>No commitments yet.</Text>
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
                onSelectDate={(date) => {
                    const formatted = date.toISOString().split('T')[0].split('-').join(' - ');
                    setTargetDate(formatted);
                }}
                currentDate={targetDate ? new Date(targetDate.split(' - ').join('-')) : new Date()}
                title="Target Date"
            />
        </SafeAreaView>
    );
};

export default WishlistScreen;
