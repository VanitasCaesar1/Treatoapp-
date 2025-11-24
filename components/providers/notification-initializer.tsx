'use client';

import { useEffect } from 'react';
import { useNotifications } from '@/lib/hooks/use-notifications';

export function NotificationInitializer() {
  useNotifications();
  return null;
}
