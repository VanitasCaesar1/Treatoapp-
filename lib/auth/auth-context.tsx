/*
 * Auth Context for Mobile App
 *
 * This replaces WorkOS AuthKitProvider with our own native auth.
 * Tokens are stored locally and refreshed automatically.
 *
 * Why not use WorkOS directly?
 * - Mobile apps need offline support
 * - We want control over token storage (Keychain/SecureStorage)
 * - Reduces dependency on third-party SDK
 *
 * The flow:
 * 1. User logs in via backend auth endpoints
 * 2. Tokens stored locally (access + refresh)
 * 3. Access token used for API calls
 * 4. Auto-refresh when token expires
 * 5. Logout clears everything
 */
'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    getAccessToken,
    getRefreshToken,
    getStoredUser,
    isTokenExpired,
    storeTokens,
    clearTokens,
    StoredUser,
} from './token-storage';
import { refreshAccessToken } from './backend-auth';

interface AuthContextType {
    user: StoredUser | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (accessToken: string, refreshToken: string, user: StoredUser, expiresIn?: number) => Promise<void>;
    logout: () => Promise<void>;
    refreshAuth: () => Promise<boolean>;
    getAuthHeaders: () => Promise<HeadersInit>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<StoredUser | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    /*
     * Initialize auth state from storage on mount.
     *
     * This runs once when the app starts. We check if there's
     * a stored token and whether it's still valid. If expired,
     * we try to refresh it. If refresh fails, user needs to
     * log in again.
     */
    useEffect(() => {
        const initAuth = async () => {
            try {
                const [storedToken, storedUser, expired] = await Promise.all([
                    getAccessToken(),
                    getStoredUser(),
                    isTokenExpired(),
                ]);

                if (storedToken && storedUser) {
                    if (expired) {
                        // Try to refresh token
                        const refreshed = await tryRefreshToken();
                        if (!refreshed) {
                            // Refresh failed, clear auth
                            await clearTokens();
                        }
                    } else {
                        setAccessToken(storedToken);
                        setUser(storedUser);
                    }
                }
            } catch (error) {
                console.error('Error initializing auth:', error);
            } finally {
                setIsLoading(false);
            }
        };

        initAuth();
    }, []);

    /*
     * tryRefreshToken - Attempt to get a new access token
     *
     * Called when the access token is expired. Uses the refresh
     * token to get a new access token without requiring the user
     * to log in again.
     *
     * Returns true if refresh succeeded, false if user needs to
     * log in again.
     */
    const tryRefreshToken = useCallback(async (): Promise<boolean> => {
        try {
            const refreshToken = await getRefreshToken();
            if (!refreshToken) return false;

            const response = await refreshAccessToken(refreshToken);
            
            await storeTokens(
                response.access_token,
                response.refresh_token,
                response.user,
                response.expires_in
            );

            setAccessToken(response.access_token);
            setUser(response.user);
            return true;
        } catch (error) {
            console.error('Token refresh failed:', error);
            return false;
        }
    }, []);

    // Login - store tokens and update state
    const login = useCallback(async (
        newAccessToken: string,
        newRefreshToken: string,
        newUser: StoredUser,
        expiresIn: number = 3600
    ) => {
        await storeTokens(newAccessToken, newRefreshToken, newUser, expiresIn);
        setAccessToken(newAccessToken);
        setUser(newUser);
    }, []);

    // Logout - clear tokens and redirect
    const logout = useCallback(async () => {
        await clearTokens();
        setAccessToken(null);
        setUser(null);
        router.push('/login');
    }, [router]);

    // Refresh auth if needed
    const refreshAuth = useCallback(async (): Promise<boolean> => {
        const expired = await isTokenExpired();
        if (expired) {
            return await tryRefreshToken();
        }
        return true;
    }, [tryRefreshToken]);

    // Get headers for API requests
    const getAuthHeaders = useCallback(async (): Promise<HeadersInit> => {
        // Refresh if needed
        await refreshAuth();
        
        const token = await getAccessToken();
        if (!token) {
            return {
                'Content-Type': 'application/json',
            };
        }

        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        };
    }, [refreshAuth]);

    const value: AuthContextType = {
        user,
        accessToken,
        isAuthenticated: !!accessToken && !!user,
        isLoading,
        login,
        logout,
        refreshAuth,
        getAuthHeaders,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

/*
 * useAuth - Hook to access auth context
 *
 * This is the main hook for auth in the app. Use it to:
 * - Check if user is authenticated
 * - Get user info
 * - Get auth headers for API calls
 * - Log out
 *
 * Replaces useAuth() from @workos-inc/authkit-react
 */
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

/*
 * useRequireAuth - Hook for protected routes
 *
 * Use this in pages that require authentication.
 * Automatically redirects to login if not authenticated.
 *
 * Usage:
 *   const { isAuthenticated, isLoading } = useRequireAuth();
 *   if (isLoading) return <Loading />;
 *   // User is authenticated, render page
 */
export function useRequireAuth(redirectTo: string = '/login') {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push(redirectTo);
        }
    }, [isAuthenticated, isLoading, router, redirectTo]);

    return { isAuthenticated, isLoading };
}
