import api from '@/services/api';
import { User } from '@/interfaces/user.interface';

export const userService = {
  async list(): Promise<User[]> {
    const response = await api.get('/users');
    return response.data;
  },
};
