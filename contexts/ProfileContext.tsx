import { useSQLiteContext } from "expo-sqlite";
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { supabase } from "../services/supabase";

export interface ProfileData {
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    avatarUrl?: string; // base64 string or null
}

interface ProfileContextType {
    profile: ProfileData;
    updateProfile: (newData: Partial<ProfileData>) => Promise<void>;
    updateAvatar: (base64Uri: string) => Promise<void>;
    syncProfile: () => Promise<void>;
}

const defaultProfile: ProfileData = {
    firstName: "User",
    lastName: "",
    email: "",
    password: "",
    avatarUrl: undefined,
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
    const db = useSQLiteContext();
    const [profile, setProfile] = useState<ProfileData>(defaultProfile);

    const refresh = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const currentUserId = user?.id || 'local';

            const result = await db.getFirstAsync<any>(
                "SELECT * FROM profile WHERE user_id = ?",
                [currentUserId]
            );
            if (result) {
                setProfile({
                    firstName: result.firstName || result.first_name || defaultProfile.firstName,
                    lastName: result.lastName || result.last_name || defaultProfile.lastName,
                    email: result.email || defaultProfile.email,
                    password: result.password || defaultProfile.password,
                    avatarUrl: result.avatarUrl || undefined,
                });
            } else {
                setProfile(defaultProfile);
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
            setProfile(defaultProfile);
        }
    };

    const syncProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const meta = user.user_metadata;

                // Pull avatar — wrapped in its own try-catch so failures don't block sync
                let remoteAvatarUrl: string | null = null;
                try {
                    const { data: remoteProfile } = await supabase
                        .from('profile')
                        .select('avatarUrl')
                        .eq('user_id', user.id)
                        .maybeSingle();
                    if (remoteProfile?.avatarUrl) {
                        remoteAvatarUrl = remoteProfile.avatarUrl;
                    }
                } catch (e) {
                    console.log("Could not fetch remote avatar, using local fallback.");
                }

                if (!remoteAvatarUrl) {
                    try {
                        const localRow = await db.getFirstAsync<any>(
                            "SELECT * FROM profile WHERE user_id = ?", [user.id]
                        );
                        remoteAvatarUrl = localRow?.avatarUrl || null;
                    } catch (e) {}
                }

                const syncedProfile: ProfileData = {
                    firstName: meta?.first_name || defaultProfile.firstName,
                    lastName: meta?.last_name || defaultProfile.lastName,
                    email: user.email || defaultProfile.email,
                    password: defaultProfile.password,
                    avatarUrl: remoteAvatarUrl || undefined,
                };

                try {
                    await db.runAsync(
                        "INSERT OR REPLACE INTO profile (id, user_id, firstName, lastName, email, password, avatarUrl) VALUES (?, ?, ?, ?, ?, ?, ?)",
                        [user.id, user.id, syncedProfile.firstName, syncedProfile.lastName, syncedProfile.email, syncedProfile.password || "", syncedProfile.avatarUrl || null]
                    );
                } catch (dbError) {
                    console.log("Profile DB write failed, will retry next launch:", dbError);
                }
                setProfile(syncedProfile);
            }
        } catch (error) {
            console.error("Error syncing profile:", error);
        }
    };

    useEffect(() => {
        refresh();
        syncProfile();
    }, [db]);

    const updateProfile = async (newData: Partial<ProfileData>) => {
        try {
            const updatedProfile = { ...profile, ...newData };

            const { data: { user } } = await supabase.auth.getUser();
            const currentUserId = user?.id || 'local';

            // 1. Save locally
            await db.runAsync(
                "UPDATE profile SET firstName = ?, lastName = ?, email = ?, password = ?, avatarUrl = ? WHERE user_id = ?",
                [
                    updatedProfile.firstName,
                    updatedProfile.lastName,
                    updatedProfile.email,
                    updatedProfile.password || "",
                    updatedProfile.avatarUrl || null,
                    currentUserId
                ]
            );
            setProfile(updatedProfile);

            // 2. Push to Supabase Auth metadata (never include avatar — too large)
            const { error } = await supabase.auth.updateUser({
                data: {
                    first_name: updatedProfile.firstName,
                    last_name: updatedProfile.lastName,
                }
            });

            if (error) console.log("Offline: Profile updated locally only.");

        } catch (error) {
            console.error("Error updating profile:", error);
        }
    };

    const updateAvatar = async (base64Uri: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const currentUserId = user?.id || 'local';

            // 1. Save locally
            await db.runAsync(
                "UPDATE profile SET avatarUrl = ? WHERE user_id = ?",
                [base64Uri || null, currentUserId]
            );

            // 2. Push to Supabase profile table as plain TEXT (not user_metadata which has a 64KB limit).
            //    We upsert so that even if the row doesn't exist yet it gets created.
            if (user) {
                const { error } = await supabase.from('profile').upsert(
                    { user_id: user.id, avatarUrl: base64Uri || null },
                    { onConflict: 'user_id' }
                );
                if (error) console.log("Offline: Avatar saved locally only.", error.message);
            }

            setProfile(prev => ({ ...prev, avatarUrl: base64Uri || undefined }));
        } catch (error) {
            console.error("Error updating avatar:", error);
        }
    };

    return (
        <ProfileContext.Provider value={{ profile, updateProfile, updateAvatar, syncProfile }}>
            {children}
        </ProfileContext.Provider>
    );
};

export const useProfile = () => {
    const context = useContext(ProfileContext);
    if (context === undefined) {
        throw new Error('useProfile must be used within a ProfileProvider');
    }
    return context;
};
