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
    return (
        <View style={{ position: 'absolute', bottom: 0, width: width, height: 90 }}>
            {/* The hump */}
            <View
                style={{
                    position: 'absolute',
                    top: -20,
                    left: width / 2 - 45,
                    width: 90,
                    height: 90,
                    borderRadius: 45,
                    backgroundColor: '#0F172B',
                    borderWidth: 1,
                    borderColor: 'rgba(148, 163, 184, 0.1)'
                }}
            />
            {/* The main bar */}
            <View style={{ flex: 1, backgroundColor: '#0F172B' }} />
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
                        tabBarLabelStyle: {
                            fontWeight: '700',
                            fontSize: 10,
                        }
                    }}>
                    <Tabs.Screen
                        name="index"
                        options={{
                            title: 'Home',
                            tabBarIcon: ({ color, size }) => (
                                <Ionicons name="home-outline" size={size + 2} color={color} />
                            ),
                        }}
                    />
                    <Tabs.Screen
                        name="aichatbot"
                        options={{
                            title: 'Summary',
                            tabBarIcon: ({ color, size }) => (
                                <MaterialCommunityIcons name="clipboard-text-outline" size={size + 2} color={color} />
                            ),
                        }}
                    />
                    <Tabs.Screen
                        name="scanner"
                        options={{
                            title: '',
                            tabBarIcon: ({ color, size }) => (
                                <View style={{
                                    backgroundColor: '#1E293B',
                                    width: 60,
                                    height: 60,
                                    borderRadius: 30,
                                    marginTop: -35,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderWidth: 1,
                                    borderColor: 'rgba(148, 163, 184, 0.2)',
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.3,
                                    shadowRadius: 5,
                                    elevation: 8
                                }}>
                                    <MaterialCommunityIcons name="crop-free" size={size + 8} color="white" />
                                </View>
                            ),
                        }}
                    />
                    <Tabs.Screen
                        name="analytics"
                        options={{
                            title: 'Analytics',
                            tabBarIcon: ({ color, size }) => (
                                <MaterialCommunityIcons name="trending-up" size={size + 4} color={color} />
                            ),
                        }}
                    />
                    <Tabs.Screen
                        name="settings"
                        options={{
                            title: 'Settings',
                            tabBarIcon: ({ color, size }) => (
                                <Ionicons name="settings-outline" size={size + 2} color={color} />
                            ),
                        }}
                    />

                    {/* Hidden Screens */}
                    <Tabs.Screen name="(tabs)/index" options={{ href: null }} />
                    <Tabs.Screen name="(tabs)/intro" options={{ href: null }} />
                    <Tabs.Screen name="components/CircularProgress" options={{ href: null }} />
                    <Tabs.Screen name="components/CustomDesign" options={{ href: null }} />
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