'use client';

import { useEffect } from 'react';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { useRouter } from 'next/navigation';

export function useBackButton(onBack?: () => boolean | void) {
  const router = useRouter();

  useEffect(() => {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') {
      return;
    }

    let listenerHandle: any = null;

    // addListener returns a Promise, so we need to await it
    App.addListener('backButton', ({ canGoBack }) => {
      // If custom handler provided, use it
      if (onBack) {
        const shouldPreventDefault = onBack();
        if (shouldPreventDefault === false) return;
      }

      // Default behavior: go back if possible, otherwise minimize app
      if (canGoBack) {
        router.back();
      } else {
        App.minimizeApp();
      }
    }).then((handle) => {
      listenerHandle = handle;
    });

    return () => {
      if (listenerHandle) {
        listenerHandle.remove();
      }
    };
  }, [onBack, router]);
}
