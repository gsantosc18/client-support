import { useState, useCallback } from 'react';
import { clientService } from '../services/client.service';
import { Client, ClientListParams, PaginatedResponse } from '@/interfaces/client.interface';

export const useClients = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paginatedData, setPaginatedData] = useState<PaginatedResponse<Client> | null>(null);
  const [client, setClient] = useState<Client | null>(null);

  const fetchClients = useCallback(async (params?: ClientListParams) => {
    setLoading(true);
    setError(null);
    try {
      const data = await clientService.list(params);
      setPaginatedData(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchClientByID = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await clientService.getByID(id);
      setClient(data);
      return data;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao buscar cliente');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createClient = async (data: Client) => {
    setLoading(true);
    setError(null);
    try {
      await clientService.create(data);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Erro ao cadastrar cliente');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateClient = async (id: string, data: Client) => {
    setLoading(true);
    setError(null);
    try {
      await clientService.update(id, data);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Erro ao atualizar cliente');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteClient = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await clientService.delete(id);
      return { success: true };
    } catch (err: any) {
      const errMsg = err.response?.data?.error || 'Erro ao remover cliente';
      setError(errMsg);
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    paginatedData,
    client,
    fetchClients,
    fetchClientByID,
    createClient,
    updateClient,
    deleteClient,
    setError,
  };
};
