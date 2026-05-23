import api from '@/services/api';
import { Annotation } from '@/interfaces/annotation.interface';

export const annotationService = {
  async list(processId: string): Promise<Annotation[]> {
    const response = await api.get(`/processes/${processId}/annotations`);
    return response.data;
  },

  async create(processId: string, data: { annotation: string; visibility: string }): Promise<Annotation> {
    const response = await api.post(`/processes/${processId}/annotations`, data);
    return response.data;
  },

  async update(processId: string, annotationId: string, data: { annotation: string }): Promise<Annotation> {
    const response = await api.put(`/processes/${processId}/annotations/${annotationId}`, data);
    return response.data;
  },

  async delete(processId: string, annotationId: string): Promise<{ message: string; id: string }> {
    const response = await api.delete(`/processes/${processId}/annotations/${annotationId}`);
    return response.data;
  },
};
