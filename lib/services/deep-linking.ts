import { App, URLOpenListenerEvent } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

export type DeepLinkHandler = (url: string, path: string, params: URLSearchParams) => void;

class DeepLinkingService {
  private handlers: Map<string, DeepLinkHandler> = new Map();

  /**
   * Initialize deep linking listeners
   */
  initialize() {
    if (!Capacitor.isNativePlatform()) return;

    App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
      this.handleDeepLink(event.url);
    });
  }

  /**
   * Register a handler for a specific path pattern
   */
  registerHandler(pattern: string, handler: DeepLinkHandler) {
    this.handlers.set(pattern, handler);
  }

  /**
   * Handle incoming deep link
   */
  private handleDeepLink(url: string) {
    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname;
      const params = urlObj.searchParams;

      // Try to find matching handler
      for (const [pattern, handler] of this.handlers) {
        if (this.matchesPattern(path, pattern)) {
          handler(url, path, params);
          return;
        }
      }

      // Default handler - navigate to path
      if (typeof window !== 'undefined') {
        window.location.href = path + urlObj.search;
      }
    } catch (error) {
      console.error('Failed to handle deep link:', error);
    }
  }

  /**
   * Check if path matches pattern
   */
  private matchesPattern(path: string, pattern: string): boolean {
    const regex = new RegExp('^' + pattern.replace(/:\w+/g, '([^/]+)') + '$');
    return regex.test(path);
  }
}

export const deepLinkingService = new DeepLinkingService();

/**
 * Setup common deep link handlers
 */
export function setupDeepLinking() {
  deepLinkingService.initialize();

  // Doctor profile: treato://doctor/123
  deepLinkingService.registerHandler('/doctor/:id', (url, path, params) => {
    const id = path.split('/')[2];
    window.location.href = `/doctor/${id}`;
  });

  // Appointment: treato://appointment/123
  deepLinkingService.registerHandler('/appointment/:id', (url, path, params) => {
    const id = path.split('/')[2];
    window.location.href = `/appointments/${id}`;
  });

  // Book appointment: treato://book?doctorId=123
  deepLinkingService.registerHandler('/book', (url, path, params) => {
    const doctorId = params.get('doctorId');
    window.location.href = doctorId 
      ? `/book-appointment/${doctorId}`
      : '/appointments/book';
  });

  // Video call: treato://video/room123
  deepLinkingService.registerHandler('/video/:roomId', (url, path, params) => {
    const roomId = path.split('/')[2];
    window.location.href = `/video/${roomId}`;
  });
}
