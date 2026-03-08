import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const SCAN_FRAME_SIZE = width * 0.7;

export default function ActionScreen() {
    const router = useRouter();
    const [permission, requestPermission] = useCameraPermissions();
    const [flash, setFlash] = useState<'on' | 'off'>('off');
    const cameraRef = useRef<CameraView>(null);

    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {
        return (
            <SafeAreaView className="flex-1 bg-[#1E293B] items-center justify-center px-6">
                <Text className="text-white text-center text-lg mb-6">We need your permission to show the camera</Text>
                <Pressable
                    onPress={requestPermission}
                    className="bg-[#3B82F6] px-6 py-3 rounded-xl"
                >
                    <Text className="text-white font-bold">Grant Permission</Text>
                </Pressable>
            </SafeAreaView>
        );
    }

    const toggleFlash = () => {
        setFlash(current => (current === 'off' ? 'on' : 'off'));
    };

    const takePicture = async () => {
        console.log("Shutter button pressed. cameraRef exists:", !!cameraRef.current);
        if (!cameraRef.current) {
            router.push('/scanned-expense');
            return;
        }

        try {
            console.log("Attempting to take picture with optimized settings...");

            // Race the camera capture against a 3-second timeout
            const capturePromise = cameraRef.current.takePictureAsync({
                base64: false,
                quality: 0.1, // Lowest quality for fastest capture
                skipProcessing: true, // Skip Android post-processing 
                exif: false // Do not read EXIF data
            });
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Camera capture timed out")), 3000)
            );

            const photo = await Promise.race([capturePromise, timeoutPromise]) as any;

            console.log("Picture taken successfully:", photo ? photo.uri : "No URI");
            if (photo && photo.uri) {
                router.push({
                    pathname: '/scanned-expense',
                    params: { imageUri: photo.uri }
                });
            } else {
                router.push('/scanned-expense');
            }
        } catch (error: any) {
            console.log("Failed or timed out taking picture:", error.message);
            // Fallback to prototype flow if camera fails or hangs
            router.push('/scanned-expense');
        }
    };

    const pickImage = async () => {
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            router.push({
                pathname: '/scanned-expense',
                params: { imageUri: result.assets[0].uri }
            });
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-black">
            <CameraView
                ref={cameraRef}
                style={StyleSheet.absoluteFillObject}
                facing="back"
                enableTorch={flash === 'on'}
            />

            {/* Dark Overlay with cutout for the scanning area */}
            <View style={StyleSheet.absoluteFillObject} className="items-center justify-center pointer-events-none">
                <View className="absolute top-0 w-full h-full bg-[#1E293B]/70" />
                <View
                    style={{
                        width: SCAN_FRAME_SIZE,
                        height: SCAN_FRAME_SIZE,
                    }}
                    className="bg-transparent border border-white/20 relative"
                >
                    {/* Corner Markers */}
                    <View className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-[#3B82F6]" />
                    <View className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-[#3B82F6]" />
                    <View className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-[#3B82F6]" />
                    <View className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-[#3B82F6]" />

                    {/* Placeholder Text inside scanner */}
                    <View className="flex-1 items-center justify-center">
                        <Text className="text-white/70 text-center px-4 font-medium bg-black/30 py-1 rounded-full">
                            Align your receipt within the frame
                        </Text>
                    </View>
                </View>
            </View>

            {/* Header overlay */}
            <View className="absolute top-12 px-6 w-full flex-row items-center justify-between">
                <Pressable onPress={() => router.back()} className="p-2 bg-black/40 rounded-full">
                    <Ionicons name="close" size={28} color="white" />
                </Pressable>
                <Text className="text-white text-xl font-bold drop-shadow-md">OCR Reader</Text>
                <View className="w-10" />
            </View>

            {/* Bottom Controls */}
            <View className="absolute bottom-20 w-full px-10 flex-row justify-between items-center">
                {/* Upload from Gallery bg-[#1E293B]/80 */}
                <Pressable onPress={pickImage} className="items-center w-20">
                    <View className="bg-white/10 p-3 rounded-full border border-white/20">
                        <MaterialCommunityIcons name="image" size={26} color="white" />
                    </View>
                    <Text className="text-white text-[10px] mt-2 font-medium">Upload</Text>
                </Pressable>

                {/* Shutter Button */}
                <Pressable onPress={takePicture} className="items-center justify-center">
                    <View className="w-[84px] h-[84px] rounded-full border-[4px] border-white items-center justify-center bg-transparent">
                        <View className="w-[68px] h-[68px] rounded-full bg-white active:bg-slate-300" />
                    </View>
                </Pressable>

                {/* Flash Toggle */}
                <Pressable onPress={toggleFlash} className="items-center w-20">
                    <View className={`p-3 rounded-full border border-white/20 ${flash === 'on' ? 'bg-[#3B82F6]' : 'bg-white/10'}`}>
                        <MaterialCommunityIcons name={flash === 'on' ? "flash" : "flash-off"} size={26} color="white" />
                    </View>
                    <Text className="text-white text-[10px] mt-2 font-medium">Flash</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
}

