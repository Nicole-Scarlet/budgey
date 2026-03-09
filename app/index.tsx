import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { supabase } from '../services/supabase';

/**
 * Root index — the very first screen the app loads.
 * Checks if the user is already logged in:
 *   • YES → redirect to the main tabs (dashboard)
 *   • NO  → redirect to the intro/welcome page
 */
export default function RootIndex() {
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (session) {
                    // Quick background sync to ensure local SQLite reflects reality
                    const meta = session.user.user_metadata;
                    // User is logged in → go to main app
                    router.replace('/(tabs)');
                } else {
                    // No session → show intro/welcome page
                    router.replace('/intro');
                }
            } catch (error) {
                // If anything goes wrong (e.g. offline), default to intro
                console.error('Auth check failed:', error);
                router.replace('/intro');
            } finally {
                setIsChecking(false);
            }
        };

        checkAuth();
    }, []);

    // Brief loading state while we check auth
    return (
        <View style={{ flex: 1, backgroundColor: '#1E293B', alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color="#94A3B8" />
        </View>
    );
}
