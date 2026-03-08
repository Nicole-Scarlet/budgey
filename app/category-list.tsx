import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Alert, FlatList, TouchableOpacity as RNTP, Text, TouchableOpacity, View } from 'react-native';
import { Category, useTransactions } from '../contexts/TransactionContext';

export default function CategoryListScreen() {
    const router = useRouter();
    const { module } = useLocalSearchParams();
    const { categories, deleteCategory, updateCategoryOrder } = useTransactions();

    // Separate categories by active module (if any) or show all
    const activeCategories = useMemo(() => {
        if (!module) return categories; // Can only reorder safely if viewing one group at a time, or handle global carefully.
        return categories.filter(c => c.type === module);
    }, [categories, module]);

    // No reorder functionality needed anymore

    const handleDelete = (category: Category) => {
        Alert.alert(
            "Delete Category",
            `Are you sure you want to delete the "${category.name}" category? This will also delete all items under this category.`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => deleteCategory(category.id)
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: Category }) => {
        return (
            <View className="mb-3 rounded-[24px] overflow-hidden bg-[#303E55]">
                <TouchableOpacity
                    onPress={() => router.push({ pathname: '/add-category', params: { id: item.id, module: item.type } } as any)}
                    style={{ padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                >
                    <View className="flex-row items-center flex-1">
                        <View
                            className="w-10 h-10 rounded-full border items-center justify-center mr-4 ml-1"
                            style={{ backgroundColor: `${item.color}20`, borderColor: item.color }}
                        >
                            <Feather name={item.icon as any} size={20} color={item.color} />
                        </View>
                        <Text className="text-white text-[16px] font-bold tracking-wide">{item.name}</Text>
                    </View>

                    <Text className="text-slate-300 text-[14px]">Edit</Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View className="flex-1 bg-[#1E293B]">
            {/* Header */}
            <View className="px-6 pt-16 pb-4 flex-row items-center justify-between z-50">
                <RNTP onPress={() => router.back()} className="p-2 -ml-2">
                    <Feather name="arrow-left" size={26} color="#E2E8F0" />
                </RNTP>
                <Text className="text-white text-[20px] font-bold tracking-wide">List</Text>
                <RNTP onPress={() => router.back()} className="p-2 -mr-2">
                    <Text className="text-white text-[16px] font-bold">Done</Text>
                </RNTP>
            </View>

            <View className="flex-1 px-5">
                <FlatList
                    data={activeCategories}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    ListHeaderComponent={
                        <View className="mb-4 mt-2">
                            <Text className="text-slate-500 text-[14px] mb-8 font-medium">
                                Tap any category to edit.
                            </Text>

                            <View className="flex-row items-center justify-between mb-4">
                                <Text className="text-white text-[22px] font-bold">
                                    List
                                </Text>
                                <RNTP
                                    className="bg-[#334155] px-4 py-1.5 rounded-full"
                                    onPress={() => router.push({ pathname: '/add-category', params: { module: module || 'Expense' } } as any)}
                                >
                                    <Text className="text-white text-[14px]">+ Add</Text>
                                </RNTP>
                            </View>
                        </View>
                    }
                    ListEmptyComponent={
                        <Text className="text-slate-400 text-[14px] ml-2 italic">No {typeof module === 'string' ? module.toLowerCase() : 'matching'} categories.</Text>
                    }
                />
            </View>
        </View>
    );
}
