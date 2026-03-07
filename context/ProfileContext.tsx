import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ProfileData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    image?: string;
}

interface ProfileContextType {
    profile: ProfileData;
    updateProfile: (newData: Partial<ProfileData>) => void;
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
    const [profile, setProfile] = useState<ProfileData>(defaultProfile);

    const updateProfile = (newData: Partial<ProfileData>) => {
        setProfile((prev) => ({ ...prev, ...newData }));
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
