'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

interface SwipeBackOptions {
  threshold?: number;
  edgeWidth?: number;
  enabled?: boolean;
}

/**
 * iOS-style swipe back gesture for Android
 * iOS handles this natively, so we only enable on Android/Web
 */
export function useSwipeBack(options: SwipeBackOptions = {}) {
  const { threshold = 100, edgeWidth = 30, enabled = true } = options;
  const router = useRouter();
  const startX = useRef(0);
  const startY = useRef(0);
  const [swipeProgress, setSwipeProgress] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

  useEffect(() => {
    // Only enable on Android (iOS has native gesture)
    if (!enabled || Capacitor.getPlatform() === 'ios') return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      // Only start if touch begins near left edge
      if (touch.clientX <= edgeWidth) {
        startX.current = touch.clientX;
        startY.current = touch.clientY;
        setIsSwiping(true);
      }
    };

    const handleTouchMove = async (e: TouchEvent) => {
      if (!isSwiping) return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - startX.current;
      const deltaY = Math.abs(touch.clientY - startY.current);

      // Cancel if vertical scroll
      if (deltaY > 50) {
        setIsSwiping(false);
        setSwipeProgress(0);
        return;
      }

      if (deltaX > 0) {
        const progress = Math.min(deltaX / threshold, 1);
        setSwipeProgress(progress);

        // Haptic at 50% and 100%
        if (progress >= 0.5 && progress < 0.6) {
          await Haptics.impact({ style: ImpactStyle.Light });
        }
        if (progress >= 1) {
          await Haptics.impact({ style: ImpactStyle.Medium });
        }
      }
    };

    const handleTouchEnd = async () => {
      if (swipeProgress >= 1) {
        await Haptics.impact({ style: ImpactStyle.Medium });
        router.back();
      }
      setIsSwiping(false);
      setSwipeProgress(0);
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled, edgeWidth, threshold, isSwiping, swipeProgress, router]);

  return { swipeProgress, isSwiping };
}

/**
 * Swipe indicator component
 */
export function SwipeBackIndicator({ progress }: { progress: number }) {
  if (progress === 0) return null;

  return (
    <div
      className="fixed left-0 top-0 bottom-0 z-50 pointer-events-none"
      style={{
        width: `${progress * 100}%`,
        maxWidth: '100px',
        background: `linear-gradient(to right, rgba(0,0,0,${progress * 0.3}), transparent)`,
      }}
    >
      <div
        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center"
        style={{
          opacity: progress,
          transform: `translateY(-50%) scale(${0.5 + progress * 0.5})`,
        }}
      >
        <svg
          className="w-4 h-4 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </div>
    </div>
  );
}
