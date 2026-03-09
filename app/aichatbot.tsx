import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import * as React from "react";
import { useState } from "react";
import { Pressable, ScrollView, Text, View, TextInput, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getGeminiResponse } from "../services/gemini";
import { useTheme } from "../contexts/ThemeContext";

// Simple helper to render bold text from **markdown**
const MarkdownText = ({ content, className, style }: { content: string, className?: string, style?: any }) => {
    const parts = content.split(/(\*\*.*?\*\*)/g);
    return (
        <Text className={className} style={style}>
            {parts.map((part, index) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return (
                        <Text key={index} className="font-bold">
                            {part.slice(2, -2)}
                        </Text>
                    );
                }
                return part;
            })}
        </Text>
    );
};

const AiChatbotPage = () => {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<{ role: 'user' | 'model', content: string }[]>([
        {
            role: 'model',
            content: "Hi there! I'm ready to help you manage your money. Whether you want to **inquire about stocks**, check the **plausibility** of buying your wishlist goal, or ask for **quick AI investment advice**, just let me know. I can now use **bold text** to highlight important info!"
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const scrollViewRef = React.useRef<ScrollView>(null);

    const handleSend = async () => {
        if (!message.trim() || isLoading) return;

        const userMessage = message.trim();
        setMessage("");
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        const history = messages.map(m => ({
            role: m.role,
            parts: [{ text: m.content }]
        }));

        const response = await getGeminiResponse(userMessage, history);

        setMessages(prev => [...prev, { role: 'model', content: response }]);
        setIsLoading(false);
    };

    const handleNewChat = () => {
        Alert.alert(
            "New Chat",
            "Are you sure you want to clear the current conversation?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Clear",
                    style: "destructive",
                    onPress: () => {
                        setMessages([
                            {
                                role: 'model',
                                content: "Conversation cleared. How else can I help you today?"
                            }
                        ]);
                    }
                }
            ]
        );
    };

    React.useEffect(() => {
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
    }, [messages, isLoading]);

    return (
        <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }} edges={["top", "bottom"]}>
            <Stack.Screen options={{ headerShown: false }} />
            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
            {/* Header */}
            <View 
                className="px-6 pt-2 pb-4 flex-row justify-between items-center border-b"
                style={{ borderBottomColor: colors.border + '1A' }}
            >
                <Pressable onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={28} color={colors.foreground} />
                </Pressable>
                <Text className="text-xl font-bold" style={{ color: colors.foreground }}>AI Chatbot</Text>
                <Pressable onPress={handleNewChat}>
                    <MaterialCommunityIcons name="square-edit-outline" size={28} color={colors.foreground} />
                </Pressable>
            </View>

            <ScrollView
                ref={scrollViewRef}
                className="flex-1 px-6 pt-6"
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            >
                {messages.map((msg, index) => (
                    <View key={index} className={`mb-6 ${msg.role === 'user' ? 'flex-row justify-end' : ''}`}>
                        <View className={`${msg.role === 'user'
                            ? 'px-6 py-3 rounded-[20px] rounded-br-[4px] max-w-[80%]'
                            : 'bg-transparent'
                            }`}
                            style={msg.role === 'user' ? { backgroundColor: colors.card } : {}}
                        >
                            <MarkdownText
                                content={msg.content}
                                className="text-base leading-6"
                                style={{ color: colors.foreground }}
                            />
                            {msg.role === 'model' && (
                                <View className="flex-row mt-4">
                                    <Pressable className="mr-6"><MaterialCommunityIcons name="refresh" size={24} color={colors.muted} /></Pressable>
                                    <Pressable className="mr-6"><MaterialCommunityIcons name="content-copy" size={20} color={colors.muted} /></Pressable>
                                    <Pressable className="mr-6"><MaterialCommunityIcons name="thumb-up-outline" size={22} color={colors.muted} /></Pressable>
                                    <Pressable><MaterialCommunityIcons name="thumb-down-outline" size={22} color={colors.muted} /></Pressable>
                                </View>
                            )}
                        </View>
                    </View>
                ))}

                {isLoading && (
                    <View className="mb-6">
                        <Text className="italic" style={{ color: colors.muted }}>Gemini is thinking...</Text>
                    </View>
                )}
            </ScrollView>

            {/* Input Bar */}
            <View className="px-6 pb-2 pt-2 mb-6">
                    <View 
                        style={{ backgroundColor: colors.card, borderColor: colors.border + '33' }}
                        className="rounded-full px-6 py-3 flex-row items-center border"
                    >
                        <TextInput
                            className="flex-1 text-base"
                            style={{ color: colors.foreground }}
                            placeholder="Ask anything"
                            placeholderTextColor={colors.muted}
                            multiline
                            maxLength={2000}
                            value={message}
                            onChangeText={setMessage}
                        />
                        <View className="flex-row items-center gap-x-3 ml-2">
                            <Pressable><MaterialCommunityIcons name="microphone-outline" size={26} color={colors.muted} /></Pressable>
                            <Pressable
                                onPress={handleSend}
                                className="w-10 h-10 rounded-full items-center justify-center"
                                style={{ backgroundColor: isLoading ? colors.muted : colors.foreground }}
                                disabled={isLoading}
                            >
                                <Ionicons name="paper-plane" size={20} color={isLoading ? "#fff" : colors.background} />
                            </Pressable>
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default AiChatbotPage;
