'use client';

import { Capacitor } from '@capacitor/core';
import { useState } from 'react';

/**
 * Smart Login Button
 * Uses in-app browser on mobile, standard redirect on web
 */
export function LoginButton() {
    const [isLoading, setIsLoading] = useState(false);
    const isMobile = Capacitor.isNativePlatform();

    const handleLogin = async () => {
        setIsLoading(true);
        try {
            if (isMobile) {
                // Use OAuth for mobile
                const { loginWithOAuth } = await import('@/lib/auth/mobile-auth');
                await loginWithOAuth('google');
            } else {
                // Use standard web redirect
                window.location.href = '/api/auth/signin';
            }
        } catch (error) {
            console.error('Login error:', error);
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full bg-gray-900 text-white py-4 rounded-2xl font-medium hover:bg-gray-800 transition-colors active:scale-[0.98] disabled:opacity-50"
        >
            {isLoading ? 'Opening...' : isMobile ? 'Sign In' : 'Sign In with WorkOS'}
        </button>
    );
}
