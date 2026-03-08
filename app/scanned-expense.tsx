import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTransactions } from '../contexts/TransactionContext';

const GEMINI_API_KEY = 'API KEY';

export default function ScannedExpenseScreen() {
    const router = useRouter();
    const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
    const [isAnalyzing, setIsAnalyzing] = useState(true);
    const [scannedItems, setScannedItems] = useState<any[]>([]);
    const { addTransaction, categories } = useTransactions();
    const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
    const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);

    const expenseCategories = categories.filter(c => c.type.toLowerCase() === 'expense');

    useEffect(() => {
        if (!imageUri) {
            setIsAnalyzing(false);
            return;
        }

        const analyzeImage = async () => {
            try {
                // 1. Convert image URI to Base64
                const response = await fetch(imageUri);
                const blob = await response.blob();

                const base64Data = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        const base64String = (reader.result as string).split(',')[1];
                        resolve(base64String);
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                });

                // 2. Prepare payload for Gemini API
                const prompt = `You are an expert receipt analyzer. Extract all purchased items from this receipt image. 
Return ONLY a valid JSON array of objects without any markdown formatting like \`\`\`json. Each object must have exactly these keys:
- "name": The short name of the purchased item.
- "amount": The exact price of the item as a pure number (do not include currency symbols, e.g. 180.00). Ensure it's a number type in JSON.`;

                const payload = {
                    contents: [
                        {
                            parts: [
                                { text: prompt },
                                {
                                    inlineData: {
                                        mimeType: 'image/jpeg',
                                        data: base64Data
                                    }
                                }
                            ]
                        }
                    ]
                };

                // 3. Call Gemini API
                const apiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload)
                });

                if (!apiResponse.ok) {
                    throw new Error(`API Error: ${apiResponse.status}`);
                }

                const data = await apiResponse.json();
                const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';

                // 4. Parse JSON
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

    }, [imageUri]);

    const handleSaveAll = () => {
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

        scannedItems.forEach(item => {
            const amountValue = typeof item.amount === 'number' ? item.amount : parseFloat(String(item.amount).replace(/[^0-9.-]+/g, '')) || 0;

            addTransaction({
                title: item.name || 'Unknown Item',
                amount: amountValue,
                categoryId: item.categoryId || 'other',
                type: 'expense',
                date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
            });
        });

        router.push('/expenses');
    };

    return (
        <SafeAreaView className="flex-1 bg-[#1E293B]">
            {/* Header */}
            <View className="px-6 py-4 flex-row items-center justify-between">
                <Pressable onPress={() => router.back()} className="p-2">
                    <Ionicons name="arrow-back" size={24} color="white" />
                </Pressable>
                <Text className="text-white text-xl font-bold">Expenses</Text>
                <Pressable className="p-2">
                    <MaterialCommunityIcons name="dots-horizontal" size={24} color="white" />
                </Pressable>
            </View>

            <ScrollView className="flex-1 px-6 mt-4 border-b border-[#90A1B9]/10 pb-4">
                {/* Captured Image Preview & Analyzing State */}
                {imageUri ? (
                    <View className="mb-6 rounded-[25px] overflow-hidden border border-[#90A1B9]/30 items-center justify-center bg-black h-48 relative">
                        <Image
                            source={{ uri: imageUri }}
                            style={{ width: '100%', height: '100%', resizeMode: 'cover', opacity: isAnalyzing ? 0.4 : 1 }}
                        />

                        {isAnalyzing && (
                            <View className="absolute items-center justify-center">
                                <ActivityIndicator size="large" color="#3B82F6" />
                                <Text className="text-[#38BDF8] font-bold mt-4 text-center">AI Analyzing Receipt...</Text>
                                <Text className="text-white/70 text-xs mt-1">Extracting text and amounts</Text>
                            </View>
                        )}
                    </View>
                ) : null}

                <Text className="text-[#CBD5E1] text-lg font-bold mb-4">
                    {isAnalyzing ? 'Extracting Details...' : 'Scanned Details'}
                </Text>

                {/* Details Table Container */}
                <View className="bg-[#334155] rounded-[25px] border border-[#90A1B9]/30 overflow-hidden">
                    {/* Table Header */}
                    <View className="flex-row border-b border-[#90A1B9]/20 px-4 py-4">
                        <Text className="flex-1 text-[#CBD5E1] font-bold text-xs">Name</Text>
                        <Text className="w-20 text-[#CBD5E1] font-bold text-xs">Category</Text>
                        <Text className="w-20 text-[#CBD5E1] font-bold text-xs text-right">Amount</Text>
                    </View>

                    {/* Table Rows */}
                    {isAnalyzing ? (
                        <View className="p-8 items-center justify-center">
                            <Text className="text-white/50 italic text-xs">Waiting for AI extraction...</Text>
                        </View>
                    ) : scannedItems.length === 0 ? (
                        <View className="p-8 items-center justify-center">
                            <MaterialCommunityIcons name="receipt" size={32} color="#94A3B8" className="mb-2" />
                            <Text className="text-[#94A3B8] text-xs text-center mt-2">No items detected on this receipt.</Text>
                        </View>
                    ) : (
                        scannedItems.map((item, index) => (
                            <View key={index} className={`flex-row items-center px-4 py-4 ${index !== scannedItems.length - 1 ? 'border-b border-[#90A1B9]/10' : ''}`}>
                                <Text className="flex-1 text-white text-[11px] leading-4 pl-1 pr-2" numberOfLines={2}>{item.name}</Text>

                                <Pressable
                                    className="w-28 justify-center"
                                    onPress={() => {
                                        setSelectedItemIndex(index);
                                        setIsCategoryModalVisible(true);
                                    }}
                                >
                                    {item.categoryId ? (
                                        <View className="bg-slate-700 px-2 py-1.5 rounded flex-row items-center border border-slate-600 mr-2">
                                            <Feather name={categories.find(c => c.id === item.categoryId)?.icon as any || 'help-circle'} size={12} color={categories.find(c => c.id === item.categoryId)?.color || '#94A3B8'} />
                                            <Text className="text-white text-[10px] ml-1.5 flex-1" numberOfLines={1}>
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
                        <Text className="text-white text-xl font-bold mb-6">{scannedItems.length > 0 ? "Is That All?" : "No Items Found"}</Text>

                        <View className="flex-row w-full px-4 gap-4">
                            {scannedItems.length > 0 && (
                                <Pressable
                                    onPress={handleSaveAll}
                                    disabled={scannedItems.some(item => (typeof item.amount === 'number' ? item.amount : parseFloat(String(item.amount).replace(/[^0-9.-]+/g, '')) || 0) > 1000000000)}
                                    className={`flex-1 border border-[#38BDF8] rounded-xl py-4 items-center 
                                        ${scannedItems.some(item => (typeof item.amount === 'number' ? item.amount : parseFloat(String(item.amount).replace(/[^0-9.-]+/g, '')) || 0) > 1000000000) ? 'bg-slate-700/50 border-slate-600' : 'bg-[#3B82F6]/10'}`}
                                >
                                    <Text className={`${scannedItems.some(item => (typeof item.amount === 'number' ? item.amount : parseFloat(String(item.amount).replace(/[^0-9.-]+/g, '')) || 0) > 1000000000) ? 'text-slate-500' : 'text-[#38BDF8]'} font-bold`}>YES, SAVE</Text>
                                </Pressable>
                            )}

                            <Pressable
                                onPress={() => router.back()}
                                className="flex-1 bg-[#334155] rounded-xl py-4 items-center"
                            >
                                <Text className="text-[#CBD5E1] font-bold">RESCAN</Text>
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
                    <View className="bg-[#1E293B] rounded-t-3xl pt-6 pb-10 px-6">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-white text-lg font-bold">Select Category</Text>
                            <Pressable onPress={() => setIsCategoryModalVisible(false)} className="bg-white/10 p-2 rounded-full">
                                <Ionicons name="close" size={20} color="white" />
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
                                            className="w-14 h-14 rounded-full items-center justify-center mb-2 bg-[#303E55]"
                                        >
                                            <Feather name={cat.icon as any} size={20} color={cat.color} />
                                        </View>
                                        <Text className="text-[10px] text-center text-slate-400" numberOfLines={1}>
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
                                        className="w-14 h-14 rounded-full items-center justify-center mb-2 bg-[#303E55] border-2 border-dashed border-[#94A3B8]"
                                    >
                                        <Feather name="plus" size={20} color="#94A3B8" />
                                    </View>
                                    <Text className="text-[10px] text-center text-slate-400" numberOfLines={1}>
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
