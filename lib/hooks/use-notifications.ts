import { useEffect } from 'react';
import { initializeHealthTipNotifications } from '@/lib/services/notifications';

export function useNotifications() {
  useEffect(() => {
    // Initialize notifications when app loads
    initializeHealthTipNotifications();
  }, []);

  return {
    scheduleHealthTips: initializeHealthTipNotifications,
  };
}
