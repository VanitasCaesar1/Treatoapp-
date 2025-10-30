import {
  useQuery,
  UseQueryOptions,
} from '@tanstack/react-query';
import {
  getPatientEncounters,
  getEncounter,
  getPatientVitals,
  getDiagnosis,
  getMedicalHistory,
} from '@/lib/api/medical-records';
import {
  MedicalEncounter,
  VitalSigns,
  MedicalHistory,
} from '@/lib/types/medical-record';
import { PaginatedResponse } from '@/lib/types/api';

/**
 * Hook to fetch complete medical history for a patient
 */
export function useMedicalHistory(
  patientId: string,
  options?: Omit<UseQueryOptions<MedicalHistory>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['medical-history', patientId],
    queryFn: () => getMedicalHistory(patientId),
    enabled: !!patientId,
    ...options,
  });
}

/**
 * Hook to fetch all medical encounters for a patient
 */
export function usePatientEncounters(
  patientId: string,
  params?: { page?: number; pageSize?: number },
  options?: Omit<
    UseQueryOptions<PaginatedResponse<MedicalEncounter>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: ['patient-encounters', patientId, params],
    queryFn: () => getPatientEncounters(patientId, params),
    enabled: !!patientId,
    ...options,
  });
}

/**
 * Hook to fetch a specific medical encounter by ID
 */
export function useEncounter(
  encounterId: string,
  options?: Omit<UseQueryOptions<MedicalEncounter>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['encounter', encounterId],
    queryFn: () => getEncounter(encounterId),
    enabled: !!encounterId,
    ...options,
  });
}

/**
 * Hook to fetch vital signs history for a patient
 */
export function useVitals(
  patientId: string,
  params?: {
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
  },
  options?: Omit<
    UseQueryOptions<PaginatedResponse<VitalSigns>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: ['vitals', patientId, params],
    queryFn: () => getPatientVitals(patientId, params),
    enabled: !!patientId,
    ...options,
  });
}

/**
 * Hook to fetch diagnosis details by ID
 */
export function useDiagnosis(
  diagnosisId: string,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['diagnosis', diagnosisId],
    queryFn: () => getDiagnosis(diagnosisId),
    enabled: !!diagnosisId,
    ...options,
  });
}
