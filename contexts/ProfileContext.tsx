import { useSQLiteContext } from "expo-sqlite";
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { supabase } from "../services/supabase";

export interface ProfileData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
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
    phone: "",
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

            const result = await db.getFirstAsync<ProfileData>(
                "SELECT firstName, lastName, email, phone, password, avatarUrl FROM profile WHERE user_id = ?",
                [currentUserId]
            );
            if (result) {
                setProfile(result);
            } else {
                setProfile(defaultProfile);
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
        }
    };

    const syncProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const meta = user.user_metadata;

                // Load the locally stored avatar (we never put it in Supabase metadata)
                const localRow = await db.getFirstAsync<{ avatarUrl: string | null }>(
                    "SELECT avatarUrl FROM profile WHERE user_id = ?", [user.id]
                );

                const syncedProfile: ProfileData = {
                    firstName: meta?.first_name || defaultProfile.firstName,
                    lastName: meta?.last_name || defaultProfile.lastName,
                    email: user.email || defaultProfile.email,
                    phone: meta?.phone || defaultProfile.phone,
                    password: defaultProfile.password,
                    avatarUrl: localRow?.avatarUrl || undefined,
                };

                await db.runAsync(
                    "INSERT OR REPLACE INTO profile (id, user_id, firstName, lastName, email, phone, password, avatarUrl) VALUES (1, ?, ?, ?, ?, ?, ?, ?)",
                    [user.id, syncedProfile.firstName, syncedProfile.lastName, syncedProfile.email, syncedProfile.phone, syncedProfile.password || "", syncedProfile.avatarUrl || null]
                );
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
                "UPDATE profile SET firstName = ?, lastName = ?, email = ?, phone = ?, password = ?, avatarUrl = ? WHERE user_id = ?",
                [
                    updatedProfile.firstName,
                    updatedProfile.lastName,
                    updatedProfile.email,
                    updatedProfile.phone,
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
                    phone: updatedProfile.phone,
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

            // Save ONLY locally — base64 images are too large for Supabase user_metadata (64KB limit).
            // SQLite is already filtered by user_id so avatars are still per-account.
            await db.runAsync(
                "UPDATE profile SET avatarUrl = ? WHERE user_id = ?",
                [base64Uri || null, currentUserId]
            );

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
