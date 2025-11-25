'use client';

import { useCallback, useRef } from 'react';
import { useCapacitor } from '@/lib/capacitor';

interface UseLongPressOptions {
  onLongPress: () => void;
  onClick?: () => void;
  delay?: number;
  haptic?: boolean;
}

export function useLongPress({
  onLongPress,
  onClick,
  delay = 500,
  haptic = true,
}: UseLongPressOptions) {
  const capacitor = useCapacitor();
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const isLongPress = useRef(false);

  const start = useCallback(() => {
    isLongPress.current = false;
    timeoutRef.current = setTimeout(async () => {
      isLongPress.current = true;
      if (haptic) {
        await capacitor.mediumHaptic();
      }
      onLongPress();
    }, delay);
  }, [onLongPress, delay, haptic, capacitor]);

  const clear = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const handleClick = useCallback(() => {
    if (!isLongPress.current && onClick) {
      onClick();
    }
  }, [onClick]);

  return {
    onMouseDown: start,
    onMouseUp: clear,
    onMouseLeave: clear,
    onTouchStart: start,
    onTouchEnd: clear,
    onClick: handleClick,
  };
}
