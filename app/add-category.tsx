import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { useStore } from '../store/useStore';

const ICONS = [
    'smile', 'smartphone', 'crosshair', 'terminal', 'thumbs-up',
    'anchor', 'dribbble', 'shopping-cart', 'compass', 'gift',
    'heart', 'sun', 'moon', 'feather', 'headphones',
    'umbrella', 'clipboard', 'tv', 'box', 'book'
];

const COLORS = [
    '#FDBA74', '#F87171', '#34D399', '#818CF8', '#38BDF8',
    '#FDE047', '#C084FC', '#22D3EE', '#E879F9', '#94A3B8'
];

export default function AddCategoryScreen() {
    const router = useRouter();
    const params = useLocalSearchParams(); // Allow dynamic module type assignment

    const activeModule = (params.module as string) || 'Expense';
    const suggestedTypes = activeModule === 'Investment'
        ? ['Stocks', 'Index funds', 'Real estate', 'Crypto', 'Insurance', 'Add More']
        : ['Food', 'Bills', 'Transport', 'Personal', 'Add More'];

    const addCategory = useStore((state) => state.addCategory);

    const [title, setTitle] = useState('');
    const [categoryType, setCategoryType] = useState(suggestedTypes[0]);
    const [customType, setCustomType] = useState('');
    const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);

    const [limit, setLimit] = useState('');

    const [selectedIcon, setSelectedIcon] = useState('shopping-cart');
    const [selectedColor, setSelectedColor] = useState('#FDBA74');

    const [isIconExpanded, setIsIconExpanded] = useState(false);
    const [isColorExpanded, setIsColorExpanded] = useState(false);

    const handleSave = () => {
        if (!title.trim() || !limit.trim()) return;

        const finalType = categoryType === 'Add More' ? customType : categoryType;
        if (!finalType.trim()) return;

        addCategory({
            name: title.trim(),
            type: activeModule, // Dynamic Assignment based on tab
            group: finalType.trim(),
            limit: parseFloat(limit),
            icon: selectedIcon,
            color: selectedColor
        });

        router.back();
    };

    return (
        <View className="flex-1 bg-[#1E293B]">
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View className="flex-1">
                        {/* Header */}
                        <View className="px-6 pt-16 pb-4 flex-row items-center justify-between z-50">
                            <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
                                <Feather name="arrow-left" size={24} color="#E2E8F0" />
                            </TouchableOpacity>
                            <Text className="text-white text-[20px] font-bold">Add a Category</Text>
                            <TouchableOpacity onPress={handleSave} className="p-2 -mr-2">
                                <Text className="text-[#38BDF8] text-[16px] font-bold">Done</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                            {/* Form Inputs */}
                            <View className="mb-10 mt-2 z-40 relative">
                                <TextInput
                                    className="text-white text-[18px] py-3 border-b border-slate-600 mb-6 focus:border-[#38BDF8]"
                                    placeholder="Input Title (e.g. Dog Food)"
                                    placeholderTextColor="#64748B"
                                    value={title}
                                    onChangeText={setTitle}
                                />

                                <View className="relative z-50 mb-6">
                                    <TouchableOpacity
                                        className="flex-row justify-between items-center py-3 border-b border-slate-600"
                                        onPress={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                                    >
                                        <Text className={`${categoryType === 'Add More' && !customType ? 'text-slate-500' : 'text-white'} text-[18px]`}>
                                            {categoryType === 'Add More' ? 'Custom Type' : categoryType}
                                        </Text>
                                        <Feather name={isTypeDropdownOpen ? "chevron-up" : "chevron-down"} size={20} color="#64748B" />
                                    </TouchableOpacity>

                                    {isTypeDropdownOpen && (
                                        <View className="absolute top-[100%] left-0 right-0 bg-[#303E55] rounded-xl mt-2 p-2 shadow-xl border border-slate-600 z-[100]">
                                            {suggestedTypes.map((type) => (
                                                <TouchableOpacity
                                                    key={type}
                                                    className="py-3 px-4 border-b border-slate-600/50 flex-row justify-between items-center"
                                                    onPress={() => {
                                                        setCategoryType(type);
                                                        setIsTypeDropdownOpen(false);
                                                    }}
                                                >
                                                    <Text className="text-white text-[16px]">{type}</Text>
                                                    {categoryType === type && <Feather name="check" size={16} color="#38BDF8" />}
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    )}

                                    {categoryType === 'Add More' && (
                                        <TextInput
                                            className="text-white text-[16px] py-3 border-b border-slate-600 mt-2"
                                            placeholder="Enter Custom Category Type"
                                            placeholderTextColor="#64748B"
                                            value={customType}
                                            onChangeText={setCustomType}
                                            autoFocus
                                        />
                                    )}
                                </View>

                                <TextInput
                                    className="text-white text-[18px] py-3 border-b border-slate-600"
                                    placeholder="Enter Spending Limit Amount"
                                    placeholderTextColor="#64748B"
                                    keyboardType="numeric"
                                    value={limit}
                                    onChangeText={setLimit}
                                />
                            </View>

                            {/* Icon Picker Accordion */}
                            <View className="bg-[#303E55] rounded-[24px] mb-4 overflow-hidden z-10 relative">
                                <TouchableOpacity
                                    className="p-5 flex-row justify-between items-center"
                                    onPress={() => {
                                        setIsIconExpanded(!isIconExpanded);
                                        if (!isIconExpanded) setIsColorExpanded(false);
                                    }}
                                >
                                    <Text className="text-white text-[18px] font-bold">Icon</Text>
                                    <View className="flex-row items-center">
                                        {!isIconExpanded ? (
                                            <View className="bg-[#475569] p-3 rounded-full mr-4">
                                                <Feather name={selectedIcon as any} size={22} color="white" />
                                            </View>
                                        ) : (
                                            <View className="p-2 rounded-full mr-4 border-2 border-[#38BDF8]">
                                                <Feather name={selectedIcon as any} size={20} color="#38BDF8" />
                                            </View>
                                        )}
                                        <Feather name={isIconExpanded ? "chevron-down" : "chevron-right"} size={24} color="#94A3B8" />
                                    </View>
                                </TouchableOpacity>

                                {isIconExpanded && (
                                    <View className="px-5 pb-5 flex-row flex-wrap justify-between" style={{ gap: 12 }}>
                                        {ICONS.map(iconName => {
                                            const isSelected = selectedIcon === iconName;
                                            return (
                                                <TouchableOpacity
                                                    key={iconName}
                                                    onPress={() => setSelectedIcon(iconName)}
                                                    className="aspect-square items-center justify-center rounded-full"
                                                    style={{
                                                        width: '16%',
                                                        borderWidth: isSelected ? 2 : 0,
                                                        borderColor: '#38BDF8',
                                                    }}
                                                >
                                                    <View className={`${isSelected ? '' : 'bg-[#475569]/50'} p-3 rounded-full`}>
                                                        <Feather name={iconName as any} size={22} color={isSelected ? "#38BDF8" : "#CBD5E1"} />
                                                    </View>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                )}
                            </View>

                            {/* Color Picker Accordion */}
                            <View className="bg-[#303E55] rounded-[24px] mb-12 overflow-hidden z-10 relative">
                                <TouchableOpacity
                                    className="p-5 flex-row justify-between items-center"
                                    onPress={() => {
                                        setIsColorExpanded(!isColorExpanded);
                                        if (!isColorExpanded) setIsIconExpanded(false);
                                    }}
                                >
                                    <Text className="text-white text-[18px] font-bold">Color</Text>
                                    <View className="flex-row items-center">
                                        <View
                                            className="w-12 h-12 rounded-full mr-4"
                                            style={{ backgroundColor: selectedColor }}
                                        />
                                        <Feather name={isColorExpanded ? "chevron-down" : "chevron-right"} size={24} color="#94A3B8" />
                                    </View>
                                </TouchableOpacity>

                                {isColorExpanded && (
                                    <View className="px-4 pb-6 pt-2 flex-row flex-wrap justify-center" style={{ gap: 16 }}>
                                        {COLORS.map(color => {
                                            const isSelected = selectedColor === color;
                                            return (
                                                <TouchableOpacity
                                                    key={color}
                                                    onPress={() => setSelectedColor(color)}
                                                    className="items-center justify-center rounded-full"
                                                    style={{
                                                        width: 48,
                                                        height: 48,
                                                        borderWidth: isSelected ? 2 : 0,
                                                        borderColor: '#38BDF8'
                                                    }}
                                                >
                                                    <View
                                                        className="w-9 h-9 rounded-full"
                                                        style={{ backgroundColor: color }}
                                                    />
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                )}
                            </View>
                        </ScrollView>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </View>
    );
}
