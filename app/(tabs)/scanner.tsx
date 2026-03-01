import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView, Image, Modal } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Sizing ───────────────────────────────────────────
const SCAN_SIZE = SCREEN_WIDTH * 0.7; // 70% of screen width

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [flash, setFlash] = useState(false);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const router = useRouter();

  if (!permission) {
    // Camera permissions are still loading.
    return <View className="flex-1 bg-[#1E293B]" />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View className="flex-1 bg-[#1E293B] items-center justify-center p-8">
        <Text className="text-white text-lg font-bold text-center mb-6">
          We need your permission to show the camera
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          className="bg-emerald-500 px-8 py-4 rounded-full"
        >
          <Text className="text-white font-bold text-lg">Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  function toggleFlash() {
    setFlash(!flash);
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        if (photo?.uri) {
          setCapturedImages((prev) => [photo.uri, ...prev]);
        }
      } catch (error) {
        console.error('Failed to take picture:', error);
      }
    }
  };

  return (
    <View className="flex-1 bg-black">
      {/* ── Camera View ── */}
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
        enableTorch={flash}
      />

      {/* ── Dark Overlay with Scanner Cutout ── */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {/* Top Spacer - Reduced to shift box higher */}
        <View style={{ flex: 0.4, backgroundColor: 'rgba(0,0,0,0.4)' }} />
        
        <View className="flex-row">
          <View className="flex-1 bg-black/40" />
          <View style={{ width: SCAN_SIZE, height: SCAN_SIZE }}>
            {/* Corner Brackets */}
            <View 
              style={{ position: 'absolute', top: 0, left: 0, width: 40, height: 40, borderLeftWidth: 4, borderTopWidth: 4, borderColor: '#FFFFFF' }} 
            />
            <View 
              style={{ position: 'absolute', top: 0, right: 0, width: 40, height: 40, borderRightWidth: 4, borderTopWidth: 4, borderColor: '#FFFFFF' }} 
            />
            <View 
              style={{ position: 'absolute', bottom: 0, left: 0, width: 40, height: 40, borderLeftWidth: 4, borderBottomWidth: 4, borderColor: '#FFFFFF' }} 
            />
            <View 
              style={{ position: 'absolute', bottom: 0, right: 0, width: 40, height: 40, borderRightWidth: 4, borderBottomWidth: 4, borderColor: '#FFFFFF' }} 
            />
          </View>
          <View className="flex-1 bg-black/40" />
        </View>
        
        {/* Bottom Spacer - Increased to push box higher */}
        <View style={{ flex: 1.6, backgroundColor: 'rgba(0,0,0,0.4)' }} />
      </View>

      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        {/* Header Removed as requested */}
        <View style={{ height: 40 }} />

        <View className="flex-1" />

        {/* ── Control Area ── */}
        <View className="px-10 pb-12">
          
          {/* Gallery View - Multi-photo list */}
          <View style={{ height: 100, marginBottom: 20 }}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ alignItems: 'center', paddingHorizontal: 10 }}
            >
              {capturedImages.map((uri, index) => (
                <TouchableOpacity 
                  key={index} 
                  onPress={() => setSelectedImage(uri)}
                  className="mr-3 overflow-hidden rounded-xl border-2 border-white/20"
                >
                  <Image 
                    source={{ uri }} 
                    style={{ width: 80, height: 80 }} 
                    resizeMode="cover" 
                  />
                </TouchableOpacity>
              ))}
              {capturedImages.length === 0 && (
                <View className="w-full items-center justify-center opacity-40">
                  <Text className="text-white italic text-xs">No images captured yet</Text>
                </View>
              )}
            </ScrollView>
          </View>

          {/* Shutter Button & Optional Controls */}
          <View className="flex-row justify-between items-center">
            {/* Placeholder / Upload icon */}
            <TouchableOpacity className="w-14 items-center opacity-60">
              <MaterialCommunityIcons name="image-plus" size={28} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Shutter Button */}
            <TouchableOpacity 
              onPress={takePicture}
              activeOpacity={0.8}
              className="items-center justify-center"
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                borderWidth: 4,
                borderColor: '#FFFFFF',
                padding: 4
              }}
            >
              <View className="flex-1 w-full bg-white rounded-full" />
            </TouchableOpacity>

            {/* Flash toggle */}
            <TouchableOpacity onPress={toggleFlash} className="w-14 items-center">
              <Ionicons name={flash ? "flash" : "flash-off"} size={28} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      {/* ── Image Zoom Modal ── */}
      <Modal
        visible={!!selectedImage}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedImage(null)}
      >
        <TouchableOpacity 
          activeOpacity={1} 
          style={styles.modalOverlay}
          onPress={() => setSelectedImage(null)}
        >
          <View className="flex-1 items-center justify-center p-4">
            {selectedImage && (
              <Image 
                source={{ uri: selectedImage }} 
                style={{ 
                  width: SCREEN_WIDTH * 0.9, 
                  height: SCREEN_WIDTH * 1.2,
                  borderRadius: 20 
                }} 
                resizeMode="contain" 
              />
            )}
            <TouchableOpacity 
              onPress={() => setSelectedImage(null)}
              className="mt-8 bg-white/20 p-4 rounded-full"
            >
              <Ionicons name="close" size={32} color="white" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
  },
});
