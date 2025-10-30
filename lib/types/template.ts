export type TemplateFieldType = 
  | 'text' 
  | 'textarea' 
  | 'select' 
  | 'checkbox' 
  | 'date' 
  | 'number';

export interface TemplateField {
  id: string;
  label: string;
  type: TemplateFieldType;
  required: boolean;
  options?: string[];
  placeholder?: string;
}

export interface MedicalTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  specialty: string;
  content: TemplateField[];
  authorId: string;
  authorName: string;
  likesCount: number;
  savesCount: number;
  usageCount: number;
  isLiked: boolean;
  isSaved: boolean;
  tags: string[];
  createdAt: string;
}

export interface TemplateSearchFilters {
  category?: string;
  specialty?: string;
  tags?: string[];
  query?: string;
  page?: number;
  pageSize?: number;
}
