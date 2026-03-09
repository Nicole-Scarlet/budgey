import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Image, Modal, Pressable, ScrollView, Text, View } from 'react-native';
const { width } = Dimensions.get('window');
import { SafeAreaView } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system/legacy';
import { useTransactions } from '../contexts/TransactionContext';
import { useTheme } from '../contexts/ThemeContext';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_SCANNER_TOKEN || '';

export default function ScannedExpenseScreen() {
    const router = useRouter();
    const { imageUri, imageUris } = useLocalSearchParams<{ imageUri?: string, imageUris?: string }>();
    const [isAnalyzing, setIsAnalyzing] = useState(true);
    const [scannedItems, setScannedItems] = useState<any[]>([]);
    const [base64Images, setBase64Images] = useState<string[]>([]);
    const { addTransaction, categories } = useTransactions();
    const { colors, isDark } = useTheme();
    const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
    const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);

    const expenseCategories = categories.filter(c => c.type.toLowerCase() === 'expense');

    useEffect(() => {
        const uris: string[] = [];
        if (imageUris) {
            try { uris.push(...JSON.parse(imageUris)); } catch (e) { console.error(e); }
        } else if (imageUri) {
            uris.push(imageUri);
        }

        if (uris.length === 0) {
            setIsAnalyzing(false);
            return;
        }

        const analyzeImage = async () => {
            try {
                // Read all images as base64
                const b64s = await Promise.all(uris.map(uri => 
                    FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 })
                ));
                setBase64Images(b64s);

                const prompt = `You are an expert receipt analyzer. I have provided ${uris.length} receipt image(s). 
Carefully analyze ALL images and extract every single purchased item found across ALL files. 
Return ONLY a valid JSON array of objects without any markdown formatting. 
Each object must have exactly these keys: 
- "name": Short name of the item.
- "amount": Price as a pure number.`;

                const payload = {
                    contents: [
                        {
                            parts: [
                                ...b64s.map(b64 => ({
                                    inlineData: {
                                        mimeType: 'image/jpeg',
                                        data: b64
                                    }
                                })),
                                { text: prompt }
                            ]
                        }
                    ]
                };

                const apiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload)
                });

                if (!apiResponse.ok) {
                    const errorText = await apiResponse.text();
                    console.error("API Error status:", apiResponse.status, errorText);
                    throw new Error(`API Error: ${apiResponse.status}`);
                }

                const data = await apiResponse.json();
                const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';

                let cleanedJsonText = aiText.trim();
                if (cleanedJsonText.startsWith('```json')) {
                    cleanedJsonText = cleanedJsonText.substring(7);
                    if (cleanedJsonText.endsWith('```')) {
                        cleanedJsonText = cleanedJsonText.slice(0, -3);
                    }
                } else if (cleanedJsonText.startsWith('```')) {
                    cleanedJsonText = cleanedJsonText.substring(3);
                    if (cleanedJsonText.endsWith('```')) {
                        cleanedJsonText = cleanedJsonText.slice(0, -3);
                    }
                }

                const parsedItems = JSON.parse(cleanedJsonText.trim());
                setScannedItems(Array.isArray(parsedItems) ? parsedItems : []);

            } catch (error) {
                console.error("Error analyzing image:", error);
                Alert.alert("Analysis Failed", "Could not extract details from the image automatically.");
                setScannedItems([
                    { name: 'Unknown Scanned Item', category: 'Other', amount: 0 },
                ]);
            } finally {
                setIsAnalyzing(false);
            }
        };

        analyzeImage();

    }, [imageUri, imageUris]);

    const handleSaveAll = async () => {
        const missingCategories = scannedItems.some(item => !item.categoryId);
        if (missingCategories) {
            Alert.alert("Missing Category", "Please select a category for each scanned item before saving.");
            return;
        }

        const exceedLimit = scannedItems.some(item => {
            const val = typeof item.amount === 'number' ? item.amount : parseFloat(String(item.amount).replace(/[^0-9.-]+/g, '')) || 0;
            return val > 1000000000;
        });

        if (exceedLimit) {
            Alert.alert("Limit Exceeded", "One or more items exceed the maximum limit of ₱1,000,000,000.");
            return;
        }

        for (const item of scannedItems) {
            const amountValue = typeof item.amount === 'number' ? item.amount : parseFloat(String(item.amount).replace(/[^0-9.-]+/g, '')) || 0;

            await addTransaction({
                title: item.name || 'Unknown Item',
                amount: amountValue,
                categoryId: item.categoryId || 'other',
                type: 'expense',
                date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                image: base64Images[0] || undefined // Store the first image as a reference
            });
        }

        router.push('/expenses');
    };

    return (
        <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
            {/* Header */}
            <View className="px-6 py-4 flex-row items-center justify-between">
                <Pressable onPress={() => router.back()} className="p-2">
                    <Ionicons name="arrow-back" size={24} color={colors.foreground} />
                </Pressable>
                <Text className="text-xl font-bold" style={{ color: colors.foreground }}>Expenses</Text>
                <Pressable className="p-2">
                    <MaterialCommunityIcons name="dots-horizontal" size={24} color={colors.foreground} />
                </Pressable>
            </View>

            <ScrollView 
                className="flex-1 px-6 mt-4 border-b pb-4"
                style={{ borderBottomColor: colors.border + '1A' }}
            >
                {/* Captured Image Preview & Analyzing State */}
                {base64Images.length > 0 ? (
                    <View 
                        style={{ borderColor: colors.border + '4D' }}
                        className="mb-6 rounded-[25px] overflow-hidden border items-center justify-center bg-black h-48 relative"
                    >
                        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
                            {base64Images.map((b64, idx) => (
                                <Image
                                    key={idx}
                                    source={{ uri: `data:image/jpeg;base64,${b64}` }}
                                    style={{ width: width - 48, height: '100%', resizeMode: 'cover', opacity: isAnalyzing ? 0.4 : 1 }}
                                />
                            ))}
                        </ScrollView>

                        {isAnalyzing && (
                            <View className="absolute items-center justify-center">
                                <ActivityIndicator size="large" color="#3B82F6" />
                                <Text className="text-[#38BDF8] font-bold mt-4 text-center">AI Analyzing {base64Images.length > 1 ? 'Receipts' : 'Receipt'}...</Text>
                                <Text className="text-white/70 text-xs mt-1">Combining multi-photo data</Text>
                            </View>
                        )}
                        
                        {!isAnalyzing && base64Images.length > 1 && (
                            <View className="absolute bottom-2 bg-black/50 px-3 py-1 rounded-full">
                                <Text className="text-white text-[10px] font-bold">{base64Images.length} photos (swipe left/right)</Text>
                            </View>
                        )}
                    </View>
                ) : null}

                <Text className="text-lg font-bold mb-4" style={{ color: colors.foreground + 'DD' }}>
                    {isAnalyzing ? 'Extracting Details...' : 'Scanned Details'}
                </Text>

                {/* Details Table Container */}
                <View 
                    style={{ backgroundColor: colors.card, borderColor: colors.border + '4D' }}
                    className="rounded-[25px] border overflow-hidden"
                >
                    {/* Table Header */}
                    <View className="flex-row border-b px-4 py-4" style={{ borderBottomColor: colors.border + '33' }}>
                        <Text className="flex-1 font-bold text-xs" style={{ color: colors.foreground + 'DD' }}>Name</Text>
                        <Text className="w-20 font-bold text-xs" style={{ color: colors.foreground + 'DD' }}>Category</Text>
                        <Text className="w-20 font-bold text-xs text-right" style={{ color: colors.foreground + 'DD' }}>Amount</Text>
                    </View>

                    {/* Table Rows */}
                    {isAnalyzing ? (
                        <View className="p-8 items-center justify-center">
                            <Text className="italic text-xs" style={{ color: colors.muted }}>Waiting for AI extraction...</Text>
                        </View>
                    ) : scannedItems.length === 0 ? (
                        <View className="p-8 items-center justify-center">
                            <MaterialCommunityIcons name="receipt" size={32} color={colors.muted} />
                            <Text className="text-xs text-center mt-2" style={{ color: colors.muted }}>No items detected on this receipt.</Text>
                        </View>
                    ) : (
                        scannedItems.map((item, index) => (
                            <View 
                                key={index} 
                                className={`flex-row items-center px-4 py-4`}
                                style={index !== scannedItems.length - 1 ? { borderBottomWidth: 1, borderBottomColor: colors.border + '1A' } : {}}
                            >
                                <Text className="flex-1 text-[11px] leading-4 pl-1 pr-2" style={{ color: colors.foreground }} numberOfLines={2}>{item.name}</Text>

                                <Pressable
                                    className="w-28 justify-center"
                                    onPress={() => {
                                        setSelectedItemIndex(index);
                                        setIsCategoryModalVisible(true);
                                    }}
                                >
                                    {item.categoryId ? (
                                        <View 
                                            style={{ backgroundColor: colors.background, borderColor: colors.border }}
                                            className="px-2 py-1.5 rounded flex-row items-center border mr-2"
                                        >
                                            <Feather name={categories.find(c => c.id === item.categoryId)?.icon as any || 'help-circle'} size={12} color={categories.find(c => c.id === item.categoryId)?.color || colors.muted} />
                                            <Text className="text-[10px] ml-1.5 flex-1" style={{ color: colors.foreground }} numberOfLines={1}>
                                                {categories.find(c => c.id === item.categoryId)?.name || 'Select'}
                                            </Text>
                                        </View>
                                    ) : (
                                        <View className="bg-[#ef4444]/20 px-2 py-1.5 rounded border border-[#ef4444]/50 mr-2">
                                            <Text className="text-[#ef4444] text-[10px] text-center font-bold">Select Category</Text>
                                        </View>
                                    )}
                                </Pressable>

                                <Text className="w-16 text-[#EF4444] font-bold text-xs text-right">
                                    ₱{typeof item.amount === 'number' ? item.amount.toFixed(2) : parseFloat(String(item.amount).replace(/[^0-9.-]+/g, '') || '0').toFixed(2)}
                                </Text>
                            </View>
                        ))
                    )}
                </View>

                {/* Footer Prompt */}
                {!isAnalyzing && (
                    <View className="items-center mt-12 mb-8">
                        <Text className="text-xl font-bold mb-6" style={{ color: colors.foreground }}>{scannedItems.length > 0 ? "Is That All?" : "No Items Found"}</Text>

                        <View className="flex-row w-full px-4 gap-4">
                            {scannedItems.length > 0 && (
                                <Pressable
                                    onPress={handleSaveAll}
                                    disabled={scannedItems.some(item => (typeof item.amount === 'number' ? item.amount : parseFloat(String(item.amount).replace(/[^0-9.-]+/g, '')) || 0) > 1000000000)}
                                    className={`flex-1 border border-[#38BDF8] rounded-xl py-4 items-center 
                                        ${scannedItems.some(item => (typeof item.amount === 'number' ? item.amount : parseFloat(String(item.amount).replace(/[^0-9.-]+/g, '')) || 0) > 1000000000) ? 'border-slate-600' : 'bg-[#3B82F6]/10'}`}
                                    style={scannedItems.some(item => (typeof item.amount === 'number' ? item.amount : parseFloat(String(item.amount).replace(/[^0-9.-]+/g, '')) || 0) > 1000000000) ? { backgroundColor: colors.card } : {}}
                                >
                                    <Text className="font-bold" style={{ color: scannedItems.some(item => (typeof item.amount === 'number' ? item.amount : parseFloat(String(item.amount).replace(/[^0-9.-]+/g, '')) || 0) > 1000000000) ? colors.muted : '#38BDF8' }}>YES, SAVE</Text>
                                </Pressable>
                            )}

                            <Pressable
                                onPress={() => router.back()}
                                className="flex-1 rounded-xl py-4 items-center"
                                style={{ backgroundColor: colors.card }}
                            >
                                <Text className="font-bold" style={{ color: colors.foreground + 'DD' }}>RESCAN</Text>
                            </Pressable>
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* Category Selection Modal */}
            <Modal
                visible={isCategoryModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsCategoryModalVisible(false)}
            >
                <View className="flex-1 bg-black/60 justify-end">
                    <View style={{ backgroundColor: colors.background }} className="rounded-t-3xl pt-6 pb-10 px-6">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-lg font-bold" style={{ color: colors.foreground }}>Select Category</Text>
                            <Pressable 
                                onPress={() => setIsCategoryModalVisible(false)} 
                                className="p-2 rounded-full"
                                style={{ backgroundColor: colors.card }}
                            >
                                <Ionicons name="close" size={20} color={colors.foreground} />
                            </Pressable>
                        </View>

                        <ScrollView className="max-h-80" showsVerticalScrollIndicator={false}>
                            <View className="flex-row flex-wrap" style={{ gap: 20 }}>
                                {expenseCategories.map(cat => (
                                    <Pressable
                                        key={cat.id}
                                        onPress={() => {
                                            if (selectedItemIndex !== null) {
                                                const updatedItems = [...scannedItems];
                                                updatedItems[selectedItemIndex].categoryId = cat.id;
                                                setScannedItems(updatedItems);
                                            }
                                            setIsCategoryModalVisible(false);
                                        }}
                                        className="items-center"
                                        style={{ width: '20%' }}
                                    >
                                        <View
                                            className="w-14 h-14 rounded-full items-center justify-center mb-2"
                                            style={{ backgroundColor: colors.card }}
                                        >
                                            <Feather name={cat.icon as any} size={20} color={cat.color} />
                                        </View>
                                        <Text className="text-[10px] text-center" style={{ color: colors.muted }} numberOfLines={1}>
                                            {cat.name}
                                        </Text>
                                    </Pressable>
                                ))}

                                <Pressable
                                    onPress={() => {
                                        setIsCategoryModalVisible(false);
                                        router.push({
                                            pathname: '/add-category',
                                            params: { module: 'Expense' }
                                        });
                                    }}
                                    className="items-center"
                                    style={{ width: '20%' }}
                                >
                                    <View
                                        className="w-14 h-14 rounded-full items-center justify-center mb-2 border-2 border-dashed"
                                        style={{ backgroundColor: colors.card, borderColor: colors.muted }}
                                    >
                                        <Feather name="plus" size={20} color={colors.muted} />
                                    </View>
                                    <Text className="text-[10px] text-center" style={{ color: colors.muted }} numberOfLines={1}>
                                        Add New
                                    </Text>
                                </Pressable>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
