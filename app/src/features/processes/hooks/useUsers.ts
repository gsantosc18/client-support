import { useState, useCallback } from 'react';
import { userService } from '../services/user.service';
import { User } from '@/interfaces/user.interface';

export const useUsers = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.list();
      setUsers(data);
      return data;
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || 'Erro ao carregar responsáveis');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    users,
    fetchUsers,
  };
};
