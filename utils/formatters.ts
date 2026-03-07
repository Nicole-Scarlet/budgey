/**
 * Formats a number or string into a PHP currency format: "Php X,XXX.XX"
 */
export const formatPHP = (value: string | number): string => {
    const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.]/g, '')) : value;
    if (isNaN(numericValue)) return 'Php 0';
    return `Php ${numericValue.toLocaleString('en-PH', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    })}`;
};

/**
 * Strips non-numeric characters from a string. Useful for raw cost values.
 */
export const stripNonNumeric = (value: string): string => {
    return value.replace(/[^0-9]/g, '');
};

/**
 * Formats a date string into "YYYY - MM - DD" format for the wishlist.
 * Also handles input masking as the user types.
 */
export const formatWishlistDate = (value: string): string => {
    // Remove all non-numeric characters
    const clean = value.replace(/\D/g, '');

    // YYYYMMDD
    if (clean.length <= 4) return clean;
    if (clean.length <= 6) return `${clean.slice(0, 4)} - ${clean.slice(4)}`;
    return `${clean.slice(0, 4)} - ${clean.slice(4, 6)} - ${clean.slice(6, 8)}`;
};

/**
 * Formats a numeric string with commas: "1,000,000"
 */
export const formatNumberWithCommas = (value: string): string => {
    const clean = stripNonNumeric(value);
    if (!clean) return '';
    return parseInt(clean).toLocaleString('en-US');
};
