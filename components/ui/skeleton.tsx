import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'card' | 'avatar' | 'list';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export function Skeleton({
  className,
  variant = 'text',
  width,
  height,
  lines = 1,
}: SkeletonProps) {
  const baseClasses = cn(
    'animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200',
    'bg-[length:200%_100%]',
    'rounded-lg',
    className
  );

  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    animation: 'shimmer 2s infinite linear',
  };

  if (variant === 'text') {
    if (lines === 1) {
      return (
        <div
          className={cn(baseClasses, 'h-4')}
          style={style}
          role="status"
          aria-label="Loading content"
        />
      );
    }

    return (
      <div className="space-y-2" role="status" aria-label="Loading content">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              baseClasses,
              'h-4',
              i === lines - 1 && 'w-3/4'
            )}
            style={style}
          />
        ))}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div
        className={cn(baseClasses, 'h-48 w-full')}
        style={style}
        role="status"
        aria-label="Loading card"
      />
    );
  }

  if (variant === 'avatar') {
    return (
      <div
        className={cn(baseClasses, 'h-12 w-12 rounded-full')}
        style={style}
        role="status"
        aria-label="Loading avatar"
      />
    );
  }

  if (variant === 'list') {
    return (
      <div className="space-y-4" role="status" aria-label="Loading list">
        {Array.from({ length: lines || 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className={cn(baseClasses, 'h-12 w-12 rounded-full')} style={style} />
            <div className="flex-1 space-y-2">
              <div className={cn(baseClasses, 'h-4 w-3/4')} style={style} />
              <div className={cn(baseClasses, 'h-3 w-1/2')} style={style} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={baseClasses}
      style={style}
      role="status"
      aria-label="Loading content"
    />
  );
}

// Preset skeleton components for common use cases
export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return <Skeleton variant="text" lines={lines} className={className} />;
}

export function SkeletonCard({ className }: { className?: string }) {
  return <Skeleton variant="card" className={className} />;
}

export function SkeletonAvatar({ className }: { className?: string }) {
  return <Skeleton variant="avatar" className={className} />;
}

export function SkeletonList({ items = 3, className }: { items?: number; className?: string }) {
  return <Skeleton variant="list" lines={items} className={className} />;
}
