import toast from 'react-hot-toast';

// Keep track of active toasts to prevent duplicates
const activeToasts = new Set<string>();

export const showToast = {
  error: (message: string, id?: string) => {
    const toastId = id || `error-${message}`;
    
    // Dismiss any existing error toasts
    toast.dismiss();
    
    // Clear our tracking
    activeToasts.clear();
    
    // Show new toast and track it
    const newToastId = toast.error(message, {
      id: toastId,
      duration: 5000,
    });
    
    activeToasts.add(toastId);
    return newToastId;
  },

  success: (message: string, id?: string) => {
    const toastId = id || `success-${message}`;
    
    // Don't dismiss success toasts, just prevent duplicates
    if (activeToasts.has(toastId)) {
      return;
    }
    
    const newToastId = toast.success(message, {
      id: toastId,
      duration: 3000,
    });
    
    activeToasts.add(toastId);
    
    // Remove from tracking after duration
    setTimeout(() => {
      activeToasts.delete(toastId);
    }, 3000);
    
    return newToastId;
  },

  info: (message: string, id?: string) => {
    const toastId = id || `info-${message}`;
    
    if (activeToasts.has(toastId)) {
      return;
    }
    
    const newToastId = toast(message, {
      id: toastId,
      duration: 4000,
      icon: '📱',
    });
    
    activeToasts.add(toastId);
    
    setTimeout(() => {
      activeToasts.delete(toastId);
    }, 4000);
    
    return newToastId;
  },

  loading: (message: string, id?: string) => {
    const toastId = id || `loading-${message}`;
    
    return toast.loading(message, {
      id: toastId,
    });
  },

  dismiss: (id?: string) => {
    if (id) {
      toast.dismiss(id);
      activeToasts.delete(id);
    } else {
      toast.dismiss();
      activeToasts.clear();
    }
  }
};