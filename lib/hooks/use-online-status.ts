'use client';

import { useNetwork } from './use-network';
import { useEffect } from 'react';
import { showToast } from '@/lib/utils/toast';

/**
 * Show toast notifications when network status changes
 */
export function useOnlineStatus(showNotifications = true) {
  const { isOnline } = useNetwork();

  useEffect(() => {
    if (!showNotifications) return;

    // Don't show notification on initial mount
    const isInitialMount = sessionStorage.getItem('network_initialized') === null;
    if (isInitialMount) {
      sessionStorage.setItem('network_initialized', 'true');
      return;
    }

    if (isOnline) {
      showToast.success('Back online', 'network-online');
    } else {
      showToast.error('No internet connection', 'network-offline');
    }
  }, [isOnline, showNotifications]);

  return { isOnline };
}
