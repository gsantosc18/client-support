export interface Establishment {
  id?: string;
  company_id?: string;
  name: string;
  address: string;
  city: string;
  state: string;
  created_at?: string;
  updated_at?: string;
}

export interface EstablishmentListParams {
  search?: string;
  page?: number;
  limit?: number;
}
