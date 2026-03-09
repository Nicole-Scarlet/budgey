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
import { useProfile } from "../contexts/ProfileContext";
import { useTheme } from "../contexts/ThemeContext";

const SecuritySettings = () => {
    const router = useRouter();
    const { profile, updateProfile } = useProfile();
    const { colors, isDark } = useTheme();

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
        <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                className="flex-1"
            >
                {/* Header */}
                <View className="flex-row items-center justify-between px-6 py-4">
                    <Pressable
                        onPress={() => router.back()}
                        className="w-10 h-10 rounded-full items-center justify-center border"
                        style={{ backgroundColor: colors.card, borderColor: colors.border }}
                    >
                        <Ionicons name="chevron-back" size={24} color={colors.foreground} />
                    </Pressable>
                    <Text className="text-xl font-bold" style={{ color: colors.foreground }}>Security</Text>
                    <View className="w-10" />
                </View>

                <ScrollView
                    className="flex-1 px-6"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 40 }}
                >
                    {/* View Password Section */}
                    <View className="mt-8 mb-10">
                        <Text className="text-lg font-bold mb-4 ml-2" style={{ color: colors.muted }}>Current Password</Text>
                        <View 
                            style={{ backgroundColor: colors.card, borderColor: colors.border }}
                            className="rounded-[25px] p-6 border shadow-2xl"
                        >
                            <View 
                                style={{ backgroundColor: colors.background, borderColor: colors.border + '33' }}
                                className="flex-row items-center justify-between h-16 rounded-2xl px-6 border"
                            >
                                <Text 
                                    className="text-lg tracking-widest"
                                    style={{ color: colors.foreground }}
                                >
                                    {isPasswordVisible ? profile.password : "••••••••••••"}
                                </Text>
                                <Pressable onPress={handleToggleVisibility}>
                                    <Ionicons
                                        name={isPasswordVisible ? "eye-outline" : "eye-off-outline"}
                                        size={24}
                                        color={colors.muted}
                                    />
                                </Pressable>
                            </View>

                            {isVerifyingToView && (
                                <View className="mt-4 gap-y-3">
                                    <Text className="text-sm ml-2" style={{ color: colors.foreground }}>Enter current password to view:</Text>
                                    <View 
                                        style={{ backgroundColor: colors.background, borderColor: colors.border + '33' }}
                                        className="h-14 rounded-2xl px-5 border justify-center"
                                    >
                                        <TextInput
                                            className="text-base"
                                            style={{ color: colors.foreground }}
                                            placeholder="••••••••"
                                            placeholderTextColor={colors.muted}
                                            secureTextEntry
                                            value={verificationPassword}
                                            onChangeText={setVerificationPassword}
                                            autoFocus
                                        />
                                    </View>
                                    <Pressable
                                        onPress={verifyToView}
                                        style={{ backgroundColor: colors.foreground }}
                                        className="h-12 rounded-2xl items-center justify-center mt-1 active:opacity-80"
                                    >
                                        <Text 
                                            className="font-black"
                                            style={{ color: colors.background }}
                                        >
                                            Verify
                                        </Text>
                                    </Pressable>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Change Password Section */}
                    <View>
                        <Text className="text-lg font-bold mb-4 ml-2" style={{ color: colors.muted }}>Change Password</Text>
                        <View 
                            style={{ backgroundColor: colors.card, borderColor: colors.border }}
                            className="rounded-[25px] p-6 border gap-y-6 shadow-2xl"
                        >

                            {/* Current Password */}
                            <View className="gap-y-2">
                                <Text className="text-base font-semibold ml-2" style={{ color: colors.foreground }}>Current Password</Text>
                                <View 
                                    style={{ backgroundColor: colors.background, borderColor: colors.border + '33' }}
                                    className="h-16 rounded-2xl px-6 flex-row items-center border"
                                >
                                    <TextInput
                                        className="flex-1 text-lg"
                                        style={{ color: colors.foreground }}
                                        placeholder="••••••••"
                                        placeholderTextColor={colors.muted}
                                        secureTextEntry={!showCurrentPass}
                                        value={currentPasswordInput}
                                        onChangeText={setCurrentPasswordInput}
                                    />
                                    <Pressable onPress={() => setShowCurrentPass(!showCurrentPass)}>
                                        <Ionicons
                                            name={showCurrentPass ? "eye-outline" : "eye-off-outline"}
                                            size={22}
                                            color={colors.muted}
                                        />
                                    </Pressable>
                                </View>
                            </View>

                            {/* New Password */}
                            <View className="gap-y-2">
                                <Text className="text-base font-semibold ml-2" style={{ color: colors.foreground }}>New Password</Text>
                                <View 
                                    style={{ backgroundColor: colors.background, borderColor: colors.border + '33' }}
                                    className="h-16 rounded-2xl px-6 flex-row items-center border"
                                >
                                    <TextInput
                                        className="flex-1 text-lg"
                                        style={{ color: colors.foreground }}
                                        placeholder="••••••••"
                                        placeholderTextColor={colors.muted}
                                        secureTextEntry={!showNewPass}
                                        value={newPassword}
                                        onChangeText={setNewPassword}
                                    />
                                    <Pressable onPress={() => setShowNewPass(!showNewPass)}>
                                        <Ionicons
                                            name={showNewPass ? "eye-outline" : "eye-off-outline"}
                                            size={22}
                                            color={colors.muted}
                                        />
                                    </Pressable>
                                </View>
                            </View>

                            {/* Confirm Password */}
                            <View className="gap-y-2">
                                <Text className="text-base font-semibold ml-2" style={{ color: colors.foreground }}>Confirm New Password</Text>
                                <View 
                                    style={{ backgroundColor: colors.background, borderColor: colors.border + '33' }}
                                    className="h-16 rounded-2xl px-6 flex-row items-center border"
                                >
                                    <TextInput
                                        className="flex-1 text-lg"
                                        style={{ color: colors.foreground }}
                                        placeholder="••••••••"
                                        placeholderTextColor={colors.muted}
                                        secureTextEntry={!showConfirmPass}
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                    />
                                    <Pressable onPress={() => setShowConfirmPass(!showConfirmPass)}>
                                        <Ionicons
                                            name={showConfirmPass ? "eye-outline" : "eye-off-outline"}
                                            size={22}
                                            color={colors.muted}
                                        />
                                    </Pressable>
                                </View>
                            </View>

                            <Pressable
                                onPress={handleChangePassword}
                                style={{ backgroundColor: colors.foreground }}
                                className="w-full h-16 rounded-[25px] items-center justify-center mt-4 active:opacity-80 shadow-lg"
                            >
                                <Text 
                                    className="text-xl font-black"
                                    style={{ color: colors.background }}
                                >
                                    Update Password
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default SecuritySettings;
