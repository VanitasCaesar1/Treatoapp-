'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Geolocation } from '@capacitor/geolocation';
import { Preferences } from '@capacitor/preferences';

interface LocationData {
    latitude: number;
    longitude: number;
    address?: string;
    city?: string;
    area?: string;
}

interface LocationContextType {
    location: LocationData | null;
    isLoading: boolean;
    error: string | null;
    requestLocation: () => Promise<void>;
    setManualLocation: (location: LocationData) => void;
    clearLocation: () => void;
    hasPermission: boolean;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
    const [location, setLocation] = useState<LocationData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasPermission, setHasPermission] = useState(false);

    // Load saved location on mount
    useEffect(() => {
        loadSavedLocation();
        checkPermission();
    }, []);

    const loadSavedLocation = async () => {
        try {
            const { value } = await Preferences.get({ key: 'user_location' });
            if (value) {
                setLocation(JSON.parse(value));
            }
        } catch (err) {
            console.error('Failed to load saved location:', err);
        }
    };

    const checkPermission = async () => {
        try {
            const permission = await Geolocation.checkPermissions();
            setHasPermission(permission.location === 'granted');
        } catch (err) {
            console.error('Failed to check permission:', err);
            setHasPermission(false);
        }
    };

    const reverseGeocode = async (lat: number, lng: number): Promise<Partial<LocationData>> => {
        try {
            // Using a free geocoding service (Nominatim)
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            );
            const data = await response.json();

            return {
                address: data.display_name,
                city: data.address?.city || data.address?.town || data.address?.village,
                area: data.address?.suburb || data.address?.neighbourhood,
            };
        } catch (err) {
            console.error('Reverse geocoding failed:', err);
            return {};
        }
    };

    const requestLocation = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Request permission first
            const permission = await Geolocation.requestPermissions();

            if (permission.location !== 'granted') {
                setError('Location permission denied');
                setHasPermission(false);
                setIsLoading(false);
                return;
            }

            setHasPermission(true);

            // Get current position
            const position = await Geolocation.getCurrentPosition({
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            });

            const { latitude, longitude } = position.coords;

            // Reverse geocode to get address
            const addressData = await reverseGeocode(latitude, longitude);

            const locationData: LocationData = {
                latitude,
                longitude,
                ...addressData,
            };

            setLocation(locationData);

            // Save to preferences
            await Preferences.set({
                key: 'user_location',
                value: JSON.stringify(locationData),
            });
        } catch (err: any) {
            console.error('Location error:', err);
            setError(err.message || 'Failed to get location');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const setManualLocation = useCallback(async (locationData: LocationData) => {
        setLocation(locationData);
        await Preferences.set({
            key: 'user_location',
            value: JSON.stringify(locationData),
        });
    }, []);

    const clearLocation = useCallback(async () => {
        setLocation(null);
        await Preferences.remove({ key: 'user_location' });
    }, []);

    return (
        <LocationContext.Provider
            value={{
                location,
                isLoading,
                error,
                requestLocation,
                setManualLocation,
                clearLocation,
                hasPermission,
            }}
        >
            {children}
        </LocationContext.Provider>
    );
}

export function useLocation() {
    const context = useContext(LocationContext);
    if (context === undefined) {
        throw new Error('useLocation must be used within a LocationProvider');
    }
    return context;
}
