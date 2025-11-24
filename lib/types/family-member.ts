export interface FamilyMember {
    id: string;
    name: string;
    relationship: 'self' | 'spouse' | 'child' | 'parent' | 'sibling' | 'other';
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'other';
    bloodGroup?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
    allergies?: string[];
    phone?: string;
    email?: string;
}

export interface FamilyMemberInput {
    name: string;
    relationship: 'spouse' | 'child' | 'parent' | 'sibling' | 'other';
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'other';
    bloodGroup?: string;
    allergies?: string[];
    phone?: string;
    email?: string;
}
