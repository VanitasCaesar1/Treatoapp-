export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  manufacturer: string;
  category: string;
  form: string;
  strength: string;
  indications: string[];
  contraindications: string[];
  sideEffects: string[];
  dosageInstructions: string;
}

export interface MedicineSearchFilters {
  query: string;
  category?: string;
  form?: string;
  page?: number;
  pageSize?: number;
}
