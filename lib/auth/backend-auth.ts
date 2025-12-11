import { Capacitor } from '@capacitor/core';

/**
 * Backend Auth API - Direct communication with Go backend
 * Mobile app only - website uses AuthKit
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface AuthResponse {
    access_token: string;
    refresh_token: string;
    user: {
        id: string;
        email: string;
        first_name: string;
        last_name: string;
    };
    expires_in: number;
}

export interface MagicAuthSendResponse {
    success: true;
    message: string;
}

/**
 * Send magic auth code to email
 */
export async function sendMagicAuthCode(email: string): Promise<MagicAuthSendResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/magic-auth/send`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send magic code');
    }

    return response.json();
}

/**
 * Verify magic auth code and get tokens
 */
export async function verifyMagicAuthCode(
    email: string,
    code: string
): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/magic-auth/verify`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code: code.replace(/\s/g, '') }), // Remove spaces
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Invalid or expired code');
    }

    const data = await response.json();

    // Transform response to match AuthResponse interface
    return {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        user: data.user,
        expires_in: data.expires_in || 3600,
    };
}

/**
 * Sign up with email and password
 */
export async function signupWithPassword(
    email: string,
    password: string,
    firstName: string,
    lastName: string
): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/password/signup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email,
            password,
            first_name: firstName,
            last_name: lastName,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Signup failed');
    }

    const data = await response.json();
    return {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        user: data.user,
        expires_in: data.expires_in || 3600,
    };
}

/**
 * Login with email and password
 */
export async function loginWithPassword(
    email: string,
    password: string
): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/password/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Invalid credentials');
    }

    const data = await response.json();
    return {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        user: data.user,
        expires_in: data.expires_in || 3600,
    };
}

/**
 * Get OAuth authorization URL for social login
 */
export async function getOAuthAuthorizationURL(
    provider: 'google' | 'microsoft' | 'github',
    redirectUri: string
): Promise<{ url: string }> {
    const response = await fetch(`${API_BASE_URL}/api/auth/oauth/authorize`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ provider, redirect_uri: redirectUri }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get authorization URL');
    }

    return response.json();
}

/**
 * Exchange OAuth code for tokens (called after deep link callback)
 */
export async function exchangeOAuthCode(
    code: string,
    state?: string
): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/oauth/exchange-code`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, state }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'OAuth authentication failed');
    }

    const data = await response.json();
    return {
        access_token: data.access_token,
        refresh_token: data.refresh_token || '',
        user: data.user,
        expires_in: data.expires_in || 3600,
    };
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(
    refreshToken: string
): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh-token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to refresh token');
    }

    const data = await response.json();
    return {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        user: data.user,
        expires_in: data.expires_in || 3600,
    };
}

/**
 * Logout (revoke session on backend)
 */
export async function logout(accessToken: string): Promise<void> {
    try {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
    } catch (error) {
        // Ignore logout errors - we'll clear local tokens anyway
        console.error('Logout error:', error);
    }
}
