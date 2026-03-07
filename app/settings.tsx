import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as React from "react";
import { useProfile } from "../context/ProfileContext";
import { Pressable, ScrollView, Text, View, Switch, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SettingsPage = () => {
    const router = useRouter();
    const { profile } = useProfile();
    const [isAlbinoMode, setIsAlbinoMode] = React.useState(false);

    return (
        <SafeAreaView className="flex-1 bg-[#1E293B]">
            {/* Header with Back Button */}
            <View className="flex-row items-center justify-between px-6 py-4">
                <Pressable
                    onPress={() => router.back()}
                    className="w-10 h-10 bg-[#334155] rounded-full items-center justify-center border border-[#90A1B9]"
                >
                    <Ionicons name="chevron-back" size={24} color="white" />
                </Pressable>
                <Text className="text-white text-xl font-bold">Settings</Text>
                <View className="w-10" />
            </View>

            <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>

                {/* Profile Header */}
                <View className="items-center mt-2 mb-8">
                    <View className="relative">
                        <View className="w-32 h-32 bg-[#334155] rounded-full border-2 border-[#90A1B9] items-center justify-center overflow-hidden">
                            {profile.image ? (
                                <Image source={{ uri: profile.image }} className="w-full h-full" />
                            ) : (
                                <Ionicons name="person" size={64} color="#90A1B9" />
                            )}
                        </View>
                        <Pressable
                            onPress={() => router.push("/profile" as any)}
                            className="absolute bottom-0 right-0 bg-[#1E293B] p-2 rounded-full border border-[#90A1B9] shadow-lg"
                        >
                            <MaterialCommunityIcons name="pencil-outline" size={20} color="white" />
                        </Pressable>
                    </View>
                    <Text className="text-white text-3xl font-black mt-4">{`${profile.firstName} ${profile.lastName}`}</Text>
                </View>

                {/* Settings Container */}
                <View className="bg-[#334155] rounded-[25px] p-6 border border-[#90A1B9] mb-8 shadow-2xl">

                    {/* Account Section */}
                    <SectionTitle title="Account" />
                    <SettingsItem icon="person-outline" label="Profile" onPress={() => router.push("/profile" as any)} />
                    <SettingsItem icon="shield-outline" label="Security" onPress={() => router.push("/security" as any)} />
                    <SettingsItem icon="lock-closed-outline" label="Privacy" onPress={() => router.push("/privacy" as any)} />

                    <View className="h-[1px] bg-[#90A1B9]/20 my-4 mx-2" />

                    {/* Support Section */}
                    <SectionTitle title="Support" />
                    <SettingsItem icon="help-circle-outline" label="Help & Support" onPress={() => router.push("/support" as any)} />
                    <SettingsItem icon="document-text-outline" label="Terms & Conditions" onPress={() => router.push("/terms" as any)} />

                    <View className="h-[1px] bg-[#90A1B9]/20 my-4 mx-2" />

                    {/* Appearance Section */}
                    <SectionTitle title="Appearance" />
                    <View className="flex-row items-center justify-between py-4 px-2">
                        <View className="flex-row items-center gap-x-4">
                            <View className="w-10 h-10 bg-slate-700/50 rounded-xl items-center justify-center">
                                <MaterialCommunityIcons name="weather-sunny" size={22} color="white" />
                            </View>
                            <Text className="text-white text-lg font-medium">Light Mode</Text>
                        </View>
                        <Switch
                            trackColor={{ false: "#1E293B", true: "#90A1B9" }}
                            thumbColor={isAlbinoMode ? "#f8fafc" : "#90A1B9"}
                            onValueChange={setIsAlbinoMode}
                            value={isAlbinoMode}
                        />
                    </View>

                    {/* Logout Button */}
                    <View className="mt-8 mb-4 items-center">
                        <Pressable className="bg-[#1E293B] w-full py-4 rounded-[25px] items-center justify-center border border-[#90A1B9]/30 active:opacity-80">
                            <Text className="text-red-500 text-xl font-black">Logout</Text>
                        </Pressable>
                    </View>
                </View>

                {/* Footer */}
                <Text className="text-slate-500 text-center mb-12 font-medium">Version 1.0</Text>

            </ScrollView>
        </SafeAreaView>
    );
};

const SectionTitle = ({ title }: { title: string }) => (
    <Text className="text-slate-400 text-lg font-bold mb-2 ml-2">{title}</Text>
);

const SettingsItem = ({ icon, label, onPress }: { icon: any, label: string, onPress?: () => void }) => (
    <Pressable
        onPress={onPress}
        className="flex-row items-center justify-between py-4 px-2 active:opacity-70"
    >
        <View className="flex-row items-center gap-x-4">
            <View className="w-10 h-10 bg-[#1E293B] rounded-xl items-center justify-center border border-[#90A1B9]/20">
                <Ionicons name={icon} size={22} color="white" />
            </View>
            <Text className="text-white text-lg font-bold">{label}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#90A1B9" />
    </Pressable>
);

export default SettingsPage;
