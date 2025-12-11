import { getAccessToken, getRefreshToken, storeTokens, isTokenExpired, clearTokens } from './token-storage';
import { refreshAccessToken as refreshToken } from './backend-auth';

/**
 * HTTP Client with automatic token refresh
 * Handles authentication and token expiry transparently
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export class AuthenticationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'AuthenticationError';
    }
}

/**
 * Make an authenticated request with automatic token refresh
 */
export async function authenticatedFetch(
    url: string,
    options: RequestInit = {}
): Promise<Response> {
    // Get current access token
    let accessToken = await getAccessToken();

    // Check if token is expired and refresh if needed
    if (await isTokenExpired()) {
        const refreshTokenValue = await getRefreshToken();

        if (!refreshTokenValue) {
            throw new AuthenticationError('No refresh token available');
        }

        try {
            const refreshed = await refreshToken(refreshTokenValue);
            await storeTokens(
                refreshed.access_token,
                refreshed.refresh_token,
                refreshed.user,
                refreshed.expires_in
            );
            accessToken = refreshed.access_token;
        } catch (error) {
            // Refresh failed - clear tokens and throw
            await clearTokens();
            throw new AuthenticationError('Token refresh failed');
        }
    }

    if (!accessToken) {
        throw new AuthenticationError('Not authenticated');
    }

    // Make request with access token
    const response = await fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            Authorization: `Bearer ${accessToken}`,
        },
    });

    // If 401, try refreshing token once
    if (response.status === 401) {
        const refreshTokenValue = await getRefreshToken();

        if (!refreshTokenValue) {
            await clearTokens();
            throw new AuthenticationError('Session expired');
        }

        try {
            const refreshed = await refreshToken(refreshTokenValue);
            await storeTokens(
                refreshed.access_token,
                refreshed.refresh_token,
                refreshed.user,
                refreshed.expires_in
            );

            // Retry original request with new token
            return fetch(url, {
                ...options,
                headers: {
                    ...options.headers,
                    Authorization: `Bearer ${refreshed.access_token}`,
                },
            });
        } catch (error) {
            await clearTokens();
            throw new AuthenticationError('Session expired');
        }
    }

    return response;
}

/**
 * Convenience methods for common HTTP verbs
 */

export async function get(path: string, options: RequestInit = {}): Promise<Response> {
    const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;
    return authenticatedFetch(url, { ...options, method: 'GET' });
}

export async function post(
    path: string,
    body?: any,
    options: RequestInit = {}
): Promise<Response> {
    const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;
    return authenticatedFetch(url, {
        ...options,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        body: body ? JSON.stringify(body) : undefined,
    });
}

export async function put(
    path: string,
    body?: any,
    options: RequestInit = {}
): Promise<Response> {
    const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;
    return authenticatedFetch(url, {
        ...options,
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        body: body ? JSON.stringify(body) : undefined,
    });
}

export async function del(path: string, options: RequestInit = {}): Promise<Response> {
    const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;
    return authenticatedFetch(url, { ...options, method: 'DELETE' });
}
