import { Ionicons } from "@expo/vector-icons";
import { useRouter, usePathname } from "expo-router";
import * as React from "react";
import { Pressable, Text, View } from "react-native";

const BottomNavbar = () => {
    const router = useRouter();
    const pathname = usePathname();

    const tabs = [
        { id: 'home', icon: 'home-outline', activeIcon: 'home', label: 'Home', path: '/home' },
        { id: 'summary', icon: 'wallet-outline', activeIcon: 'wallet', label: 'Summary', path: '/summary' },
        { id: 'analytics', icon: 'trending-up-outline', activeIcon: 'trending-up', label: 'Analytics', path: '/analytics' },
        { id: 'settings', icon: 'settings-outline', activeIcon: 'settings', label: 'Settings', path: '/settings' },
    ];

    const isActive = (path: string) => pathname === path;

    return (
        <View className="bg-[#1E293B] border-t border-[#90A1B9]/20 pb-10 pt-4 flex-row justify-around items-center px-4 relative">
            <TabIcon
                name={isActive('/home') ? 'home' : 'home-outline'}
                label="Home"
                active={isActive('/home')}
                onPress={() => router.push('/home')}
            />
            <TabIcon
                name={isActive('/summary') ? 'wallet' : 'wallet-outline'}
                label="Summary"
                active={isActive('/summary')}
                onPress={() => router.push('/summary')}
            />

            {/* Center "Scanner" / Action Button */}
            <View className="-mt-16 bg-[#1E293B] p-2 rounded-full">
                <Pressable
                    onPress={() => {/* Open Scanner */ }}
                    className="bg-[#334155] w-16 h-16 rounded-full items-center justify-center border-4 border-[#1E293B] shadow-2xl active:opacity-80"
                >
                    <Ionicons name="scan-outline" size={32} color="white" />
                </Pressable>
            </View>

            <TabIcon
                name={isActive('/analytics') ? 'trending-up' : 'trending-up-outline'}
                label="Analytics"
                active={isActive('/analytics')}
                onPress={() => router.push('/analytics')}
            />
            <TabIcon
                name={isActive('/settings') ? 'settings' : 'settings-outline'}
                label="Settings"
                active={isActive('/settings')}
                onPress={() => router.push('/settings')}
            />
        </View>
    );
};

const TabIcon = ({ name, label, active, onPress }: { name: any, label: string, active: boolean, onPress: () => void }) => (
    <Pressable onPress={onPress} className="items-center active:opacity-60 px-2">
        <Ionicons name={name} size={24} color={active ? "white" : "#90A1B9"} />
        <Text className={`${active ? 'text-white' : 'text-[#90A1B9]'} text-[10px] mt-1 font-bold`}>{label}</Text>
    </Pressable>
);

export default BottomNavbar;
