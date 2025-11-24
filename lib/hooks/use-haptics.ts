import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

/**
 * Haptic feedback hook for Capacitor apps
 * Provides native-feeling tactile feedback for user interactions
 */
export const useHaptics = () => {
    const isCapacitor = typeof window !== 'undefined' &&
        (window as any).Capacitor?.isNativePlatform?.();

    /**
     * Light impact - for selections, toggles
     */
    const light = async () => {
        if (!isCapacitor) return;
        try {
            await Haptics.impact({ style: ImpactStyle.Light });
        } catch (e) {
            // Silently fail on web
        }
    };

    /**
     * Medium impact - for button presses
     */
    const medium = async () => {
        if (!isCapacitor) return;
        try {
            await Haptics.impact({ style: ImpactStyle.Medium });
        } catch (e) {
            // Silently fail on web
        }
    };

    /**
     * Heavy impact - for important actions
     */
    const heavy = async () => {
        if (!isCapacitor) return;
        try {
            await Haptics.impact({ style: ImpactStyle.Heavy });
        } catch (e) {
            // Silently fail on web
        }
    };

    /**
     * Success notification - for successful operations
     */
    const success = async () => {
        if (!isCapacitor) return;
        try {
            await Haptics.notification({ type: NotificationType.Success });
        } catch (e) {
            // Silently fail on web
        }
    };

    /**
     * Warning notification - for warnings
     */
    const warning = async () => {
        if (!isCapacitor) return;
        try {
            await Haptics.notification({ type: NotificationType.Warning });
        } catch (e) {
            // Silently fail on web
        }
    };

    /**
     * Error notification - for errors
     */
    const error = async () => {
        if (!isCapacitor) return;
        try {
            await Haptics.notification({ type: NotificationType.Error });
        } catch (e) {
            // Silently fail on web
        }
    };

    /**
     * Selection changed - for picker/selector changes
     */
    const selectionChanged = async () => {
        if (!isCapacitor) return;
        try {
            await Haptics.selectionChanged();
        } catch (e) {
            // Silently fail on web
        }
    };

    return {
        light,
        medium,
        heavy,
        success,
        warning,
        error,
        selectionChanged,
        isAvailable: isCapacitor,
    };
};
