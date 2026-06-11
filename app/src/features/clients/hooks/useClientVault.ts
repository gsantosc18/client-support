import { useState, useCallback } from 'react';
import { vaultService, VaultItem, VaultItemInput } from '../services/vault.service';

export const useClientVault = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<VaultItem[]>([]);

  const fetchItems = useCallback(async (clientId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await vaultService.list(clientId);
      setItems(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar itens do cofre');
    } finally {
      setLoading(false);
    }
  }, []);

  const revealItem = async (clientId: string, itemId: string): Promise<VaultItem | null> => {
    setError(null);
    try {
      const data = await vaultService.getByID(clientId, itemId);
      return data;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao revelar informações confidenciais');
      return null;
    }
  };

  const createItem = async (clientId: string, data: VaultItemInput) => {
    setLoading(true);
    setError(null);
    try {
      await vaultService.create(clientId, data);
      await fetchItems(clientId);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao salvar item no cofre');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async (clientId: string, itemId: string, data: VaultItemInput) => {
    setLoading(true);
    setError(null);
    try {
      await vaultService.update(clientId, itemId, data);
      await fetchItems(clientId);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao atualizar item do cofre');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (clientId: string, itemId: string) => {
    setLoading(true);
    setError(null);
    try {
      await vaultService.delete(clientId, itemId);
      await fetchItems(clientId);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao remover item do cofre');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    items,
    fetchItems,
    revealItem,
    createItem,
    updateItem,
    deleteItem,
  };
};
