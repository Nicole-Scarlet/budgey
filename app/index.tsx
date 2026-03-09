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
        let isMounted = true;

        const checkAuth = async () => {
            try {
                // getSession() reads the locally cached token — fast & offline-safe
                const { data: { session } } = await supabase.auth.getSession();

                if (!isMounted) return;

                if (session) {
                    router.replace('/(tabs)');
                } else {
                    router.replace('/intro');
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                if (isMounted) router.replace('/intro');
            } finally {
                if (isMounted) setIsChecking(false);
            }
        };

        checkAuth();

        // Also listen for auth state changes (e.g. token refresh, sign-out from another tab)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!isMounted) return;
            // Only redirect on definitive sign-in/out events, not token refreshes
            if (_event === 'SIGNED_IN') {
                router.replace('/(tabs)');
            } else if (_event === 'SIGNED_OUT') {
                router.replace('/intro');
            }
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, []);

    return (
        <View style={{ flex: 1, backgroundColor: '#1E293B', alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color="#94A3B8" />
        </View>
    );
}
