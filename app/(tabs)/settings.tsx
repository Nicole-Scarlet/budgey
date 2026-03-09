import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as React from "react";
import { useProfile } from "../../contexts/ProfileContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useTransactions } from "../../contexts/TransactionContext";
import { useWishlist } from "../../contexts/WishlistContext";
import { Pressable, ScrollView, Text, View, Switch, Alert, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../services/supabase";

const SettingsPage = () => {
    const router = useRouter();
    const { profile } = useProfile();
    const { clearData } = useTransactions();
    const { clearWishlistState } = useWishlist();
    const { isDark, toggleTheme } = useTheme();
    const { colors } = useTheme();

    const handleLogout = async () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to log out?",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Logout", 
                    style: "destructive",
                    onPress: async () => {
                        await clearData();
                        clearWishlistState();
                        await supabase.auth.signOut();
                        router.replace("/login");
                    }
                }
            ]
        );
    };
    const handleDeleteAccount = async () => {
        Alert.alert(
            "Delete Account",
            "Are you sure you want to permanently delete your account? All your data will be erased and your email will be freed for a new account. This cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => {
                        // Second confirmation
                        Alert.alert(
                            "Final Confirmation",
                            "This is irreversible. Delete your account now?",
                            [
                                { text: "Cancel", style: "cancel" },
                                {
                                    text: "Delete Forever",
                                    style: "destructive",
                                    onPress: async () => {
                                        try {
                                            const { data: { user } } = await supabase.auth.getUser();
                                            if (!user) return;

                                            // 1. Delete all user data from Supabase tables
                                            await supabase.from('transactions').delete().eq('user_id', user.id);
                                            await supabase.from('categories').delete().eq('user_id', user.id);
                                            await supabase.from('debt_payments').delete().eq('user_id', user.id);
                                            await supabase.from('debts').delete().eq('user_id', user.id);
                                            await supabase.from('settings').delete().eq('user_id', user.id);
                                            await supabase.from('wishlist').delete().eq('user_id', user.id);
                                            await supabase.from('profile').delete().eq('user_id', user.id);

                                            // 2. Delete the auth user via server-side RPC (frees the email)
                                            const { error: rpcError } = await supabase.rpc('delete_own_account');
                                            if (rpcError) {
                                                console.error("RPC delete error:", rpcError.message);
                                            }

                                            // 3. Clear local state
                                            await clearData();
                                            clearWishlistState();

                                            // 4. Sign out and go to intro
                                            await supabase.auth.signOut();
                                            router.replace("/intro");
                                        } catch (error) {
                                            console.error("Error deleting account:", error);
                                            Alert.alert("Error", "Failed to delete account. Please try again.");
                                        }
                                    }
                                }
                            ]
                        );
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
            <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
                {/* Profile Header */}
                <View className="items-center mt-2 mb-8">
                    <View className="relative">
                        <View 
                            style={{ backgroundColor: colors.card, borderColor: colors.border }}
                            className="w-32 h-32 rounded-full border-2 items-center justify-center overflow-hidden"
                        >
                            {profile.avatarUrl ? (
                                <Image
                                    source={{ uri: profile.avatarUrl }}
                                    style={{ width: '100%', height: '100%' }}
                                    resizeMode="cover"
                                />
                            ) : (
                                <Ionicons name="person" size={64} color={colors.muted} />
                            )}
                        </View>
                        <Pressable
                            onPress={() => router.push("/edit-profile" as any)}
                            style={{ backgroundColor: colors.background, borderColor: colors.border }}
                            className="absolute bottom-0 right-0 p-2 rounded-full border shadow-lg"
                        >
                            <MaterialCommunityIcons name="pencil-outline" size={20} color={colors.foreground} />
                        </Pressable>
                    </View>
                    <Text 
                        className="text-3xl font-black mt-4"
                        style={{ color: colors.foreground }}
                    >{`${profile.firstName} ${profile.lastName}`}</Text>
                </View>

                {/* Settings Container */}
                <View 
                    style={{ backgroundColor: colors.card, borderColor: colors.border }}
                    className="rounded-[25px] p-6 border mb-8 shadow-2xl"
                >
                    <SectionTitle title="Account" />
                    <SettingsItem icon="person-outline" label="Edit Profile" onPress={() => router.push("/edit-profile" as any)} />
                    <SettingsItem icon="shield-outline" label="Security" onPress={() => router.push("/security" as any)} />
                    <SettingsItem icon="lock-closed-outline" label="Privacy" onPress={() => router.push("/privacy" as any)} />

                    <View className="h-[1px] my-4 mx-2" style={{ backgroundColor: colors.border + '33' }} />

                    <SectionTitle title="Support" />
                    <SettingsItem icon="help-circle-outline" label="Help & Support" onPress={() => router.push("/support" as any)} />
                    <SettingsItem icon="document-text-outline" label="Terms & Conditions" onPress={() => router.push("/terms" as any)} />

                    <View className="h-[1px] bg-[#90A1B9]/20 my-4 mx-2" />

                    <SectionTitle title="Appearance" />
                    <View className="flex-row items-center justify-between py-4 px-2">
                        <View className="flex-row items-center gap-x-4">
                            <View 
                                style={{ backgroundColor: colors.background, borderColor: colors.border }}
                                className="w-10 h-10 rounded-xl items-center justify-center border"
                            >
                                <MaterialCommunityIcons name="weather-sunny" size={22} color={colors.foreground} />
                            </View>
                            <Text className="text-lg font-medium" style={{ color: colors.foreground }}>Light Mode</Text>
                        </View>
                        <Switch
                            trackColor={{ false: colors.background, true: colors.muted }}
                            thumbColor={!isDark ? colors.card : colors.foreground}
                            onValueChange={toggleTheme}
                            value={!isDark}
                        />
                    </View>

                    {/* Logout Button */}
                    <View className="mt-8 mb-2 items-center">
                        <Pressable 
                            onPress={handleLogout}
                            style={{ backgroundColor: colors.background, borderColor: colors.border + '4D' }}
                            className="w-full py-4 rounded-[25px] items-center justify-center border active:opacity-80"
                        >
                            <Text className="text-red-500 text-xl font-black">Logout</Text>
                        </Pressable>
                    </View>

                    {/* Delete Account Button */}
                    <View className="mb-4 items-center">
                        <Pressable 
                            onPress={handleDeleteAccount}
                            className="w-full py-4 rounded-[25px] items-center justify-center active:opacity-80"
                            style={{ backgroundColor: '#ef44441A', borderColor: '#ef444433', borderWidth: 1 }}
                        >
                            <Text className="text-red-500 text-lg font-bold">Delete Account</Text>
                        </Pressable>
                    </View>
                </View>
                
                <Text className="text-center mb-12 font-medium" style={{ color: colors.muted }}>Version 1.0</Text>
            </ScrollView>
        </SafeAreaView>
    );
};

const SectionTitle = ({ title }: { title: string }) => {
    const { colors } = useTheme();
    return (
        <Text className="text-lg font-bold mb-2 ml-2" style={{ color: colors.muted }}>{title}</Text>
    );
};

const SettingsItem = ({ icon, label, onPress }: { icon: any, label: string, onPress?: () => void }) => {
    const { colors } = useTheme();
    return (
    <Pressable
        onPress={onPress}
        className="flex-row items-center justify-between py-4 px-2 active:opacity-70"
    >
        <View className="flex-row items-center gap-x-4">
            <View 
                style={{ backgroundColor: colors.background, borderColor: colors.border }}
                className="w-10 h-10 rounded-xl items-center justify-center border"
            >
                <Ionicons name={icon} size={22} color={colors.foreground} />
            </View>
            <Text className="text-lg font-bold" style={{ color: colors.foreground }}>{label}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.muted} />
    </Pressable>
    );
};

export default SettingsPage;
