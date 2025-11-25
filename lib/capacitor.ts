import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { LocalNotifications } from '@capacitor/local-notifications';
import { BiometricAuth } from '@aparajita/capacitor-biometric-auth';
import { Preferences } from '@capacitor/preferences';
import { Geolocation } from '@capacitor/geolocation';

export class CapacitorService {
  static isNative() {
    return Capacitor.isNativePlatform();
  }

  static getPlatform() {
    return Capacitor.getPlatform();
  }

  // Status Bar
  static async setStatusBarStyle(style: 'light' | 'dark' = 'dark') {
    if (this.isNative()) {
      await StatusBar.setStyle({
        style: style === 'dark' ? Style.Dark : Style.Light,
      });
    }
  }

  static async setStatusBarBackgroundColor(color: string) {
    if (this.isNative()) {
      await StatusBar.setBackgroundColor({ color });
    }
  }

  // Splash Screen
  static async hideSplashScreen() {
    if (this.isNative()) {
      await SplashScreen.hide();
    }
  }

  // Haptics
  static async lightHaptic() {
    if (this.isNative()) {
      await Haptics.impact({ style: ImpactStyle.Light });
    }
  }

  static async mediumHaptic() {
    if (this.isNative()) {
      await Haptics.impact({ style: ImpactStyle.Medium });
    }
  }

  static async heavyHaptic() {
    if (this.isNative()) {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    }
  }

  // Notifications
  static async requestNotificationPermissions() {
    if (this.isNative()) {
      return await LocalNotifications.requestPermissions();
    }
    return { display: 'granted' };
  }

  static async scheduleNotification(title: string, body: string, id: number, schedule?: Date) {
    if (this.isNative()) {
      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id,
            schedule: schedule ? { at: schedule } : undefined,
          },
        ],
      });
    }
  }

  // Biometric Authentication
  static async isBiometricAvailable() {
    if (!this.isNative()) return false;
    try {
      const result = await BiometricAuth.checkBiometry();
      return result.isAvailable;
    } catch {
      return false;
    }
  }

  static async authenticateWithBiometric(reason: string = 'Authenticate to continue') {
    if (!this.isNative()) return { success: false };
    try {
      const result = await BiometricAuth.authenticate({
        reason,
        cancelTitle: 'Cancel',
        allowDeviceCredential: true,
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Secure Storage for biometric credentials
  static async setBiometricEnabled(enabled: boolean) {
    await Preferences.set({ key: 'biometric_enabled', value: enabled.toString() });
  }

  static async isBiometricEnabled() {
    const { value } = await Preferences.get({ key: 'biometric_enabled' });
    return value === 'true';
  }

  static async saveCredentials(email: string, token: string) {
    await Preferences.set({ key: 'saved_email', value: email });
    await Preferences.set({ key: 'saved_token', value: token });
  }

  static async getCredentials() {
    const email = await Preferences.get({ key: 'saved_email' });
    const token = await Preferences.get({ key: 'saved_token' });
    return { email: email.value, token: token.value };
  }

  static async clearCredentials() {
    await Preferences.remove({ key: 'saved_email' });
    await Preferences.remove({ key: 'saved_token' });
    await Preferences.remove({ key: 'biometric_enabled' });
  }

  // Geolocation
  static async getCurrentPosition() {
    try {
      const coordinates = await Geolocation.getCurrentPosition();
      return {
        latitude: coordinates.coords.latitude,
        longitude: coordinates.coords.longitude,
      };
    } catch (error) {
      // Silent fail - user may have denied location permission
      return null;
    }
  }

  static async getLocationName(lat: number, lon: number) {
    try {
      // Use reverse geocoding API (you'd need to implement this with a service like Google Maps)
      // For now, return a placeholder
      return 'Current Location';
    } catch {
      return 'Location';
    }
  }

  // App lifecycle
  static async initializeApp() {
    if (this.isNative()) {
      // Set status bar style
      await this.setStatusBarStyle('dark');
      await this.setStatusBarBackgroundColor('#ffffff');

      // Hide splash screen after a delay
      setTimeout(async () => {
        await this.hideSplashScreen();
      }, 1000);

      // Request notification permissions
      await this.requestNotificationPermissions();
    }
  }
}

// Hook for using Capacitor features in React components
const capacitorInterface = {
  isNative: CapacitorService.isNative(),
  platform: CapacitorService.getPlatform(),
  lightHaptic: () => CapacitorService.lightHaptic(),
  mediumHaptic: () => CapacitorService.mediumHaptic(),
  heavyHaptic: () => CapacitorService.heavyHaptic(),
  scheduleNotification: (title: string, body: string, id: number, schedule?: Date) =>
    CapacitorService.scheduleNotification(title, body, id, schedule),
  isBiometricAvailable: () => CapacitorService.isBiometricAvailable(),
  authenticateWithBiometric: (reason?: string) => CapacitorService.authenticateWithBiometric(reason),
  setBiometricEnabled: (enabled: boolean) => CapacitorService.setBiometricEnabled(enabled),
  isBiometricEnabled: () => CapacitorService.isBiometricEnabled(),
  saveCredentials: (email: string, token: string) => CapacitorService.saveCredentials(email, token),
  getCredentials: () => CapacitorService.getCredentials(),
  clearCredentials: () => CapacitorService.clearCredentials(),
  getCurrentPosition: () => CapacitorService.getCurrentPosition(),
  getLocationName: (lat: number, lon: number) => CapacitorService.getLocationName(lat, lon),
};

export function useCapacitor() {
  return capacitorInterface;
}