import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as React from "react";
import { useState } from "react";
import { Pressable, ScrollView, Text, View, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const AiChatbotPage = () => {
    const router = useRouter();
    const [message, setMessage] = useState("");

    return (
        <SafeAreaView className="flex-1 bg-[#1E293B]">
            {/* Header */}
            <View className="px-6 pt-4 pb-4 flex-row justify-between items-center border-b border-[#94A3B8]/10">
                <Pressable onPress={() => { }}>
                    <MaterialCommunityIcons name="format-list-bulleted" size={32} color="white" />
                </Pressable>
                <Text className="text-white text-2xl font-black">AI Chatbot</Text>
                <Pressable onPress={() => { }}>
                    <MaterialCommunityIcons name="square-edit-outline" size={32} color="white" />
                </Pressable>
            </View>

            <ScrollView
                className="flex-1 px-6 pt-6"
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            >
                {/* User Message - "Hi!" */}
                <View className="flex-row justify-end mb-6">
                    <View className="bg-[#334155] px-6 py-3 rounded-[20px] rounded-br-[4px]">
                        <Text className="text-white text-base">Hi!</Text>
                    </View>
                </View>

                {/* AI Intro Message */}
                <View className="mb-8">
                    <View className="flex-row items-start">
                        <View className="flex-1 bg-[#1E293B]">
                            <Text className="text-white text-[15px] leading-6 opacity-90">
                                Hi there! I'm ready to help you manage your money. Whether you want to inquire about stocks, check the plausibility of buying your wishlist goal with your current spending habits, or ask for some quick AI investment advice, just let me know.
                            </Text>
                        </View>
                    </View>

                    {/* Action Bar under AI response */}
                    <View className="flex-row mt-4">
                        <Pressable className="mr-6"><MaterialCommunityIcons name="refresh" size={24} color="#94A3B8" /></Pressable>
                        <Pressable className="mr-6"><MaterialCommunityIcons name="content-copy" size={20} color="#94A3B8" /></Pressable>
                        <Pressable className="mr-6"><MaterialCommunityIcons name="thumb-up-outline" size={22} color="#94A3B8" /></Pressable>
                        <Pressable><MaterialCommunityIcons name="thumb-down-outline" size={22} color="#94A3B8" /></Pressable>
                    </View>
                </View>
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
                            <View className="bg-[#E2E8F0] w-10 h-10 rounded-full items-center justify-center">
                                <Ionicons name="paper-plane" size={20} color="#1E293B" />
                            </View>
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default AiChatbotPage;
