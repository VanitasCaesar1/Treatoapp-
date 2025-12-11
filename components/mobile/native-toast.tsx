'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Haptics, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => void;
  hideToast: (id: string) => void;
  success: (message: string, action?: Toast['action']) => void;
  error: (message: string, action?: Toast['action']) => void;
  warning: (message: string, action?: Toast['action']) => void;
  info: (message: string, action?: Toast['action']) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const toastConfig = {
  success: {
    icon: CheckCircle,
    bgColor: 'bg-green-500',
    haptic: NotificationType.Success,
  },
  error: {
    icon: XCircle,
    bgColor: 'bg-red-500',
    haptic: NotificationType.Error,
  },
  warning: {
    icon: AlertCircle,
    bgColor: 'bg-amber-500',
    haptic: NotificationType.Warning,
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-500',
    haptic: NotificationType.Success,
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(async (toast: Omit<Toast, 'id'>) => {
    const id = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newToast: Toast = { ...toast, id };

    // Haptic feedback
    if (Capacitor.isNativePlatform()) {
      await Haptics.notification({ type: toastConfig[toast.type].haptic });
    }

    setToasts(prev => [...prev, newToast]);

    // Auto dismiss
    const duration = toast.duration ?? 3000;
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const success = useCallback((message: string, action?: Toast['action']) => {
    showToast({ type: 'success', message, action });
  }, [showToast]);

  const error = useCallback((message: string, action?: Toast['action']) => {
    showToast({ type: 'error', message, action });
  }, [showToast]);

  const warning = useCallback((message: string, action?: Toast['action']) => {
    showToast({ type: 'warning', message, action });
  }, [showToast]);

  const info = useCallback((message: string, action?: Toast['action']) => {
    showToast({ type: 'info', message, action });
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, hideToast, success, error, warning, info }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={hideToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 flex flex-col gap-2 pointer-events-none safe-area-bottom">
      <AnimatePresence mode="popLayout">
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const config = toastConfig[toast.type];
  const Icon = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className={`${config.bgColor} rounded-2xl px-4 py-3 shadow-lg flex items-center gap-3 pointer-events-auto`}
    >
      <Icon className="w-5 h-5 text-white flex-shrink-0" />
      
      <p className="flex-1 text-white text-sm font-medium">{toast.message}</p>

      {toast.action && (
        <button
          onClick={toast.action.onPress}
          className="text-white/90 text-sm font-semibold hover:text-white"
        >
          {toast.action.label}
        </button>
      )}

      <button
        onClick={onDismiss}
        className="p-1 -mr-1 rounded-full hover:bg-white/20 transition-colors"
      >
        <X className="w-4 h-4 text-white/80" />
      </button>
    </motion.div>
  );
}

/**
 * Standalone toast function (for use outside React components)
 */
let toastFn: ToastContextType | null = null;

export function setToastRef(ref: ToastContextType) {
  toastFn = ref;
}

export const toast = {
  success: (message: string) => toastFn?.success(message),
  error: (message: string) => toastFn?.error(message),
  warning: (message: string) => toastFn?.warning(message),
  info: (message: string) => toastFn?.info(message),
};
