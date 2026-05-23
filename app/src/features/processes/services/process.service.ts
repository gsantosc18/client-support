import api from '@/services/api';
import { Process, ProcessListParams } from '@/interfaces/process.interface';
import { PaginatedResponse } from '@/interfaces/client.interface';

export const processService = {
  async list(params?: ProcessListParams): Promise<PaginatedResponse<Process>> {
    const response = await api.get('/processes', { params });
    return response.data;
  },

  async getByID(id: string): Promise<Process> {
    const response = await api.get(`/processes/${id}`);
    return response.data;
  },

  async create(data: Partial<Process>): Promise<Process> {
    const response = await api.post('/processes', data);
    return response.data;
  },

  async update(id: string, data: Partial<Process>): Promise<Process> {
    const response = await api.put(`/processes/${id}`, data);
    return response.data;
  },

  async updateStatus(id: string, status: string): Promise<Process> {
    const response = await api.patch(`/processes/${id}/status`, { status });
    return response.data;
  },

  async delete(id: string): Promise<{ message: string; id: string }> {
    const response = await api.delete(`/processes/${id}`);
    return response.data;
  },
};
