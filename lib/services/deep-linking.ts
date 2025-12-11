import { App, URLOpenListenerEvent } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

/**
 * Deep linking configuration and handlers
 * 
 * Supported URLs:
 * - treato://appointment/{id}
 * - treato://doctor/{id}
 * - treato://prescription/{id}
 * - treato://video/{roomId}
 * - treato://auth/callback?code=xxx
 * - https://treato.app/appointment/{id} (Universal Links)
 */

export interface DeepLinkRoute {
  pattern: RegExp;
  handler: (params: Record<string, string>, query: URLSearchParams) => string;
}

const routes: DeepLinkRoute[] = [
  // Appointment details
  {
    pattern: /^\/appointment\/([^\/]+)$/,
    handler: (params) => `/appointments/${params[1]}`,
  },
  // Doctor profile
  {
    pattern: /^\/doctor\/([^\/]+)$/,
    handler: (params) => `/doctor/${params[1]}`,
  },
  // Book appointment with doctor
  {
    pattern: /^\/book\/([^\/]+)$/,
    handler: (params) => `/book-appointment/${params[1]}`,
  },
  // Prescription
  {
    pattern: /^\/prescription\/([^\/]+)$/,
    handler: (params) => `/prescription/${params[1]}`,
  },
  // Video call
  {
    pattern: /^\/video\/([^\/]+)$/,
    handler: (params) => `/video/${params[1]}`,
  },
  // Auth callback
  {
    pattern: /^\/auth\/callback$/,
    handler: (_, query) => `/callback?${query.toString()}`,
  },
  // Lab reports
  {
    pattern: /^\/lab-reports$/,
    handler: () => `/lab-reports`,
  },
  // Medical records
  {
    pattern: /^\/medical-records$/,
    handler: () => `/medical-records`,
  },
];

/**
 * Parse deep link URL and return navigation path
 */
export function parseDeepLink(url: string): string | null {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname;
    const query = parsed.searchParams;

    for (const route of routes) {
      const match = path.match(route.pattern);
      if (match) {
        const params: Record<string, string> = {};
        match.slice(1).forEach((value, index) => {
          params[index + 1] = value;
        });
        return route.handler(params, query);
      }
    }

    // Default: try to use path directly
    return path || null;
  } catch {
    return null;
  }
}

/**
 * Initialize deep link listener
 */
export function initDeepLinkListener(
  navigate: (path: string) => void
): () => void {
  if (!Capacitor.isNativePlatform()) {
    return () => {};
  }

  const handler = App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
    console.log('Deep link received:', event.url);
    
    const path = parseDeepLink(event.url);
    if (path) {
      console.log('Navigating to:', path);
      navigate(path);
    }
  });

  // Check if app was opened with a URL
  App.getLaunchUrl().then((result) => {
    if (result?.url) {
      console.log('App launched with URL:', result.url);
      const path = parseDeepLink(result.url);
      if (path) {
        navigate(path);
      }
    }
  });

  return () => {
    handler.then(h => h.remove());
  };
}

/**
 * Generate shareable deep link
 */
export function generateDeepLink(
  type: 'appointment' | 'doctor' | 'prescription' | 'video',
  id: string
): { appLink: string; webLink: string } {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://treato.app';
  
  return {
    appLink: `treato://${type}/${id}`,
    webLink: `${baseUrl}/${type}/${id}`,
  };
}

/**
 * Share content with deep link
 */
export async function shareWithDeepLink(
  type: 'appointment' | 'doctor' | 'prescription',
  id: string,
  title: string,
  text: string
): Promise<void> {
  const { webLink } = generateDeepLink(type, id);

  if (Capacitor.isNativePlatform()) {
    const { Share } = await import('@capacitor/share');
    await Share.share({
      title,
      text,
      url: webLink,
      dialogTitle: 'Share',
    });
  } else if (navigator.share) {
    await navigator.share({
      title,
      text,
      url: webLink,
    });
  } else {
    // Fallback: copy to clipboard
    await navigator.clipboard.writeText(webLink);
  }
}
