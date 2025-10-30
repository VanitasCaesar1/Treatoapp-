export interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  specialty: string;
  subSpecialties?: string[];
  licenseNumber: string;
  yearsOfExperience: number;
  education: string[];
  hospitalAffiliations: string[];
  rating?: number;
  reviewCount?: number;
  bio?: string;
  languages?: string[];
  profileImage?: string;
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
  specialty?: string;
  location?: string;
  date?: string;
  minRating?: number;
  maxFee?: number;
  languages?: string[];
  page?: number;
  pageSize?: number;
}
