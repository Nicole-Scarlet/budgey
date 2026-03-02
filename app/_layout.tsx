import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs, usePathname, SplashScreen } from 'expo-router';
import React, { useEffect } from 'react';
import { Dimensions, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { ProfileProvider } from '../context/ProfileContext';
import { WishlistProvider } from '../context/WishlistContext';
import '../global.css';

const { width } = Dimensions.get('window');

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const CustomTabBarBackground = () => {
    const notchRadius = 45;
    const centerX = width / 2;
    const height = 90;

    // Path for a rectangle with a semicircular cutout in the center
    const d = `
    M 0 0
    L ${centerX - notchRadius} 0
    C ${centerX - notchRadius + 10} 0, ${centerX - 35} 35, ${centerX} 35
    C ${centerX + 35} 35, ${centerX + notchRadius - 10} 0, ${centerX + notchRadius} 0
    L ${width} 0
    L ${width} ${height}
    L 0 ${height}
    Z
  `;

    return (
        <View style={{ position: 'absolute', bottom: 0 }}>
            <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
                <Path d={d} fill="#0F172B" />
            </Svg>
        </View>
    );
};

export default function RootLayout() {
    const colorScheme = useColorScheme();

    useEffect(() => {
        SplashScreen.hideAsync();
    }, []);

    const pathname = usePathname();
    const hideTabs = ['/intro', '/login', '/register', '/question', '/profile', '/security', '/privacy', '/support', '/terms'].includes(pathname);

    return (
        <ProfileProvider>
            <WishlistProvider>
                <Tabs
                    screenOptions={{
                        tabBarActiveTintColor: '#FFFFFF',
                        tabBarInactiveTintColor: '#94A3B8',
                        tabBarStyle: {
                            backgroundColor: 'transparent',
                            borderTopWidth: 0,
                            height: 90,
                            paddingBottom: 25,
                            paddingTop: 10,
                            position: 'absolute',
                            elevation: 0,
                            display: hideTabs ? 'none' : 'flex'
                        },
                        tabBarBackground: () => <CustomTabBarBackground />,
                        headerShown: false,
                    }}>
                    <Tabs.Screen
                        name="index"
                        options={{
                            title: 'Home',
                            tabBarIcon: ({ color, size }) => (
                                <Ionicons name="home-outline" size={size} color={color} />
                            ),
                        }}
                    />
                    <Tabs.Screen
                        name="aichatbot"
                        options={{
                            title: 'Summary',
                            tabBarIcon: ({ color, size }) => (
                                <MaterialCommunityIcons name="wallet-outline" size={size} color={color} />
                            ),
                        }}
                    />
                    <Tabs.Screen
                        name="scanner"
                        options={{
                            title: '',
                            tabBarIcon: ({ focused }) => {
                                const isScannerScreen = pathname === '/scanner';

                                if (isScannerScreen) {
                                    return (
                                        <View
                                            style={{
                                                top: -35,
                                                shadowColor: '#000',
                                                shadowOffset: { width: 0, height: 10 },
                                                shadowOpacity: 0.3,
                                                shadowRadius: 10,
                                                elevation: 10,
                                            }}
                                            className="w-[75px] h-[75px] rounded-full items-center justify-center border-2 border-white bg-transparent"
                                        >
                                            <View className="w-[62px] h-[62px] bg-white/10 rounded-full items-center justify-center">
                                                <View className="w-[54px] h-[54px] bg-[#0F172B] rounded-full" />
                                            </View>
                                        </View>
                                    );
                                }

                                return (
                                    <View
                                        style={{
                                            top: -25,
                                            shadowColor: '#000',
                                            shadowOffset: { width: 0, height: 5 },
                                            shadowOpacity: 0.2,
                                            shadowRadius: 5,
                                            elevation: 5,
                                        }}
                                        className="bg-[#0F172B] w-[60px] h-[60px] rounded-full items-center justify-center"
                                    >
                                        <MaterialCommunityIcons name="crop-free" size={30} color="#CBD5E1" />
                                    </View>
                                );
                            },
                        }}
                    />
                    <Tabs.Screen
                        name="analytics"
                        options={{
                            title: 'Analytics',
                            tabBarIcon: ({ color, size }) => (
                                <Ionicons name="bar-chart-outline" size={size} color={color} />
                            ),
                        }}
                    />
                    <Tabs.Screen
                        name="settings"
                        options={{
                            title: 'Settings',
                            tabBarIcon: ({ color, size }) => (
                                <Ionicons name="settings-outline" size={size} color={color} />
                            ),
                        }}
                    />

                    {/* Hidden Screens */}
                    <Tabs.Screen name="wishlist/[id]" options={{ href: null }} />
                    <Tabs.Screen name="wishlist/add" options={{ href: null }} />
                    <Tabs.Screen name="home" options={{ href: null }} />
                    <Tabs.Screen name="wishlist" options={{ href: null }} />
                    <Tabs.Screen name="intro" options={{ href: null }} />
                    <Tabs.Screen name="login" options={{ href: null }} />
                    <Tabs.Screen name="register" options={{ href: null }} />
                    <Tabs.Screen name="question" options={{ href: null }} />
                    <Tabs.Screen name="profile" options={{ href: null }} />
                    <Tabs.Screen name="security" options={{ href: null }} />
                    <Tabs.Screen name="privacy" options={{ href: null }} />
                    <Tabs.Screen name="support" options={{ href: null }} />
                    <Tabs.Screen name="terms" options={{ href: null }} />
                </Tabs>
            </WishlistProvider>
        </ProfileProvider>
    );
}