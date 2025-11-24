'use client';

import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ErrorDisplayProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  variant?: 'page' | 'card' | 'inline';
  className?: string;
}

export function ErrorDisplay({
  title = 'Something went wrong',
  message,
  onRetry,
  variant = 'page',
  className,
}: ErrorDisplayProps) {
  const isPage = variant === 'page';
  const isCard = variant === 'card';

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        isPage && 'min-h-[60vh] px-6',
        isCard && 'py-8 px-6 bg-white rounded-airbnb-lg border border-gray-100',
        variant === 'inline' && 'py-4 px-4',
        className
      )}
    >
      <div className={cn(
        'bg-red-50 rounded-full flex items-center justify-center mb-4',
        isPage && 'w-16 h-16',
        'w-14 h-14'
      )}>
        <AlertTriangle className={cn(
          'text-red-500',
          isPage && 'h-8 w-8',
          'h-7 w-7'
        )} />
      </div>
      <h3 className={cn(
        'font-bold text-gray-900 mb-2',
        isPage && 'text-lg',
        'text-base'
      )}>
        {title}
      </h3>
      <p className={cn(
        'text-gray-600 leading-relaxed max-w-sm',
        isPage && 'text-base mb-8',
        'text-sm mb-6'
      )}>
        {message}
      </p>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          className={cn(
            'rounded-full font-medium',
            isPage && 'w-full max-w-xs h-12'
          )}
        >
          Try Again
        </Button>
      )}
    </div>
  );
}
