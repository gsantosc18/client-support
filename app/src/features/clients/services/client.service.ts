import api from '@/services/api';
import { Client, ClientListParams, PaginatedResponse } from '@/interfaces/client.interface';

export const clientService = {
  async list(params?: ClientListParams): Promise<PaginatedResponse<Client>> {
    const response = await api.get('/clients', { params });
    return response.data;
  },

  async getByID(id: string): Promise<Client> {
    const response = await api.get(`/clients/${id}`);
    return response.data;
  },

  async create(data: Client): Promise<Client> {
    const response = await api.post('/clients', data);
    return response.data;
  },

  async update(id: string, data: Client): Promise<Client> {
    const response = await api.put(`/clients/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<{ message: string; id: string; status: string }> {
    const response = await api.delete(`/clients/${id}`);
    return response.data;
  },
};
