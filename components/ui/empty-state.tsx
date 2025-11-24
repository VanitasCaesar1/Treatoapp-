'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';

// Dynamically import Lottie to avoid SSR issues
const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  lottieAnimation?: any; // Lottie animation JSON
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon: Icon,
  lottieAnimation,
  primaryAction,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-6 text-center',
        className
      )}
    >
      {/* Animation or Icon */}
      <div className="mb-6">
        {lottieAnimation ? (
          <div className="w-48 h-48">
            <Lottie
              animationData={lottieAnimation}
              loop={true}
              autoplay={true}
              className="w-full h-full"
            />
          </div>
        ) : Icon ? (
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
            <Icon className="h-10 w-10 text-gray-400" />
          </div>
        ) : null}
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="text-base text-gray-600 mb-8 max-w-sm leading-relaxed">
          {description}
        </p>
      )}

      {/* Actions */}
      {(primaryAction || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
          {primaryAction && (
            <Button
              onClick={primaryAction.onClick}
              className="flex-1 h-12 bg-medical-blue hover:bg-medical-blue-dark rounded-full shadow-medical hover:shadow-medical-lg"
            >
              {primaryAction.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="outline"
              onClick={secondaryAction.onClick}
              className="flex-1 h-12 rounded-full border-2"
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
