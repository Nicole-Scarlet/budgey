import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';

const { width } = Dimensions.get('window');
const SCAN_FRAME_SIZE = width * 0.7;

export default function ActionScreen() {
    const router = useRouter();
    const [permission, requestPermission] = useCameraPermissions();
    const [flash, setFlash] = useState<'on' | 'off'>('off');
    const [isCapturing, setIsCapturing] = useState(false);
    const [capturedImages, setCapturedImages] = useState<string[]>([]);
    const cameraRef = useRef<CameraView>(null);
    const { colors } = useTheme();

    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {
        return (
            <SafeAreaView className="flex-1 items-center justify-center px-6" style={{ backgroundColor: colors.background }}>
                <Text className="text-center text-lg mb-6" style={{ color: colors.foreground }}>We need your permission to show the camera</Text>
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
        if (cameraRef.current) {
            try {
                const photo = await cameraRef.current.takePictureAsync({
                    quality: 1,
                    base64: true,
                });
                if (photo) {
                    setCapturedImages(prev => [...prev, photo.uri]);
                    console.log("Photo Taken" + (capturedImages.length + 1));
                }
            } catch (error) {
                console.error("Camera Capture Error:", error);
            }
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
            const newUris = result.assets.map(asset => asset.uri);
            setCapturedImages(prev => [...prev, ...newUris]);
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

            {/* Transparent Overlay */}
            <View style={StyleSheet.absoluteFillObject} className="items-center justify-center pointer-events-none">
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
            <View className="absolute bottom-10 w-full px-6 items-center">
                {/* Captured Photos Count Indicator */}
                {capturedImages.length > 0 && (
                    <View className="bg-white/20 px-4 py-1.5 rounded-full mb-6 border border-white/20 backdrop-blur-md">
                        <Text className="text-white text-xs font-bold">{capturedImages.length} {capturedImages.length === 1 ? 'photo' : 'photos'} ready</Text>
                    </View>
                )}

                <View className="flex-row justify-between items-center w-full px-4 mb-8">
                    {/* Upload from Gallery bg-[#1E293B]/80 */}
                    <Pressable onPress={pickImage} className="items-center w-20">
                        <View className="bg-white/10 p-3 rounded-full border border-white/20">
                            <MaterialCommunityIcons name="image" size={26} color="white" />
                        </View>
                        <Text className="text-white text-[10px] mt-2 font-medium">Upload</Text>
                    </Pressable>

                    {/* Shutter Button */}
                    <View 
                        className="items-center justify-center"
                    >
                        <View className="w-[84px] h-[84px] rounded-full border-[4px] border-white items-center justify-center bg-transparent">
                            <Pressable onPress={takePicture} className="w-[68px] h-[68px] rounded-full bg-white active:bg-slate-300" />
                        </View>
                    </View>

                    {/* Flash Toggle */}
                    <Pressable onPress={toggleFlash} className="items-center w-20">
                        <View className={`p-3 rounded-full border border-white/20 ${flash === 'on' ? 'bg-[#3B82F6]' : 'bg-white/10'}`}>
                            <MaterialCommunityIcons name={flash === 'on' ? "flash" : "flash-off"} size={26} color="white" />
                        </View>
                        <Text className="text-white text-[10px] mt-2 font-medium">Flash</Text>
                    </Pressable>
                </View>

                {/* Confirm and Clear Buttons */}
                <View className="flex-row w-full gap-4">
                    <Pressable 
                        onPress={() => setCapturedImages([])}
                        disabled={capturedImages.length === 0}
                        className={`flex-1 py-4 rounded-2xl items-center justify-center border border-white/20 ${capturedImages.length === 0 ? 'opacity-30' : 'bg-white/10 active:bg-white/20'}`}
                    >
                        <Text className="text-white font-bold text-sm">CLEAR ALL</Text>
                    </Pressable>

                    <Pressable 
                        onPress={() => {
                            if (capturedImages.length > 0) {
                                router.push({
                                    pathname: '/scanned-expense',
                                    params: { imageUris: JSON.stringify(capturedImages) }
                                });
                            }
                        }}
                        disabled={capturedImages.length === 0 || isCapturing}
                        className={`flex-1 py-4 rounded-2xl items-center justify-center ${capturedImages.length === 0 ? 'bg-slate-700 opacity-50' : 'bg-[#3B82F6] active:bg-[#2563EB]'}`}
                    >
                        <Text className="text-white font-bold text-sm">CONFIRM ({capturedImages.length})</Text>
                    </Pressable>
                </View>
            </View>
        </SafeAreaView>
    );
}

