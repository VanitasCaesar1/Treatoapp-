export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface Patient {
  id: string;
  authId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: Address;
  emergencyContact?: EmergencyContact;
  medicalConditions?: string[];
  allergies?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UpdatePatientInput {
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: Address;
  emergencyContact?: EmergencyContact;
  medicalConditions?: string[];
  allergies?: string[];
}
