import { useSQLiteContext } from "expo-sqlite";
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { supabase } from "../services/supabase";

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
    syncWishlist: () => Promise<void>;
    clearWishlistState: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
    const db = useSQLiteContext();
    const [items, setItems] = useState<WishlistItem[]>([]);

    // Fetch only the current user's wishlist items from local SQLite
    const fetchItems = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const currentUserId = user?.id || 'local';

            const result = await db.getAllAsync<any>(
                "SELECT * FROM wishlist WHERE user_id = ?",
                [currentUserId]
            );
            const parsedResult: WishlistItem[] = result.map(row => {
                let commitments = [];
                try {
                    commitments = row.commitments ? JSON.parse(row.commitments) : [];
                } catch (e) {
                    console.error("Error parsing commitments for item:", row.id, e);
                }
                return { ...row, commitments };
            });
            setItems(parsedResult);
        } catch (error) {
            console.warn("Error fetching wishlist items:", error);
        }
    };

    // Sync from Supabase → SQLite for the current user, then reload
    const syncWishlist = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: remoteItems, error } = await supabase
                .from('wishlist')
                .select('*')
                .eq('user_id', user.id);

            if (error) {
                console.log("Wishlist sync error (offline?):", error.message);
                return;
            }

            if (remoteItems) {
                for (const w of remoteItems) {
                    await db.runAsync(
                        `INSERT OR REPLACE INTO wishlist 
                         (id, user_id, name, price, color, icon, cost, targetDate, progress, commitments, image, url)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            w.id,
                            user.id,
                            w.name,
                            w.price,
                            w.color,
                            w.icon,
                            w.cost,
                            w.targetDate,
                            w.progress,
                            w.commitments,
                            w.image || null,
                            w.url || null
                        ]
                    );
                }
            }

            // Reload local state after sync
            await fetchItems();
            console.log("Wishlist synced from Supabase.");
        } catch (error) {
            console.warn("Wishlist sync failed (table may not exist in Supabase yet):", error);
        }
    };

    useEffect(() => {
        // On initial mount: fetch whatever is stored locally for the current user
        const init = async () => {
            await fetchItems();
            await syncWishlist();
        };
        init();

        // Listen for auth state changes: reload wishlist when switching accounts
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
            if (event === 'SIGNED_IN') {
                await fetchItems();
                await syncWishlist();
            } else if (event === 'SIGNED_OUT') {
                setItems([]);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [db]);

    const addItem = async (item: Omit<WishlistItem, "id">) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const currentUserId = user?.id || 'local';
            const commitmentsStr = JSON.stringify(item.commitments || []);

            // 1. Save locally first
            const result = await db.runAsync(
                `INSERT INTO wishlist 
                 (user_id, name, price, color, icon, cost, targetDate, progress, commitments, image, url) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [currentUserId, item.name, item.price, item.color, item.icon, item.cost, item.targetDate, item.progress, commitmentsStr, item.image || null, item.url || null]
            );

            const newLocalId = result.lastInsertRowId;
            if (result) {
                setItems((prev) => [...prev, { ...item, id: newLocalId, commitments: item.commitments || [] }]);
            }

            // 2. Push to Supabase
            if (user) {
                await supabase.from('wishlist').insert([{
                    id: newLocalId,
                    user_id: user.id,
                    name: item.name,
                    price: item.price,
                    color: item.color,
                    icon: item.icon,
                    cost: item.cost,
                    targetDate: item.targetDate,
                    progress: item.progress,
                    commitments: commitmentsStr,
                    image: item.image || null,
                    url: item.url || null,
                }]);
            }
        } catch (error) {
            console.error("Error adding wishlist item:", error);
        }
    };

    const updateItem = async (id: number, updates: Partial<WishlistItem>) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const currentItem = items.find((i) => i.id === id);
            if (!currentItem) return;

            const updatedItem = { ...currentItem, ...updates };
            const commitmentsStr = JSON.stringify(updatedItem.commitments);

            // 1. Update locally
            await db.runAsync(
                "UPDATE wishlist SET name = ?, price = ?, color = ?, icon = ?, cost = ?, targetDate = ?, progress = ?, commitments = ?, image = ?, url = ? WHERE id = ? AND user_id = ?",
                [updatedItem.name, updatedItem.price, updatedItem.color, updatedItem.icon, updatedItem.cost, updatedItem.targetDate, updatedItem.progress, commitmentsStr, updatedItem.image || null, updatedItem.url || null, id, user?.id || 'local']
            );
            setItems((prev) => prev.map((item) => (item.id === id ? updatedItem : item)));

            // 2. Push to Supabase
            if (user) {
                await supabase.from('wishlist').upsert({
                    id,
                    user_id: user.id,
                    name: updatedItem.name,
                    price: updatedItem.price,
                    color: updatedItem.color,
                    icon: updatedItem.icon,
                    cost: updatedItem.cost,
                    targetDate: updatedItem.targetDate,
                    progress: updatedItem.progress,
                    commitments: commitmentsStr,
                    image: updatedItem.image || null,
                    url: updatedItem.url || null,
                }, { onConflict: 'id' });
            }
        } catch (error) {
            console.error("Error updating wishlist item:", error);
        }
    };

    const deleteItem = async (id: number) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            // 1. Delete locally
            await db.runAsync("DELETE FROM wishlist WHERE id = ? AND user_id = ?", [id, user?.id || 'local']);
            setItems((prev) => prev.filter((item) => item.id !== id));

            // 2. Delete from Supabase
            if (user) {
                await supabase.from('wishlist').delete().eq('id', id).eq('user_id', user.id);
            }
        } catch (error) {
            console.error("Error deleting wishlist item:", error);
        }
    };

    const clearWishlistState = () => {
        setItems([]);
    };

    return (
        <WishlistContext.Provider value={{ wishlistItems: items, addItem, updateItem, deleteItem, syncWishlist, clearWishlistState }}>
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
