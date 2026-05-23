import { useState, useCallback } from 'react';
import { documentService } from '../services/documentService';
import { ProcessDocument } from '@/interfaces/document.interface';

export const useProcessDocuments = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<ProcessDocument[]>([]);

  const fetchDocuments = useCallback(async (processId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await documentService.list(processId);
      setDocuments(data);
      return data;
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.response?.data?.error || 'Erro ao carregar documentos');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadDocument = async (processId: string, name: string, description: string, file: File) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('file', file);

      const res = await documentService.upload(processId, formData);
      setDocuments((prev) => [res, ...prev]);
      return res;
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.response?.data?.error || 'Erro ao fazer upload do documento');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateDocument = async (
    processId: string,
    documentId: string,
    name: string,
    description: string,
    file?: File
  ) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      if (file) {
        formData.append('file', file);
      }

      const res = await documentService.update(processId, documentId, formData);
      setDocuments((prev) =>
        prev.map((item) => (item.id === documentId ? res : item))
      );
      return res;
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.response?.data?.error || 'Erro ao atualizar documento');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (processId: string, documentId: string) => {
    setLoading(true);
    setError(null);
    try {
      await documentService.delete(processId, documentId);
      setDocuments((prev) => prev.filter((item) => item.id !== documentId));
      return true;
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.response?.data?.error || 'Erro ao excluir documento');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const downloadDocument = async (processId: string, documentId: string, documentName: string) => {
    setLoading(true);
    setError(null);
    try {
      const blob = await documentService.download(processId, documentId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', documentName);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      return true;
    } catch (err: any) {
      setError('Erro ao baixar o arquivo');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    documents,
    fetchDocuments,
    uploadDocument,
    updateDocument,
    deleteDocument,
    downloadDocument,
    setError,
  };
};
