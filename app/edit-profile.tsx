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
import { useProfile } from "../context/ProfileContext";

const ProfileScreen = () => {
    const router = useRouter();
    const { profile, updateProfile } = useProfile();

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
                    <Text className="text-white text-xl font-bold">Edit Profile</Text>
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
                            <View className="w-32 h-32 bg-[#334155] rounded-full border-2 border-[#90A1B9] items-center justify-center overflow-hidden">
                                <Ionicons name="person" size={64} color="#90A1B9" />
                            </View>
                            <Pressable
                                onPress={() => {/* Change Photo handler */ }}
                                className="absolute bottom-0 right-0 bg-[#1E293B] p-2 rounded-full border border-[#90A1B9] shadow-lg"
                            >
                                <MaterialCommunityIcons name="camera-plus" size={20} color="white" />
                            </Pressable>
                        </View>
                        <Text className="text-slate-400 text-sm mt-3 font-medium">Change Profile Photo</Text>
                    </View>

                    {/* Form Fields */}
                    <View className="gap-y-6">
                        {/* Name Section */}
                        <View className="flex-row gap-x-4">
                            <View className="flex-1 gap-y-2">
                                <Text className="text-white text-lg font-semibold ml-2">First Name</Text>
                                <View className="bg-[#334155] h-16 rounded-[25px] px-6 justify-center border border-[#90A1B9]/50">
                                    <TextInput
                                        className="text-white text-lg"
                                        placeholder="First Name"
                                        placeholderTextColor="#64748b"
                                        value={firstName}
                                        onChangeText={setFirstName}
                                    />
                                </View>
                            </View>
                            <View className="flex-1 gap-y-2">
                                <Text className="text-white text-lg font-semibold ml-2">Last Name</Text>
                                <View className="bg-[#334155] h-16 rounded-[25px] px-6 justify-center border border-[#90A1B9]/50">
                                    <TextInput
                                        className="text-white text-lg"
                                        placeholder="Last Name"
                                        placeholderTextColor="#64748b"
                                        value={lastName}
                                        onChangeText={setLastName}
                                    />
                                </View>
                            </View>
                        </View>

                        {/* Email Field */}
                        <View className="gap-y-2">
                            <Text className="text-white text-lg font-semibold ml-2">Email Address</Text>
                            <View className="bg-[#334155] h-16 rounded-[25px] px-6 justify-center border border-[#90A1B9]/50">
                                <TextInput
                                    className="text-white text-lg"
                                    placeholder="your@email.com"
                                    placeholderTextColor="#64748b"
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                />
                            </View>
                        </View>

                        {/* Phone Number Field */}
                        <View className="gap-y-2">
                            <Text className="text-white text-lg font-semibold ml-2">Phone Number</Text>
                            <View className="bg-[#334155] h-16 rounded-[25px] px-6 justify-center border border-[#90A1B9]/50">
                                <TextInput
                                    className="text-white text-lg"
                                    placeholder="0917 XXX XXXX"
                                    placeholderTextColor="#64748b"
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
                            className="w-full bg-[#90A1B9] h-16 rounded-[25px] items-center justify-center active:opacity-80 shadow-2xl"
                        >
                            <Text className="text-[#1E293B] text-xl font-black">Save Changes</Text>
                        </Pressable>

                        <Pressable
                            onPress={() => router.back()}
                            className="w-full h-16 rounded-3xl items-center justify-center mt-2"
                        >
                            <Text className="text-slate-500 text-lg font-medium">Cancel</Text>
                        </Pressable>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default ProfileScreen;
