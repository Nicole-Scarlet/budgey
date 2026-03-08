/**
 * Formats a numeric value (string or number) as a PHP currency string.
 * Example: "1000" -> "₱1,000"
 */
export const formatPHP = (value: string | number): string => {
    if (value === undefined || value === null || value === "") return "₱0";
    const numeric = typeof value === "string" ? value.replace(/[^0-9.]/g, "") : value.toString();
    const parsed = parseFloat(numeric);
    if (isNaN(parsed)) return "₱0";
    return `₱${parsed.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};

/**
 * Removes all non-numeric characters from a string.
 * Useful for processing input before saving to database.
 */
export const stripNonNumeric = (text: string): string => {
    return text.replace(/[^0-9]/g, "");
};
