import { apiClient } from './client';
import { Medicine, MedicineSearchFilters } from '@/lib/types/medicine';
import { PaginatedResponse } from '@/lib/types/api';

/**
 * Search for medicines
 */
export async function searchMedicines(
  filters: MedicineSearchFilters
): Promise<PaginatedResponse<Medicine>> {
  return apiClient.get<PaginatedResponse<Medicine>>('/api/medicines/search', {
    params: filters,
  });
}

/**
 * Get a specific medicine by ID
 */
export async function getMedicine(id: string): Promise<Medicine> {
  return apiClient.get<Medicine>(`/api/medicines/${id}`);
}

/**
 * Get autocomplete suggestions for medicine search
 */
export async function getMedicineSuggestions(query: string): Promise<string[]> {
  return apiClient.get<string[]>('/api/medicines/suggestions', {
    params: { q: query },
  });
}
