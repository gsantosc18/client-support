import api from '@/services/api';

export interface VaultItem {
  id: string;
  client_id: string;
  company_id: string;
  user_id: string;
  title: string;
  password?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface VaultItemInput {
  title: string;
  password?: string;
  notes?: string;
}

export const vaultService = {
  async list(clientId: string): Promise<VaultItem[]> {
    const response = await api.get(`/clients/${clientId}/vault`);
    return response.data;
  },

  async getByID(clientId: string, itemId: string): Promise<VaultItem> {
    const response = await api.get(`/clients/${clientId}/vault/${itemId}`);
    return response.data;
  },

  async create(clientId: string, data: VaultItemInput): Promise<VaultItem> {
    const response = await api.post(`/clients/${clientId}/vault`, data);
    return response.data;
  },

  async update(clientId: string, itemId: string, data: VaultItemInput): Promise<{ message: string }> {
    const response = await api.put(`/clients/${clientId}/vault/${itemId}`, data);
    return response.data;
  },

  async delete(clientId: string, itemId: string): Promise<void> {
    await api.delete(`/clients/${clientId}/vault/${itemId}`);
  },
};
