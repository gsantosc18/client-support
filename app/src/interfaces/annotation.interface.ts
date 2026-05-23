export type AnnotationVisibility = 'PUBLIC' | 'PRIVATE';

export interface Annotation {
  id?: string;
  process_id: string;
  company_id?: string;
  user_id: string;
  user?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  annotation: string;
  visibility: AnnotationVisibility;
  created_at?: string;
  updated_at?: string;
}
