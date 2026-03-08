import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import '../global.css';

import { Inter_400Regular, Inter_700Bold, useFonts } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { TransactionProvider } from '@/contexts/TransactionContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: 'intro',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TransactionProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="intro" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="register" options={{ headerShown: false }} />
            <Stack.Screen name="question" options={{ headerShown: false }} />
            <Stack.Screen name="question2" options={{ headerShown: false }} />
            <Stack.Screen name="question3" options={{ headerShown: false }} />
            <Stack.Screen name="question4" options={{ headerShown: false }} />
            <Stack.Screen name="question5" options={{ headerShown: false }} />
            <Stack.Screen name="home" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="scanned-expense" options={{ headerShown: false }} />
            <Stack.Screen name="add-income" options={{ headerShown: false }} />
            <Stack.Screen name="add-savings" options={{ headerShown: false }} />
            <Stack.Screen name="add-category" options={{ headerShown: false }} />
            <Stack.Screen name="add-expense" options={{ headerShown: false }} />
            <Stack.Screen name="add-budget" options={{ headerShown: false }} />
            <Stack.Screen name="category-list" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </TransactionProvider>
    </GestureHandlerRootView>
  );
}
