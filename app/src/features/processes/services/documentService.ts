import api from '@/services/api';
import { ProcessDocument } from '@/interfaces/document.interface';

export const documentService = {
  async list(processId: string): Promise<ProcessDocument[]> {
    const response = await api.get(`/processes/${processId}/documents`);
    return response.data;
  },

  async upload(processId: string, formData: FormData): Promise<ProcessDocument> {
    const response = await api.post(`/processes/${processId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async update(processId: string, documentId: string, formData: FormData): Promise<ProcessDocument> {
    const response = await api.put(`/processes/${processId}/documents/${documentId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async delete(processId: string, documentId: string): Promise<{ message: string; id: string }> {
    const response = await api.delete(`/processes/${processId}/documents/${documentId}`);
    return response.data;
  },

  async download(processId: string, documentId: string): Promise<Blob> {
    const response = await api.get(`/processes/${processId}/documents/${documentId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },
};
