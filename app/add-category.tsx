import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { useTransactions } from '../contexts/TransactionContext';

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

    let suggestedTypes: string[] = [];
    switch (activeModule) {
        case 'Investment':
            suggestedTypes = ['Stocks', 'Index funds', 'Real estate', 'Crypto', 'Add More'];
            break;
        case 'Savings':
            suggestedTypes = ['Emergency', 'Vacation', 'New Car', 'House Downpayment', 'Add More'];
            break;
        case 'Income':
            suggestedTypes = ['Salary', 'Freelance', 'Business', 'Gifts', 'Add More'];
            break;
        case 'Debt':
            suggestedTypes = ['Credit Card', 'Student Loan', 'Mortgage', 'Personal Loan', 'Add More'];
            break;
        case 'Expense':
        default:
            suggestedTypes = ['Food', 'Bills', 'Transport', 'Personal', 'Add More'];
            break;
    }

    const {
        addCategory,
        updateCategory,
        deleteCategory,
        categories,
        expenseGoal,
        savingsGoal,
        debtLimit,
        investmentLimit,
        incomeGoal
    } = useTransactions();
    const categoryId = params.id as string | undefined;

    // Get the relevant goal/limit for the current module
    const getModuleGoal = () => {
        switch (activeModule) {
            case 'Expense': return expenseGoal;
            case 'Savings': return savingsGoal;
            case 'Debt': return debtLimit;
            case 'Investment': return investmentLimit;
            case 'Income': return incomeGoal;
            default: return 0;
        }
    };

    const currentModuleGoal = getModuleGoal();
    const isGoalMissing = currentModuleGoal <= 0;

    const [categoryType, setCategoryType] = useState(suggestedTypes[0]);
    const [customType, setCustomType] = useState('');
    const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);

    const [limit, setLimit] = useState('');

    const [selectedIcon, setSelectedIcon] = useState('shopping-cart');
    const [selectedColor, setSelectedColor] = useState('#FDBA74');

    const [isIconExpanded, setIsIconExpanded] = useState(false);
    const [isColorExpanded, setIsColorExpanded] = useState(false);

    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

    useEffect(() => {
        if (categoryId) {
            const existing = categories.find(c => c.id === categoryId);
            if (existing) {
                if (suggestedTypes.includes(existing.name)) {
                    setCategoryType(existing.name);
                } else {
                    setCategoryType('Add More');
                    setCustomType(existing.name);
                }
                setLimit(existing.limit > 0 ? existing.limit.toString() : '');
                setSelectedIcon(existing.icon);
                setSelectedColor(existing.color);
            }
        }
    }, [categoryId]);

    const handleSave = () => {
        const finalType = categoryType === 'Add More' ? customType : categoryType;
        if (!finalType.trim()) return;

        const data = {
            name: finalType.trim(),
            type: activeModule as any,
            group: finalType.trim(),
            limit: parseFloat(limit) || 0,
            icon: selectedIcon,
            color: selectedColor
        };

        if (categoryId) {
            updateCategory(categoryId, data);
        } else {
            addCategory(data);
        }

        router.back();
    };

    const handleDelete = () => {
        setIsDeleteModalVisible(true);
    };

    const confirmDelete = () => {
        if (categoryId) {
            deleteCategory(categoryId);
            setIsDeleteModalVisible(false);
            router.back();
        }
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
                            <Text className="text-white text-[20px] font-bold">{categoryId ? 'Edit Category' : 'Add a Category'}</Text>
                            <TouchableOpacity
                                onPress={handleSave}
                                className="p-2 -mr-2"
                                disabled={parseFloat(limit) > 1000000000}
                            >
                                <Text className={`${parseFloat(limit) > 1000000000 ? 'text-slate-500' : 'text-[#38BDF8]'} text-[16px] font-bold`}>Done</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                            {/* Form Inputs */}
                            <View className="mb-10 mt-2 z-40 relative">
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

                                    <Modal
                                        visible={isTypeDropdownOpen}
                                        transparent
                                        animationType="none"
                                        statusBarTranslucent={true}
                                        onRequestClose={() => setIsTypeDropdownOpen(false)}
                                    >
                                        <Pressable
                                            className="flex-1 bg-black/40"
                                            onPress={() => setIsTypeDropdownOpen(false)}
                                        >
                                            <View className="absolute top-80 left-6 right-6 bg-[#303E55] rounded-xl mt-2 p-2 shadow-xl border border-slate-600 z-[100]">
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
                                        </Pressable>
                                    </Modal>

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

                                <View className={`py-1 border-b ${isGoalMissing ? 'border-red-500/50' : 'border-slate-600'}`}>
                                    <TextInput
                                        className={`text-white text-[18px] py-2 ${isGoalMissing ? 'text-slate-500' : ''}`}
                                        placeholder={isGoalMissing ? `Set overall ${activeModule} limit first` : "Enter Limit Amount"}
                                        placeholderTextColor={isGoalMissing ? "#7F1D1D" : "#64748B"}
                                        keyboardType="numeric"
                                        value={limit}
                                        onChangeText={(text) => setLimit(text.replace(/[^0-9.]/g, ''))}
                                        editable={!isGoalMissing}
                                    />
                                </View>
                                {parseFloat(limit) > 1000000000 && (
                                    <Text className="text-red-400 text-xs mt-2 ml-1">Maximum limit is ₱1,000,000,000</Text>
                                )}

                                {isGoalMissing && (
                                    <View className="flex-row items-center bg-red-500/10 p-3 rounded-xl mt-3 border border-red-500/20">
                                        <Feather name="info" size={16} color="#EF4444" />
                                        <Text className="text-[#EF4444] text-[13px] ml-2 font-medium">
                                            Please set an overall {activeModule} {activeModule === 'Income' || activeModule === 'Savings' ? 'Goal' : 'Limit'} in the {activeModule} tab before setting category limits.
                                        </Text>
                                    </View>
                                )}

                                {/* Dynamic Budget Warning */}
                                {(() => {
                                    if (isGoalMissing || !limit.trim()) return null;

                                    const parsedLimit = parseFloat(limit);
                                    if (isNaN(parsedLimit) || parsedLimit <= 0) return null;

                                    // Sum existing categories of this type
                                    const currentTypeLimitsTotal = categories
                                        .filter(c => c.type === activeModule && c.id !== categoryId)
                                        .reduce((sum, c) => sum + (c.limit || 0), 0);

                                    const projectedTotal = currentTypeLimitsTotal + parsedLimit;

                                    if (projectedTotal > currentModuleGoal) {
                                        return (
                                            <View className="flex-row items-start bg-[#EAB308]/20 p-4 rounded-xl mt-4 border border-[#EAB308]/30">
                                                <Feather name="alert-triangle" size={20} color="#EAB308" className="mt-0.5" />
                                                <View className="ml-3 flex-1 gap-y-1">
                                                    <Text className="text-[#EAB308] text-sm font-bold">
                                                        Limit Exceeded Warning
                                                    </Text>
                                                    <Text className="text-[#EAB308]/90 text-sm leading-5">
                                                        Adding ₱{parsedLimit.toLocaleString('en-US', { minimumFractionDigits: 2 })} brings your combined {activeModule} categories total to ₱{projectedTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}.
                                                    </Text>
                                                    <Text className="text-[#EAB308]/90 text-sm leading-5">
                                                        This exceeds your overall {activeModule} {activeModule === 'Income' || activeModule === 'Savings' ? 'goal' : 'limit'} of ₱{currentModuleGoal.toLocaleString('en-US', { minimumFractionDigits: 2 })}.
                                                    </Text>
                                                </View>
                                            </View>
                                        );
                                    }
                                    return null;
                                })()}
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

                            {categoryId && (
                                <TouchableOpacity
                                    onPress={handleDelete}
                                    className="bg-red-500/10 py-4 rounded-[24px] mb-12 items-center flex-row justify-center border border-red-500/20"
                                >
                                    <Feather name="trash-2" size={20} color="#F87171" className="mr-2" />
                                    <Text className="text-[#F87171] text-[18px] font-bold">Delete Category</Text>
                                </TouchableOpacity>
                            )}

                        </ScrollView>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>

            {/* Delete Confirmation Modal */}
            <Modal
                visible={isDeleteModalVisible}
                transparent
                animationType="fade"
                statusBarTranslucent={true}
                onRequestClose={() => setIsDeleteModalVisible(false)}
            >
                <Pressable
                    className="flex-1 bg-black/60 justify-center items-center px-6"
                    onPress={() => setIsDeleteModalVisible(false)}
                >
                    <Pressable onPress={() => { }} className="w-full max-w-sm">
                        <View className="bg-[#334155] rounded-[32px] p-6 w-full border border-slate-600">
                            <Text className="text-white text-xl font-bold mb-3">Delete category</Text>
                            <Text className="text-slate-300 text-[15px] leading-6 mb-8 pr-2">
                                Are you sure you want to delete this category? This action is irreversible and will completely erase it. Any items or transactions under this category will also be deleted.
                            </Text>

                            <View className="flex-row justify-end space-x-6 gap-x-6 mt-2">
                                <TouchableOpacity onPress={() => setIsDeleteModalVisible(false)} className="px-2 py-2">
                                    <Text className="text-[#84CC16] font-medium text-[16px]">Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={confirmDelete} className="px-2 py-2">
                                    <Text className="text-[#EF4444] font-medium text-[16px]">Yes, delete</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
}
