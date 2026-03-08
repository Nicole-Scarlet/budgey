import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as React from "react";
import {
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

const ProfileScreen = () => {
    const router = useRouter();
    const { profile, updateProfile } = useProfile();
    const { colors, isDark } = useTheme();

    const [firstName, setFirstName] = React.useState(profile.firstName);
    const [lastName, setLastName] = React.useState(profile.lastName);
    const [email, setEmail] = React.useState(profile.email);
    const [phone, setPhone] = React.useState(profile.phone);

    const handleSave = async () => {
        await updateProfile({
            firstName,
            lastName,
            email,
            phone
        });
        router.back();
    };

    return (
        <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
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
                    <Text className="text-xl font-bold" style={{ color: colors.foreground }}>Edit Profile</Text>
                    <View className="w-10" />
                </View>

                <ScrollView
                    className="flex-1 px-6"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 40 }}
                >
                    {/* Profile Header */}
                    <View className="items-center mt-6 mb-10">
                        <View className="relative">
                            <View 
                                style={{ backgroundColor: colors.card, borderColor: colors.border }}
                                className="w-32 h-32 rounded-full border-2 items-center justify-center overflow-hidden"
                            >
                                <Ionicons name="person" size={64} color={colors.muted} />
                            </View>
                            <Pressable
                                onPress={() => {/* Change Photo handler */ }}
                                style={{ backgroundColor: colors.background, borderColor: colors.border }}
                                className="absolute bottom-0 right-0 p-2 rounded-full border shadow-lg"
                            >
                                <MaterialCommunityIcons name="camera-plus" size={20} color={colors.foreground} />
                            </Pressable>
                        </View>
                        <Text className="text-sm mt-3 font-medium" style={{ color: colors.muted }}>Change Profile Photo</Text>
                    </View>

                    {/* Form Fields */}
                    <View className="gap-y-6">
                        {/* Name Section */}
                        <View className="flex-row gap-x-4">
                            <View className="flex-1 gap-y-2">
                                <Text className="text-lg font-semibold ml-2" style={{ color: colors.foreground }}>First Name</Text>
                                <View 
                                    style={{ backgroundColor: colors.card, borderColor: colors.border + '80' }}
                                    className="h-16 rounded-[25px] px-6 justify-center border"
                                >
                                    <TextInput
                                        className="text-lg"
                                        style={{ color: colors.foreground }}
                                        placeholder="First Name"
                                        placeholderTextColor={colors.muted}
                                        value={firstName}
                                        onChangeText={setFirstName}
                                    />
                                </View>
                            </View>
                            <View className="flex-1 gap-y-2">
                                <Text className="text-lg font-semibold ml-2" style={{ color: colors.foreground }}>Last Name</Text>
                                <View 
                                    style={{ backgroundColor: colors.card, borderColor: colors.border + '80' }}
                                    className="h-16 rounded-[25px] px-6 justify-center border"
                                >
                                    <TextInput
                                        className="text-lg"
                                        style={{ color: colors.foreground }}
                                        placeholder="Last Name"
                                        placeholderTextColor={colors.muted}
                                        value={lastName}
                                        onChangeText={setLastName}
                                    />
                                </View>
                            </View>
                        </View>

                        {/* Email Field */}
                        <View className="gap-y-2">
                            <Text className="text-lg font-semibold ml-2" style={{ color: colors.foreground }}>Email Address</Text>
                            <View 
                                style={{ backgroundColor: colors.card, borderColor: colors.border + '80' }}
                                className="h-16 rounded-[25px] px-6 justify-center border"
                            >
                                <TextInput
                                    className="text-lg"
                                    style={{ color: colors.foreground }}
                                    placeholder="your@email.com"
                                    placeholderTextColor={colors.muted}
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                />
                            </View>
                        </View>

                        {/* Phone Number Field */}
                        <View className="gap-y-2">
                            <Text className="text-lg font-semibold ml-2" style={{ color: colors.foreground }}>Phone Number</Text>
                            <View 
                                style={{ backgroundColor: colors.card, borderColor: colors.border + '80' }}
                                className="h-16 rounded-[25px] px-6 justify-center border"
                            >
                                <TextInput
                                    className="text-lg"
                                    style={{ color: colors.foreground }}
                                    placeholder="0917 XXX XXXX"
                                    placeholderTextColor={colors.muted}
                                    value={phone}
                                    onChangeText={setPhone}
                                    keyboardType="phone-pad"
                                />
                            </View>
                        </View>
                    </View>

                    {/* Save Button */}
                    <View className="mt-12">
                        <Pressable
                            onPress={handleSave}
                            style={{ backgroundColor: colors.foreground }}
                            className="w-full h-16 rounded-[25px] items-center justify-center active:opacity-80 shadow-2xl"
                        >
                            <Text 
                                className="text-xl font-black"
                                style={{ color: colors.background }}
                            >
                                Save Changes
                            </Text>
                        </Pressable>

                        <Pressable
                            onPress={() => router.back()}
                            className="w-full h-16 rounded-3xl items-center justify-center mt-2"
                        >
                            <Text className="text-lg font-medium" style={{ color: colors.muted }}>Cancel</Text>
                        </Pressable>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default ProfileScreen;
