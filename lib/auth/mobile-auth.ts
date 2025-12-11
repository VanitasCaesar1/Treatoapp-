import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import {
    getOAuthAuthorizationURL,
    logout as backendLogout
} from './backend-auth';
import { storeTokens, clearTokens, getAccessToken } from './token-storage';

/**
 * Mobile-optimized authentication handler for backend APIs
 * Uses in-app browser for OAuth, direct API calls for other methods
 */

/**
 * Login with OAuth (Google, Microsoft, etc.) for mobile
 * Opens in-app browser and handles deep link callback
 */
export async function loginWithOAuth(provider: 'google' | 'microsoft' | 'github') {
    const isNative = Capacitor.isNativePlatform();

    if (!isNative) {
        throw new Error('OAuth login is only supported on mobile platforms');
    }

    try {
        // Haptic feedback for button press
        await Haptics.impact({ style: ImpactStyle.Light });

        // Mark OAuth as in progress (tracked by DeepLinkHandler)
        localStorage.setItem('oauth_in_progress', 'true');
        localStorage.setItem('oauth_started_at', Date.now().toString());

        // Get auth URL from backend with mobile deep link redirect
        const { url } = await getOAuthAuthorizationURL(
            provider,
            'treato://auth/callback'
        );

        // Platform-specific browser configuration for optimal in-app experience
        const browserOptions = {
            url,
            // iOS: fullscreen is more reliable with SFSafariViewController
            // Android: popover uses Chrome Custom Tabs (in-app browser)
            presentationStyle: Capacitor.getPlatform() === 'ios'
                ? 'fullscreen' as 'fullscreen'
                : 'popover' as 'popover',
            toolbarColor: '#ffffff',
            windowName: '_blank',
        };

        await Browser.open(browserOptions);

        // Browser will automatically close when deep link handler calls Browser.close()
        // See deep-link-handler.tsx for the callback handling

    } catch (error) {
        console.error('Error opening OAuth:', error);
        // Clear OAuth tracking on error
        localStorage.removeItem('oauth_in_progress');
        localStorage.removeItem('oauth_started_at');
        throw error;
    }
}

/**
 * Handle logout across web and mobile
 */
export async function logoutWorkOS() {
    try {
        // Haptic feedback
        if (Capacitor.isNativePlatform()) {
            await Haptics.impact({ style: ImpactStyle.Medium });
        }

        // Get access token for backend logout
        const accessToken = await getAccessToken();

        if (accessToken) {
            // Revoke session on backend
            await backendLogout(accessToken);
        }

        // Clear local tokens
        await clearTokens();

        // Redirect to home
        window.location.href = '/';
    } catch (error) {
        console.error('Logout error:', error);
        // Clear tokens anyway
        await clearTokens();
        window.location.href = '/';
    }
}

// Export OAuth login as loginWithWorkOS for backward compatibility
export const loginWithWorkOS = loginWithOAuth;

