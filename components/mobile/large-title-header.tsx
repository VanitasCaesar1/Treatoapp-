'use client';

import React, { useRef, useEffect, useState, ReactNode } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

interface LargeTitleHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightAction?: ReactNode;
  children: ReactNode;
  onBack?: () => void;
}

/**
 * iOS-style large title that shrinks on scroll
 */
export function LargeTitleHeader({
  title,
  subtitle,
  showBack = false,
  rightAction,
  children,
  onBack,
}: LargeTitleHeaderProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);

  // Track scroll position
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setScrollY(container.scrollTop);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Animation values
  const largeTitleOpacity = Math.max(0, 1 - scrollY / 50);
  const largeTitleScale = Math.max(0.8, 1 - scrollY / 200);
  const largeTitleY = Math.min(0, -scrollY * 0.5);
  const smallTitleOpacity = Math.min(1, scrollY / 50);
  const headerBg = scrollY > 30 ? 'rgba(255,255,255,0.95)' : 'transparent';
  const headerBorder = scrollY > 30 ? '1px solid rgba(0,0,0,0.1)' : 'none';

  const handleBack = async () => {
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style: ImpactStyle.Light });
    }
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Fixed header bar */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 px-4 h-14 flex items-center justify-between backdrop-blur-xl safe-area-top"
        style={{
          backgroundColor: headerBg,
          borderBottom: headerBorder,
        }}
      >
        {/* Left side */}
        <div className="w-20">
          {showBack && (
            <button
              onClick={handleBack}
              className="p-2 -ml-2 rounded-full active:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-900" />
            </button>
          )}
        </div>

        {/* Center - small title (appears on scroll) */}
        <motion.h1
          className="text-base font-semibold text-gray-900 truncate"
          style={{ opacity: smallTitleOpacity }}
        >
          {title}
        </motion.h1>

        {/* Right side */}
        <div className="w-20 flex justify-end">
          {rightAction}
        </div>
      </motion.header>

      {/* Scrollable content */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto pt-14 safe-area-top"
      >
        {/* Large title section */}
        <motion.div
          className="px-4 pt-2 pb-4"
          style={{
            opacity: largeTitleOpacity,
            transform: `scale(${largeTitleScale}) translateY(${largeTitleY}px)`,
            transformOrigin: 'left center',
          }}
        >
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          {subtitle && (
            <p className="text-base text-gray-500 mt-1">{subtitle}</p>
          )}
        </motion.div>

        {/* Content */}
        <div className="px-4 pb-20">
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * Simpler sticky header variant
 */
export function StickyHeader({
  title,
  showBack = false,
  rightAction,
  onBack,
}: Omit<LargeTitleHeaderProps, 'children'>) {
  const router = useRouter();

  const handleBack = async () => {
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style: ImpactStyle.Light });
    }
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-100 px-4 h-14 flex items-center justify-between safe-area-top">
      <div className="w-20">
        {showBack && (
          <button
            onClick={handleBack}
            className="p-2 -ml-2 rounded-full active:bg-gray-100 transition-colors active:scale-95"
          >
            <ArrowLeft className="w-6 h-6 text-gray-900" />
          </button>
        )}
      </div>

      <h1 className="text-base font-semibold text-gray-900 truncate">
        {title}
      </h1>

      <div className="w-20 flex justify-end">
        {rightAction}
      </div>
    </header>
  );
}
