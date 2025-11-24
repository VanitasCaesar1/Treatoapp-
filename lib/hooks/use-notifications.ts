import { useEffect } from 'react';
import { notificationService } from '@/lib/services/notifications';

export function useNotifications() {
  useEffect(() => {
    // Initialize notifications when app loads
    notificationService.initialize();
  }, []);

  return {
    scheduleHealthTips: () => notificationService.scheduleDailyHealthTips(),
    cancelNotifications: () => notificationService.cancelAllNotifications(),
    getPending: () => notificationService.getPendingNotifications(),
  };
}
