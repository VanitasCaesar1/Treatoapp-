import type { CapacitorConfig } from '@capacitor/cli';
import { KeyboardResize, KeyboardStyle } from '@capacitor/keyboard';

const config: CapacitorConfig = {
  appId: 'com.treato.treato',
  appName: 'Treato',
  webDir: 'public', // Temporary directory for initial assets
  server: {
    // For Android emulator: 10.0.2.2 maps to host machine's localhost
    // For physical device: use your computer's local IP (e.g., 192.168.1.x)
    url: process.env.NODE_ENV === 'production' ? undefined : 'http://10.0.2.2:3000',
    cleartext: true,
    androidScheme: 'http',
  },
  // iOS configuration for deep linking
  ios: {
    scheme: 'treato', // Custom URL scheme: treato://
  },
  // Android configuration
  android: {
    allowMixedContent: true, // Allow HTTP in development
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ffffff',
      showSpinner: false,
      androidSplashResourceName: 'splash',

    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#ffffff',
      overlaysWebView: false,
    },
    Keyboard: {
      resize: KeyboardResize.Body,
      style: KeyboardStyle.Dark,
      resizeOnFullScreen: true,
    },

  },
};

export default config;
