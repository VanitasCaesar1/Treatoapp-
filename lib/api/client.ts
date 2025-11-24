// Note: For client-side API calls, we'll use cookies for authentication
// WorkOS handles JWT tokens via HTTP-only cookies automatically

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
    this.baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
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

  private async getAuthHeaders(): Promise<Record<string, string>> {
    // The proxy route handles authentication, so we only need basic headers
    return {
      'Accept': 'application/json',
    };
  }

  private async request<T>(
    method: string,
    endpoint: string,
    config: RequestConfig = {},
    body?: any
  ): Promise<T> {
    const { headers = {}, params, retries = this.defaultRetries, timeout = this.defaultTimeout } = config;

    // Get authentication headers
    const authHeaders = await this.getAuthHeaders();

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...headers,
    };

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
          credentials: 'include', // Send cookies for auth
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

          // Handle 401 Unauthorized - token might be expired
          if (response.status === 401) {
            console.warn('Unauthorized request - token may be expired');
            throw error;
          }

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

  // Healthcare-specific API methods

  // Patient endpoints
  async getPatientProfile(patientId: string) {
    return this.get(`/api/patients/${patientId}`);
  }

  async updatePatientProfile(patientId: string, data: any) {
    return this.put(`/api/patients/${patientId}`, data);
  }

  async getPatientMedicalHistory(patientId: string) {
    return this.get(`/api/patients/${patientId}/medical-history`);
  }

  async getPatientVitals(patientId: string) {
    return this.get(`/api/emr/patients/${patientId}/vitals`);
  }

  async getPatientEncounters(patientId: string) {
    return this.get(`/api/emr/patients/${patientId}/encounters`);
  }

  // Doctor endpoints
  async searchDoctors(params: any) {
    return this.get('/api/doctors/search', { params });
  }

  async getDoctorProfile(doctorId: string) {
    return this.get(`/api/doctors/${doctorId}`);
  }

  async getDoctorSchedules(doctorId: string) {
    return this.get(`/doctors/${doctorId}/schedules`);
  }

  // Appointment endpoints
  async getAppointments(params?: any) {
    return this.get('/api/appointments', { params });
  }

  async getAppointment(appointmentId: string) {
    return this.get(`/api/appointments/${appointmentId}`);
  }

  async createAppointment(data: any) {
    return this.post('/api/appointments', data);
  }

  async updateAppointment(appointmentId: string, data: any) {
    return this.put(`/api/appointments/${appointmentId}`, data);
  }

  async cancelAppointment(appointmentId: string) {
    return this.delete(`/api/appointments/${appointmentId}`);
  }

  // Medical Records endpoints
  async getMedicalRecords(patientId: string) {
    return this.get(`/api/emr/patients/${patientId}/encounters`);
  }

  async createEncounter(data: any) {
    return this.post('/api/emr/encounters', data);
  }

  async recordVitals(data: any) {
    return this.post('/api/emr/vitals', data);
  }

  // Search endpoints
  async searchPatients(query: string) {
    return this.get('/api/patients/search', { params: { q: query } });
  }

  async searchMedicines(query: string) {
    return this.get('/api/medicines/search', { params: { q: query } });
  }

  // User profile endpoints
  // For current user (convenience route)
  async getCurrentUserProfile() {
    return this.get('/user/profile');
  }

  async updateCurrentUserProfile(data: any) {
    return this.put('/user/profile', data);
  }

  // For specific user by ID
  async getUserProfile(userId: string) {
    return this.get(`/users/${userId}/profile`);
  }

  async updateUserProfile(userId: string, data: any) {
    return this.put(`/users/${userId}/profile`, data);
  }

  // User roles endpoints
  async getUserRoles(userId: string) {
    return this.get(`/users/${userId}/roles`);
  }

  async addUserRole(userId: string, roleData: any) {
    return this.post(`/users/${userId}/roles`, roleData);
  }

  async removeUserRole(userId: string, roleId: string) {
    return this.delete(`/users/${userId}/roles/${roleId}`);
  }
}

// Export singleton instance
export const apiClient = new APIClient();