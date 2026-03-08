import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Alert, FlatList, TouchableOpacity as RNTP, Text, TouchableOpacity, View } from 'react-native';
import { Category, useTransactions } from '../contexts/TransactionContext';
import { useTheme } from '../contexts/ThemeContext';

export default function CategoryListScreen() {
    const router = useRouter();
    const { module } = useLocalSearchParams();
    const { categories, deleteCategory, updateCategoryOrder } = useTransactions();
    const { colors, isDark } = useTheme();

    const activeCategories = useMemo(() => {
        if (!module) return categories;
        return categories.filter(c => c.type === module);
    }, [categories, module]);

    const handleDelete = (category: Category) => {
        Alert.alert(
            "Delete Category",
            `Are you sure you want to delete the "${category.name}" category? This will also delete all items under this category.`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => await deleteCategory(category.id)
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: Category }) => {
        return (
            <View 
                className="mb-3 rounded-[24px] overflow-hidden"
                style={{ backgroundColor: colors.card }}
            >
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
                        <Text className="text-[16px] font-bold tracking-wide" style={{ color: colors.foreground }}>{item.name}</Text>
                    </View>

                    <Text className="text-[14px]" style={{ color: colors.foreground + 'CC' }}>Edit</Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View className="flex-1" style={{ backgroundColor: colors.background }}>
            {/* Header */}
            <View className="px-6 pt-16 pb-4 flex-row items-center justify-between z-50">
                <RNTP onPress={() => router.back()} className="p-2 -ml-2">
                    <Feather name="arrow-left" size={26} color={colors.foreground} />
                </RNTP>
                <Text className="text-[20px] font-bold tracking-wide" style={{ color: colors.foreground }}>List</Text>
                <RNTP onPress={() => router.back()} className="p-2 -mr-2">
                    <Text className="text-[16px] font-bold" style={{ color: colors.foreground }}>Done</Text>
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
                            <Text className="text-[14px] mb-8 font-medium" style={{ color: colors.muted }}>
                                Tap any category to edit.
                            </Text>

                            <View className="flex-row items-center justify-between mb-4">
                                <Text className="text-[22px] font-bold" style={{ color: colors.foreground }}>
                                    List
                                </Text>
                                <RNTP
                                    style={{ backgroundColor: colors.card, borderColor: colors.border + '4D' }}
                                    className="px-4 py-1.5 rounded-full border"
                                    onPress={() => router.push({ pathname: '/add-category', params: { module: module || 'Expense' } } as any)}
                                >
                                    <Text className="text-[14px]" style={{ color: colors.foreground }}>+ Add</Text>
                                </RNTP>
                            </View>
                        </View>
                    }
                    ListEmptyComponent={
                        <Text className="text-[14px] ml-2 italic" style={{ color: colors.muted }}>No {typeof module === 'string' ? module.toLowerCase() : 'matching'} categories.</Text>
                    }
                />
            </View>
        </View>
    );
}
