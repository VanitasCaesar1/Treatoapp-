import { cn } from '@/lib/utils';
import { CheckCircle, Clock, XCircle, Calendar } from 'lucide-react';

export type BadgeVariant = 
  | 'default' 
  | 'secondary'
  | 'outline'
  | 'destructive'
  | 'confirmed' 
  | 'pending' 
  | 'cancelled' 
  | 'completed'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: BadgeVariant;
  icon?: React.ComponentType<{ className?: string }>;
}

const variantConfig = {
  default: {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-200',
    icon: null,
  },
  secondary: {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-200',
    icon: null,
  },
  outline: {
    bg: 'bg-transparent',
    text: 'text-gray-700',
    border: 'border-gray-300',
    icon: null,
  },
  destructive: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    icon: null,
  },
  confirmed: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
    icon: CheckCircle,
  },
  pending: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    border: 'border-yellow-200',
    icon: Clock,
  },
  cancelled: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    icon: XCircle,
  },
  completed: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    icon: CheckCircle,
  },
  success: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
    icon: CheckCircle,
  },
  warning: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    border: 'border-yellow-200',
    icon: Clock,
  },
  error: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    icon: XCircle,
  },
  info: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    icon: Calendar,
  },
};

export function Badge({
  children,
  variant = 'default',
  icon: CustomIcon,
  className,
  ...props
}: BadgeProps) {
  const config = variantConfig[variant];
  const Icon = CustomIcon || config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5',
        'px-3 py-1',
        'text-xs font-semibold',
        'rounded-full',
        config.bg,
        config.text,
        className
      )}
      {...props}
    >
      {Icon && <Icon className="w-3 h-3" />}
      {children}
    </span>
  );
}

// Preset badge components for common appointment statuses
export function ConfirmedBadge({ className }: { className?: string }) {
  return (
    <Badge variant="confirmed" className={className}>
      Confirmed
    </Badge>
  );
}

export function PendingBadge({ className }: { className?: string }) {
  return (
    <Badge variant="pending" className={className}>
      Pending
    </Badge>
  );
}

export function CancelledBadge({ className }: { className?: string }) {
  return (
    <Badge variant="cancelled" className={className}>
      Cancelled
    </Badge>
  );
}

export function CompletedBadge({ className }: { className?: string }) {
  return (
    <Badge variant="completed" className={className}>
      Completed
    </Badge>
  );
}
