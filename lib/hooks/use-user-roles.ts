import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export interface UserRoles {
    roles: string[];
    isDoctor: boolean;
    isAdmin: boolean;
    loading: boolean;
}

export function useUserRoles(): UserRoles {
    const [roles, setRoles] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
    }, []);

    return {
        roles,
        isDoctor: roles.includes('doctor'),
        isAdmin: roles.includes('admin') || roles.includes('super_admin'),
        loading,
    };
}
