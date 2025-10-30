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
export async function searchDoctors(
  filters: DoctorSearchFilters
): Promise<PaginatedResponse<Doctor>> {
  return apiClient.get<PaginatedResponse<Doctor>>('/api/doctors/search', {
    params: filters,
  });
}

/**
 * Get a specific doctor's profile by ID
 */
export async function getDoctor(id: string): Promise<Doctor> {
  return apiClient.get<Doctor>(`/api/doctors/${id}`);
}

/**
 * Get a doctor's schedules
 */
export async function getDoctorSchedules(
  doctorId: string
): Promise<DoctorSchedule[]> {
  return apiClient.get<DoctorSchedule[]>(`/api/doctors/${doctorId}/schedules`);
}

/**
 * Get a doctor's consultation fees
 */
export async function getDoctorFees(
  doctorId: string
): Promise<ConsultationFee[]> {
  return apiClient.get<ConsultationFee[]>(`/api/doctors/${doctorId}/fees`);
}
