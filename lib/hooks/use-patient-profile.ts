'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@workos-inc/authkit-react';
import { Patient, UpdatePatientInput } from '@/lib/types/patient';
import { getPatientProfile, updatePatientProfile } from '@/lib/api/patients';

const CACHE_KEY_PREFIX = 'patient_profile_';
const CACHE_VERSION = '1.0';
const CACHE_EXPIRY_DAYS = 7;

interface CachedProfile {
    data: Patient;
    timestamp: number;
    version: string;
}

export function usePatientProfile() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<Patient | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    /**
     * Get cache key for current user
     */
    const getCacheKey = useCallback(() => {
        return user ? `${CACHE_KEY_PREFIX}${user.id}` : null;
    }, [user]);

    /**
     * Load profile from cache
     */
    const loadFromCache = useCallback((): Patient | null => {
        const cacheKey = getCacheKey();
        if (!cacheKey) return null;

        try {
            const cached = localStorage.getItem(cacheKey);
            if (!cached) return null;

            const { data, timestamp, version }: CachedProfile = JSON.parse(cached);

            // Check version
            if (version !== CACHE_VERSION) {
                localStorage.removeItem(cacheKey);
                return null;
            }

            // Check expiry (7 days)
            const now = Date.now();
            const expiryTime = CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
            if (now - timestamp > expiryTime) {
                localStorage.removeItem(cacheKey);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Failed to load from cache:', error);
            return null;
        }
    }, [getCacheKey]);

    /**
     * Save profile to cache
     */
    const saveToCache = useCallback((profileData: Patient) => {
        const cacheKey = getCacheKey();
        if (!cacheKey) return;

        try {
            const cached: CachedProfile = {
                data: profileData,
                timestamp: Date.now(),
                version: CACHE_VERSION
            };
            localStorage.setItem(cacheKey, JSON.stringify(cached));
        } catch (error) {
            console.error('Failed to save to cache:', error);
        }
    }, [getCacheKey]);

    /**
     * Clear cache
     */
    const clearCache = useCallback(() => {
        const cacheKey = getCacheKey();
        if (cacheKey) {
            localStorage.removeItem(cacheKey);
        }
    }, [getCacheKey]);

    /**
     * Fetch profile from API
     */
    const fetchProfile = useCallback(async (skipCache = false) => {
        if (!user) {
            setLoading(false);
            return;
        }

        try {
            setError(null);

            // Try cache first
            if (!skipCache) {
                const cachedProfile = loadFromCache();
                if (cachedProfile) {
                    setProfile(cachedProfile);
                    setLoading(false);
                    // Still fetch in background to update
                    fetchProfile(true);
                    return;
                }
            }

            const profileData = await getPatientProfile(user.id);

            if (profileData) {
                setProfile(profileData);
                saveToCache(profileData);
            } else {
                // Profile doesn't exist - set error
                setError('Profile not found. Please contact support.');
            }
        } catch (err: any) {
            console.error('Failed to fetch profile:', err);
            setError(err.message || 'Failed to load profile');
        } finally {
            setLoading(false);
        }
    }, [user, loadFromCache, saveToCache]);

    /**
     * Update profile with optimistic update
     */
    const updateProfile = useCallback(async (updates: UpdatePatientInput): Promise<boolean> => {
        if (!profile) return false;

        // Optimistic update
        const updatedProfile = { ...profile, ...updates };
        setProfile(updatedProfile);
        saveToCache(updatedProfile);

        try {
            const result = await updatePatientProfile(profile.id, updates);
            setProfile(result);
            saveToCache(result);
            return true;
        } catch (err: any) {
            console.error('Failed to update profile:', err);
            setError(err.message || 'Failed to update profile');
            // Revert optimistic update
            setProfile(profile);
            return false;
        }
    }, [profile, saveToCache]);

    /**
     * Refresh profile from API
     */
    const refreshProfile = useCallback(() => {
        setLoading(true);
        fetchProfile(true);
    }, [fetchProfile]);

    // Initial fetch
    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    // Sync on app foreground (visibilitychange)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden && user) {
                refreshProfile();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [user, refreshProfile]);

    return {
        profile,
        loading,
        error,
        updateProfile,
        refreshProfile,
        clearCache
    };
}
