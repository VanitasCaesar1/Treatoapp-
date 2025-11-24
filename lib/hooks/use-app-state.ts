'use client';

import { useEffect, useState } from 'react';
import { App, AppState } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

export function useAppState(onResume?: () => void, onPause?: () => void) {
  const [appState, setAppState] = useState<AppState>({ isActive: true });

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const stateListener = App.addListener('appStateChange', (state) => {
      setAppState(state);
      
      if (state.isActive && onResume) {
        onResume();
      } else if (!state.isActive && onPause) {
        onPause();
      }
    });

    return () => {
      stateListener.remove();
    };
  }, [onResume, onPause]);

  return appState;
}
