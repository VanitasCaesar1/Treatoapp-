import { useEffect, useCallback } from 'react';
import { App, AppState } from '@capacitor/app';

interface VideoAppStateOptions {
    onActive?: () => void;
    onInactive?: () => void;
    onBackground?: () => void;
    pauseVideoOnBackground?: boolean;
}

/**
 * Handle app lifecycle events during video call
 * Manage video/audio state when app goes to background
 */
export function useVideoAppState(options: VideoAppStateOptions) {
    const {
        onActive,
        onInactive,
        onBackground,
        pauseVideoOnBackground = true
    } = options;

    const handleStateChange = useCallback(async (state: AppState) => {
        console.log('App state changed:', state.isActive);

        if (state.isActive) {
            // App came to foreground
            onActive?.();
        } else {
            // App went to background
            onBackground?.();

            // Future enhancement: continue audio-only in background
            // For now, we'll pause the entire call
        }
    }, [onActive, onBackground]);

    useEffect(() => {
        // Add state change listener
        const listener = App.addListener('appStateChange', handleStateChange);

        return () => {
            listener.remove();
        };
    }, [handleStateChange]);

    // Get current app state
    const getState = useCallback(async () => {
        const state = await App.getState();
        return state.isActive;
    }, []);

    return {
        getState
    };
}
