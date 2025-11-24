'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface UserData {
    profilePictureUrl?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
}

interface UserSessionContextType {
    user: UserData | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

const UserSessionContext = createContext<UserSessionContextType | undefined>(undefined);

export function UserSessionProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUserSession = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch('/api/auth/session');
            if (!response.ok) {
                throw new Error('Failed to fetch user session');
            }

            const data = await response.json();
            setUser(data.user);
        } catch (err) {
            console.error('Error fetching user session:', err);
            setError(err instanceof Error ? err.message : 'Unknown error');
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUserSession();
    }, [fetchUserSession]);

    const value: UserSessionContextType = {
        user,
        isLoading,
        error,
        refetch: fetchUserSession,
    };

    return (
        <UserSessionContext.Provider value={value}>
            {children}
        </UserSessionContext.Provider>
    );
}

export function useUserSession() {
    const context = useContext(UserSessionContext);
    if (context === undefined) {
        throw new Error('useUserSession must be used within a UserSessionProvider');
    }
    return context;
}
