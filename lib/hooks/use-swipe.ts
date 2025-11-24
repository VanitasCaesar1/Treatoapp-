'use client';

import { useRef, TouchEvent } from 'react';

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

interface SwipeConfig {
  minSwipeDistance?: number;
  maxSwipeTime?: number;
}

export function useSwipe(
  handlers: SwipeHandlers,
  config: SwipeConfig = {}
) {
  const { minSwipeDistance = 50, maxSwipeTime = 300 } = config;
  
  const touchStart = useRef<{ x: number; y: number; time: number } | null>(null);

  const onTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0];
    touchStart.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
  };

  const onTouchEnd = (e: TouchEvent) => {
    if (!touchStart.current) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.current.x;
    const deltaY = touch.clientY - touchStart.current.y;
    const deltaTime = Date.now() - touchStart.current.time;

    // Check if swipe was fast enough
    if (deltaTime > maxSwipeTime) {
      touchStart.current = null;
      return;
    }

    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    // Horizontal swipe
    if (absX > absY && absX > minSwipeDistance) {
      if (deltaX > 0) {
        handlers.onSwipeRight?.();
      } else {
        handlers.onSwipeLeft?.();
      }
    }
    // Vertical swipe
    else if (absY > absX && absY > minSwipeDistance) {
      if (deltaY > 0) {
        handlers.onSwipeDown?.();
      } else {
        handlers.onSwipeUp?.();
      }
    }

    touchStart.current = null;
  };

  return {
    onTouchStart,
    onTouchEnd,
  };
}
