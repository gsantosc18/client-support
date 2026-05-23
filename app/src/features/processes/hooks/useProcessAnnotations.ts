import { useState, useCallback } from 'react';
import { annotationService } from '../services/annotationService';
import { Annotation } from '@/interfaces/annotation.interface';

export const useProcessAnnotations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);

  const fetchAnnotations = useCallback(async (processId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await annotationService.list(processId);
      setAnnotations(data);
      return data;
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.response?.data?.error || 'Erro ao carregar anotações');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createAnnotation = async (processId: string, text: string, visibility: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await annotationService.create(processId, { annotation: text, visibility });
      setAnnotations((prev) => [res, ...prev]);
      return res;
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.response?.data?.error || 'Erro ao criar anotação');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateAnnotation = async (processId: string, annotationId: string, text: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await annotationService.update(processId, annotationId, { annotation: text });
      setAnnotations((prev) =>
        prev.map((item) => (item.id === annotationId ? res : item))
      );
      return res;
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.response?.data?.error || 'Erro ao atualizar anotação');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteAnnotation = async (processId: string, annotationId: string) => {
    setLoading(true);
    setError(null);
    try {
      await annotationService.delete(processId, annotationId);
      setAnnotations((prev) => prev.filter((item) => item.id !== annotationId));
      return true;
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.response?.data?.error || 'Erro ao excluir anotação');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    annotations,
    fetchAnnotations,
    createAnnotation,
    updateAnnotation,
    deleteAnnotation,
    setError,
  };
};
