'use client';

import React, { useRef, useState, ReactNode } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';
import { Trash2, Edit, Archive, Star } from 'lucide-react';

interface SwipeAction {
  icon: ReactNode;
  color: string;
  bgColor: string;
  onAction: () => void | Promise<void>;
}

interface SwipeableItemProps {
  children: ReactNode;
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  threshold?: number;
  disabled?: boolean;
  onSwipeStart?: () => void;
  onSwipeEnd?: () => void;
}

/**
 * iOS-style swipeable list item with actions
 */
export function SwipeableItem({
  children,
  leftActions = [],
  rightActions = [],
  threshold = 80,
  disabled = false,
  onSwipeStart,
  onSwipeEnd,
}: SwipeableItemProps) {
  const x = useMotionValue(0);
  const [isOpen, setIsOpen] = useState<'left' | 'right' | null>(null);
  const triggeredHaptic = useRef(false);

  const leftActionsWidth = leftActions.length * 70;
  const rightActionsWidth = rightActions.length * 70;

  // Background colors based on swipe direction
  const leftBgOpacity = useTransform(x, [0, leftActionsWidth], [0, 1]);
  const rightBgOpacity = useTransform(x, [-rightActionsWidth, 0], [1, 0]);

  const handleDragStart = () => {
    if (disabled) return;
    triggeredHaptic.current = false;
    onSwipeStart?.();
  };

  const handleDrag = async (_: any, info: PanInfo) => {
    if (disabled) return;

    const offset = info.offset.x;
    
    // Haptic at threshold
    if (Math.abs(offset) >= threshold && !triggeredHaptic.current && Capacitor.isNativePlatform()) {
      triggeredHaptic.current = true;
      await Haptics.impact({ style: ImpactStyle.Light });
    }
  };

  const handleDragEnd = async (_: any, info: PanInfo) => {
    if (disabled) return;

    const offset = info.offset.x;
    const velocity = info.velocity.x;

    // Determine if we should open actions
    if (offset > threshold || velocity > 500) {
      if (leftActions.length > 0) {
        x.set(leftActionsWidth);
        setIsOpen('left');
        if (Capacitor.isNativePlatform()) {
          await Haptics.impact({ style: ImpactStyle.Medium });
        }
      } else {
        x.set(0);
        setIsOpen(null);
      }
    } else if (offset < -threshold || velocity < -500) {
      if (rightActions.length > 0) {
        x.set(-rightActionsWidth);
        setIsOpen('right');
        if (Capacitor.isNativePlatform()) {
          await Haptics.impact({ style: ImpactStyle.Medium });
        }
      } else {
        x.set(0);
        setIsOpen(null);
      }
    } else {
      x.set(0);
      setIsOpen(null);
    }

    onSwipeEnd?.();
  };

  const handleActionClick = async (action: SwipeAction) => {
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style: ImpactStyle.Medium });
    }
    await action.onAction();
    x.set(0);
    setIsOpen(null);
  };

  const close = () => {
    x.set(0);
    setIsOpen(null);
  };

  return (
    <div className="relative overflow-hidden">
      {/* Left actions */}
      {leftActions.length > 0 && (
        <motion.div
          className="absolute left-0 top-0 bottom-0 flex"
          style={{ opacity: leftBgOpacity }}
        >
          {leftActions.map((action, index) => (
            <button
              key={index}
              onClick={() => handleActionClick(action)}
              className="w-[70px] flex items-center justify-center transition-colors"
              style={{ backgroundColor: action.bgColor }}
            >
              <span style={{ color: action.color }}>{action.icon}</span>
            </button>
          ))}
        </motion.div>
      )}

      {/* Right actions */}
      {rightActions.length > 0 && (
        <motion.div
          className="absolute right-0 top-0 bottom-0 flex"
          style={{ opacity: rightBgOpacity }}
        >
          {rightActions.map((action, index) => (
            <button
              key={index}
              onClick={() => handleActionClick(action)}
              className="w-[70px] flex items-center justify-center transition-colors"
              style={{ backgroundColor: action.bgColor }}
            >
              <span style={{ color: action.color }}>{action.icon}</span>
            </button>
          ))}
        </motion.div>
      )}

      {/* Main content */}
      <motion.div
        drag={disabled ? false : 'x'}
        dragConstraints={{
          left: rightActions.length > 0 ? -rightActionsWidth : 0,
          right: leftActions.length > 0 ? leftActionsWidth : 0,
        }}
        dragElastic={0.1}
        style={{ x }}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        onClick={isOpen ? close : undefined}
        className="relative bg-white"
      >
        {children}
      </motion.div>
    </div>
  );
}

// Pre-configured action presets
export const SwipeActions = {
  delete: (onDelete: () => void): SwipeAction => ({
    icon: <Trash2 className="w-5 h-5" />,
    color: '#ffffff',
    bgColor: '#ef4444',
    onAction: onDelete,
  }),
  edit: (onEdit: () => void): SwipeAction => ({
    icon: <Edit className="w-5 h-5" />,
    color: '#ffffff',
    bgColor: '#3b82f6',
    onAction: onEdit,
  }),
  archive: (onArchive: () => void): SwipeAction => ({
    icon: <Archive className="w-5 h-5" />,
    color: '#ffffff',
    bgColor: '#8b5cf6',
    onAction: onArchive,
  }),
  favorite: (onFavorite: () => void): SwipeAction => ({
    icon: <Star className="w-5 h-5" />,
    color: '#ffffff',
    bgColor: '#f59e0b',
    onAction: onFavorite,
  }),
};
