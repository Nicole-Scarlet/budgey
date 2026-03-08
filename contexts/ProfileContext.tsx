import { useSQLiteContext } from "expo-sqlite";
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

export interface ProfileData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password?: string;
}

interface ProfileContextType {
    profile: ProfileData;
    updateProfile: (newData: Partial<ProfileData>) => Promise<void>;
}

const defaultProfile: ProfileData = {
    firstName: "Ryan Reimann",
    lastName: "Layno",
    email: "ryan.layno@example.com",
    phone: "0917 123 4567",
    password: "password123",
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
    const db = useSQLiteContext();
    const [profile, setProfile] = useState<ProfileData>(defaultProfile);

    const refresh = async () => {
        try {
            const result = await db.getFirstAsync<ProfileData>(
                "SELECT firstName, lastName, email, phone, password FROM profile WHERE id = 1"
            );
            if (result) {
                setProfile(result);
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
        }
    };

    useEffect(() => {
        refresh();
    }, [db]);

    const updateProfile = async (newData: Partial<ProfileData>) => {
        try {
            const updatedProfile = { ...profile, ...newData };
            await db.runAsync(
                "UPDATE profile SET firstName = ?, lastName = ?, email = ?, phone = ?, password = ? WHERE id = 1",
                [
                    updatedProfile.firstName,
                    updatedProfile.lastName,
                    updatedProfile.email,
                    updatedProfile.phone,
                    updatedProfile.password || "",
                ]
            );
            setProfile(updatedProfile);
        } catch (error) {
            console.error("Error updating profile:", error);
        }
    };

    return (
        <ProfileContext.Provider value={{ profile, updateProfile }}>
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
