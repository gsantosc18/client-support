import { useState, useCallback } from 'react';
import { processService } from '../services/process.service';
import { Process, ProcessListParams } from '@/interfaces/process.interface';
import { PaginatedResponse } from '@/interfaces/client.interface';

export const useProcesses = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paginatedData, setPaginatedData] = useState<PaginatedResponse<Process> | null>(null);
  const [process, setProcess] = useState<Process | null>(null);

  const fetchProcesses = useCallback(async (params?: ProcessListParams) => {
    setLoading(true);
    setError(null);
    try {
      const data = await processService.list(params);
      setPaginatedData(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar processos');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProcessByID = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await processService.getByID(id);
      setProcess(data);
      return data;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao buscar processo');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createProcess = async (data: Partial<Process>) => {
    setLoading(true);
    setError(null);
    try {
      const res = await processService.create(data);
      return res;
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Erro ao abrir processo');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateProcess = async (id: string, data: Partial<Process>) => {
    setLoading(true);
    setError(null);
    try {
      const res = await processService.update(id, data);
      return res;
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Erro ao atualizar processo');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateProcessStatus = async (id: string, status: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await processService.updateStatus(id, status);
      if (process && process.id === id) {
        setProcess(res);
      }
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Erro ao atualizar status');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteProcess = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await processService.delete(id);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao excluir processo');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    paginatedData,
    process,
    fetchProcesses,
    fetchProcessByID,
    createProcess,
    updateProcess,
    updateProcessStatus,
    deleteProcess,
    setError,
  };
};
