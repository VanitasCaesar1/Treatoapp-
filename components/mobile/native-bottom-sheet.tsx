'use client';

import React, { useEffect, useRef, ReactNode } from 'react';
import { motion, AnimatePresence, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';
import { X } from 'lucide-react';

interface NativeBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  snapPoints?: number[]; // Heights in vh (e.g., [50, 90])
  initialSnap?: number;
  showHandle?: boolean;
  showCloseButton?: boolean;
}

/**
 * Native-feeling bottom sheet with snap points
 */
export function NativeBottomSheet({
  isOpen,
  onClose,
  children,
  title,
  snapPoints = [50, 90],
  initialSnap = 0,
  showHandle = true,
  showCloseButton = true,
}: NativeBottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const y = useMotionValue(0);
  const [currentSnap, setCurrentSnap] = React.useState(initialSnap);

  // Convert vh to pixels
  const getSnapHeight = (snapVh: number) => {
    if (typeof window === 'undefined') return 0;
    return (window.innerHeight * snapVh) / 100;
  };

  const currentHeight = getSnapHeight(snapPoints[currentSnap]);
  const maxHeight = getSnapHeight(snapPoints[snapPoints.length - 1]);

  // Background opacity based on sheet position
  const backdropOpacity = useTransform(
    y,
    [-maxHeight, 0],
    [0.5, 0]
  );

  const handleDragEnd = async (_: any, info: PanInfo) => {
    const velocity = info.velocity.y;
    const offset = info.offset.y;

    // Close if dragged down fast or far enough
    if (velocity > 500 || offset > 100) {
      if (Capacitor.isNativePlatform()) {
        await Haptics.impact({ style: ImpactStyle.Light });
      }
      onClose();
      return;
    }

    // Snap to nearest point
    const currentY = y.get();
    const heights = snapPoints.map(getSnapHeight);
    
    let nearestSnap = 0;
    let minDistance = Infinity;
    
    heights.forEach((height, index) => {
      const distance = Math.abs(currentY + height);
      if (distance < minDistance) {
        minDistance = distance;
        nearestSnap = index;
      }
    });

    if (nearestSnap !== currentSnap) {
      if (Capacitor.isNativePlatform()) {
        await Haptics.impact({ style: ImpactStyle.Medium });
      }
      setCurrentSnap(nearestSnap);
    }
  };

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            ref={sheetRef}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl safe-area-bottom"
            initial={{ y: '100%' }}
            animate={{ y: 0, height: currentHeight }}
            exit={{ y: '100%' }}
            transition={{
              type: 'spring',
              damping: 30,
              stiffness: 300,
            }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.1, bottom: 0.5 }}
            onDragEnd={handleDragEnd}
            style={{ y }}
          >
            {/* Handle */}
            {showHandle && (
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 bg-gray-300 rounded-full" />
              </div>
            )}

            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="p-2 -mr-2 rounded-full hover:bg-gray-100 active:scale-95 transition-transform"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                )}
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-auto px-4 py-4">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * Simple action sheet variant
 */
interface ActionSheetAction {
  label: string;
  icon?: ReactNode;
  destructive?: boolean;
  onPress: () => void | Promise<void>;
}

interface ActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  actions: ActionSheetAction[];
  cancelLabel?: string;
}

export function ActionSheet({
  isOpen,
  onClose,
  title,
  message,
  actions,
  cancelLabel = 'Cancel',
}: ActionSheetProps) {
  const handleAction = async (action: ActionSheetAction) => {
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style: ImpactStyle.Medium });
    }
    await action.onPress();
    onClose();
  };

  const handleCancel = async () => {
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style: ImpactStyle.Light });
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 p-3 safe-area-bottom"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            {/* Actions group */}
            <div className="bg-white rounded-2xl overflow-hidden mb-2">
              {/* Header */}
              {(title || message) && (
                <div className="px-4 py-3 text-center border-b border-gray-100">
                  {title && <p className="text-sm font-semibold text-gray-500">{title}</p>}
                  {message && <p className="text-xs text-gray-400 mt-1">{message}</p>}
                </div>
              )}

              {/* Actions */}
              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleAction(action)}
                  className={`w-full px-4 py-4 flex items-center justify-center gap-2 border-b border-gray-100 last:border-0 active:bg-gray-50 transition-colors ${
                    action.destructive ? 'text-red-500' : 'text-blue-500'
                  }`}
                >
                  {action.icon}
                  <span className="text-lg font-medium">{action.label}</span>
                </button>
              ))}
            </div>

            {/* Cancel button */}
            <button
              onClick={handleCancel}
              className="w-full bg-white rounded-2xl px-4 py-4 text-lg font-semibold text-blue-500 active:bg-gray-50 transition-colors"
            >
              {cancelLabel}
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
