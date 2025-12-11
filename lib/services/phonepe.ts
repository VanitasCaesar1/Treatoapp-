import { Capacitor } from '@capacitor/core';

// PhonePe Plugin types based on ionic-capacitor-phonepe-pg
interface PhonePeInitOptions {
  environment: 'SANDBOX' | 'PRODUCTION';
  merchantId: string;
  flowId: string;
  enableLogging: boolean;
}

interface PhonePeTransactionOptions {
  request: string; // Base64 encoded payload
  showLoaderFlag?: boolean;
  appSchema?: string | null; // iOS only - custom URL scheme
}

interface PhonePeTransactionResult {
  status: 'SUCCESS' | 'FAILURE' | 'INTERRUPTED';
  error?: string;
}

interface UpiApp {
  packageName?: string; // Android
  applicationName: string;
  versionCode?: string; // Android
}

// Dynamic import for native plugin
let PhonePePlugin: any = null;

async function getPhonePePlugin() {
  if (!PhonePePlugin && Capacitor.isNativePlatform()) {
    try {
      const module = await import('ionic-capacitor-phonepe-pg');
      PhonePePlugin = module.PhonePePaymentPlugin;
    } catch (e) {
      console.error('Failed to load PhonePe plugin:', e);
    }
  }
  return PhonePePlugin;
}

export const PhonePeService = {
  /**
   * Check if running on native platform (iOS/Android)
   */
  isNative(): boolean {
    return Capacitor.isNativePlatform();
  },

  /**
   * Get current platform
   */
  getPlatform(): 'ios' | 'android' | 'web' {
    return Capacitor.getPlatform() as 'ios' | 'android' | 'web';
  },

  /**
   * Initialize PhonePe SDK (call once on app start)
   * @param options.environment - SANDBOX or PRODUCTION
   * @param options.merchantId - Merchant ID from PhonePe
   * @param options.flowId - Alphanumeric string for tracking (e.g., user ID)
   * @param options.enableLogging - Enable SDK logs (iOS)
   */
  async init(options: PhonePeInitOptions): Promise<boolean> {
    if (!this.isNative()) {
      console.log('PhonePe SDK: Web platform, using redirect flow');
      return false;
    }

    const plugin = await getPhonePePlugin();
    if (!plugin) {
      console.error('PhonePe plugin not available');
      return false;
    }

    try {
      const result = await plugin.init({
        environment: options.environment,
        merchantId: options.merchantId,
        flowId: options.flowId,
        enableLogging: options.enableLogging
      });
      console.log('PhonePe SDK initialized:', result);
      return result?.success === true || Object.values(result)[0] === true;
    } catch (error) {
      console.error('PhonePe SDK init failed:', error);
      return false;
    }
  },

  /**
   * Start a payment transaction using native SDK
   * @param options.request - Base64 encoded request body
   * @param options.showLoaderFlag - Show loader in PhonePe app (default: true)
   * @param options.appSchema - iOS custom URL scheme for callback
   */
  async startTransaction(options: PhonePeTransactionOptions): Promise<PhonePeTransactionResult> {
    if (!this.isNative()) {
      return { status: 'FAILURE', error: 'Native platform required' };
    }

    const plugin = await getPhonePePlugin();
    if (!plugin) {
      return { status: 'FAILURE', error: 'PhonePe plugin not available' };
    }

    try {
      const result = await plugin.startTransaction({
        request: options.request,
        showLoaderFlag: options.showLoaderFlag ?? true,
        appSchema: options.appSchema || null
      });
      
      return {
        status: result.status as PhonePeTransactionResult['status'],
        error: result.error
      };
    } catch (error: any) {
      console.error('PhonePe transaction error:', error);
      return { status: 'FAILURE', error: error.message || 'Transaction failed' };
    }
  },

  /**
   * Get list of installed UPI apps
   */
  async getUpiApps(): Promise<UpiApp[]> {
    if (!this.isNative()) return [];

    const plugin = await getPhonePePlugin();
    if (!plugin) return [];

    try {
      const platform = this.getPlatform();
      let result: Record<string, string>;

      if (platform === 'android') {
        result = await plugin.getUpiAppsForAndroid();
      } else if (platform === 'ios') {
        result = await plugin.getUpiAppsForIos();
      } else {
        return [];
      }

      // Parse JSON string response
      const jsonStr = Object.values(result)[0];
      if (typeof jsonStr === 'string') {
        return JSON.parse(jsonStr) as UpiApp[];
      }
      return [];
    } catch (error) {
      console.error('Failed to get UPI apps:', error);
      return [];
    }
  }
};

export type { PhonePeInitOptions, PhonePeTransactionOptions, PhonePeTransactionResult, UpiApp };
