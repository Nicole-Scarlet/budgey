import { ResizeMode, Video } from 'expo-av';
import { useRouter } from "expo-router";
import * as React from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const WelcomePage = () => {
    const router = useRouter();

    return (
        <SafeAreaView className="flex-1 bg-slate-900 px-8 justify-between py-12">
            {/* Top Illustration - Now a Video! */}
            <View className="items-center mt-10">
                <View className="w-full h-80 rounded-[20px] items-center justify-center border border-slate-600 overflow-hidden bg-slate-800">
                    <Video
                        source={require('../assets/images/introVid.mp4')}
                        rate={1.0}
                        volume={0}
                        isMuted={true}
                        resizeMode={ResizeMode.COVER}
                        shouldPlay
                        isLooping
                        onError={(error) => console.log('Video Error:', error)}
                        onPlaybackStatusUpdate={(status) => {
                            if (status.isLoaded === false && status.error) {
                                console.log(`Video status error: ${status.error}`);
                            }
                        }}
                        style={{ width: '100%', height: '100%' }}
                    />
                </View>
            </View>

            {/* Text Content */}
            <View className="items-center">
                <Text className="text-white text-4xl font-bold mb-4 text-center">
                    Welcome to Budgey!
                </Text>
                <Text className="text-slate-300 text-xl leading-8 text-center">
                    Know yourself (and your wallet) better using our state-of-the-art features that will help you understand that budgeting does not have to be difficult.
                </Text>
            </View>

            {/* Bottom Button */}
            <View className="items-center">
                <Pressable
                    onPress={() => router.replace("/login")}
                    className="w-full bg-slate-400 h-16 rounded-3xl items-center justify-center active:bg-slate-500"
                >
                    <Text className="text-slate-900 text-2xl font-semibold">Get Started</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
};

export default WelcomePage;
