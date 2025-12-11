'use client';

import { useEffect, useRef, useCallback } from 'react';
import { App, AppState } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

interface AppLifecycleCallbacks {
  onForeground?: () => void | Promise<void>;
  onBackground?: () => void | Promise<void>;
  onResume?: () => void | Promise<void>;
  onPause?: () => void | Promise<void>;
}

/**
 * Hook to handle app lifecycle events
 * Useful for refreshing data when app comes to foreground
 */
export function useAppLifecycle(callbacks: AppLifecycleCallbacks) {
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const stateHandler = App.addListener('appStateChange', async (state: AppState) => {
      if (state.isActive) {
        // App came to foreground
        await callbacksRef.current.onForeground?.();
        await callbacksRef.current.onResume?.();
      } else {
        // App went to background
        await callbacksRef.current.onBackground?.();
        await callbacksRef.current.onPause?.();
      }
    });

    return () => {
      stateHandler.then(h => h.remove());
    };
  }, []);
}

/**
 * Hook to refresh data when app comes to foreground
 */
export function useRefreshOnForeground(refreshFn: () => void | Promise<void>) {
  const lastRefreshRef = useRef<number>(Date.now());
  const MIN_REFRESH_INTERVAL = 30000; // 30 seconds

  useAppLifecycle({
    onForeground: async () => {
      const now = Date.now();
      if (now - lastRefreshRef.current > MIN_REFRESH_INTERVAL) {
        lastRefreshRef.current = now;
        await refreshFn();
      }
    },
  });
}

/**
 * Hook to save state when app goes to background
 */
export function useSaveOnBackground(saveFn: () => void | Promise<void>) {
  useAppLifecycle({
    onBackground: saveFn,
  });
}

/**
 * Hook to track time spent in app
 */
export function useSessionTracking() {
  const sessionStartRef = useRef<number>(Date.now());
  const totalTimeRef = useRef<number>(0);

  useAppLifecycle({
    onForeground: () => {
      sessionStartRef.current = Date.now();
    },
    onBackground: () => {
      const sessionDuration = Date.now() - sessionStartRef.current;
      totalTimeRef.current += sessionDuration;
    },
  });

  const getSessionDuration = useCallback(() => {
    return Date.now() - sessionStartRef.current;
  }, []);

  const getTotalTime = useCallback(() => {
    return totalTimeRef.current + getSessionDuration();
  }, [getSessionDuration]);

  return { getSessionDuration, getTotalTime };
}

/**
 * Hook to handle back button on Android
 */
export function useBackButton(handler: () => boolean | void) {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const backHandler = App.addListener('backButton', ({ canGoBack }) => {
      const handled = handler();
      
      // If handler returns false or undefined, use default behavior
      if (handled === false || handled === undefined) {
        if (canGoBack) {
          window.history.back();
        } else {
          App.exitApp();
        }
      }
    });

    return () => {
      backHandler.then(h => h.remove());
    };
  }, [handler]);
}

/**
 * Hook to prevent accidental app exit
 */
export function useExitConfirmation(message: string = 'Press back again to exit') {
  const lastBackPressRef = useRef<number>(0);
  const DOUBLE_PRESS_DELAY = 2000;

  useBackButton(() => {
    const now = Date.now();
    
    if (now - lastBackPressRef.current < DOUBLE_PRESS_DELAY) {
      // Double press - exit app
      App.exitApp();
      return true;
    }
    
    lastBackPressRef.current = now;
    
    // Show toast (you'd implement this with your toast system)
    console.log(message);
    
    return true; // Prevent default back behavior
  });
}
