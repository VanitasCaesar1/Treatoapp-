import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from '@tanstack/react-query';
import {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  cancelAppointment,
} from '@/lib/api/appointments';
import {
  Appointment,
  CreateAppointmentInput,
  UpdateAppointmentInput,
} from '@/lib/types/appointment';
import { PaginatedResponse } from '@/lib/types/api';

/**
 * Hook to fetch all appointments for the current user
 */
export function useAppointments(
  params?: {
    status?: string;
    page?: number;
    pageSize?: number;
  },
  options?: Omit<
    UseQueryOptions<PaginatedResponse<Appointment>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: ['appointments', params],
    queryFn: () => getAppointments(params),
    ...options,
  });
}

/**
 * Hook to fetch a specific appointment by ID
 */
export function useAppointment(
  id: string,
  options?: Omit<UseQueryOptions<Appointment>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['appointment', id],
    queryFn: () => getAppointment(id),
    enabled: !!id,
    ...options,
  });
}

/**
 * Hook to create a new appointment
 */
export function useCreateAppointment(
  options?: UseMutationOptions<Appointment, Error, CreateAppointmentInput>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAppointment,
    onSuccess: (data) => {
      // Invalidate appointments list to refetch
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      // Set the new appointment in cache
      queryClient.setQueryData(['appointment', data.id], data);
    },
    ...options,
  });
}

/**
 * Hook to update an existing appointment
 */
export function useUpdateAppointment(
  options?: UseMutationOptions<
    Appointment,
    Error,
    { id: string; input: UpdateAppointmentInput }
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }) => updateAppointment(id, input),
    onSuccess: (data, variables) => {
      // Invalidate appointments list
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      // Update the specific appointment in cache
      queryClient.setQueryData(['appointment', variables.id], data);
    },
    ...options,
  });
}

/**
 * Hook to cancel an appointment
 */
export function useCancelAppointment(
  options?: UseMutationOptions<void, Error, string>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelAppointment,
    onSuccess: (_, appointmentId) => {
      // Invalidate appointments list to refetch
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      // Remove the cancelled appointment from cache
      queryClient.removeQueries({ queryKey: ['appointment', appointmentId] });
    },
    ...options,
  });
}
