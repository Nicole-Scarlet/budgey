import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { View } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#94A3B8",
        tabBarInactiveTintColor: "#64748B",
        tabBarStyle: {
          backgroundColor: "#1E293B",
          borderTopColor: "#334155",
          borderTopWidth: 1,
          // Remove tab bar shadow bleed
          elevation: 0,
          shadowOpacity: 0,
        },
        headerStyle: {
          backgroundColor: "#1E293B",
          // Standard shadow removal for Android/iOS
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1, // Keep your border
          borderBottomColor: "#334155",
        } as any,
        headerShadowVisible: false, // THIS is the key to stopping the "early" clipping
        headerTransparent: false,
        headerBackground: () => (
          <View style={{ flex: 1, backgroundColor: "#1E293B" }} />
        ),
        headerTintColor: "#FFFFFF",
        headerTitleStyle: {
          fontWeight: "bold",
          fontSize: 18,
          letterSpacing: 0.3,
          color: "#F1F5F9",
        },
        headerTitleAlign: "center",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="summary"
        options={{
          title: "Summary",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="receipt-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="scanner"
        options={{
          title: "Scanner",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="scan-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: "Analytics",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="pie-chart-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="debt"
        options={{
          href: null,
          title: "Debt",
        }}
      />
      <Tabs.Screen
        name="expenses"
        options={{
          href: null,
          title: "Expenses",
        }}
      />
      <Tabs.Screen
        name="investment"
        options={{
          href: null,
          title: "Investment",
        }}
      />
      <Tabs.Screen
        name="savings"
        options={{
          href: null,
          title: "Savings",
        }}
      />
      <Tabs.Screen
        name="income"
        options={{
          href: null,
          title: "Income",
        }}
      />
    </Tabs>
  );
}
