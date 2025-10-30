import {
  useQuery,
  UseQueryOptions,
} from '@tanstack/react-query';
import {
  searchDoctors,
  getDoctor,
  getDoctorSchedules,
  getDoctorFees,
} from '@/lib/api/doctors';
import {
  Doctor,
  DoctorSchedule,
  ConsultationFee,
  DoctorSearchFilters,
} from '@/lib/types/doctor';
import { PaginatedResponse } from '@/lib/types/api';

/**
 * Hook to search for doctors with filters
 */
export function useSearchDoctors(
  filters: DoctorSearchFilters,
  options?: Omit<
    UseQueryOptions<PaginatedResponse<Doctor>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: ['doctors', 'search', filters],
    queryFn: () => searchDoctors(filters),
    ...options,
  });
}

/**
 * Hook to fetch a specific doctor's profile by ID
 */
export function useDoctor(
  id: string,
  options?: Omit<UseQueryOptions<Doctor>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['doctor', id],
    queryFn: () => getDoctor(id),
    enabled: !!id,
    ...options,
  });
}

/**
 * Hook to fetch a doctor's schedules
 */
export function useDoctorSchedules(
  doctorId: string,
  options?: Omit<UseQueryOptions<DoctorSchedule[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['doctor', doctorId, 'schedules'],
    queryFn: () => getDoctorSchedules(doctorId),
    enabled: !!doctorId,
    ...options,
  });
}

/**
 * Hook to fetch a doctor's consultation fees
 */
export function useDoctorFees(
  doctorId: string,
  options?: Omit<UseQueryOptions<ConsultationFee[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['doctor', doctorId, 'fees'],
    queryFn: () => getDoctorFees(doctorId),
    enabled: !!doctorId,
    ...options,
  });
}
