'use client';

import { useEffect } from 'react';
import { CapacitorService } from '@/lib/capacitor';
import { initializeHealthTipNotifications } from '@/lib/services/notifications';
import { setupKeyboardDismiss } from '@/lib/utils/mobile';
import { useDeepLinks } from '@/lib/capacitor/deep-links';

interface CapacitorProviderProps {
  children: React.ReactNode;
}

export function CapacitorProvider({ children }: CapacitorProviderProps) {
  // Initialize deep link listener
  useDeepLinks();

  useEffect(() => {
    // Initialize Capacitor when the app loads
    CapacitorService.initializeApp();

    // Initialize daily health tip notifications
    initializeHealthTipNotifications();

    // Setup keyboard dismiss on tap outside
    const cleanup = setupKeyboardDismiss();

    return cleanup;
  }, []);

  return <>{children}</>;
}