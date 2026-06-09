import api from '@/services/api';

export interface Company {
  id: string;
  name: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export const companyService = {
  async getCompany(): Promise<Company> {
    const response = await api.get('/company');
    return response.data;
  },
};
