'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCapacitor } from '@/lib/capacitor';

export interface BottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
    size?: 'sm' | 'md' | 'lg' | 'full';
    showCloseButton?: boolean;
    dismissible?: boolean;
    className?: string;
}

const sizeMap = {
    sm: 'max-h-[40vh]',
    md: 'max-h-[60vh]',
    lg: 'max-h-[80vh]',
    full: 'h-screen',
};

export function BottomSheet({
    isOpen,
    onClose,
    children,
    title,
    size = 'md',
    showCloseButton = true,
    dismissible = true,
    className,
}: BottomSheetProps) {
    const capacitor = useCapacitor();
    const sheetRef = useRef<HTMLDivElement>(null);

    // Lock body scroll when sheet is open
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

    // Close on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && dismissible) {
                handleClose();
            }
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, dismissible]);

    const handleClose = () => {
        if (dismissible) {
            capacitor.mediumHaptic();
            onClose();
        }
    };

    const handleDragEnd = (_: unknown, info: PanInfo) => {
        // Close if dragged down more than 100px or with sufficient velocity
        if (info.offset.y > 100 || info.velocity.y > 500) {
            handleClose();
        }
    };

    if (!isOpen) return null;

    const content = (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 tap-highlight-none"
                        onClick={handleClose}
                        aria-hidden="true"
                    />

                    {/* Sheet */}
                    <motion.div
                        ref={sheetRef}
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{
                            type: 'spring',
                            damping: 30,
                            stiffness: 300,
                        }}
                        drag={dismissible ? 'y' : false}
                        dragConstraints={{ top: 0, bottom: 0 }}
                        dragElastic={{ top: 0, bottom: 0.5 }}
                        onDragEnd={handleDragEnd}
                        className={cn(
                            'fixed bottom-0 left-0 right-0 z-50',
                            'bg-white rounded-t-3xl shadow-2xl',
                            'flex flex-col',
                            'safe-area-bottom',
                            size !== 'full' && sizeMap[size],
                            className
                        )}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby={title ? 'bottom-sheet-title' : undefined}
                    >
                        {/* Drag Handle */}
                        {dismissible && (
                            <div className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing">
                                <div className="w-10 h-1 bg-gray-300 rounded-full" />
                            </div>
                        )}

                        {/* Header */}
                        {(title || showCloseButton) && (
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                                {title && (
                                    <h2
                                        id="bottom-sheet-title"
                                        className="text-lg font-semibold text-gray-900"
                                    >
                                        {title}
                                    </h2>
                                )}
                                {showCloseButton && (
                                    <button
                                        onClick={handleClose}
                                        className="touch-target rounded-full hover:bg-gray-100 active:scale-95 transition-all flex items-center justify-center ml-auto"
                                        aria-label="Close"
                                    >
                                        <X className="h-5 w-5 text-gray-500" />
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto overscroll-bounce px-6 py-4">
                            {children}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );

    // Render in portal to avoid z-index issues
    if (typeof window === 'undefined') return null;
    return createPortal(content, document.body);
}
