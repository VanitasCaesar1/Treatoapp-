import { App } from '@capacitor/app';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Deep Link Handler for Capacitor
 * Handles treato:// URL scheme links
 * 
 * Supported deep links:
 * - treato://dashboard
 * - treato://doctor/{id}
 * - treato://appointment/{id}
 * - treato://payment/success?transactionId={id}
 * - treato://payment/failed?transactionId={id}
 */

export interface DeepLinkData {
    url: string;
    path: string;
    query: Record<string, string>;
}

export function parseDeepLink(url: string): DeepLinkData {
    try {
        const urlObj = new URL(url);
        const path = urlObj.hostname + urlObj.pathname;
        const query: Record<string, string> = {};

        urlObj.searchParams.forEach((value, key) => {
            query[key] = value;
        });

        return { url, path, query };
    } catch (error) {
        console.error('Error parsing deep link:', error);
        return { url, path: '', query: {} };
    }
}

export function navigateFromDeepLink(deepLink: DeepLinkData, router: any) {
    const { path, query } = deepLink;

    // Map deep link paths to app routes
    if (path === 'dashboard') {
        router.push('/dashboard');
    } else if (path.startsWith('doctor/')) {
        const doctorId = path.split('/')[1];
        router.push(`/doctor/${doctorId}`);
    } else if (path.startsWith('appointment/')) {
        const appointmentId = path.split('/')[1];
        router.push(`/appointments/${appointmentId}`);
    } else if (path === 'payment/success') {
        const params = new URLSearchParams(query).toString();
        router.push(`/payment/success?${params}`);
    } else if (path === 'payment/failed') {
        const params = new URLSearchParams(query).toString();
        router.push(`/payment/failed?${params}`);
    } else if (path === 'medical-records') {
        router.push('/medical-records');
    } else if (path === 'profile') {
        router.push('/profile');
    } else {
        // Default to dashboard
        router.push('/dashboard');
    }
}

/**
 * React Hook for Deep Link Handling
 * Use this in your root layout or app component
 */
export function useDeepLinks() {
    const router = useRouter();

    useEffect(() => {
        // Listen for app URL open events
        let listener: any;

        const setupListener = async () => {
            listener = await App.addListener('appUrlOpen', (event: any) => {
                console.log('Deep link opened:', event.url);

                const deepLink = parseDeepLink(event.url);
                navigateFromDeepLink(deepLink, router);
            });
        };

        setupListener();

        return () => {
            if (listener) {
                listener.remove();
            }
        };
    }, [router]);
}

/**
 * Test deep links (for development)
 * 
 * Examples:
 * - treato://dashboard
 * - treato://doctor/123
 * - treato://payment/success?transactionId=abc123
 */
export const testDeepLink = (url: string) => {
    if (typeof window !== 'undefined') {
        window.location.href = url;
    }
};
