import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as React from "react";
import { useState } from "react";
import { Pressable, ScrollView, Text, View, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getGeminiResponse } from "../services/gemini";

// Simple helper to render bold text from **markdown**
const MarkdownText = ({ content, className }: { content: string, className?: string }) => {
    const parts = content.split(/(\*\*.*?\*\*)/g);
    return (
        <Text className={className}>
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

        // Prepare history for Gemini (excluding the system/intro message if it's too simple, 
        // but here we just convert our current state)
        const history = messages.map(m => ({
            role: m.role,
            parts: [{ text: m.content }]
        }));

        const response = await getGeminiResponse(userMessage, history);

        setMessages(prev => [...prev, { role: 'model', content: response }]);
        setIsLoading(false);
    };

    React.useEffect(() => {
        // Auto scroll to bottom when messages change
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
    }, [messages, isLoading]);

    return (
        <SafeAreaView className="flex-1 bg-[#1E293B]">
            {/* Header */}
            <View className="px-6 pt-4 pb-4 flex-row justify-between items-center border-b border-[#94A3B8]/10">
                <Pressable onPress={() => { }}>
                    <MaterialCommunityIcons name="format-list-bulleted" size={32} color="white" />
                </Pressable>
                <Text className="text-white text-2xl font-black">Summary</Text>
                <Pressable onPress={() => { }}>
                    <MaterialCommunityIcons name="square-edit-outline" size={32} color="white" />
                </Pressable>
            </View>

            <ScrollView
                ref={scrollViewRef}
                className="flex-1 px-6 pt-6"
                contentContainerStyle={{ paddingBottom: 150 }}
                showsVerticalScrollIndicator={false}
            >
                {messages.map((msg, index) => (
                    <View key={index} className={`mb-6 ${msg.role === 'user' ? 'flex-row justify-end' : ''}`}>
                        <View className={`${msg.role === 'user'
                            ? 'bg-[#334155] px-6 py-3 rounded-[20px] rounded-br-[4px] max-w-[80%]'
                            : 'bg-transparent'
                            }`}>
                            <MarkdownText
                                content={msg.content}
                                className="text-white text-base leading-6"
                            />
                            {msg.role === 'model' && (
                                <View className="flex-row mt-4">
                                    <Pressable className="mr-6"><MaterialCommunityIcons name="refresh" size={24} color="#94A3B8" /></Pressable>
                                    <Pressable className="mr-6"><MaterialCommunityIcons name="content-copy" size={20} color="#94A3B8" /></Pressable>
                                    <Pressable className="mr-6"><MaterialCommunityIcons name="thumb-up-outline" size={22} color="#94A3B8" /></Pressable>
                                    <Pressable><MaterialCommunityIcons name="thumb-down-outline" size={22} color="#94A3B8" /></Pressable>
                                </View>
                            )}
                        </View>
                    </View>
                ))}

                {isLoading && (
                    <View className="mb-6">
                        <Text className="text-[#94A3B8] italic">Gemini is thinking...</Text>
                    </View>
                )}
            </ScrollView>

            {/* Input Bar */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <View className="px-6 pb-32 pt-2">
                    <View className="bg-[#334155] rounded-full px-6 py-3 flex-row items-center border border-[#94A3B8]/20">
                        <TextInput
                            className="flex-1 text-white text-base"
                            placeholder="Ask anything"
                            placeholderTextColor="#94A3B8"
                            multiline
                            style={{ maxHeight: 100 }}
                            value={message}
                            onChangeText={setMessage}
                        />
                        <View className="flex-row items-center gap-x-3 ml-2">
                            <Pressable><MaterialCommunityIcons name="microphone-outline" size={26} color="#94A3B8" /></Pressable>
                            <Pressable
                                onPress={handleSend}
                                className={`w-10 h-10 rounded-full items-center justify-center ${isLoading ? 'bg-gray-500' : 'bg-[#E2E8F0]'}`}
                                disabled={isLoading}
                            >
                                <Ionicons name="paper-plane" size={20} color="#1E293B" />
                            </Pressable>
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default AiChatbotPage;
