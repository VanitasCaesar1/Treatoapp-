'use client';

import { useCapacitor } from '@/lib/capacitor';
import { cn } from '@/lib/utils';

interface HapticPressableProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hapticStyle?: 'light' | 'medium' | 'heavy';
  disabled?: boolean;
}

export function HapticPressable({
  children,
  hapticStyle = 'light',
  disabled = false,
  onClick,
  className,
  ...props
}: HapticPressableProps) {
  const capacitor = useCapacitor();

  const handleClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return;
    
    // Trigger haptic feedback
    if (hapticStyle === 'light') {
      await capacitor.lightHaptic();
    } else if (hapticStyle === 'medium') {
      await capacitor.mediumHaptic();
    } else {
      await capacitor.heavyHaptic();
    }

    onClick?.(e);
  };

  return (
    <div
      className={cn(
        'cursor-pointer active:scale-[0.98] transition-transform',
        disabled && 'opacity-50 pointer-events-none',
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {children}
    </div>
  );
}
