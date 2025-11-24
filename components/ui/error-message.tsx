'use client';

import { AlertTriangle } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorMessage({
  title = 'Something went wrong',
  message,
  onRetry,
  className,
}: ErrorMessageProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-8 px-6 text-center',
      className
    )}>
      <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-4">
        <AlertTriangle className="h-7 w-7 text-red-500" />
      </div>
      <h3 className="text-base font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-600 mb-6 max-w-sm">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="rounded-full">
          Try Again
        </Button>
      )}
    </div>
  );
}
