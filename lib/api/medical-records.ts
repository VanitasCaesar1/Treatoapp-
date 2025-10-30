import { apiClient } from './client';
import {
  MedicalEncounter,
  VitalSigns,
  MedicalHistory,
} from '@/lib/types/medical-record';
import { PaginatedResponse } from '@/lib/types/api';

/**
 * Get all medical encounters for a patient
 */
export async function getPatientEncounters(
  patientId: string,
  params?: { page?: number; pageSize?: number }
): Promise<PaginatedResponse<MedicalEncounter>> {
  return apiClient.get<PaginatedResponse<MedicalEncounter>>(
    `/api/emr/patients/${patientId}/encounters`,
    { params }
  );
}

/**
 * Get a specific medical encounter by ID
 */
export async function getEncounter(encounterId: string): Promise<MedicalEncounter> {
  return apiClient.get<MedicalEncounter>(`/api/emr/encounters/${encounterId}`);
}

/**
 * Get vital signs history for a patient
 */
export async function getPatientVitals(
  patientId: string,
  params?: { startDate?: string; endDate?: string; page?: number; pageSize?: number }
): Promise<PaginatedResponse<VitalSigns>> {
  return apiClient.get<PaginatedResponse<VitalSigns>>(
    `/api/emr/patients/${patientId}/vitals`,
    { params }
  );
}

/**
 * Get diagnosis details by ID
 */
export async function getDiagnosis(diagnosisId: string): Promise<any> {
  return apiClient.get<any>(`/api/diagnosis/${diagnosisId}`);
}

/**
 * Get complete medical history for a patient
 */
export async function getMedicalHistory(patientId: string): Promise<MedicalHistory> {
  return apiClient.get<MedicalHistory>(`/api/patients/${patientId}/medical-history`);
}
