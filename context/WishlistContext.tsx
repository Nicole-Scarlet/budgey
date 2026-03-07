import React, { createContext, useContext, useState, ReactNode } from 'react';
import { wishlistItems as initialData, WishlistItem } from '../constants/wishlistData';

interface WishlistContextType {
    wishlistItems: WishlistItem[];
    addItem: (item: Omit<WishlistItem, 'id'>) => void;
    updateItem: (id: number, updates: Partial<WishlistItem>) => void;
    deleteItem: (id: number) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
    const [items, setItems] = useState<WishlistItem[]>(initialData);

    const addItem = (item: Omit<WishlistItem, 'id'>) => {
        const newId = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
        setItems(prev => [...prev, { ...item, id: newId }]);
    };

    const updateItem = (id: number, updates: Partial<WishlistItem>) => {
        setItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    };

    const deleteItem = (id: number) => {
        setItems(prev => prev.filter(item => item.id !== id));
    };

    return (
        <WishlistContext.Provider value={{ wishlistItems: items, addItem, updateItem, deleteItem }}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (context === undefined) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
};
