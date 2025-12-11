import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useUserSession } from '@/lib/contexts/user-session-context';

export interface UserRoles {
    roles: string[];
    isDoctor: boolean;
    isAdmin: boolean;
    loading: boolean;
}

export function useUserRoles(): UserRoles {
    const { user, isLoading: sessionLoading } = useUserSession();
    const [roles, setRoles] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Don't fetch roles if session is still loading or user is not authenticated
        if (sessionLoading) {
            return;
        }

        if (!user) {
            // Not authenticated - don't fetch roles, just set defaults
            setRoles(['patient']);
            setLoading(false);
            return;
        }

        async function fetchRoles() {
            try {
                const response = await api.get('/user/roles');
                const userRoles = response.roles || ['patient'];
                setRoles(userRoles);
            } catch (error) {
                console.error('Failed to fetch user roles:', error);
                setRoles(['patient']); // Default to patient role
            } finally {
                setLoading(false);
            }
        }

        fetchRoles();
    }, [user, sessionLoading]);

    return {
        roles,
        isDoctor: roles.includes('doctor'),
        isAdmin: roles.includes('admin') || roles.includes('super_admin'),
        loading: loading || sessionLoading,
    };
}
