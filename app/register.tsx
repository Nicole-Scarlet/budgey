import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as React from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Register = () => {
    const router = useRouter();
    const [showPassword, setShowPassword] = React.useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

    return (
        <SafeAreaView className="flex-1 bg-slate-900">
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-8 py-10">
                    {/* Header Section */}
                    <View className="mb-10">
                        <Text className="text-white text-5xl font-bold mb-4">
                            Register.
                        </Text>
                        <Text className="text-slate-300 text-lg leading-6">
                            Start your journey to better budgeting today!
                        </Text>
                    </View>

                    {/* Form Section */}
                    <View className="gap-y-6">
                        {/* Name Section (Row) */}
                        <View className="flex-row gap-x-4">
                            <View className="flex-1 gap-y-2">
                                <Text className="text-white text-lg font-semibold ml-2">First Name</Text>
                                <View className="bg-slate-800 h-16 rounded-3xl px-6 justify-center border border-slate-700">
                                    <TextInput
                                        className="text-white text-lg"
                                        placeholder="John"
                                        placeholderTextColor="#64748b"
                                    />
                                </View>
                            </View>
                            <View className="flex-1 gap-y-2">
                                <Text className="text-white text-lg font-semibold ml-2">Last Name</Text>
                                <View className="bg-slate-800 h-16 rounded-3xl px-6 justify-center border border-slate-700">
                                    <TextInput
                                        className="text-white text-lg"
                                        placeholder="Doe"
                                        placeholderTextColor="#64748b"
                                    />
                                </View>
                            </View>
                        </View>

                        {/* Email Field */}
                        <View className="gap-y-2">
                            <Text className="text-white text-lg font-semibold ml-2">Email</Text>
                            <View className="bg-slate-800 h-16 rounded-3xl px-6 justify-center border border-slate-700">
                                <TextInput
                                    className="text-white text-lg"
                                    placeholder="your@email.com"
                                    placeholderTextColor="#64748b"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>
                        </View>

                        {/* Phone Number Field */}
                        <View className="gap-y-2">
                            <Text className="text-white text-lg font-semibold ml-2">Phone Number</Text>
                            <View className="bg-slate-800 h-16 rounded-3xl px-6 justify-center border border-slate-700">
                                <TextInput
                                    className="text-white text-lg"
                                    placeholder="0917 XXX XXXX"
                                    placeholderTextColor="#64748b"
                                    keyboardType="phone-pad"
                                />
                            </View>
                        </View>

                        {/* Password Field */}
                        <View className="gap-y-2">
                            <Text className="text-white text-lg font-semibold ml-2">Password</Text>
                            <View className="bg-slate-800 h-16 rounded-3xl px-6 flex-row items-center border border-slate-700">
                                <TextInput
                                    className="flex-1 text-white text-lg"
                                    placeholder="••••••••"
                                    placeholderTextColor="#64748b"
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

                        {/* Confirm Password Field */}
                        <View className="gap-y-2">
                            <Text className="text-white text-lg font-semibold ml-2">Confirm Password</Text>
                            <View className="bg-slate-800 h-16 rounded-3xl px-6 flex-row items-center border border-slate-700">
                                <TextInput
                                    className="flex-1 text-white text-lg"
                                    placeholder="••••••••"
                                    placeholderTextColor="#64748b"
                                    secureTextEntry={!showConfirmPassword}
                                />
                                <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                    <Ionicons
                                        name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                                        size={24}
                                        color="#94a3b8"
                                    />
                                </Pressable>
                            </View>
                        </View>
                    </View>

                    {/* Action Section */}
                    <View className="mt-12">
                        <Pressable
                            onPress={() => router.replace("/question")}
                            className="w-full bg-slate-400 h-16 rounded-3xl items-center justify-center active:bg-slate-500 shadow-lg"
                        >
                            <Text className="text-slate-900 text-xl font-bold">Register</Text>
                        </Pressable>

                        <View className="flex-row justify-center mt-6">
                            <Text className="text-slate-500 text-base">Already have an account? </Text>
                            <Pressable onPress={() => router.push("/login")}>
                                <Text className="text-slate-400 text-base font-bold">Login</Text>
                            </Pressable>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default Register;
