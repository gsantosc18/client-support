import React, { useEffect, useState } from 'react';
import { useClientVault } from '../hooks/useClientVault';
import { VaultItem, VaultItemInput } from '../services/vault.service';
import { VaultItemModal } from './VaultItemModal';
import { Button } from '@/components/forms/Button';

interface ClientVaultSectionProps {
  clientId: string;
}

export const ClientVaultSection: React.FC<ClientVaultSectionProps> = ({ clientId }) => {
  const {
    loading,
    error,
    items,
    fetchItems,
    revealItem,
    createItem,
    updateItem,
    deleteItem,
  } = useClientVault();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<VaultItem | null>(null);
  const [revealedItems, setRevealedItems] = useState<Record<string, VaultItem>>({});
  const [revealedLoading, setRevealedLoading] = useState<Record<string, boolean>>({});
  const [localActionLoading, setLocalActionLoading] = useState(false);

  useEffect(() => {
    fetchItems(clientId);
  }, [clientId, fetchItems]);

  const handleOpenCreateModal = () => {
    setSelectedItem(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = async (item: VaultItem) => {
    setLocalActionLoading(true);
    // Fetch full decrypted data before opening the edit modal
    const decrypted = await revealItem(clientId, item.id);
    setLocalActionLoading(false);
    if (decrypted) {
      setSelectedItem(decrypted);
      setModalOpen(true);
    }
  };

  const handleSaveItem = async (data: VaultItemInput) => {
    if (selectedItem) {
      return await updateItem(clientId, selectedItem.id, data);
    } else {
      return await createItem(clientId, data);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (window.confirm('Tem certeza de que deseja remover esta credencial do cofre?')) {
      await deleteItem(clientId, itemId);
      // Remove from revealed state if present
      const newRevealed = { ...revealedItems };
      delete newRevealed[itemId];
      setRevealedItems(newRevealed);
    }
  };

  const handleToggleReveal = async (item: VaultItem) => {
    if (revealedItems[item.id]) {
      // Toggle off
      const newRevealed = { ...revealedItems };
      delete newRevealed[item.id];
      setRevealedItems(newRevealed);
    } else {
      // Toggle on: Fetch decrypted data
      setRevealedLoading((prev) => ({ ...prev, [item.id]: true }));
      const decrypted = await revealItem(clientId, item.id);
      setRevealedLoading((prev) => ({ ...prev, [item.id]: false }));
      if (decrypted) {
        setRevealedItems((prev) => ({ ...prev, [item.id]: decrypted }));
      }
    }
  };

  const handleCopyPassword = (itemId: string) => {
    const revealed = revealedItems[itemId];
    if (revealed && revealed.password) {
      navigator.clipboard.writeText(revealed.password);
      alert('Senha copiada para a área de transferência!');
    }
  };

  return (
    <div className="mt-8 bg-background-surface border border-border-default rounded-2xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border-muted pb-4 mb-6 gap-4">
        <div>
          <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <svg className="h-5 w-5 text-action-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Cofre de Credenciais Sigilosas
          </h3>
          <p className="text-text-muted text-xs mt-1">
            Armazene e gerencie chaves e senhas de acesso aos portais do cliente de forma encriptada e segura.
          </p>
        </div>
        <Button
          onClick={handleOpenCreateModal}
          variant="primary"
          className="flex items-center gap-2 self-start sm:self-auto"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nova Credencial
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm font-medium text-destructive">
          {error}
        </div>
      )}

      {loading && items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10">
          <div className="h-6 w-6 border-2 border-border-default border-t-action-primary rounded-full animate-spin"></div>
          <p className="text-text-muted text-xs mt-2 font-medium">Carregando cofre...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border-default rounded-xl">
          <svg className="h-10 w-10 text-text-muted mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <p className="text-text-secondary text-sm font-medium">Nenhuma credencial sigilosa cadastrada.</p>
          <p className="text-text-muted text-xs mt-1 max-w-sm mx-auto">
            Clique no botão acima para adicionar a primeira senha e mantê-la segura.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border-muted text-sm text-left">
            <thead>
              <tr className="text-text-muted font-bold text-xs uppercase tracking-wider">
                <th className="py-3 px-4">Título / Acesso</th>
                <th className="py-3 px-4">Senha / Código</th>
                <th className="py-3 px-4">Notas / Observações</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-muted text-text-primary">
              {items.map((item) => {
                const isRevealed = !!revealedItems[item.id];
                const decItem = revealedItems[item.id];
                const isRevLoading = !!revealedLoading[item.id];

                return (
                  <tr key={item.id} className="hover:bg-background-muted/40 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-text-primary">{item.title}</td>
                    <td className="py-3.5 px-4 font-mono text-xs">
                      {isRevLoading ? (
                        <span className="animate-pulse text-text-muted">Descriptografando...</span>
                      ) : isRevealed && decItem ? (
                        <span className="text-action-primary bg-action-primary/5 px-2 py-0.5 rounded font-bold">
                          {decItem.password}
                        </span>
                      ) : (
                        <span className="text-text-muted tracking-widest font-black">••••••••</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-text-secondary max-w-xs truncate">
                      {isRevealed && decItem ? decItem.notes || '-' : '• Ocultado •'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        {/* Toggle Reveal Button */}
                        <button
                          onClick={() => handleToggleReveal(item)}
                          disabled={isRevLoading}
                          title={isRevealed ? 'Ocultar Credencial' : 'Revelar e Descriptografar'}
                          className={`p-1.5 rounded-lg border transition-all ${
                            isRevealed
                              ? 'bg-action-primary/10 border-action-primary/20 text-action-primary hover:bg-action-primary/20'
                              : 'bg-background-primary border-border-default text-text-muted hover:text-text-primary hover:border-border-muted'
                          }`}
                        >
                          {isRevealed ? (
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                            </svg>
                          ) : (
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                        </button>

                        {/* Copy Password Button (Only when revealed) */}
                        <button
                          onClick={() => handleCopyPassword(item.id)}
                          disabled={!isRevealed}
                          title={isRevealed ? 'Copiar Senha' : 'Exiba a senha para copiar'}
                          className={`p-1.5 rounded-lg border transition-all ${
                            isRevealed
                              ? 'bg-background-primary border-border-default text-text-muted hover:text-text-primary hover:border-border-muted hover:bg-background-muted'
                              : 'bg-background-primary border-border-default opacity-40 cursor-not-allowed text-text-muted'
                          }`}
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                          </svg>
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          disabled={localActionLoading}
                          title="Editar Credencial"
                          className="p-1.5 rounded-lg border bg-background-primary border-border-default text-text-muted hover:text-action-primary hover:border-action-primary/20 hover:bg-action-primary/5 transition-all"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          title="Excluir Credencial"
                          className="p-1.5 rounded-lg border bg-background-primary border-border-default text-text-muted hover:text-destructive hover:border-destructive/20 hover:bg-destructive/5 transition-all"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal form */}
      <VaultItemModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveItem}
        item={selectedItem}
        isLoading={loading}
      />
    </div>
  );
};
