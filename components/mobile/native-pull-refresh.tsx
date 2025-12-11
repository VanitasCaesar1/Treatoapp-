'use client';

import React, { useRef, useState, useCallback, ReactNode } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';
import { Loader2, ArrowDown } from 'lucide-react';

interface NativePullRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  threshold?: number;
  resistance?: number;
  disabled?: boolean;
}

/**
 * Native-feeling pull-to-refresh component
 */
export function NativePullRefresh({
  children,
  onRefresh,
  threshold = 80,
  resistance = 2.5,
  disabled = false,
}: NativePullRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const pullDistance = useMotionValue(0);
  const triggeredHaptic = useRef(false);

  // Transform pull distance to indicator opacity and scale
  const indicatorOpacity = useTransform(pullDistance, [0, threshold * 0.5, threshold], [0, 0.5, 1]);
  const indicatorScale = useTransform(pullDistance, [0, threshold], [0.5, 1]);
  const indicatorRotate = useTransform(pullDistance, [0, threshold], [0, 180]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled || isRefreshing) return;
    
    const scrollTop = containerRef.current?.scrollTop || 0;
    if (scrollTop > 0) return; // Only pull when at top
    
    startY.current = e.touches[0].clientY;
    setIsPulling(true);
    triggeredHaptic.current = false;
  }, [disabled, isRefreshing]);

  const handleTouchMove = useCallback(async (e: React.TouchEvent) => {
    if (!isPulling || disabled || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;

    if (diff > 0) {
      // Apply resistance
      const distance = diff / resistance;
      pullDistance.set(Math.min(distance, threshold * 1.5));

      // Haptic feedback at threshold
      if (distance >= threshold && !triggeredHaptic.current && Capacitor.isNativePlatform()) {
        triggeredHaptic.current = true;
        await Haptics.impact({ style: ImpactStyle.Medium });
      }
    }
  }, [isPulling, disabled, isRefreshing, pullDistance, threshold, resistance]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling) return;

    const distance = pullDistance.get();
    
    if (distance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      pullDistance.set(threshold * 0.6); // Keep indicator visible

      if (Capacitor.isNativePlatform()) {
        await Haptics.impact({ style: ImpactStyle.Heavy });
      }

      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        pullDistance.set(0);
      }
    } else {
      pullDistance.set(0);
    }

    setIsPulling(false);
  }, [isPulling, pullDistance, threshold, isRefreshing, onRefresh]);

  return (
    <div className="relative overflow-hidden">
      {/* Pull indicator */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 z-10 flex items-center justify-center"
        style={{
          top: useTransform(pullDistance, (v) => v - 50),
          opacity: indicatorOpacity,
          scale: indicatorScale,
        }}
      >
        <div className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center">
          {isRefreshing ? (
            <Loader2 className="w-5 h-5 text-gray-600 animate-spin" />
          ) : (
            <motion.div style={{ rotate: indicatorRotate }}>
              <ArrowDown className="w-5 h-5 text-gray-600" />
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        ref={containerRef}
        className="overflow-auto"
        style={{
          y: useTransform(pullDistance, (v) => Math.min(v, threshold)),
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </motion.div>
    </div>
  );
}
