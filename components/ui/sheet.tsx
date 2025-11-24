'use client';

import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  snapPoints?: number[];
  initialSnap?: number;
}

export function Sheet({
  isOpen,
  onClose,
  children,
  title,
  description,
  snapPoints = [0.9, 0.5],
  initialSnap = 1,
}: SheetProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [translateY, setTranslateY] = useState(0);
  const [currentSnap, setCurrentSnap] = useState(initialSnap);
  const sheetRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const currentY = useRef(0);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTranslateY(0);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleDragStart = (clientY: number) => {
    setIsDragging(true);
    startY.current = clientY;
    currentY.current = translateY;
  };

  const handleDragMove = (clientY: number) => {
    if (!isDragging) return;

    const deltaY = clientY - startY.current;
    const newTranslateY = Math.max(0, currentY.current + deltaY);
    setTranslateY(newTranslateY);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const threshold = window.innerHeight * 0.2;

    if (translateY > threshold) {
      onClose();
    } else {
      setTranslateY(0);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    handleDragStart(e.clientY);
  };

  const handleMouseMove = (e: MouseEvent) => {
    handleDragMove(e.clientY);
  };

  const handleMouseUp = () => {
    handleDragEnd();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientY);
  };

  const handleTouchMove = (e: TouchEvent) => {
    handleDragMove(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    handleDragEnd();
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging]);

  if (!isOpen) return null;

  const height = snapPoints[currentSnap] * 100;

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-50 bg-black/50',
          'transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0'
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50',
          'bg-white rounded-t-3xl shadow-2xl',
          'transition-transform duration-300 ease-out',
          isDragging && 'transition-none'
        )}
        style={{
          height: `${height}vh`,
          transform: `translateY(${translateY}px)`,
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'sheet-title' : undefined}
        aria-describedby={description ? 'sheet-description' : undefined}
      >
        {/* Drag Handle */}
        <div
          className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        {(title || description) && (
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {title && (
                  <h2
                    id="sheet-title"
                    className="text-xl font-semibold text-gray-900"
                  >
                    {title}
                  </h2>
                )}
                {description && (
                  <p
                    id="sheet-description"
                    className="mt-1 text-sm text-gray-500"
                  >
                    {description}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="ml-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto px-6 py-4" style={{ maxHeight: `calc(${height}vh - 120px)` }}>
          {children}
        </div>
      </div>
    </>
  );
}
