import axios, { AxiosRequestConfig, AxiosError } from 'axios';
import { withAuth } from '@workos-inc/authkit-nextjs';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

/**
 * Makes an API request to the backend with detailed error handling
 * Server-side version using WorkOS AuthKit
 */
export async function makeApiRequest(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: any,
    options: AxiosRequestConfig = {}
) {
    const fullUrl = `${API_BASE_URL}${endpoint}`;
    console.log(`🔍 Making ${method} request to: ${fullUrl}`);

    const isFormData = data instanceof FormData;

    const config: AxiosRequestConfig = {
        method,
        url: fullUrl,
        headers: {
            ...(!isFormData && { 'Content-Type': 'application/json' }),
            ...options.headers,
        },
        timeout: 30000,
        ...options
    };

    try {
        const { accessToken, organizationId, role, permissions } = await withAuth();

        if (accessToken) {
            config.headers!.Authorization = `Bearer ${accessToken}`;
        }

        if (organizationId) {
            config.headers!['X-Organization-ID'] = organizationId;
        }

        if (role) {
            config.headers!['X-Role'] = role;
        }

        if (permissions) {
            config.headers!['X-Permissions'] = permissions;
        }
    } catch (error) {
        console.warn('Auth data not available in this context:', error);
    }

    if (method !== 'GET' && data) {
        config.data = data;
    }

    if (method === 'GET' && data) {
        config.params = data;
    }

    try {
        const response = await axios(config);
        return response.data;
    } catch (error: any) {
        console.error('❌ API request failed:', error);
        if (axios.isAxiosError(error)) {
            // Log error details if needed
        }
        throw error;
    }
}

export const api = {
    get: (endpoint: string, params?: any, options?: AxiosRequestConfig) =>
        makeApiRequest(endpoint, 'GET', params, options),
    post: (endpoint: string, data?: any, options?: AxiosRequestConfig) =>
        makeApiRequest(endpoint, 'POST', data, options),
    put: (endpoint: string, data?: any, options?: AxiosRequestConfig) =>
        makeApiRequest(endpoint, 'PUT', data, options),
    delete: (endpoint: string, params?: any, options?: AxiosRequestConfig) =>
        makeApiRequest(endpoint, 'DELETE', params, options),
};
