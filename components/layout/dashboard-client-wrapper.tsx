'use client';

import { useBackButton } from '@/lib/hooks/use-back-button';
import { useAppState } from '@/lib/hooks/use-app-state';
import { usePathname } from 'next/navigation';
import { LocationPromptDrawer } from '@/components/location/location-prompt-drawer';

export function DashboardClientWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Handle Android back button
  useBackButton(() => {
    // On dashboard home, minimize app instead of going back
    if (pathname === '/dashboard') {
      return false; // Let default behavior minimize app
    }
    // On other pages, allow normal back navigation
    return true;
  });

  // Handle app state changes (resume/pause)
  useAppState(
    () => {
      // On resume: refresh data, check notifications, etc.
      console.log('App resumed');
    },
    () => {
      // On pause: save state, pause timers, etc.
      console.log('App paused');
    }
  );

  return (
    <>
      {children}
      {/* Global Location Prompt - shows when no location is set */}
      <LocationPromptDrawer />
    </>
  );
}
