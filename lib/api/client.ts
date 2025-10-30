import { withAuth } from '@workos-inc/authkit-nextjs';

export interface APIError {
  status: number;
  message: string;
  code: string;
  details?: Record<string, any>;
}

export class APIClientError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'APIClientError';
  }
}

interface RequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, any>;
  retries?: number;
  timeout?: number;
}

class APIClient {
  private baseURL: string;
  private defaultRetries: number = 3;
  private defaultTimeout: number = 30000;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8080';
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      const session = await withAuth();
      if ('accessToken' in session) {
        return session.accessToken || null;
      }
      return null;
    } catch (error) {
      console.error('Failed to get access token:', error);
      return null;
    }
  }

  private buildURL(endpoint: string, params?: Record<string, any>): string {
    const url = new URL(endpoint, this.baseURL);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    
    return url.toString();
  }

  private async request<T>(
    method: string,
    endpoint: string,
    config: RequestConfig = {},
    body?: any
  ): Promise<T> {
    const { headers = {}, params, retries = this.defaultRetries, timeout = this.defaultTimeout } = config;
    
    const token = await this.getAuthToken();
    
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }

    const url = this.buildURL(endpoint, params);
    
    let lastError: APIClientError | null = null;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          method,
          headers: requestHeaders,
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          
          const error = new APIClientError(
            response.status,
            this.getErrorCode(response.status),
            errorData.message || response.statusText || 'An error occurred',
            errorData.details
          );

          // Don't retry client errors (4xx)
          if (response.status >= 400 && response.status < 500) {
            throw error;
          }

          lastError = error;
          
          // Retry server errors (5xx)
          if (attempt < retries) {
            await this.delay(this.getRetryDelay(attempt));
            continue;
          }
          
          throw error;
        }

        // Handle empty responses
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          return {} as T;
        }

        const data = await response.json();
        return data as T;
        
      } catch (error) {
        if (error instanceof APIClientError) {
          throw error;
        }

        // Handle network errors and timeouts
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            lastError = new APIClientError(
              408,
              'TIMEOUT',
              'Request timed out'
            );
          } else {
            lastError = new APIClientError(
              0,
              'NETWORK_ERROR',
              error.message || 'Network error occurred'
            );
          }
        } else {
          lastError = new APIClientError(
            0,
            'UNKNOWN_ERROR',
            'An unknown error occurred'
          );
        }

        if (attempt < retries) {
          await this.delay(this.getRetryDelay(attempt));
          continue;
        }

        throw lastError;
      }
    }

    throw lastError || new APIClientError(0, 'UNKNOWN_ERROR', 'Request failed');
  }

  private getErrorCode(status: number): string {
    switch (status) {
      case 401:
        return 'UNAUTHORIZED';
      case 403:
        return 'FORBIDDEN';
      case 404:
        return 'NOT_FOUND';
      case 422:
        return 'VALIDATION_ERROR';
      case 408:
        return 'TIMEOUT';
      case 500:
      case 502:
      case 503:
      case 504:
        return 'SERVER_ERROR';
      default:
        return 'UNKNOWN_ERROR';
    }
  }

  private getRetryDelay(attemptIndex: number): number {
    // Exponential backoff: 1s, 2s, 4s, etc., max 30s
    return Math.min(1000 * Math.pow(2, attemptIndex), 30000);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>('GET', endpoint, config);
  }

  async post<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>('POST', endpoint, config, data);
  }

  async put<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>('PUT', endpoint, config, data);
  }

  async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>('DELETE', endpoint, config);
  }

  async patch<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>('PATCH', endpoint, config, data);
  }
}

// Export singleton instance
export const apiClient = new APIClient();
