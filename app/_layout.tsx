import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import '../global.css';

import { Inter_400Regular, Inter_700Bold, useFonts } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { TransactionProvider } from '@/contexts/TransactionContext';
import { WishlistProvider } from '@/contexts/WishlistContext';
import { ProfileProvider } from '@/contexts/ProfileContext';
import { AppThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { SQLiteProvider } from 'expo-sqlite';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { migrateDbIfNeeded } from '@/utils/db-init';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: 'index',
};

// Inner component to bridge AppTheme state to Navigation theme
function ThemeBridge({ children }: { children: React.ReactNode }) {
  const { isDark } = useTheme();
  return (
    <NavigationThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      {children}
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
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
      <SQLiteProvider databaseName="budgey.db" onInit={migrateDbIfNeeded}>
        <AppThemeProvider>
          <TransactionProvider>
            <WishlistProvider>
              <ProfileProvider>
                <ThemeBridge>
                  <Stack>
                    <Stack.Screen name="index" options={{ headerShown: false }} />
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
                    <Stack.Screen name="wishlist" options={{ headerShown: false }} />
                    <Stack.Screen name="privacy" options={{ headerShown: false }} />
                    <Stack.Screen name="security" options={{ headerShown: false }} />
                    <Stack.Screen name="support" options={{ headerShown: false }} />
                    <Stack.Screen name="terms" options={{ headerShown: false }} />
                    <Stack.Screen name="edit-profile" options={{ headerShown: false }} />
                    <Stack.Screen name="aichatbot" options={{ headerShown: false }} />
                  </Stack>
                  <StatusBar style="auto" />
                </ThemeBridge>
              </ProfileProvider>
            </WishlistProvider>
          </TransactionProvider>
        </AppThemeProvider>
      </SQLiteProvider>
    </GestureHandlerRootView>
  );
}
