import { apiClient } from './client';
import { Patient, UpdatePatientInput } from '@/lib/types/patient';
import { MedicalHistory } from '@/lib/types/medical-record';

/**
 * Get the current patient's profile
 */
export async function getPatientProfile(id: string): Promise<Patient> {
  return apiClient.get<Patient>(`/api/patients/${id}`);
}

/**
 * Update the current patient's profile
 */
export async function updatePatientProfile(
  id: string,
  input: UpdatePatientInput
): Promise<Patient> {
  return apiClient.put<Patient>(`/api/patients/${id}`, input);
}

/**
 * Get the patient's medical history
 */
export async function getPatientMedicalHistory(
  id: string
): Promise<MedicalHistory> {
  return apiClient.get<MedicalHistory>(`/api/patients/${id}/medical-history`);
}

/**
 * Search patients (for admin/doctor use)
 */
export async function searchPatients(query: string): Promise<Patient[]> {
  return apiClient.get<Patient[]>('/api/patients/search', {
    params: { q: query },
  });
}
