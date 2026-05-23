import { useState, useCallback } from 'react';
import { establishmentService } from '../services/establishment.service';
import { Establishment, EstablishmentListParams } from '@/interfaces/establishment.interface';
import { PaginatedResponse } from '@/interfaces/client.interface';

export const useEstablishments = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paginatedData, setPaginatedData] = useState<PaginatedResponse<Establishment> | null>(null);

  const fetchEstablishments = useCallback(async (params?: EstablishmentListParams) => {
    setLoading(true);
    setError(null);
    try {
      const data = await establishmentService.list(params);
      setPaginatedData(data);
      return data;
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || 'Erro ao carregar estabelecimentos');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createEstablishment = async (data: Establishment) => {
    setLoading(true);
    setError(null);
    try {
      const res = await establishmentService.create(data);
      return res;
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Erro ao cadastrar estabelecimento');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    paginatedData,
    fetchEstablishments,
    createEstablishment,
    setError,
  };
};
