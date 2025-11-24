import { apiClient } from './client';
import {
  Doctor,
  DoctorSchedule,
  ConsultationFee,
  DoctorSearchFilters,
} from '@/lib/types/doctor';
import { PaginatedResponse } from '@/lib/types/api';

/**
 * Search for doctors with filters
 */
export async function searchDoctors(params: DoctorSearchFilters = {}): Promise<PaginatedResponse<Doctor>> {
  return apiClient.get<PaginatedResponse<Doctor>>('/doctors/search', {
    params,
  });
}

/**
 * Get a doctor by ID
 */
export async function getDoctorById(id: string): Promise<Doctor> {
  return apiClient.get<Doctor>(`/doctors/${id}`);
}

/**
 * Get doctor's available schedules
 */
export async function getDoctorSchedules(
  doctorId: string
): Promise<DoctorSchedule[]> {
  return apiClient.get<DoctorSchedule[]>(`/doctors/${doctorId}/schedules`);
}

/**
 * Get doctor's consultation fees
 */
export async function getDoctorFees(
  doctorId: string
): Promise<ConsultationFee[]> {
  return apiClient.get<ConsultationFee[]>(`/doctors/${doctorId}/fees`);
}
