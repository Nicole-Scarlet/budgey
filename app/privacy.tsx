import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as React from "react";
import {
    Pressable,
    ScrollView,
    Text,
    View,
    Switch,
    TouchableOpacity,
    Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../contexts/ThemeContext";
import { useTransactions } from "../contexts/TransactionContext";
import { useWishlist } from "../contexts/WishlistContext";
import { supabase } from "../services/supabase";

const PrivacyPage = () => {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const { clearData } = useTransactions();
    const { clearWishlistState } = useWishlist();

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

    // --- State Management ---
    // Security & Session
    const [autoLogout, setAutoLogout] = React.useState(false);
    const [logoutDuration, setLogoutDuration] = React.useState("5m");
    const [loginAlerts, setLoginAlerts] = React.useState(true);

    // Profile Privacy
    const [isPrivateProfile, setIsPrivateProfile] = React.useState(true);
    const [hideSensitiveCategories, setHideSensitiveCategories] = React.useState(true);

    // AI & Financial Data
    const [aiAnalysis, setAiAnalysis] = React.useState(true);
    const [aiDataScope, setAiDataScope] = React.useState("full"); // expenses, budgets, full
    const [riskRecommendationConsent, setRiskRecommendationConsent] = React.useState(false);

    // Media & Parsing
    const [cameraAccess, setCameraAccess] = React.useState(true);
    const [autoDeleteImages, setAutoDeleteImages] = React.useState(true);

    // Connectivity & Integration
    const [notifications, setNotifications] = React.useState(true);

    // --- Components ---
    const SectionHeader = ({ title, icon }: { title: string, icon: any }) => (
        <View className="flex-row items-center gap-x-3 mb-4 mt-6 ml-2">
            <View 
                style={{ backgroundColor: colors.card, borderColor: colors.border + '4D' }}
                className="w-8 h-8 rounded-lg items-center justify-center border"
            >
                <Ionicons name={icon} size={18} color={colors.muted} />
            </View>
            <Text className="text-lg font-bold" style={{ color: colors.muted }}>{title}</Text>
        </View>
    );

    const SettingToggle = ({ label, description, value, onValueChange }: any) => (
        <View className="flex-row items-center justify-between py-4 px-2">
            <View className="flex-1 mr-4">
                <Text className="text-lg font-medium" style={{ color: colors.foreground }}>{label}</Text>
                {description && <Text className="text-sm mt-0.5" style={{ color: colors.muted }}>{description}</Text>}
            </View>
            <Switch
                trackColor={{ false: colors.background, true: colors.muted }}
                thumbColor={value ? (isDark ? colors.foreground : colors.card) : (isDark ? colors.card : colors.foreground)}
                onValueChange={onValueChange}
                value={value}
            />
        </View>
    );

    const SettingAction = ({ label, description, actionLabel, onPress, destructive }: any) => (
        <TouchableOpacity
            onPress={onPress}
            className="flex-row items-center justify-between py-4 px-2 active:opacity-50 rounded-xl"
        >
            <View className="flex-1 mr-4">
                <Text className="text-lg font-medium" style={{ color: colors.foreground }}>{label}</Text>
                {description && <Text className="text-sm mt-0.5" style={{ color: colors.muted }}>{description}</Text>}
            </View>
            <Text 
                className={`${destructive ? 'text-red-500' : ''} font-bold px-3 py-1.5 rounded-lg border`}
                style={!destructive ? { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border + '33' } : { backgroundColor: colors.background, borderColor: '#ef444433' }}
            >
                {actionLabel}
            </Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
            {/* Header */}
            <View className="flex-row items-center justify-between px-6 py-4">
                <Pressable
                    onPress={() => router.back()}
                    className="w-10 h-10 rounded-full items-center justify-center border"
                    style={{ backgroundColor: colors.card, borderColor: colors.border }}
                >
                    <Ionicons name="chevron-back" size={24} color={colors.foreground} />
                </Pressable>
                <Text className="text-xl font-bold" style={{ color: colors.foreground }}>Privacy Settings</Text>
                <View className="w-10" />
            </View>

            <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>

                {/* 1. Security & Session */}
                <SectionHeader title="Security & Session" icon="shield-checkmark" />
                <View 
                    style={{ backgroundColor: colors.card, borderColor: colors.border }}
                    className="rounded-[25px] p-4 border shadow-2xl"
                >
                    <SettingToggle
                        label="Auto-Logout"
                        description="Automatically logs you out after inactivity"
                        value={autoLogout}
                        onValueChange={setAutoLogout}
                    />

                    {autoLogout && (
                        <View className="px-2 pt-2 pb-4">
                            <Text className="text-sm mb-3 font-medium" style={{ color: colors.muted }}>Inactivity Duration:</Text>
                            <View 
                                style={{ backgroundColor: colors.background, borderColor: colors.border + '33' }}
                                className="flex-row justify-between p-1 rounded-2xl border"
                            >
                                {["1m", "5m", "10m", "30m", "1h"].map((d) => (
                                    <TouchableOpacity
                                        key={d}
                                        onPress={() => setLogoutDuration(d)}
                                        className={`flex-1 py-2.5 rounded-xl items-center ${logoutDuration === d ? (isDark ? 'bg-slate-700' : 'bg-slate-200 shadow-sm') : ''}`}
                                    >
                                        <Text 
                                            className={`text-sm font-black ${logoutDuration === d ? '' : ''}`}
                                            style={{ color: logoutDuration === d ? colors.foreground : colors.muted }}
                                        >
                                            {d}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    <View className="h-[1px] mx-2" style={{ backgroundColor: colors.border + '1A' }} />

                    <SettingToggle
                        label="Login Alerts"
                        description="Get notified about logins from new devices"
                        value={loginAlerts}
                        onValueChange={setLoginAlerts}
                    />

                    <View className="h-[1px] mx-2" style={{ backgroundColor: colors.border + '1A' }} />

                    <SettingAction
                        label="Device Management"
                        description="View or remove registered devices"
                        actionLabel="Manage"
                        onPress={() => Alert.alert("Device Management", "Managing 2 active devices...")}
                    />

                    <View className="h-[1px] mx-2" style={{ backgroundColor: colors.border + '1A' }} />

                    <SettingAction
                        label="Account Deletion"
                        description="Permanently delete your account and data"
                        actionLabel="Delete Account"
                        destructive
                        onPress={handleDeleteAccount}
                    />
                </View>

                {/* 2. Profile Privacy */}
                <SectionHeader title="Profile & Visibility" icon="eye-off" />
                <View 
                    style={{ backgroundColor: colors.card, borderColor: colors.border }}
                    className="rounded-[25px] p-4 border shadow-2xl"
                >
                    <View className="flex-row items-center justify-between py-4 px-2">
                        <View className="flex-1 mr-4">
                            <Text className="text-lg font-medium" style={{ color: colors.foreground }}>Financial Profile</Text>
                            <Text className="text-sm mt-0.5" style={{ color: colors.muted }}>{isPrivateProfile ? "Private" : "Shared"}</Text>
                        </View>
                        <View 
                            style={{ backgroundColor: colors.background, borderColor: colors.border + '33' }}
                            className="flex-row p-1 rounded-2xl border"
                        >
                            <TouchableOpacity
                                onPress={() => setIsPrivateProfile(true)}
                                className={`px-4 py-2 rounded-xl items-center ${isPrivateProfile ? (isDark ? 'bg-slate-700' : 'bg-slate-200') : ''}`}
                            >
                                <Text className={`text-xs font-black ${isPrivateProfile ? '' : ''}`} style={{ color: isPrivateProfile ? colors.foreground : colors.muted }}>Private</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setIsPrivateProfile(false)}
                                className={`px-4 py-2 rounded-xl items-center ${!isPrivateProfile ? (isDark ? 'bg-slate-700' : 'bg-slate-200') : ''}`}
                            >
                                <Text className={`text-xs font-black ${!isPrivateProfile ? '' : ''}`} style={{ color: !isPrivateProfile ? colors.foreground : colors.muted }}>Shared</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View className="h-[1px] mx-2" style={{ backgroundColor: colors.border + '1A' }} />

                    <SettingToggle
                        label="Hide Sensitive Categories"
                        description="Conceal gambling or health expenses in summaries"
                        value={hideSensitiveCategories}
                        onValueChange={setHideSensitiveCategories}
                    />
                </View>

                {/* 3. AI & Data Insights */}
                <SectionHeader title="AI & Data Intelligence" icon="bulb" />
                <View 
                    style={{ backgroundColor: colors.card, borderColor: colors.border }}
                    className="rounded-[25px] p-4 border shadow-2xl"
                >
                    <SettingToggle
                        label="AI Financial Analysis"
                        description="Allow AI to generate insights and savings tips"
                        value={aiAnalysis}
                        onValueChange={setAiAnalysis}
                    />

                    <View className="h-[1px] mx-2" style={{ backgroundColor: colors.border + '1A' }} />

                    <View className="py-4 px-2">
                        <Text className="text-lg font-medium" style={{ color: colors.foreground }}>AI Information Access</Text>
                        <Text className="text-sm mt-0.5 mb-4" style={{ color: colors.muted }}>Control which data the AI can utilize</Text>

                        <View className="gap-y-3">
                            {[
                                { id: "expenses", label: "Expenses Only", icon: "receipt-outline" },
                                { id: "budgets", label: "Budgets & Goals", icon: "calendar-outline" },
                                { id: "full", label: "Full Financial History", icon: "analytics-outline" }
                            ].map((s) => (
                                <TouchableOpacity
                                    key={s.id}
                                    onPress={() => setAiDataScope(s.id)}
                                    className={`flex-row items-center justify-between p-4 rounded-2xl border ${aiDataScope === s.id ? (isDark ? 'bg-slate-700' : 'bg-slate-100 shadow-sm') : ''}`}
                                    style={{ borderColor: aiDataScope === s.id ? colors.foreground : colors.border + '33' }}
                                >
                                    <View className="flex-row items-center gap-x-3">
                                        <Ionicons 
                                            name={s.icon as any} 
                                            size={20} 
                                            color={aiDataScope === s.id ? colors.foreground : colors.muted} 
                                        />
                                        <Text 
                                            className="font-black"
                                            style={{ color: aiDataScope === s.id ? colors.foreground : colors.muted }}
                                        >
                                            {s.label}
                                        </Text>
                                    </View>
                                    <View 
                                        style={{ borderColor: aiDataScope === s.id ? colors.foreground : colors.muted + '66' }}
                                        className={`w-5 h-5 rounded-full border-2 items-center justify-center ${aiDataScope === s.id ? '' : ''}`}
                                    >
                                        {aiDataScope === s.id && <Ionicons name="checkmark" size={12} color={colors.foreground} />}
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View className="h-[1px] mx-2" style={{ backgroundColor: colors.border + '1A' }} />

                    <SettingToggle
                        label="AI Risk Recommendations"
                        description="Receive AI-driven alerts on portfolio risks"
                        value={riskRecommendationConsent}
                        onValueChange={setRiskRecommendationConsent}
                    />
                </View>

                {/* 4. Media & Storage */}
                <SectionHeader title="Media & Storage" icon="camera" />
                <View 
                    style={{ backgroundColor: colors.card, borderColor: colors.border }}
                    className="rounded-[25px] p-4 border shadow-2xl"
                >
                    <SettingToggle
                        label="Camera Access (OCR)"
                        description="Use camera to scan receipts and documents"
                        value={cameraAccess}
                        onValueChange={setCameraAccess}
                    />

                    <View className="h-[1px] mx-2" style={{ backgroundColor: colors.border + '1A' }} />

                    <SettingToggle
                        label="Auto-Cleanup"
                        description="Delete receipt images immediately after parsing"
                        value={autoDeleteImages}
                        onValueChange={setAutoDeleteImages}
                    />

                    <View className="h-[1px] mx-2" style={{ backgroundColor: colors.border + '1A' }} />

                    <View className="flex-row gap-x-3 py-4 px-2">
                        <TouchableOpacity
                            onPress={() => Alert.alert("Download", "Receipt archive is being prepared...")}
                            style={{ backgroundColor: colors.background, borderColor: colors.border + '33' }}
                            className="flex-1 h-14 rounded-2xl items-center justify-center border active:opacity-80"
                        >
                            <Text className="font-black" style={{ color: colors.foreground }}>Download Archive</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => Alert.alert("Delete Archive", "Are you sure? This cannot be undone.", [{ text: "Cancel", style: "cancel" }, { text: "Delete", style: "destructive" }])}
                            style={{ backgroundColor: colors.background, borderColor: '#ef444433' }}
                            className="flex-1 h-14 rounded-2xl items-center justify-center border active:opacity-80"
                        >
                            <Text className="text-red-500 font-black">Delete All</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* 5. Connectivity & Third-Party */}
                <SectionHeader title="Connectivity" icon="link" />
                <View 
                    style={{ backgroundColor: colors.card, borderColor: colors.border }}
                    className="rounded-[25px] p-4 border shadow-2xl"
                >
                    <SettingToggle
                        label="Push Notifications"
                        description="Alerts for budgets, risks, and security"
                        value={notifications}
                        onValueChange={setNotifications}
                    />
                </View>

                {/* 6. Legal & Policy */}
                <SectionHeader title="Legal" icon="document-text" />
                <View 
                    style={{ backgroundColor: colors.card, borderColor: colors.border }}
                    className="rounded-[25px] p-4 border shadow-2xl"
                >
                    <TouchableOpacity className="flex-row items-center justify-between py-4 px-2 active:opacity-50 rounded-xl">
                        <Text className="text-lg font-medium" style={{ color: colors.foreground }}>Privacy Policy</Text>
                        <Ionicons name="open-outline" size={20} color={colors.muted} />
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

export default PrivacyPage;
