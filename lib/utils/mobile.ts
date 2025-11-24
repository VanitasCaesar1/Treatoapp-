import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';

/**
 * Check if running on native mobile platform
 */
export function isNativePlatform(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * Get current platform (ios, android, web)
 */
export function getPlatform(): string {
  return Capacitor.getPlatform();
}

/**
 * Check if running on iOS
 */
export function isIOS(): boolean {
  return Capacitor.getPlatform() === 'ios';
}

/**
 * Check if running on Android
 */
export function isAndroid(): boolean {
  return Capacitor.getPlatform() === 'android';
}

/**
 * Dismiss keyboard if on native platform
 */
export async function dismissKeyboard(): Promise<void> {
  if (isNativePlatform()) {
    try {
      await Keyboard.hide();
    } catch (error) {
      console.warn('Failed to dismiss keyboard:', error);
    }
  }
}

/**
 * Add click-outside-to-dismiss keyboard behavior
 */
export function setupKeyboardDismiss(): () => void {
  if (!isNativePlatform()) return () => {};

  const handleTouchStart = (e: TouchEvent) => {
    const target = e.target as HTMLElement;
    // If tapping outside input/textarea, dismiss keyboard
    if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
      dismissKeyboard();
    }
  };

  document.addEventListener('touchstart', handleTouchStart);

  return () => {
    document.removeEventListener('touchstart', handleTouchStart);
  };
}

/**
 * Prevent overscroll/bounce effect on iOS
 */
export function preventOverscroll(): () => void {
  if (!isIOS()) return () => {};

  const preventBounce = (e: TouchEvent) => {
    const target = e.target as HTMLElement;
    const scrollable = target.closest('[data-scrollable]');
    
    if (!scrollable) {
      e.preventDefault();
    }
  };

  document.addEventListener('touchmove', preventBounce, { passive: false });

  return () => {
    document.removeEventListener('touchmove', preventBounce);
  };
}

/**
 * Get safe area insets
 */
export function getSafeAreaInsets() {
  if (typeof window === 'undefined') {
    return { top: 0, bottom: 0, left: 0, right: 0 };
  }

  const style = getComputedStyle(document.documentElement);
  
  return {
    top: parseInt(style.getPropertyValue('env(safe-area-inset-top)') || '0'),
    bottom: parseInt(style.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
    left: parseInt(style.getPropertyValue('env(safe-area-inset-left)') || '0'),
    right: parseInt(style.getPropertyValue('env(safe-area-inset-right)') || '0'),
  };
}
