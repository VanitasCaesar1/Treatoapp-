import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

/**
 * Haptic feedback utilities for native feel
 */

export const haptic = {
  // Light tap - for buttons, toggles
  light: async () => {
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style: ImpactStyle.Light });
    }
  },

  // Medium tap - for selections, confirmations
  medium: async () => {
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style: ImpactStyle.Medium });
    }
  },

  // Heavy tap - for important actions, deletions
  heavy: async () => {
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    }
  },

  // Success - for completed actions
  success: async () => {
    if (Capacitor.isNativePlatform()) {
      await Haptics.notification({ type: NotificationType.Success });
    }
  },

  // Warning - for alerts
  warning: async () => {
    if (Capacitor.isNativePlatform()) {
      await Haptics.notification({ type: NotificationType.Warning });
    }
  },

  // Error - for failures
  error: async () => {
    if (Capacitor.isNativePlatform()) {
      await Haptics.notification({ type: NotificationType.Error });
    }
  },

  // Selection changed - for pickers, sliders
  selection: async () => {
    if (Capacitor.isNativePlatform()) {
      await Haptics.selectionChanged();
    }
  },
};

/**
 * Hook for haptic button
 */
export function useHapticButton(style: 'light' | 'medium' | 'heavy' = 'light') {
  return async (callback?: () => void | Promise<void>) => {
    await haptic[style]();
    if (callback) await callback();
  };
}
