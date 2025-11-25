'use client';

import { useEffect, useState } from 'react';
import { App, AppState } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

export function useAppState(onResume?: () => void, onPause?: () => void) {
  const [appState, setAppState] = useState<AppState>({ isActive: true });

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let listenerHandle: any = null;

    // addListener returns a Promise, so we need to await it
    App.addListener('appStateChange', (state) => {
      setAppState(state);

      if (state.isActive && onResume) {
        onResume();
      } else if (!state.isActive && onPause) {
        onPause();
      }
    }).then((handle) => {
      listenerHandle = handle;
    });

    return () => {
      if (listenerHandle) {
        listenerHandle.remove();
      }
    };
  }, [onResume, onPause]);

  return appState;
}
