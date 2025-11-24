'use client';

import { Badge } from './badge';
import { cn } from '@/lib/utils';

interface BadgeGroupProps {
  items: string[];
  max?: number;
  variant?: 'default' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function BadgeGroup({
  items,
  max = 3,
  variant = 'secondary',
  size = 'sm',
  className,
}: BadgeGroupProps) {
  const displayItems = items.slice(0, max);
  const remaining = items.length - max;

  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {displayItems.map((item, index) => (
        <Badge key={index} variant={variant} className={cn(
          size === 'sm' && 'text-xs px-2 py-0.5',
          size === 'lg' && 'text-sm px-3 py-1'
        )}>
          {item}
        </Badge>
      ))}
      {remaining > 0 && (
        <Badge variant="outline" className={cn(
          size === 'sm' && 'text-xs px-2 py-0.5',
          size === 'lg' && 'text-sm px-3 py-1'
        )}>
          +{remaining}
        </Badge>
      )}
    </div>
  );
}
