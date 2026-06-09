import api from './api';

export const authService = {
  register: async (data: any) => {
    const companyId = process.env.NEXT_PUBLIC_COMPANY_ID || data.company_id || '11111111-1111-1111-1111-111111111111'; 
    const response = await api.post(`/auth/register?company_id=${companyId}`, data);
    return response.data;
  },
  login: async (data: any) => {
    const companyId = process.env.NEXT_PUBLIC_COMPANY_ID || data.company_id || '11111111-1111-1111-1111-111111111111';
    const response = await api.post('/auth/login', { ...data, company_id: companyId });
    return response.data;
  },
  recoverPassword: async (data: { email: string, company_id?: string }) => {
    const companyId = process.env.NEXT_PUBLIC_COMPANY_ID || data.company_id || '11111111-1111-1111-1111-111111111111';
    const response = await api.post('/auth/forgot-password', { ...data, company_id: companyId });
    return response.data;
  },
  resetPassword: async (data: any) => {
    const response = await api.post('/auth/reset-password', data);
    return response.data;
  },
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
  validateInvitation: async (token: string) => {
    const response = await api.get(`/auth/validate-invitation?token=${token}`);
    return response.data;
  },
  createInvitation: async (email: string) => {
    const response = await api.post('/auth/invitations', { email });
    return response.data;
  }
};
