import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

type Theme = 'light' | 'dark';

interface ThemeColors {
    background: string;
    card: string;
    foreground: string;
    muted: string;
    border: string;
    accent: string;
    secondaryCard?: string;
}

interface ThemeContextType {
    theme: Theme;
    isDark: boolean;
    colors: ThemeColors;
    toggleTheme: () => void;
}

const darkColors: ThemeColors = {
    background: '#1E293B', // Slate-900 (custom)
    card: '#334155',       // Slate-700 (custom)
    secondaryCard: '#0F172A', // Slate-950
    foreground: '#FFFFFF',
    muted: '#94A3B8',      // Slate-400
    border: '#90A1B9',     // Custom border
    accent: '#90A1B9'      // Custom accent
};

const lightColors: ThemeColors = {
    background: '#F8FAFC', // Slate-50
    card: '#FFFFFF',
    secondaryCard: '#F1F5F9', // Slate-100
    foreground: '#0F172A', // Slate-950
    muted: '#64748B',      // Slate-500
    border: '#E2E8F0',     // Slate-200
    accent: '#334155'      // Slate-700
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const AppThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const db = useSQLiteContext();
    const [theme, setTheme] = useState<Theme>('dark');

    const loadTheme = async () => {
        try {
            const result = await db.getFirstAsync<{ value: string }>(
                "SELECT value FROM settings WHERE key = 'theme'"
            );
            if (result) {
                setTheme(result.value as Theme);
            } else {
                // Initial setup if doesn't exist (done by db-init usually)
                await db.runAsync("INSERT OR IGNORE INTO settings (key, value) VALUES ('theme', 'dark')");
            }
        } catch (error) {
            console.error("Error loading theme:", error);
        }
    };

    useEffect(() => {
        loadTheme();
    }, [db]);

    const toggleTheme = async () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        try {
            await db.runAsync(
                "UPDATE settings SET value = ? WHERE key = 'theme'",
                [newTheme]
            );
        } catch (error) {
            console.error("Error updating theme:", error);
        }
    };

    const isDark = theme === 'dark';
    const colors = isDark ? darkColors : lightColors;

    return (
        <ThemeContext.Provider value={{ theme, isDark, colors, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
