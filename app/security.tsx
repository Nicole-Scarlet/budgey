import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as React from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useProfile } from "../context/ProfileContext";

const SecuritySettings = () => {
    const router = useRouter();
    const { profile, updateProfile } = useProfile();

    // View Password State
    const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);
    const [isVerifyingToView, setIsVerifyingToView] = React.useState(false);
    const [verificationPassword, setVerificationPassword] = React.useState("");

    // Change Password State
    const [currentPasswordInput, setCurrentPasswordInput] = React.useState("");
    const [newPassword, setNewPassword] = React.useState("");
    const [confirmPassword, setConfirmPassword] = React.useState("");
    const [showCurrentPass, setShowCurrentPass] = React.useState(false);
    const [showNewPass, setShowNewPass] = React.useState(false);
    const [showConfirmPass, setShowConfirmPass] = React.useState(false);

    const handleToggleVisibility = () => {
        if (isPasswordVisible) {
            setIsPasswordVisible(false);
        } else {
            setIsVerifyingToView(true);
        }
    };

    const verifyToView = () => {
        if (verificationPassword === profile.password) {
            setIsPasswordVisible(true);
            setIsVerifyingToView(false);
            setVerificationPassword("");
        } else {
            Alert.alert("Error", "Incorrect password. Please try again.");
        }
    };

    const handleChangePassword = () => {
        if (!currentPasswordInput || !newPassword || !confirmPassword) {
            Alert.alert("Error", "Please fill in all fields.");
            return;
        }

        if (currentPasswordInput !== profile.password) {
            Alert.alert("Error", "Current password is incorrect.");
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert("Error", "New passwords do not match.");
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert("Error", "New password must be at least 6 characters.");
            return;
        }

        updateProfile({ password: newPassword });
        Alert.alert("Success", "Password updated successfully!", [
            { text: "OK", onPress: () => router.back() }
        ]);
    };

    return (
        <SafeAreaView className="flex-1 bg-[#1E293B]">
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
            >
                {/* Header */}
                <View className="flex-row items-center justify-between px-6 py-4">
                    <Pressable
                        onPress={() => router.back()}
                        className="w-10 h-10 bg-[#334155] rounded-full items-center justify-center border border-[#90A1B9]"
                    >
                        <Ionicons name="chevron-back" size={24} color="white" />
                    </Pressable>
                    <Text className="text-white text-xl font-bold">Security</Text>
                    <View className="w-10" />
                </View>

                <ScrollView
                    className="flex-1 px-6"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 40 }}
                >
                    {/* View Password Section */}
                    <View className="mt-8 mb-10">
                        <Text className="text-slate-400 text-lg font-bold mb-4 ml-2">Current Password</Text>
                        <View className="bg-[#334155] rounded-[25px] p-6 border border-[#90A1B9] shadow-2xl">
                            <View className="flex-row items-center justify-between bg-[#1E293B] h-16 rounded-2xl px-6 border border-[#90A1B9]/20">
                                <Text className="text-white text-lg tracking-widest">
                                    {isPasswordVisible ? profile.password : "••••••••••••"}
                                </Text>
                                <Pressable onPress={handleToggleVisibility}>
                                    <Ionicons
                                        name={isPasswordVisible ? "eye-outline" : "eye-off-outline"}
                                        size={24}
                                        color="#90A1B9"
                                    />
                                </Pressable>
                            </View>

                            {isVerifyingToView && (
                                <View className="mt-4 gap-y-3">
                                    <Text className="text-slate-300 text-sm ml-2">Enter current password to view:</Text>
                                    <View className="bg-[#1E293B] h-14 rounded-2xl px-5 border border-[#90A1B9]/20 justify-center">
                                        <TextInput
                                            className="text-white text-base"
                                            placeholder="••••••••"
                                            placeholderTextColor="#64748b"
                                            secureTextEntry
                                            value={verificationPassword}
                                            onChangeText={setVerificationPassword}
                                            autoFocus
                                        />
                                    </View>
                                    <Pressable
                                        onPress={verifyToView}
                                        className="bg-[#90A1B9] h-12 rounded-2xl items-center justify-center mt-1 active:opacity-80"
                                    >
                                        <Text className="text-[#1E293B] font-black">Verify</Text>
                                    </Pressable>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Change Password Section */}
                    <View>
                        <Text className="text-slate-400 text-lg font-bold mb-4 ml-2">Change Password</Text>
                        <View className="bg-[#334155] rounded-[25px] p-6 border border-[#90A1B9] gap-y-6 shadow-2xl">

                            {/* Current Password */}
                            <View className="gap-y-2">
                                <Text className="text-white text-base font-semibold ml-2">Current Password</Text>
                                <View className="bg-[#1E293B] h-16 rounded-2xl px-6 flex-row items-center border border-[#90A1B9]/20">
                                    <TextInput
                                        className="flex-1 text-white text-lg"
                                        placeholder="••••••••"
                                        placeholderTextColor="#64748b"
                                        secureTextEntry={!showCurrentPass}
                                        value={currentPasswordInput}
                                        onChangeText={setCurrentPasswordInput}
                                    />
                                    <Pressable onPress={() => setShowCurrentPass(!showCurrentPass)}>
                                        <Ionicons
                                            name={showCurrentPass ? "eye-outline" : "eye-off-outline"}
                                            size={22}
                                            color="#90A1B9"
                                        />
                                    </Pressable>
                                </View>
                            </View>

                            {/* New Password */}
                            <View className="gap-y-2">
                                <Text className="text-white text-base font-semibold ml-2">New Password</Text>
                                <View className="bg-[#1E293B] h-16 rounded-2xl px-6 flex-row items-center border border-[#90A1B9]/20">
                                    <TextInput
                                        className="flex-1 text-white text-lg"
                                        placeholder="••••••••"
                                        placeholderTextColor="#64748b"
                                        secureTextEntry={!showNewPass}
                                        value={newPassword}
                                        onChangeText={setNewPassword}
                                    />
                                    <Pressable onPress={() => setShowNewPass(!showNewPass)}>
                                        <Ionicons
                                            name={showNewPass ? "eye-outline" : "eye-off-outline"}
                                            size={22}
                                            color="#90A1B9"
                                        />
                                    </Pressable>
                                </View>
                            </View>

                            {/* Confirm Password */}
                            <View className="gap-y-2">
                                <Text className="text-white text-base font-semibold ml-2">Confirm New Password</Text>
                                <View className="bg-[#1E293B] h-16 rounded-2xl px-6 flex-row items-center border border-[#90A1B9]/20">
                                    <TextInput
                                        className="flex-1 text-white text-lg"
                                        placeholder="••••••••"
                                        placeholderTextColor="#64748b"
                                        secureTextEntry={!showConfirmPass}
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                    />
                                    <Pressable onPress={() => setShowConfirmPass(!showConfirmPass)}>
                                        <Ionicons
                                            name={showConfirmPass ? "eye-outline" : "eye-off-outline"}
                                            size={22}
                                            color="#90A1B9"
                                        />
                                    </Pressable>
                                </View>
                            </View>

                            <Pressable
                                onPress={handleChangePassword}
                                className="w-full bg-[#90A1B9] h-16 rounded-[25px] items-center justify-center mt-4 active:opacity-80 shadow-lg"
                            >
                                <Text className="text-[#1E293B] text-xl font-black">Update Password</Text>
                            </Pressable>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default SecuritySettings;
