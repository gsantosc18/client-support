export interface Client {
  id?: string;
  company_id?: string;
  full_name: string;
  email?: string | null;
  phone?: string | null;
  birth_date?: string | null; // format YYYY-MM-DD
  cpf?: string | null;
  rg?: string | null;
  cnh?: string | null;
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  created_at?: string;
  updated_at?: string;
}

export interface ClientListParams {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    current_page: number;
    limit: number;
    total_records: number;
    total_pages: number;
  };
}
