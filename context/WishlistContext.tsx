import { useSQLiteContext } from "expo-sqlite";
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

export interface WishlistCommitment {
    date: string;
    amount: string;
}

export interface WishlistItem {
    id: number;
    name: string;
    price: string;
    color: string;
    icon: string;
    cost: string;
    targetDate: string;
    progress: number;
    commitments: WishlistCommitment[];
    image?: string;
    url?: string;
}

interface WishlistContextType {
    wishlistItems: WishlistItem[];
    addItem: (item: Omit<WishlistItem, "id">) => Promise<void>;
    updateItem: (id: number, updates: Partial<WishlistItem>) => Promise<void>;
    deleteItem: (id: number) => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
    const db = useSQLiteContext();
    const [items, setItems] = useState<WishlistItem[]>([]);

    const fetchItems = async () => {
        try {
            const result = await db.getAllAsync<any>("SELECT * FROM wishlist");
            const parsedResult: WishlistItem[] = result.map(row => ({
                ...row,
                commitments: row.commitments ? JSON.parse(row.commitments) : []
            }));
            setItems(parsedResult);
        } catch (error) {
            console.error("Error fetching wishlist items:", error);
        }
    };

    useEffect(() => {
        fetchItems();
    }, [db]);

    const addItem = async (item: Omit<WishlistItem, "id">) => {
        try {
            const commitmentsStr = JSON.stringify(item.commitments || []);
            const result = await db.runAsync(
                "INSERT INTO wishlist (name, price, color, icon, cost, targetDate, progress, commitments, image, url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                [item.name, item.price, item.color, item.icon, item.cost, item.targetDate, item.progress, commitmentsStr, item.image || null, item.url || null]
            );
            if (result) {
                setItems((prev) => [...prev, { ...item, id: result.lastInsertRowId, commitments: item.commitments || [] }]);
            }
        } catch (error) {
            console.error("Error adding wishlist item:", error);
        }
    };

    const updateItem = async (id: number, updates: Partial<WishlistItem>) => {
        try {
            const currentItem = items.find((i) => i.id === id);
            if (!currentItem) return;
            
            const updatedItem = { ...currentItem, ...updates };
            const commitmentsStr = JSON.stringify(updatedItem.commitments);

            await db.runAsync(
                "UPDATE wishlist SET name = ?, price = ?, color = ?, icon = ?, cost = ?, targetDate = ?, progress = ?, commitments = ?, image = ?, url = ? WHERE id = ?",
                [updatedItem.name, updatedItem.price, updatedItem.color, updatedItem.icon, updatedItem.cost, updatedItem.targetDate, updatedItem.progress, commitmentsStr, updatedItem.image || null, updatedItem.url || null, id]
            );

            setItems((prev) =>
                prev.map((item) => (item.id === id ? updatedItem : item))
            );
        } catch (error) {
            console.error("Error updating wishlist item:", error);
        }
    };

    const deleteItem = async (id: number) => {
        try {
            await db.runAsync("DELETE FROM wishlist WHERE id = ?", [id]);
            setItems((prev) => prev.filter((item) => item.id !== id));
        } catch (error) {
            console.error("Error deleting wishlist item:", error);
        }
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
        throw new Error("useWishlist must be used within a WishlistProvider");
    }
    return context;
};
