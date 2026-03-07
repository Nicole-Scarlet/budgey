export interface WishlistItem {
    id: number;
    name: string;
    price: string;
    cost: string;
    targetDate: string;
    progress: number;
    color: string;
    icon: string;
    image?: string;
    commitments: { date: string; amount: string; }[];
}

export const wishlistItems: WishlistItem[] = [
    {
        id: 1,
        name: "iPhone 17 Pro",
        price: "Php 79,990",
        cost: "79,990",
        targetDate: "2026 - 02 - 04",
        progress: 20,
        color: "#6366F1",
        icon: "cellphone",
        commitments: [
            { date: "February 4, 2026", amount: "+ ₱5,000.00" },
            { date: "February 5, 2026", amount: "+ ₱5,000.00" },
            { date: "February 5, 2026", amount: "+ ₱5,000.00" },
        ]
    },
    {
        id: 2,
        name: "2025 Honda Civic RS e:HEV",
        price: "Php 1,990,000",
        cost: "1,990,000",
        targetDate: "2026 - 12 - 25",
        progress: 10,
        color: "#EF4444",
        icon: "car",
        commitments: [
            { date: "March 1, 2026", amount: "+ ₱50,000.00" }
        ]
    },
    {
        id: 3,
        name: "Small Dior Bow Bag",
        price: "Php 295,000",
        cost: "295,000",
        targetDate: "2026 - 05 - 10",
        progress: 35,
        color: "#EC4899",
        icon: "bag-personal",
        commitments: [
            { date: "February 10, 2026", amount: "+ ₱15,000.00" }
        ]
    },
    {
        id: 4,
        name: "iPad Air M3 13-inch (256GB)",
        price: "Php 61,990",
        cost: "61,990",
        targetDate: "2026 - 04 - 15",
        progress: 50,
        color: "#3B82F6",
        icon: "tablet-cellphone",
        commitments: [
            { date: "February 1, 2026", amount: "+ ₱10,000.00" }
        ]
    },
    {
        id: 5,
        name: "Jean Paul Gaultier Ultra Male",
        price: "Php 8,000",
        cost: "8,000",
        targetDate: "2026 - 03 - 20",
        progress: 80,
        color: "#14B8A6",
        icon: "bottle-tonic-plus",
        commitments: [
            { date: "January 20, 2026", amount: "+ ₱2,000.00" }
        ]
    },
    {
        id: 6,
        name: "Ferrari Jacket",
        price: "Php 4,000",
        cost: "0",
        targetDate: "2026 - 12 - 31",
        progress: 0,
        color: "#64748B",
        icon: "account-star",
        commitments: []
    },
];
