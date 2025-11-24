export interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  specialty?: string; // For backward compatibility
  specialization?: string[]; // JSONB array from backend
  subSpecialties?: string[];
  licenseNumber: string;
  yearsOfExperience?: number; // For backward compatibility
  years_of_experience?: number; // From backend
  experience?: number; // Computed field
  education?: string[];
  hospitalAffiliations?: string[];
  rating?: number;
  reviewCount?: number;
  bio?: string;
  languages?: string[]; // For backward compatibility
  languages_spoken?: string[]; // JSONB array from backend
  profileImage?: string;
  profile_image?: string; // From backend
  location?: string;
  hospital_id?: string;
  org_id?: string;
  price?: number | null; // Consultation fee
  hospitalName?: string; // Hospital name for display
}

export interface DoctorSchedule {
  id: string;
  doctorId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDuration: number;
  isAvailable: boolean;
}

export interface ConsultationFee {
  id: string;
  doctorId: string;
  consultationType: string;
  amount: number;
  currency: string;
}

export interface DoctorSearchFilters {
  query?: string; // General search query
  specialty?: string;
  location?: string;
  date?: string;
  availability?: string;
  rating?: number; // Minimum rating filter
  experience?: number; // Minimum years of experience
  languages?: string[];
  page?: number;
  pageSize?: number;
}
