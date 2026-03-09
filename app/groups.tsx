import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../contexts/ThemeContext";

export default function GroupsScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");



  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-1 px-6">
        {/* Header */}
        <View className="flex-row items-center justify-between py-6">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <Ionicons name="arrow-back" size={28} color={colors.foreground} />
          </TouchableOpacity>
          <Text className="text-xl font-bold" style={{ color: colors.foreground }}>
            Groups
          </Text>
          <View className="w-10" />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Search Bar */}
          <View 
            className="flex-row items-center px-4 h-14 rounded-2xl mb-6"
            style={{ backgroundColor: colors.card }}
          >
            <Ionicons name="search" size={20} color={colors.muted} />
            <TextInput
              placeholder="Add or search groups"
              placeholderTextColor={colors.muted}
              className="flex-1 ml-3 text-base"
              style={{ color: colors.foreground }}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Banner */}
          <View 
            className="flex-row items-center p-4 rounded-2xl mb-8 border"
            style={{ backgroundColor: colors.card, borderColor: colors.border }}
          >
            <View 
                style={{ backgroundColor: colors.background }}
                className="w-8 h-8 rounded-full items-center justify-center mr-3 border"
            >
                <Ionicons name="compass" size={18} color={colors.foreground} />
            </View>
            <Text className="flex-1 text-[13px] font-medium" style={{ color: colors.foreground }}>
              Search group ID, name, or invite link to find your groups on budgey
            </Text>
            <TouchableOpacity className="ml-2">
                <Ionicons name="close" size={20} color={colors.muted} />
            </TouchableOpacity>
          </View>

          {/* Action List */}
          <View className="gap-y-6">
            <ActionItem 
                icon={<Ionicons name="enter-outline" size={24} color={colors.foreground} />}
                label="Join Group"
                onPress={() => {}}
            />
            <ActionItem 
                icon={<MaterialCommunityIcons name="account-group-outline" size={24} color={colors.foreground} />}
                label="Create Group"
                onPress={() => {}}
            />
            <ActionItem 
                icon={<Ionicons name="notifications-outline" size={24} color={colors.foreground} />}
                label="Requests"
                onPress={() => {}}
            />
          </View>

          {/* Subcategory: Groups */}
          <View className="mt-12">
            <Text className="text-lg font-bold mb-6" style={{ color: colors.muted }}>
              Groups
            </Text>
            
            <View className="flex-row gap-x-4">
                {/* Simulated Group Card 1 */}
                <GroupCard 
                    name="The Weekend"
                    handle="@weekend_vibe"
                    image="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1000&auto=format&fit=crop"
                />

                {/* Simulated View All Card */}
                <TouchableOpacity 
                    activeOpacity={0.8}
                    className="w-[160px] h-[220px] rounded-[30px] items-center justify-center border-2 border-dashed"
                    style={{ backgroundColor: colors.card + "80", borderColor: colors.border }}
                >
                    <View className="w-12 h-12 rounded-full items-center justify-center mb-3" style={{ backgroundColor: colors.background }}>
                        <Ionicons name="eye-outline" size={24} color={colors.muted} />
                    </View>
                    <Text className="text-sm font-bold" style={{ color: colors.muted }}>View All</Text>
                </TouchableOpacity>
            </View>
          </View>

          {/* My Active Groups (Bonus Section for polish) */}
          <View className="mt-12">
            <Text className="text-lg font-bold mb-6" style={{ color: colors.muted }}>
                Joined
            </Text>
            <View className="gap-y-4">
                <JoinedGroupItem 
                    name="Family Budget"
                    handle="@family_main"
                    members={4}
                    image="https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=1000&auto=format&fit=crop"
                />
                <JoinedGroupItem 
                    name="Trip to Japan"
                    handle="@japan_trip_2024"
                    members={3}
                    image="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1000&auto=format&fit=crop"
                />
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function ActionItem({ icon, label, onPress }: any) {
    const { colors } = useTheme();
    return (
        <TouchableOpacity 
            onPress={onPress}
            activeOpacity={0.7}
            className="flex-row items-center justify-between"
        >
            <View className="flex-row items-center">
                <View 
                    style={{ backgroundColor: colors.card }}
                    className="w-12 h-12 rounded-xl items-center justify-center mr-4"
                >
                    {icon}
                </View>
                <Text 
                    className="text-lg font-bold" 
                    style={{ color: colors.foreground }}
                >
                    {label}
                </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.muted} />
        </TouchableOpacity>
    );
}

function GroupCard({ name, handle, image }: any) {
    const { colors } = useTheme();
    return (
        <View 
            className="w-[160px] h-[220px] rounded-[30px] p-4 items-center justify-between relative"
            style={{ backgroundColor: colors.card }}
        >
            <TouchableOpacity className="absolute top-3 right-3">
                <Ionicons name="close" size={18} color={colors.muted} />
            </TouchableOpacity>

            <View className="mt-4 items-center">
                <Image 
                    source={{ uri: image }} 
                    className="w-20 h-20 rounded-full mb-3"
                />
                <Text className="text-base font-bold text-center" style={{ color: colors.foreground }} numberOfLines={1}>{name}</Text>
                <Text className="text-xs" style={{ color: colors.muted }}>{handle}</Text>
            </View>

            <TouchableOpacity 
                activeOpacity={0.8}
                className="w-full py-2.5 rounded-2xl items-center flex-row justify-center gap-x-2 border"
                style={{ backgroundColor: colors.background, borderColor: colors.border }}
            >
                <Ionicons name="add" size={18} color={colors.foreground} />
                <Text className="font-bold text-sm" style={{ color: colors.foreground }}>Join</Text>
            </TouchableOpacity>
        </View>
    );
}

function JoinedGroupItem({ name, handle, members, image }: any) {
    const { colors } = useTheme();
    return (
        <TouchableOpacity 
            className="flex-row items-center justify-between py-2"
            activeOpacity={0.7}
        >
            <View className="flex-row items-center">
                <Image 
                    source={{ uri: image }} 
                    className="w-14 h-14 rounded-full mr-4"
                />
                <View>
                    <Text className="text-lg font-bold" style={{ color: colors.foreground }}>{name}</Text>
                    <Text className="text-sm" style={{ color: colors.muted }}>{handle} • {members} members</Text>
                </View>
            </View>
            <View 
                style={{ backgroundColor: colors.card, borderColor: colors.border }}
                className="w-8 h-8 rounded-full items-center justify-center border"
            >
                <View 
                    style={{ backgroundColor: colors.foreground }}
                    className="w-2 h-2 rounded-full" 
                />
            </View>
        </TouchableOpacity>
    );
}
