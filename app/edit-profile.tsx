import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as React from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useProfile } from "../contexts/ProfileContext";
import { useTheme } from "../contexts/ThemeContext";

const ProfileScreen = () => {
    const router = useRouter();
    const { profile, updateProfile, updateAvatar } = useProfile();
    const { colors, isDark } = useTheme();

    const [firstName, setFirstName] = React.useState(profile.firstName);
    const [lastName, setLastName] = React.useState(profile.lastName);
    const [email, setEmail] = React.useState(profile.email);
    const [avatarUri, setAvatarUri] = React.useState<string | undefined>(profile.avatarUrl);
    const [isUploadingAvatar, setIsUploadingAvatar] = React.useState(false);

    const handleChangePhoto = () => {
        Alert.alert(
            "Profile Photo",
            "Choose an option",
            [
                {
                    text: "Take Photo",
                    onPress: async () => {
                        const { status } = await ImagePicker.requestCameraPermissionsAsync();
                        if (status !== "granted") {
                            Alert.alert("Permission Required", "Camera access is needed to take a photo.");
                            return;
                        }
                        const res = await ImagePicker.launchCameraAsync({
                            allowsEditing: true,
                            aspect: [1, 1],
                            quality: 0.6,
                        });
                        if (!res.canceled) {
                            await handleAvatarUpload(res.assets[0].uri);
                        }
                    },
                },
                {
                    text: "Choose from Gallery",
                    onPress: async () => {
                        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                        if (status !== "granted") {
                            Alert.alert("Permission Required", "Gallery access is needed to pick a photo.");
                            return;
                        }
                        const res = await ImagePicker.launchImageLibraryAsync({
                            allowsEditing: true,
                            aspect: [1, 1],
                            quality: 0.6,
                            mediaTypes: ImagePicker.MediaTypeOptions.Images,
                        });
                        if (!res.canceled) {
                            await handleAvatarUpload(res.assets[0].uri);
                        }
                    },
                },
                {
                    text: "Remove Photo",
                    style: "destructive",
                    onPress: async () => {
                        setAvatarUri(undefined);
                        await updateAvatar("");
                    },
                },
                { text: "Cancel", style: "cancel" },
            ]
        );
    };

    const handleAvatarUpload = async (uri: string) => {
        try {
            setIsUploadingAvatar(true);
            // Convert image to base64
            const base64 = await FileSystem.readAsStringAsync(uri, {
                encoding: 'base64',
            });
            // Store as data URI so it can be used directly in <Image source={{ uri }} />
            const dataUri = `data:image/jpeg;base64,${base64}`;
            setAvatarUri(dataUri);
            await updateAvatar(dataUri);
        } catch (error) {
            console.error("Error uploading avatar:", error);
            Alert.alert("Error", "Could not save the photo. Please try again.");
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    const handleSave = async () => {
        await updateProfile({
            firstName,
            lastName,
            email,
        });
        router.back();
    };

    return (
        <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                className="flex-1"
            >
                {/* Header */}
                <View className="flex-row items-center justify-between px-6 py-4">
                    <Pressable
                        onPress={() => router.back()}
                        className="w-10 h-10 rounded-full items-center justify-center border"
                        style={{ backgroundColor: colors.card, borderColor: colors.border }}
                    >
                        <Ionicons name="chevron-back" size={24} color={colors.foreground} />
                    </Pressable>
                    <Text className="text-xl font-bold" style={{ color: colors.foreground }}>Edit Profile</Text>
                    <View className="w-10" />
                </View>

                <ScrollView
                    className="flex-1 px-6"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 40 }}
                >
                    {/* Avatar Section */}
                    <View className="items-center mt-6 mb-10">
                        <Pressable onPress={handleChangePhoto} className="relative">
                            <View
                                style={{ backgroundColor: colors.card, borderColor: colors.border }}
                                className="w-32 h-32 rounded-full border-2 items-center justify-center overflow-hidden"
                            >
                                {isUploadingAvatar ? (
                                    <ActivityIndicator color={colors.muted} />
                                ) : avatarUri ? (
                                    <Image
                                        source={{ uri: avatarUri }}
                                        className="w-full h-full"
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <Ionicons name="person" size={64} color={colors.muted} />
                                )}
                            </View>
                            {/* Camera badge */}
                            <View
                                className="absolute bottom-0 right-0 w-9 h-9 rounded-full items-center justify-center border-2 shadow-lg"
                                style={{ backgroundColor: colors.foreground, borderColor: colors.background }}
                            >
                                <MaterialCommunityIcons name="camera-plus" size={17} color={colors.background} />
                            </View>
                        </Pressable>
                        <Text className="text-sm mt-3 font-medium" style={{ color: colors.muted }}>
                            {isUploadingAvatar ? "Saving photo..." : "Tap to change photo"}
                        </Text>
                    </View>

                    {/* Form Fields */}
                    <View className="gap-y-6">
                        {/* Name Section */}
                        <View className="flex-row gap-x-4">
                            <View className="flex-1 gap-y-2">
                                <Text className="text-lg font-semibold ml-2" style={{ color: colors.foreground }}>First Name</Text>
                                <View
                                    style={{ backgroundColor: colors.card, borderColor: colors.border + '80' }}
                                    className="h-16 rounded-[25px] px-6 justify-center border"
                                >
                                    <TextInput
                                        className="text-lg"
                                        style={{ color: colors.foreground }}
                                        placeholder="First Name"
                                        placeholderTextColor={colors.muted}
                                        value={firstName}
                                        onChangeText={setFirstName}
                                    />
                                </View>
                            </View>
                            <View className="flex-1 gap-y-2">
                                <Text className="text-lg font-semibold ml-2" style={{ color: colors.foreground }}>Last Name</Text>
                                <View
                                    style={{ backgroundColor: colors.card, borderColor: colors.border + '80' }}
                                    className="h-16 rounded-[25px] px-6 justify-center border"
                                >
                                    <TextInput
                                        className="text-lg"
                                        style={{ color: colors.foreground }}
                                        placeholder="Last Name"
                                        placeholderTextColor={colors.muted}
                                        value={lastName}
                                        onChangeText={setLastName}
                                    />
                                </View>
                            </View>
                        </View>

                        {/* Email Field */}
                        <View className="gap-y-2">
                            <Text className="text-lg font-semibold ml-2" style={{ color: colors.foreground }}>Email Address</Text>
                            <View
                                style={{ backgroundColor: colors.card, borderColor: colors.border + '80' }}
                                className="h-16 rounded-[25px] px-6 justify-center border"
                            >
                                <TextInput
                                    className="text-lg"
                                    style={{ color: colors.foreground }}
                                    placeholder="your@email.com"
                                    placeholderTextColor={colors.muted}
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                />
                            </View>
                        </View>
                    </View>

                    {/* Save Button */}
                    <View className="mt-12">
                        <Pressable
                            onPress={handleSave}
                            style={{ backgroundColor: colors.foreground }}
                            className="w-full h-16 rounded-[25px] items-center justify-center active:opacity-80 shadow-2xl"
                        >
                            <Text
                                className="text-xl font-black"
                                style={{ color: colors.background }}
                            >
                                Save Changes
                            </Text>
                        </Pressable>

                        <Pressable
                            onPress={() => router.back()}
                            className="w-full h-16 rounded-3xl items-center justify-center mt-2"
                        >
                            <Text className="text-lg font-medium" style={{ color: colors.muted }}>Cancel</Text>
                        </Pressable>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default ProfileScreen;
