import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.treato.treato',
  appName: 'Treato',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    // Allow clear text traffic for local development
    cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ffffff',
      showSpinner: false,
      androidSplashResourceName: 'splash',
      iosSplashResourceName: 'Default',
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#ffffff',
      overlaysWebView: false,
    },
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true,
    },
    App: {
      // Deep linking configuration
      appUrlOpen: {
        enabled: true,
      },
    },
  },
};

export default config;
