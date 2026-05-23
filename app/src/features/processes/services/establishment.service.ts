import api from '@/services/api';
import { Establishment, EstablishmentListParams } from '@/interfaces/establishment.interface';
import { PaginatedResponse } from '@/interfaces/client.interface';

export const establishmentService = {
  async list(params?: EstablishmentListParams): Promise<PaginatedResponse<Establishment>> {
    const response = await api.get('/establishments', { params });
    return response.data;
  },

  async create(data: Establishment): Promise<Establishment> {
    const response = await api.post('/establishments', data);
    return response.data;
  },
};
