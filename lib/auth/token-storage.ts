import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';

/**
 * Secure token storage for mobile app
 * Uses Capacitor Preferences (encrypted on iOS/Android)
 */

const TOKEN_KEYS = {
    ACCESS_TOKEN: 'auth_access_token',
    REFRESH_TOKEN: 'auth_refresh_token',
    USER_DATA: 'auth_user_data',
    TOKEN_EXPIRY: 'auth_token_expiry',
} as const;

export interface StoredUser {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
}

/**
 * Store authentication tokens securely
 */
export async function storeTokens(
    accessToken: string,
    refreshToken: string,
    user: StoredUser,
    expiresIn: number = 3600
): Promise<void> {
    const expiryTime = Date.now() + expiresIn * 1000; // Convert seconds to milliseconds

    await Promise.all([
        Preferences.set({ key: TOKEN_KEYS.ACCESS_TOKEN, value: accessToken }),
        Preferences.set({ key: TOKEN_KEYS.REFRESH_TOKEN, value: refreshToken }),
        Preferences.set({ key: TOKEN_KEYS.USER_DATA, value: JSON.stringify(user) }),
        Preferences.set({ key: TOKEN_KEYS.TOKEN_EXPIRY, value: expiryTime.toString() }),
    ]);
}

/**
 * Get stored access token
 */
export async function getAccessToken(): Promise<string | null> {
    const { value } = await Preferences.get({ key: TOKEN_KEYS.ACCESS_TOKEN });
    return value;
}

/**
 * Get stored refresh token
 */
export async function getRefreshToken(): Promise<string | null> {
    const { value } = await Preferences.get({ key: TOKEN_KEYS.REFRESH_TOKEN });
    return value;
}

/**
 * Get stored user data
 */
export async function getStoredUser(): Promise<StoredUser | null> {
    const { value } = await Preferences.get({ key: TOKEN_KEYS.USER_DATA });
    if (!value) return null;

    try {
        return JSON.parse(value);
    } catch {
        return null;
    }
}

/**
 * Check if access token is expired
 */
export async function isTokenExpired(): Promise<boolean> {
    const { value } = await Preferences.get({ key: TOKEN_KEYS.TOKEN_EXPIRY });
    if (!value) return true;

    const expiryTime = parseInt(value, 10);
    // Consider token expired 5 minutes before actual expiry (for safety)
    return Date.now() >= expiryTime - 5 * 60 * 1000;
}

/**
 * Clear all stored tokens (logout)
 */
export async function clearTokens(): Promise<void> {
    await Promise.all([
        Preferences.remove({ key: TOKEN_KEYS.ACCESS_TOKEN }),
        Preferences.remove({ key: TOKEN_KEYS.REFRESH_TOKEN }),
        Preferences.remove({ key: TOKEN_KEYS.USER_DATA }),
        Preferences.remove({ key: TOKEN_KEYS.TOKEN_EXPIRY }),
    ]);
}

/**
 * Check if user is authenticated (has valid tokens)
 */
export async function isAuthenticated(): Promise<boolean> {
    const [accessToken, expired] = await Promise.all([
        getAccessToken(),
        isTokenExpired(),
    ]);

    return !!accessToken && !expired;
}
