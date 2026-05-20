import api from './api';

export const authService = {
  register: async (data: any) => {
    // get company_id from somewhere or URL, for now let's pass it in data
    const companyId = data.company_id || '11111111-1111-1111-1111-111111111111'; 
    const response = await api.post(`/auth/register?company_id=${companyId}`, data);
    return response.data;
  },
  login: async (data: any) => {
    // Add default companyId just for testing, in real case should come from context/url
    data.company_id = data.company_id || '11111111-1111-1111-1111-111111111111';
    const response = await api.post('/auth/login', data);
    return response.data;
  },
  recoverPassword: async (data: { email: string, company_id: string }) => {
    data.company_id = data.company_id || '11111111-1111-1111-1111-111111111111';
    const response = await api.post('/auth/forgot-password', data);
    return response.data;
  },
  resetPassword: async (data: any) => {
    const response = await api.post('/auth/reset-password', data);
    return response.data;
  },
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  }
};
