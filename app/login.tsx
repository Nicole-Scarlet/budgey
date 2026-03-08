import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as React from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const LogIn = () => {
    const router = useRouter();
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [showPassword, setShowPassword] = React.useState(false);
    const [isSubmitted, setIsSubmitted] = React.useState(false);

    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    const isFormValid = isEmailValid && password.trim() !== "";
    const hasInputs = email.trim() !== "" || password.trim() !== "";

    const handleLogin = () => {
        setIsSubmitted(true);
        if (isFormValid) {
            router.replace("/(tabs)");
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-[#1E293B]">
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-8 py-12">
                    {/* Header Section */}
                    <View className="mb-12">
                        <Text className="text-white text-5xl font-bold mb-4">
                            Log in.
                        </Text>
                        <Text className="text-slate-300 text-lg leading-6">
                            Remind us who you are—though, your money’s safe with us. :)
                        </Text>
                    </View>

                    {/* Form Section */}
                    <View className="space-y-6">
                        {/* Email Field */}
                        <View className="gap-y-2">
                            <Text className="text-white text-lg font-semibold ml-2">Email</Text>
                            <View className={`bg-slate-800 h-16 rounded-3xl px-6 justify-center border ${isSubmitted && !isEmailValid ? 'border-red-500' : 'border-slate-700'}`}>
                                <TextInput
                                    className="text-white text-lg"
                                    placeholder="your@email.com"
                                    placeholderTextColor="#64748b"
                                    value={email}
                                    onChangeText={(text) => {
                                        setEmail(text);
                                        if (isSubmitted) setIsSubmitted(false);
                                    }}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                />
                            </View>
                            {isSubmitted && !isEmailValid && (
                                <Text className="text-red-500 text-sm ml-2">
                                    Please enter a valid email address.
                                </Text>
                            )}
                        </View>

                        {/* Password Field */}
                        <View className="gap-y-2 mt-6">
                            <Text className="text-white text-lg font-semibold ml-2">Password</Text>
                            <View className="bg-slate-800 h-16 rounded-3xl px-6 flex-row items-center border border-slate-700">
                                <TextInput
                                    className="flex-1 text-white text-lg"
                                    placeholder="••••••••"
                                    placeholderTextColor="#64748b"
                                    value={password}
                                    onChangeText={(text) => {
                                        setPassword(text);
                                        if (isSubmitted) setIsSubmitted(false);
                                    }}
                                    secureTextEntry={!showPassword}
                                />
                                <Pressable onPress={() => setShowPassword(!showPassword)}>
                                    <Ionicons
                                        name={showPassword ? "eye-outline" : "eye-off-outline"}
                                        size={24}
                                        color="#94a3b8"
                                    />
                                </Pressable>
                            </View>
                        </View>
                    </View>

                    {/* Action Section */}
                    <View className="mt-12 space-y-6">
                        <Pressable
                            onPress={handleLogin}
                            disabled={!hasInputs}
                            className={`w-full h-16 rounded-3xl items-center justify-center shadow-lg ${hasInputs ? "bg-slate-400 active:bg-slate-500" : "bg-slate-700 opacity-50"}`}
                        >
                            <Text className={`text-xl font-bold ${hasInputs ? "text-slate-900" : "text-slate-500"}`}>
                                Login
                            </Text>
                        </Pressable>

                        <View className="flex-row justify-center mt-6">
                            <Text className="text-slate-500 text-base">Don't have an account? </Text>
                            <Pressable onPress={() => router.push("/register")}>
                                <Text className="text-slate-400 text-base font-bold">Register</Text>
                            </Pressable>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default LogIn;
