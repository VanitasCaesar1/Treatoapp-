'use client';

import { useNetwork } from '@/lib/hooks/use-network';
import { WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export function NetworkStatus() {
  const { isOnline } = useNetwork();

  if (isOnline) return null;

  return (
    <div className={cn(
      "fixed top-0 left-0 right-0 z-50 bg-red-500 text-white px-4 py-2 text-center text-sm font-medium",
      "flex items-center justify-center gap-2 shadow-lg",
      "animate-slide-down"
    )}>
      <WifiOff className="h-4 w-4" />
      <span>No internet connection</span>
    </div>
  );
}
