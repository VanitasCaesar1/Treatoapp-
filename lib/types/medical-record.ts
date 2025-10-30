export interface Prescription {
  id: string;
  medicineId: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface MedicalEncounter {
  id: string;
  patientId: string;
  doctorId: string;
  encounterDate: string;
  encounterType: string;
  chiefComplaint: string;
  diagnosis: string[];
  treatment: string;
  prescriptions: Prescription[];
  followUpDate?: string;
  notes?: string;
}

export interface VitalSigns {
  id: string;
  patientId: string;
  recordedAt: string;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRate?: number;
  temperature?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  weight?: number;
  height?: number;
  bmi?: number;
}

export interface MedicalHistory {
  encounters: MedicalEncounter[];
  vitals: VitalSigns[];
  allergies: string[];
  medicalConditions: string[];
}
