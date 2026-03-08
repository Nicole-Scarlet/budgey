import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs, usePathname } from 'expo-router';
import React from 'react';
import { Dimensions, View } from 'react-native';

const { width } = Dimensions.get('window');

const CustomTabBarBackground = () => {
  const notchSize = 72; // Snug against the scanner orb width
  const circleSize = 1000; // Fake border size
  const borderWidth = (circleSize - notchSize) / 2;

  return (
    <View style={{ position: 'absolute', bottom: 0, width: width, height: 107, flexDirection: 'row' }}>
      {/* Left solid part */}
      <View style={{ flex: 1, backgroundColor: '#0F172B' }} />

      {/* Center notch part */}
      <View style={{ width: notchSize, height: 107, overflow: 'hidden' }}>
        <View style={{
          position: 'absolute',
          top: -(circleSize / 2) + 20, // Push the cutout circle down so the top half clears properly
          left: -(circleSize / 2) + (notchSize / 2),
          width: circleSize,
          height: circleSize,
          borderRadius: circleSize / 2,
          backgroundColor: 'transparent',
          borderColor: '#0F172B', // Solid color to fill the rest of the bar below the floating notch
          borderWidth: borderWidth,
        }} />
      </View>

      {/* Right solid part */}
      <View style={{ flex: 1, backgroundColor: '#0F172B' }} />
    </View>
  );
};

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          height: 107,
          paddingBottom: 20,
          paddingTop: 20,
          position: 'absolute',
          elevation: 0,
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
        name="summary"
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
          tabBarStyle: { display: 'none' },
          tabBarIcon: ({ focused }) => {
            const pathname = usePathname();
            const isScannerScreen = pathname === '/scanner';

            if (isScannerScreen) {
              return (
                <View
                  style={{
                    top: -30, // Pushed up exactly 10px to cancel the paddingTop shift and restore notch position
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
                  top: -20, // Pushed up exactly 10px to cancel the paddingTop shift and restore notch position
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
      <Tabs.Screen
        name="intro"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="income"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="expenses"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="debt"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="investment"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="savings"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
