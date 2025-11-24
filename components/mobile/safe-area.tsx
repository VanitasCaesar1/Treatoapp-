'use client';

import { cn } from '@/lib/utils';

interface SafeAreaProps {
  children: React.ReactNode;
  className?: string;
  top?: boolean;
  bottom?: boolean;
}

export function SafeArea({ children, className, top = true, bottom = true }: SafeAreaProps) {
  return (
    <div
      className={cn(
        'w-full h-full',
        top && 'pt-[env(safe-area-inset-top)]',
        bottom && 'pb-[env(safe-area-inset-bottom)]',
        className
      )}
    >
      {children}
    </div>
  );
}
