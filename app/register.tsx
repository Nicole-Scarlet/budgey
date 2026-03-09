import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as React from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View, Alert, ActivityIndicator, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../services/supabase";

import { useTransactions } from "../contexts/TransactionContext";

const Register = () => {
    const router = useRouter();
    const { clearData } = useTransactions();
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [confirmPassword, setConfirmPassword] = React.useState("");
    const [firstName, setFirstName] = React.useState("");
    const [lastName, setLastName] = React.useState("");
    const [phone, setPhone] = React.useState("");
    const [showPassword, setShowPassword] = React.useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
    const [isSubmitted, setIsSubmitted] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const [showVerification, setShowVerification] = React.useState(false);
    const [verificationPin, setVerificationPin] = React.useState("");
    const [isVerifying, setIsVerifying] = React.useState(false);

    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    const isFormValid =
        firstName.trim() !== "" &&
        lastName.trim() !== "" &&
        isEmailValid &&
        password.trim() !== "" &&
        password === confirmPassword;

    const handleRegister = async () => {
        setIsSubmitted(true);
        if (isFormValid) {
            setIsLoading(true);
            try {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            first_name: firstName,
                            last_name: lastName,
                            phone,
                        }
                    }
                });

                if (error) {
                    if (error.message.includes("already registered") || error.message.includes("User already exists")) {
                        Alert.alert("Registration Error", "This email is already registered. Please login or use a different email.");
                    } else {
                        Alert.alert("Registration Error", error.message);
                    }
                    return;
                }

                if (data.user) {
                    setShowVerification(true);
                }
            } catch (err: any) {
                Alert.alert("Error", "Something went wrong. Please try again.");
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleVerifyPin = async () => {
        if (verificationPin.length !== 6) {
            Alert.alert("Invalid PIN", "Please enter the 6-digit PIN sent to your email.");
            return;
        }

        setIsVerifying(true);
        try {
            const { error } = await supabase.auth.verifyOtp({
                email,
                token: verificationPin,
                type: 'signup'
            });

            if (error) {
                Alert.alert("Verification Failed", error.message);
            } else {
                setShowVerification(false);
                await clearData();
                router.replace("/question");
            }
        } catch (err) {
            Alert.alert("Error", "Verification failed. Please try again.");
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResendPin = async () => {
        try {
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: email,
            });

            if (error) {
                Alert.alert("Resend Failed", error.message);
            } else {
                Alert.alert("PIN Resent", "A new 6-digit PIN has been sent to your email.");
            }
        } catch (err) {
            Alert.alert("Error", "Could not resend PIN. Please try again.");
        }
    };

    const handleChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (text: string) => {
        setter(text);
        if (isSubmitted) setIsSubmitted(false);
    };

    return (
        <SafeAreaView className="flex-1 bg-[#1E293B]">
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }} className="px-8 py-10">
                    {/* Header Section */}
                    <View className="mb-12">
                        <Text className="text-white text-5xl font-bold mb-4">
                            Register.
                        </Text>
                        <Text className="text-slate-300 text-lg leading-6">
                            Start your journey to better budgeting today!
                        </Text>
                    </View>

                    {/* Form Section */}
                    <View className="gap-y-8">
                        {/* First Name Field */}
                        <View className="gap-y-2">
                            <Text className="text-white text-lg font-semibold ml-2">First Name</Text>
                            <View className="bg-[#1E293B] h-16 rounded-3xl px-6 justify-center border border-slate-700">
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
                            <View className="bg-[#1E293B] h-16 rounded-3xl px-6 justify-center border border-slate-700">
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
                            <View className={`bg-[#1E293B] h-16 rounded-3xl px-6 justify-center border ${isSubmitted && !isEmailValid ? 'border-red-500' : 'border-slate-700'}`}>
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
                            <View className="bg-[#1E293B] h-16 rounded-3xl px-6 justify-center border border-slate-700">
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
                            <View className="bg-[#1E293B] h-16 rounded-3xl px-6 flex-row items-center border border-slate-700">
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
                            <View className="bg-[#1E293B] h-16 rounded-3xl px-6 flex-row items-center border border-slate-700">
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
                    <View className="mt-16">
                        <Pressable
                            onPress={handleRegister}
                            disabled={isLoading}
                            className={`w-full h-16 rounded-3xl items-center justify-center shadow-lg bg-slate-400 active:bg-slate-500 ${isLoading ? 'opacity-70' : ''}`}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#0f172a" />
                            ) : (
                                <Text className={`text-xl font-bold text-slate-900`}>
                                    Register
                                </Text>
                            )}
                        </Pressable>

                        <Modal
                            visible={showVerification}
                            transparent={true}
                            animationType="fade"
                        >
                            <View className="flex-1 bg-black/60 items-center justify-center px-8">
                                <View className="bg-[#1E293B] w-full rounded-3xl p-8 border border-slate-700 shadow-2xl">
                                    <Text className="text-white text-3xl font-bold mb-4">Verify Email</Text>
                                    <Text className="text-slate-300 text-base mb-8 leading-6">
                                        We've sent a 6-digit PIN to {email}. Enter it below to verify your account.
                                    </Text>

                                    <View className="gap-y-6">
                                        <View className="bg-[#1E293B] h-16 rounded-3xl px-6 justify-center border border-slate-700">
                                            <TextInput
                                                className="text-white text-2xl text-center font-bold tracking-[10px]"
                                                placeholder="000000"
                                                placeholderTextColor="#64748b"
                                                value={verificationPin}
                                                onChangeText={setVerificationPin}
                                                keyboardType="number-pad"
                                                maxLength={6}
                                            />
                                        </View>

                                        <Pressable
                                            onPress={handleVerifyPin}
                                            disabled={isVerifying}
                                            className={`h-16 rounded-3xl items-center justify-center bg-slate-400 active:bg-slate-500 ${isVerifying ? 'opacity-70' : ''}`}
                                        >
                                            {isVerifying ? (
                                                <ActivityIndicator color="#0f172a" />
                                            ) : (
                                                <Text className="text-xl font-bold text-slate-900">Verify Account</Text>
                                            )}
                                        </Pressable>

                                        <Pressable 
                                            onPress={handleResendPin}
                                            className="items-center mt-2"
                                        >
                                            <Text className="text-slate-400 font-medium underline">Didn't receive a PIN? Resend</Text>
                                        </Pressable>

                                        <Pressable 
                                            onPress={() => setShowVerification(false)}
                                            className="items-center mt-4"
                                        >
                                            <Text className="text-slate-500 font-semibold">Cancel</Text>
                                        </Pressable>
                                    </View>
                                </View>
                            </View>
                        </Modal>

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
