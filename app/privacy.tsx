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

const PrivacyPage = () => {
    const router = useRouter();

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
            <View className="w-8 h-8 bg-[#334155] rounded-lg items-center justify-center border border-[#90A1B9]/30">
                <Ionicons name={icon} size={18} color="#90A1B9" />
            </View>
            <Text className="text-slate-400 text-lg font-bold">{title}</Text>
        </View>
    );

    const SettingToggle = ({ label, description, value, onValueChange }: any) => (
        <View className="flex-row items-center justify-between py-4 px-2">
            <View className="flex-1 mr-4">
                <Text className="text-white text-lg font-medium">{label}</Text>
                {description && <Text className="text-slate-500 text-sm mt-0.5">{description}</Text>}
            </View>
            <Switch
                trackColor={{ false: "#1E293B", true: "#90A1B9" }}
                thumbColor={value ? "#f8fafc" : "#90A1B9"}
                onValueChange={onValueChange}
                value={value}
            />
        </View>
    );

    const SettingAction = ({ label, description, actionLabel, onPress, destructive }: any) => (
        <TouchableOpacity
            onPress={onPress}
            className="flex-row items-center justify-between py-4 px-2 active:bg-slate-800/20 rounded-xl"
        >
            <View className="flex-1 mr-4">
                <Text className="text-white text-lg font-medium">{label}</Text>
                {description && <Text className="text-slate-500 text-sm mt-0.5">{description}</Text>}
            </View>
            <Text className={`${destructive ? 'text-red-500' : 'text-[#90A1B9]'} font-bold bg-[#1E293B] px-3 py-1.5 rounded-lg border border-[#90A1B9]/20`}>
                {actionLabel}
            </Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-[#1E293B]">
            {/* Header */}
            <View className="flex-row items-center justify-between px-6 py-4">
                <Pressable
                    onPress={() => router.back()}
                    className="w-10 h-10 bg-[#334155] rounded-full items-center justify-center border border-[#90A1B9]"
                >
                    <Ionicons name="chevron-back" size={24} color="white" />
                </Pressable>
                <Text className="text-white text-xl font-bold">Privacy Settings</Text>
                <View className="w-10" />
            </View>

            <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>

                {/* 1. Security & Session */}
                <SectionHeader title="Security & Session" icon="shield-checkmark" />
                <View className="bg-[#334155] rounded-[25px] p-4 border border-[#90A1B9] shadow-2xl">
                    <SettingToggle
                        label="Auto-Logout"
                        description="Automatically logs you out after inactivity"
                        value={autoLogout}
                        onValueChange={setAutoLogout}
                    />

                    {autoLogout && (
                        <View className="px-2 pt-2 pb-4">
                            <Text className="text-slate-400 text-sm mb-3 font-medium">Inactivity Duration:</Text>
                            <View className="flex-row justify-between bg-[#1E293B] p-1 rounded-2xl border border-[#90A1B9]/20">
                                {["1m", "5m", "10m", "30m", "1h"].map((d) => (
                                    <TouchableOpacity
                                        key={d}
                                        onPress={() => setLogoutDuration(d)}
                                        className={`flex-1 py-2.5 rounded-xl items-center ${logoutDuration === d ? 'bg-[#90A1B9] shadow-sm' : ''}`}
                                    >
                                        <Text className={`text-sm font-black ${logoutDuration === d ? 'text-[#1E293B]' : 'text-[#90A1B9]'}`}>{d}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    <View className="h-[1px] bg-[#90A1B9]/20 mx-2" />

                    <SettingToggle
                        label="Login Alerts"
                        description="Get notified about logins from new devices"
                        value={loginAlerts}
                        onValueChange={setLoginAlerts}
                    />

                    <View className="h-[1px] bg-[#90A1B9]/20 mx-2" />

                    <SettingAction
                        label="Device Management"
                        description="View or remove registered devices"
                        actionLabel="Manage"
                        onPress={() => Alert.alert("Device Management", "Managing 2 active devices...")}
                    />
                </View>

                {/* 2. Profile Privacy */}
                <SectionHeader title="Profile & Visibility" icon="eye-off" />
                <View className="bg-[#334155] rounded-[25px] p-4 border border-[#90A1B9] shadow-2xl">
                    <View className="flex-row items-center justify-between py-4 px-2">
                        <View className="flex-1 mr-4">
                            <Text className="text-white text-lg font-medium">Financial Profile</Text>
                            <Text className="text-slate-500 text-sm mt-0.5">{isPrivateProfile ? "Private" : "Shared"}</Text>
                        </View>
                        <View className="flex-row bg-[#1E293B] p-1 rounded-2xl border border-[#90A1B9]/20">
                            <TouchableOpacity
                                onPress={() => setIsPrivateProfile(true)}
                                className={`px-4 py-2 rounded-xl items-center ${isPrivateProfile ? 'bg-[#90A1B9]' : ''}`}
                            >
                                <Text className={`text-xs font-black ${isPrivateProfile ? 'text-[#1E293B]' : 'text-[#90A1B9]'}`}>Private</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setIsPrivateProfile(false)}
                                className={`px-4 py-2 rounded-xl items-center ${!isPrivateProfile ? 'bg-[#90A1B9]' : ''}`}
                            >
                                <Text className={`text-xs font-black ${!isPrivateProfile ? 'text-[#1E293B]' : 'text-[#90A1B9]'}`}>Shared</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View className="h-[1px] bg-[#90A1B9]/20 mx-2" />

                    <SettingToggle
                        label="Hide Sensitive Categories"
                        description="Conceal gambling or health expenses in summaries"
                        value={hideSensitiveCategories}
                        onValueChange={setHideSensitiveCategories}
                    />
                </View>

                {/* 3. AI & Data Insights */}
                <SectionHeader title="AI & Data Intelligence" icon="bulb" />
                <View className="bg-[#334155] rounded-[25px] p-4 border border-[#90A1B9] shadow-2xl">
                    <SettingToggle
                        label="AI Financial Analysis"
                        description="Allow AI to generate insights and savings tips"
                        value={aiAnalysis}
                        onValueChange={setAiAnalysis}
                    />

                    <View className="h-[1px] bg-[#90A1B9]/20 mx-2" />

                    <View className="py-4 px-2">
                        <Text className="text-white text-lg font-medium">AI Information Access</Text>
                        <Text className="text-slate-500 text-sm mt-0.5 mb-4">Control which data the AI can utilize</Text>

                        <View className="gap-y-3">
                            {[
                                { id: "expenses", label: "Expenses Only", icon: "receipt-outline" },
                                { id: "budgets", label: "Budgets & Goals", icon: "calendar-outline" },
                                { id: "full", label: "Full Financial History", icon: "analytics-outline" }
                            ].map((s) => (
                                <TouchableOpacity
                                    key={s.id}
                                    onPress={() => setAiDataScope(s.id)}
                                    className={`flex-row items-center justify-between p-4 rounded-2xl border ${aiDataScope === s.id ? 'bg-[#90A1B9] border-[#90A1B9] shadow-sm' : 'bg-[#1E293B]/30 border-[#90A1B9]/20'}`}
                                >
                                    <View className="flex-row items-center gap-x-3">
                                        <Ionicons name={s.icon as any} size={20} color={aiDataScope === s.id ? "#1E293B" : "#90A1B9"} />
                                        <Text className={`font-black ${aiDataScope === s.id ? 'text-[#1E293B]' : 'text-[#90A1B9]'}`}>{s.label}</Text>
                                    </View>
                                    <View className={`w-5 h-5 rounded-full border-2 items-center justify-center ${aiDataScope === s.id ? 'border-[#1E293B] bg-[#1E293B]' : 'border-[#90A1B9]/40'}`}>
                                        {aiDataScope === s.id && <Ionicons name="checkmark" size={12} color="#90A1B9" />}
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View className="h-[1px] bg-[#90A1B9]/20 mx-2" />

                    <SettingToggle
                        label="AI Risk Recommendations"
                        description="Receive AI-driven alerts on portfolio risks"
                        value={riskRecommendationConsent}
                        onValueChange={setRiskRecommendationConsent}
                    />
                </View>

                {/* 4. Media & Storage */}
                <SectionHeader title="Media & Storage" icon="camera" />
                <View className="bg-[#334155] rounded-[25px] p-4 border border-[#90A1B9] shadow-2xl">
                    <SettingToggle
                        label="Camera Access (OCR)"
                        description="Use camera to scan receipts and documents"
                        value={cameraAccess}
                        onValueChange={setCameraAccess}
                    />

                    <View className="h-[1px] bg-[#90A1B9]/20 mx-2" />

                    <SettingToggle
                        label="Auto-Cleanup"
                        description="Delete receipt images immediately after parsing"
                        value={autoDeleteImages}
                        onValueChange={setAutoDeleteImages}
                    />

                    <View className="h-[1px] bg-[#90A1B9]/20 mx-2" />

                    <View className="flex-row gap-x-3 py-4 px-2">
                        <TouchableOpacity
                            onPress={() => Alert.alert("Download", "Receipt archive is being prepared...")}
                            className="flex-1 bg-[#1E293B] h-14 rounded-2xl items-center justify-center border border-[#90A1B9]/20 active:opacity-80"
                        >
                            <Text className="text-[#90A1B9] font-black">Download Archive</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => Alert.alert("Delete Archive", "Are you sure? This cannot be undone.", [{ text: "Cancel", style: "cancel" }, { text: "Delete", style: "destructive" }])}
                            className="flex-1 bg-[#1E293B] h-14 rounded-2xl items-center justify-center border border-red-500/20 active:opacity-80"
                        >
                            <Text className="text-red-500 font-black">Delete All</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* 5. Connectivity & Third-Party */}
                <SectionHeader title="Connectivity" icon="link" />
                <View className="bg-[#334155] rounded-[25px] p-4 border border-[#90A1B9] shadow-2xl">
                    <SettingToggle
                        label="Push Notifications"
                        description="Alerts for budgets, risks, and security"
                        value={notifications}
                        onValueChange={setNotifications}
                    />

                    <View className="h-[1px] bg-[#90A1B9]/20 mx-2" />

                    <SettingAction
                        label="Third-Party Integrations"
                        description="Manage connected bank accounts and apps"
                        actionLabel="Manage"
                        onPress={() => Alert.alert("Integrations", "Viewing 3 active connections")}
                    />

                    <View className="h-[1px] bg-[#90A1B9]/20 mx-2" />

                    <SettingAction
                        label="API Access"
                        description="Control developer and external API tokens"
                        actionLabel="Tokens"
                        onPress={() => Alert.alert("API Management", "Generating token access...")}
                    />
                </View>

                {/* 6. Legal & Policy */}
                <SectionHeader title="Legal" icon="document-text" />
                <View className="bg-[#334155] rounded-[25px] p-4 border border-[#90A1B9] shadow-2xl">
                    <TouchableOpacity className="flex-row items-center justify-between py-4 px-2 active:bg-slate-800/20 rounded-xl">
                        <Text className="text-white text-lg font-medium">Privacy Policy</Text>
                        <Ionicons name="open-outline" size={20} color="#94a3b8" />
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

export default PrivacyPage;
