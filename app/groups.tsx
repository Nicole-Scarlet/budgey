import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useState, useMemo } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../contexts/ThemeContext";
import { useTransactions } from "../contexts/TransactionContext";

export default function GroupsScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { 
    groups, 
    activeGroupId, 
    setActiveGroupId, 
    createGroup, 
    joinGroup,
    leaveGroup,
    groupMembers,
    updateGroupMemberSharing
  } = useTransactions();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isJoinModalVisible, setIsJoinModalVisible] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);
  
  const [selectedGroupForSettings, setSelectedGroupForSettings] = useState<string | null>(null);

  const [inviteCode, setInviteCode] = useState("");
  const [groupName, setGroupName] = useState("");
  const [groupDesc, setGroupDesc] = useState("");

  const handleJoin = async () => {
    if (!inviteCode) return;
    try {
      await joinGroup(inviteCode.toUpperCase());
      setIsJoinModalVisible(false);
      setInviteCode("");
      Alert.alert("Success", "You have joined the group!");
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to join group");
    }
  };

  const handleCreate = async () => {
    if (!groupName) return;
    try {
      await createGroup(groupName, groupDesc);
      setIsCreateModalVisible(false);
      setGroupName("");
      setGroupDesc("");
      Alert.alert("Success", "Group created successfully!");
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to create group");
    }
  };

  const currentMemberSettings = useMemo(() => {
    if (!selectedGroupForSettings) return null;
    return groupMembers.find(m => m.groupId === selectedGroupForSettings);
  }, [selectedGroupForSettings, groupMembers]);

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
              placeholder="Search your groups"
              placeholderTextColor={colors.muted}
              className="flex-1 ml-3 text-base"
              style={{ color: colors.foreground }}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Action List */}
          <View className="gap-y-6">
            <ActionItem 
                icon={<Ionicons name="enter-outline" size={24} color={colors.foreground} />}
                label="Join Group"
                onPress={() => setIsJoinModalVisible(true)}
            />
            <ActionItem 
                icon={<MaterialCommunityIcons name="account-group-outline" size={24} color={colors.foreground} />}
                label="Create Group"
                onPress={() => setIsCreateModalVisible(true)}
            />
          </View>

          {/* Account Switching */}
          <View className="mt-12">
            <Text className="text-lg font-bold mb-6" style={{ color: colors.muted }}>
                Account Mode
            </Text>
            <JoinedGroupItem 
                name="Personal Mode"
                handle="Only see your individual budget"
                isActive={activeGroupId === null}
                onPress={() => setActiveGroupId(null)}
                isPersonal
            />
          </View>

          {/* Joined Groups List */}
          {groups.length > 0 && (
            <View className="mt-12">
                <View className="flex-row items-center justify-between mb-6">
                    <Text className="text-lg font-bold" style={{ color: colors.muted }}>
                        Shared Groups
                    </Text>
                    <Text className="text-xs" style={{ color: colors.muted }}>
                        Manage individual sharing in settings
                    </Text>
                </View>
                <View className="gap-y-4">
                    {groups.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase())).map(group => (
                        <JoinedGroupItem 
                            key={group.id}
                            name={group.name}
                            handle={`Group Code: ${group.inviteCode}`}
                            isActive={activeGroupId === group.id}
                            onPress={() => setActiveGroupId(group.id)}
                            onSettingsPress={() => {
                                setSelectedGroupForSettings(group.id);
                                setIsSettingsModalVisible(true);
                            }}
                            onLongPress={() => {
                                Alert.alert(
                                    "Group Actions",
                                    `Select an action for ${group.name}`,
                                    [
                                        { text: "Share Settings", onPress: () => {
                                            setSelectedGroupForSettings(group.id);
                                            setIsSettingsModalVisible(true);
                                        }},
                                        { text: "Leave Group", style: "destructive", onPress: () => leaveGroup(group.id) },
                                        { text: "Cancel", style: "cancel" }
                                    ]
                                );
                            }}
                        />
                    ))}
                </View>
            </View>
          )}
        </ScrollView>
      </View>

      {/* Join Modal */}
      <Modal visible={isJoinModalVisible} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/50">
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <View className="p-8 rounded-t-[40px]" style={{ backgroundColor: colors.card }}>
                    <Text className="text-2xl font-bold mb-2" style={{ color: colors.foreground }}>Join Group</Text>
                    <Text className="mb-6" style={{ color: colors.muted }}>Enter the 6-character invite code.</Text>
                    
                    <TextInput 
                        placeholder="ENTER CODE"
                        placeholderTextColor={colors.muted}
                        className="h-14 rounded-2xl px-4 text-center text-xl font-bold mb-6 border"
                        style={{ backgroundColor: colors.background, color: colors.foreground, borderColor: colors.border }}
                        autoCapitalize="characters"
                        value={inviteCode}
                        onChangeText={setInviteCode}
                        maxLength={6}
                    />

                    <View className="flex-row gap-x-4">
                        <TouchableOpacity 
                            onPress={() => setIsJoinModalVisible(false)}
                            className="flex-1 h-14 rounded-2xl items-center justify-center border"
                            style={{ borderColor: colors.border }}
                        >
                            <Text className="font-bold" style={{ color: colors.foreground }}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            onPress={handleJoin}
                            className="flex-1 h-14 rounded-2xl items-center justify-center"
                            style={{ backgroundColor: colors.foreground }}
                        >
                            <Text className="font-bold" style={{ color: colors.background }}>Join</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Sharing Settings Modal */}
      <Modal visible={isSettingsModalVisible} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/50">
            <View className="p-8 rounded-t-[40px]" style={{ backgroundColor: colors.card }}>
                <View className="flex-row items-center justify-between mb-6">
                    <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>Sharing Privacy</Text>
                    <TouchableOpacity onPress={() => setIsSettingsModalVisible(false)}>
                        <Ionicons name="close" size={28} color={colors.foreground} />
                    </TouchableOpacity>
                </View>
                
                <Text className="mb-4 text-sm font-medium uppercase tracking-widest" style={{ color: colors.muted }}>
                    Your sharing preferences for this group
                </Text>

                <View className="gap-y-6 mb-8">
                    <PrivacyToggle 
                        label="Share Income" 
                        description="Allow group members to see your earning records."
                        value={currentMemberSettings?.shareIncome || false}
                        onToggle={(val: boolean) => updateGroupMemberSharing(selectedGroupForSettings!, { shareIncome: val })}
                    />
                    <PrivacyToggle 
                        label="Share Savings" 
                        description="Share your savings goals and progress."
                        value={currentMemberSettings?.shareSavings || false}
                        onToggle={(val: boolean) => updateGroupMemberSharing(selectedGroupForSettings!, { shareSavings: val })}
                    />
                    <PrivacyToggle 
                        label="Share Investments" 
                        description="Show your group how much you are investing."
                        value={currentMemberSettings?.shareInvestments || false}
                        onToggle={(val: boolean) => updateGroupMemberSharing(selectedGroupForSettings!, { shareInvestments: val })}
                    />
                    <PrivacyToggle 
                        label="Share Debts" 
                        description="Share your debt and repayment status."
                        value={currentMemberSettings?.shareDebts || false}
                        onToggle={(val: boolean) => updateGroupMemberSharing(selectedGroupForSettings!, { shareDebts: val })}
                    />
                    <View className="flex-row items-center justify-between p-4 rounded-xl" style={{ backgroundColor: colors.background + '80' }}>
                        <View className="flex-1 mr-4">
                            <Text className="text-base font-bold" style={{ color: colors.foreground }}>Expenses (Always Shared)</Text>
                            <Text className="text-xs" style={{ color: colors.muted }}>Expenses are core to the group budget and cannot be hidden.</Text>
                        </View>
                        <Ionicons name="lock-closed" size={20} color={colors.muted} />
                    </View>
                </View>

                <TouchableOpacity 
                    onPress={() => setIsSettingsModalVisible(false)}
                    className="w-full h-14 rounded-2xl items-center justify-center"
                    style={{ backgroundColor: colors.foreground }}
                >
                    <Text className="font-bold" style={{ color: colors.background }}>Done</Text>
                </TouchableOpacity>
            </View>
        </View>
      </Modal>

      {/* Create Modal */}
      <Modal visible={isCreateModalVisible} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/50">
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <View className="p-8 rounded-t-[40px]" style={{ backgroundColor: colors.card }}>
                    <Text className="text-2xl font-bold mb-2" style={{ color: colors.foreground }}>Create Group</Text>
                    <Text className="mb-6" style={{ color: colors.muted }}>Start a shared budget with friends.</Text>
                    
                    <TextInput 
                        placeholder="Group Name"
                        placeholderTextColor={colors.muted}
                        className="h-14 rounded-2xl px-4 mb-4 border"
                        style={{ backgroundColor: colors.background, color: colors.foreground, borderColor: colors.border }}
                        value={groupName}
                        onChangeText={setGroupName}
                    />

                    <TextInput 
                        placeholder="Description (Optional)"
                        placeholderTextColor={colors.muted}
                        className="h-24 rounded-2xl px-4 mb-6 border pt-4"
                        style={{ backgroundColor: colors.background, color: colors.foreground, borderColor: colors.border }}
                        multiline
                        textAlignVertical="top"
                        value={groupDesc}
                        onChangeText={setGroupDesc}
                    />

                    <View className="flex-row gap-x-4">
                        <TouchableOpacity 
                            onPress={() => setIsCreateModalVisible(false)}
                            className="flex-1 h-14 rounded-2xl items-center justify-center border"
                            style={{ borderColor: colors.border }}
                        >
                            <Text className="font-bold" style={{ color: colors.foreground }}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            onPress={handleCreate}
                            className="flex-1 h-14 rounded-2xl items-center justify-center"
                            style={{ backgroundColor: colors.foreground }}
                        >
                            <Text className="font-bold" style={{ color: colors.background }}>Create</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function PrivacyToggle({ label, description, value, onToggle }: any) {
    const { colors } = useTheme();
    return (
        <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-4">
                <Text className="text-base font-bold" style={{ color: colors.foreground }}>{label}</Text>
                <Text className="text-xs" style={{ color: colors.muted }}>{description}</Text>
            </View>
            <Switch 
                value={value} 
                onValueChange={onToggle}
                trackColor={{ false: colors.border, true: colors.foreground }}
                thumbColor={colors.background}
            />
        </View>
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

function JoinedGroupItem({ name, handle, isActive, onPress, onLongPress, onSettingsPress, isPersonal }: any) {
    const { colors } = useTheme();
    return (
        <TouchableOpacity 
            className="flex-row items-center justify-between py-2 mb-2"
            activeOpacity={0.7}
            onPress={onPress}
            onLongPress={onLongPress}
        >
            <View className="flex-row items-center flex-1">
                <View 
                    className="w-14 h-14 rounded-full mr-4 items-center justify-center"
                    style={{ backgroundColor: colors.card }}
                >
                    <Ionicons 
                        name={isPersonal ? "person" : "people"} 
                        size={24} 
                        color={isActive ? colors.foreground : colors.muted} 
                    />
                </View>
                <View className="flex-1">
                    <Text className="text-lg font-bold" style={{ color: colors.foreground }}>{name}</Text>
                    <Text className="text-sm" style={{ color: colors.muted }} numberOfLines={1}>{handle}</Text>
                </View>
            </View>
            <View className="flex-row items-center gap-x-4">
                {!isPersonal && (
                    <TouchableOpacity 
                        onPress={onSettingsPress}
                        className="p-2 mr-2"
                    >
                        <Ionicons name="settings-outline" size={22} color={colors.muted} />
                    </TouchableOpacity>
                )}
                <View 
                    style={{ backgroundColor: colors.card, borderColor: isActive ? colors.foreground : colors.border }}
                    className="w-8 h-8 rounded-full items-center justify-center border"
                >
                    {isActive && (
                        <View 
                            style={{ backgroundColor: colors.foreground }}
                            className="w-2 h-2 rounded-full" 
                        />
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
}
