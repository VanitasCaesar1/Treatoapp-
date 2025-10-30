import { apiClient } from './client';
import { MedicalTemplate, TemplateSearchFilters } from '@/lib/types/template';
import { PaginatedResponse } from '@/lib/types/api';

/**
 * Get all templates (feed)
 */
export async function getTemplates(params?: {
  page?: number;
  pageSize?: number;
  category?: string;
  specialty?: string;
}): Promise<PaginatedResponse<MedicalTemplate>> {
  return apiClient.get<PaginatedResponse<MedicalTemplate>>(
    '/api/templates/feed',
    { params }
  );
}

/**
 * Search templates with filters
 */
export async function searchTemplates(
  filters: TemplateSearchFilters
): Promise<PaginatedResponse<MedicalTemplate>> {
  return apiClient.get<PaginatedResponse<MedicalTemplate>>(
    '/api/templates/search',
    { params: filters }
  );
}

/**
 * Get a specific template by ID
 */
export async function getTemplate(id: string): Promise<MedicalTemplate> {
  return apiClient.get<MedicalTemplate>(`/api/templates/${id}`);
}

/**
 * Like or unlike a template
 */
export async function toggleLikeTemplate(id: string): Promise<MedicalTemplate> {
  return apiClient.post<MedicalTemplate>(`/api/templates/${id}/like`);
}

/**
 * Save or unsave a template
 */
export async function toggleSaveTemplate(id: string): Promise<MedicalTemplate> {
  return apiClient.post<MedicalTemplate>(`/api/templates/${id}/save`);
}

/**
 * Increment usage count for a template
 */
export async function useTemplate(id: string): Promise<MedicalTemplate> {
  return apiClient.post<MedicalTemplate>(`/api/templates/${id}/use`);
}

/**
 * Get saved templates for the current user
 */
export async function getSavedTemplates(params?: {
  page?: number;
  pageSize?: number;
}): Promise<PaginatedResponse<MedicalTemplate>> {
  return apiClient.get<PaginatedResponse<MedicalTemplate>>(
    '/api/templates/saved',
    { params }
  );
}
