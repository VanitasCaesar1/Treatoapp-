import { Doctor } from './doctor';
import { Patient } from './patient';

export type ConsultationType = 'in-person' | 'video' | 'phone';

export type AppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'in-progress'
  | 'completed'
  | 'cancelled';

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentDate: string;
  appointmentTime: string;
  duration: number;
  consultationType: ConsultationType;
  status: AppointmentStatus;
  reason?: string;
  notes?: string;
  videoRoomId?: string;
  createdAt: string;
  updatedAt: string;
  doctor?: Doctor;
  patient?: Patient;

  // Denormalized fields for convenience (populated by backend)
  doctorName?: string;
  specialty?: string;
  location?: string;
}

export interface CreateAppointmentInput {
  doctorId: string;
  appointmentDate: string;
  appointmentTime: string;
  duration: number;
  consultationType: ConsultationType;
  reason?: string;
  notes?: string;
}

export interface UpdateAppointmentInput {
  appointmentDate?: string;
  appointmentTime?: string;
  reason?: string;
  notes?: string;
  status?: AppointmentStatus;
}
