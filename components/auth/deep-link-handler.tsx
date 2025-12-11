'use client';

import { useEffect } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { useRouter } from 'next/navigation';
import { exchangeOAuthCode } from '@/lib/auth/backend-auth';
import { storeTokens } from '@/lib/auth/token-storage';

/**
 * Deep Link Handler Component
 * Listens for deep link callbacks from OAuth authentication
 * Add this to your root layout
 */
export function DeepLinkHandler() {
    const router = useRouter();

    useEffect(() => {
        // Only run on native platforms
        if (!Capacitor.isNativePlatform()) return;

        let listenerHandle: any;
        let stateListenerHandle: any;

        // Track if OAuth is in progress
        const markOAuthInProgress = () => {
            localStorage.setItem('oauth_in_progress', 'true');
            localStorage.setItem('oauth_started_at', Date.now().toString());
        };

        const markOAuthComplete = () => {
            localStorage.removeItem('oauth_in_progress');
            localStorage.removeItem('oauth_started_at');
            localStorage.removeItem('oauth_backgrounded_at');
        };

        // Monitor app state changes during OAuth
        const setupStateListener = async () => {
            stateListenerHandle = await CapacitorApp.addListener('appStateChange', (state) => {
                const isOAuthActive = localStorage.getItem('oauth_in_progress') === 'true';

                if (!isOAuthActive) return;

                if (!state.isActive) {
                    // App went to background during OAuth
                    console.log('App backgrounded during OAuth flow');
                    localStorage.setItem('oauth_backgrounded_at', Date.now().toString());
                } else if (state.isActive) {
                    // App came back to foreground
                    const backgroundedAt = localStorage.getItem('oauth_backgrounded_at');
                    if (backgroundedAt) {
                        const elapsed = Date.now() - parseInt(backgroundedAt);
                        console.log(`App resumed after ${elapsed}ms`);

                        // If backgrounded for more than 5 minutes, consider OAuth expired
                        if (elapsed > 5 * 60 * 1000) {
                            console.warn('OAuth possibly expired due to long background time');
                            markOAuthComplete();
                            // User will see error in deep link handler if code exchange fails
                        }
                    }
                }
            });
        };

        // Handle app URL open events (deep links)
        const setupListener = async () => {
            listenerHandle = await CapacitorApp.addListener('appUrlOpen', async (data) => {
                console.log('Deep link received:', data.url);

                try {
                    // Parse the deep link URL
                    // Expected format: treato://auth/callback?code=xxx&state=yyy
                    const url = new URL(data.url);

                    // Check if this is an auth callback
                    if (url.host === 'auth' && url.pathname === '/callback') {
                        const code = url.searchParams.get('code');
                        const state = url.searchParams.get('state');

                        if (code) {
                            // Check if OAuth timed out
                            const startedAt = localStorage.getItem('oauth_started_at');
                            if (startedAt) {
                                const elapsed = Date.now() - parseInt(startedAt);
                                if (elapsed > 10 * 60 * 1000) { // 10 minutes total timeout
                                    throw new Error('OAuth flow timed out - please try again');
                                }
                            }

                            // Haptic feedback
                            await Haptics.impact({ style: ImpactStyle.Medium });

                            // Close the in-app browser
                            await Browser.close().catch(() => {
                                // Browser might already be closed
                            });

                            console.log('Exchanging OAuth code with backend...');

                            // Exchange code for tokens via backend
                            const authResponse = await exchangeOAuthCode(code, state || undefined);

                            // Store tokens securely
                            await storeTokens(
                                authResponse.access_token,
                                authResponse.refresh_token,
                                authResponse.user,
                                authResponse.expires_in
                            );

                            console.log('Authentication successful:', authResponse.user.email);

                            // Mark OAuth as complete
                            markOAuthComplete();

                            // Success haptic
                            await Haptics.impact({ style: ImpactStyle.Heavy });

                            // Navigate to dashboard
                            router.push('/dashboard');
                        }
                    }
                } catch (error) {
                    console.error('Error handling deep link:', error);

                    // Mark OAuth as complete (failed)
                    markOAuthComplete();

                    // Error haptic
                    await Haptics.impact({ style: ImpactStyle.Heavy }).catch(() => { });

                    // Show error to user
                    const errorMessage = error instanceof Error ? error.message : 'auth_failed';
                    router.push(`/?error=${encodeURIComponent(errorMessage)}`);
                }
            });
        };

        setupListener();
        setupStateListener();

        // Check for existing OAuth in progress on mount
        const existingOAuth = localStorage.getItem('oauth_in_progress');
        if (existingOAuth === 'true') {
            const startedAt = localStorage.getItem('oauth_started_at');
            if (startedAt) {
                const elapsed = Date.now() - parseInt(startedAt);
                if (elapsed > 10 * 60 * 1000) {
                    // OAuth was abandoned, clean up
                    console.log('Cleaning up abandoned OAuth flow');
                    markOAuthComplete();
                }
            }
        }

        // Cleanup listeners on unmount
        return () => {
            if (listenerHandle) {
                listenerHandle.remove();
            }
            if (stateListenerHandle) {
                stateListenerHandle.remove();
            }
        };
    }, [router]);

    // This component doesn't render anything
    return null;
}
