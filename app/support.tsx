import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as React from "react";
import {
    LayoutAnimation,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
    Platform,
    UIManager,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../contexts/ThemeContext";

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface FAQItem {
    question: string;
    answer: string;
}

interface FAQCategory {
    title: string;
    icon: any;
    items: FAQItem[];
}

const FAQS: FAQCategory[] = [
    {
        title: "Budgeting & Shared Accounts",
        icon: "wallet-outline",
        items: [
            {
                question: "How do I create a budget profile?",
                answer: "You can initialize budget profiles for personal use or multi-person contexts through the Dashboard. Budgey supports analyzing shared and combined budgets between partners and families."
            },
            {
                question: "Can I set spending limits for specific categories?",
                answer: "Yes! You can set specific limits for categories like food, transport, bills, and more. Budgey recalculates your remaining budget in real-time as you log transactions."
            }
        ]
    },
    {
        title: "Tracking Expenses & Receipts",
        icon: "receipt-outline",
        items: [
            {
                question: "How do I record my daily expenses?",
                answer: "You can manually enter expenses via the input interface, or use our AI-powered voice module to parse verbal statements into transaction records."
            },
            {
                question: "How does the receipt scanner work?",
                answer: "Simply capture an image of your receipt. Our system validates and automatically records the transaction details using advanced OCR technology."
            },
            {
                question: "How do I track debts and money owed?",
                answer: "Budgey has a dedicated interface for recording debts you owe to others and debts you are collectible from others, ensuring your full financial picture is accurate."
            }
        ]
    },
    {
        title: "Savings & Wishlists",
        icon: "star-outline",
        items: [
            {
                question: "How do I track my savings goals?",
                answer: "Define your monetary goals in the 'Goals' section. Budgey displays your progress percentage and lets you log contributions over time."
            },
            {
                question: "What is the Wishlist affordability check?",
                answer: "Our system automatically analyzes your current budget and savings to determine if items in your wishlist are affordable given your financial status."
            }
        ]
    },
    {
        title: "AI Assistant & Insights",
        icon: "bulb-outline",
        items: [
            {
                question: "What can the AI Assistant do?",
                answer: "Budgey's AI interprets your financial data to provide behavioral insights, savings tips, and answers your financial questions through a chat interface."
            },
            {
                question: "What are risk recommendations?",
                answer: "Based on your calculated risk appetite, Budgey generates tailored recommendations for stocks, mutual funds, and insurance products."
            }
        ]
    },
    {
        title: "Dashboard & History",
        icon: "stats-chart-outline",
        items: [
            {
                question: "How can I view my spending patterns?",
                answer: "Your dashboard displays real-time status and generates graphical visualizations (charts and graphs) representing your spending patterns and budget adherence."
            },
            {
                question: "How do I access my old financial reports?",
                answer: "Budgey maintains a comprehensive history log and an archive of historical AI financial reports, which you can review and filter by category at any time."
            }
        ]
    }
];

const SupportPage = () => {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const [searchQuery, setSearchQuery] = React.useState("");
    const [expandedIndex, setExpandedIndex] = React.useState<string | null>(null);

    const toggleExpand = (id: string) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedIndex(expandedIndex === id ? null : id);
    };

    const filteredFAQs = FAQS.map(category => ({
        ...category,
        items: category.items.filter(item =>
            item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.answer.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })).filter(category => category.items.length > 0);

    return (
        <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
            {/* Header */}
            <View className="flex-row items-center justify-between px-6 py-4">
                <Pressable
                    onPress={() => router.back()}
                    className="w-10 h-10 rounded-full items-center justify-center border"
                    style={{ backgroundColor: colors.card, borderColor: colors.border }}
                >
                    <Ionicons name="chevron-back" size={24} color={colors.foreground} />
                </Pressable>
                <Text className="text-xl font-bold" style={{ color: colors.foreground }}>Help & Support</Text>
                <View className="w-10" />
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Search Bar */}
                <View className="px-6 mt-4">
                    <View 
                        style={{ backgroundColor: colors.card, borderColor: colors.border + '4D' }}
                        className="flex-row items-center px-4 h-14 rounded-2xl border shadow-sm"
                    >
                        <Ionicons name="search" size={20} color={colors.muted} />
                        <TextInput
                            className="flex-1 ml-3 text-base"
                            style={{ color: colors.foreground }}
                            placeholder="Search help topics..."
                            placeholderTextColor={colors.muted}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                </View>

                {/* FAQ Categories */}
                <View className="px-6 mt-8">
                    {filteredFAQs.map((category, catIdx) => (
                        <View key={catIdx} className="mb-8">
                            <View className="flex-row items-center gap-x-3 mb-4 ml-2">
                                <View 
                                    style={{ backgroundColor: colors.card, borderColor: colors.border + '4D' }}
                                    className="w-8 h-8 rounded-lg items-center justify-center border"
                                >
                                    <Ionicons name={category.icon} size={18} color={colors.muted} />
                                </View>
                                <Text className="text-lg font-bold" style={{ color: colors.muted }}>{category.title}</Text>
                            </View>

                            <View 
                                style={{ backgroundColor: colors.card, borderColor: colors.border }}
                                className="rounded-[25px] overflow-hidden border shadow-2xl"
                            >
                                {category.items.map((item, itemIdx) => {
                                    const id = `${catIdx}-${itemIdx}`;
                                    const isExpanded = expandedIndex === id;
                                    return (
                                        <View key={id}>
                                            <Pressable
                                                onPress={() => toggleExpand(id)}
                                                className="p-5 flex-row items-center justify-between active:opacity-70"
                                                style={isExpanded ? { backgroundColor: colors.background + '4D' } : {}}
                                            >
                                                <Text 
                                                    className="flex-1 text-base font-semibold mr-4"
                                                    style={{ color: colors.foreground }}
                                                >
                                                    {item.question}
                                                </Text>
                                                <Ionicons
                                                    name={isExpanded ? "chevron-up" : "chevron-down"}
                                                    size={20}
                                                    color={colors.muted}
                                                />
                                            </Pressable>

                                            {isExpanded && (
                                                <View className="px-5 pb-6 pt-1">
                                                    <Text 
                                                        className="text-base leading-6"
                                                        style={{ color: colors.muted }}
                                                    >
                                                        {item.answer}
                                                    </Text>
                                                </View>
                                            )}

                                            {itemIdx < category.items.length - 1 && (
                                                <View className="h-[1px] mx-5" style={{ backgroundColor: colors.border + '33' }} />
                                            )}
                                        </View>
                                    );
                                })}
                            </View>
                        </View>
                    ))}

                    {filteredFAQs.length === 0 && (
                        <View className="items-center mt-20">
                            <Ionicons name="help-circle-outline" size={64} color={colors.card} />
                            <Text className="text-lg mt-4 font-medium" style={{ color: colors.muted }}>No topics found for "{searchQuery}"</Text>
                        </View>
                    )}
                </View>

                {/* Contact Section */}
                <View className="px-6 mt-4">
                    <Text className="text-lg font-bold mb-4 ml-2" style={{ color: colors.muted }}>Still need help?</Text>
                    <Pressable 
                        style={{ backgroundColor: colors.foreground }}
                        className="h-16 rounded-[25px] flex-row items-center justify-center active:opacity-80 shadow-2xl"
                    >
                        <Ionicons name="mail" size={24} color={colors.background} />
                        <Text className="text-xl font-black ml-3" style={{ color: colors.background }}>Contact Support</Text>
                    </Pressable>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default SupportPage;
