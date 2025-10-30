import { apiClient } from './client';
import {
  Appointment,
  CreateAppointmentInput,
  UpdateAppointmentInput,
} from '@/lib/types/appointment';
import { PaginatedResponse } from '@/lib/types/api';

/**
 * Fetch all appointments for the current user
 */
export async function getAppointments(params?: {
  status?: string;
  page?: number;
  pageSize?: number;
}): Promise<PaginatedResponse<Appointment>> {
  return apiClient.get<PaginatedResponse<Appointment>>('/api/appointments', {
    params,
  });
}

/**
 * Fetch a specific appointment by ID
 */
export async function getAppointment(id: string): Promise<Appointment> {
  return apiClient.get<Appointment>(`/api/appointments/${id}`);
}

/**
 * Create a new appointment
 */
export async function createAppointment(
  input: CreateAppointmentInput
): Promise<Appointment> {
  return apiClient.post<Appointment>('/api/appointments', input);
}

/**
 * Update an existing appointment
 */
export async function updateAppointment(
  id: string,
  input: UpdateAppointmentInput
): Promise<Appointment> {
  return apiClient.put<Appointment>(`/api/appointments/${id}`, input);
}

/**
 * Cancel an appointment
 */
export async function cancelAppointment(id: string): Promise<void> {
  return apiClient.delete<void>(`/api/appointments/${id}`);
}
