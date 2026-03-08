import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as React from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Register = () => {
    const router = useRouter();
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [confirmPassword, setConfirmPassword] = React.useState("");
    const [firstName, setFirstName] = React.useState("");
    const [lastName, setLastName] = React.useState("");
    const [phone, setPhone] = React.useState("");
    const [showPassword, setShowPassword] = React.useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
    const [isSubmitted, setIsSubmitted] = React.useState(false);

    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    const isFormValid =
        firstName.trim() !== "" &&
        lastName.trim() !== "" &&
        isEmailValid &&
        password.trim() !== "" &&
        password === confirmPassword;

    const handleRegister = () => {
        setIsSubmitted(true);
        if (isFormValid) {
            router.replace("/question");
        }
    };

    const handleChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (text: string) => {
        setter(text);
        if (isSubmitted) setIsSubmitted(false);
    };

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
                        {/* First Name Field */}
                        <View className="gap-y-2">
                            <Text className="text-white text-lg font-semibold ml-2">First Name</Text>
                            <View className="bg-slate-800 h-16 rounded-3xl px-6 justify-center border border-slate-700">
                                <TextInput
                                    className="text-white text-lg"
                                    placeholder="John"
                                    placeholderTextColor="#64748b"
                                    value={firstName}
                                    onChangeText={handleChange(setFirstName)}
                                />
                            </View>
                        </View>

                        {/* Last Name Field */}
                        <View className="gap-y-2">
                            <Text className="text-white text-lg font-semibold ml-2">Last Name</Text>
                            <View className="bg-slate-800 h-16 rounded-3xl px-6 justify-center border border-slate-700">
                                <TextInput
                                    className="text-white text-lg"
                                    placeholder="Doe"
                                    placeholderTextColor="#64748b"
                                    value={lastName}
                                    onChangeText={handleChange(setLastName)}
                                />
                            </View>
                        </View>

                        {/* Email Field */}
                        <View className="gap-y-2">
                            <Text className="text-white text-lg font-semibold ml-2">Email</Text>
                            <View className={`bg-slate-800 h-16 rounded-3xl px-6 justify-center border ${isSubmitted && !isEmailValid ? 'border-red-500' : 'border-slate-700'}`}>
                                <TextInput
                                    className="text-white text-lg"
                                    placeholder="your@email.com"
                                    placeholderTextColor="#64748b"
                                    value={email}
                                    onChangeText={handleChange(setEmail)}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>
                            {isSubmitted && !isEmailValid && (
                                <Text className="text-red-500 text-sm ml-2">
                                    Please enter a valid email address.
                                </Text>
                            )}
                        </View>

                        {/* Phone Number Field */}
                        <View className="gap-y-2">
                            <Text className="text-white text-lg font-semibold ml-2">Phone Number</Text>
                            <View className="bg-slate-800 h-16 rounded-3xl px-6 justify-center border border-slate-700">
                                <TextInput
                                    className="text-white text-lg"
                                    placeholder="0917 XXX XXXX"
                                    placeholderTextColor="#64748b"
                                    value={phone}
                                    onChangeText={handleChange(setPhone)}
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
                                    value={password}
                                    onChangeText={handleChange(setPassword)}
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
                                    value={confirmPassword}
                                    onChangeText={handleChange(setConfirmPassword)}
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

                        {isSubmitted && !isFormValid && (
                            <Text className="text-red-500 text-sm ml-2 text-center mt-2">
                                Please fill in all fields to register.
                            </Text>
                        )}
                    </View>

                    {/* Action Section */}
                    <View className="mt-12">
                        <Pressable
                            onPress={handleRegister}
                            className={`w-full h-16 rounded-3xl items-center justify-center shadow-lg bg-slate-400 active:bg-slate-500`}
                        >
                            <Text className={`text-xl font-bold text-slate-900`}>
                                Register
                            </Text>
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
