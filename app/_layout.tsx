import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import "../global.css";

import {
  Inter_400Regular,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { SQLiteProvider, type SQLiteDatabase } from "expo-sqlite";
import { FinanceProvider } from "../context/FinanceContext";
import { ProfileProvider } from "../context/ProfileContext";
import { WishlistProvider } from "../context/WishlistContext";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: "(tabs)",
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

  const createDbIfNeeded = async (db: SQLiteDatabase) => {
    console.log("Initializing database...");
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON;

      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
      );

      CREATE TABLE IF NOT EXISTS debts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        person TEXT NOT NULL,
        description TEXT,
        date TEXT,
        initialAmount REAL NOT NULL,
        remainingAmount REAL NOT NULL,
        direction TEXT CHECK(direction IN ('left', 'right')),
        status TEXT CHECK(status IN ('pending', 'paid'))
      );

      CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        debtId INTEGER NOT NULL,
        amount REAL NOT NULL,
        date TEXT,
        FOREIGN KEY (debtId) REFERENCES debts (id) ON DELETE CASCADE
      );

      -- Initialize default budget if not exists
      INSERT OR IGNORE INTO settings (key, value) VALUES ('budget', '0');

      CREATE TABLE IF NOT EXISTS profile (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        firstName TEXT,
        lastName TEXT,
        email TEXT,
        phone TEXT,
        password TEXT
      );

      INSERT OR IGNORE INTO profile (id, firstName, lastName, email, phone, password)
      VALUES (1, 'Ryan Reimann', 'Layno', 'ryan.layno@example.com', '0917 123 4567', 'password123');

      DROP TABLE IF EXISTS wishlist;

      CREATE TABLE IF NOT EXISTS wishlist (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price TEXT,
        color TEXT,
        icon TEXT,
        cost TEXT,
        targetDate TEXT,
        progress INTEGER DEFAULT 0,
        commitments TEXT DEFAULT '[]',
        image TEXT,
        url TEXT
      );
    `);
  };

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <SQLiteProvider databaseName="test.db" onInit={createDbIfNeeded}>
        <ProfileProvider>
          <FinanceProvider>
            <WishlistProvider>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="edit-profile" options={{ headerShown: false }} />
                <Stack.Screen name="privacy" options={{ headerShown: false }} />
                <Stack.Screen name="security" options={{ headerShown: false }} />
                <Stack.Screen name="support" options={{ headerShown: false }} />
                <Stack.Screen name="terms" options={{ headerShown: false }} />
                <Stack.Screen name="wishlist" options={{ headerShown: false }} />
                <Stack.Screen
                  name="budget"
                  options={{
                    presentation: "modal",
                    headerShown: false,
                    animation: "slide_from_bottom",
                  }}
                />
              </Stack>
              <StatusBar style="auto" />
            </WishlistProvider>
          </FinanceProvider>
        </ProfileProvider>
      </SQLiteProvider>
    </ThemeProvider>
  );
}
