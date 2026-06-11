import React, { useState, useEffect } from 'react';
import { Button } from '@/components/forms/Button';
import { VaultItem, VaultItemInput } from '../services/vault.service';

interface VaultItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: VaultItemInput) => Promise<boolean>;
  item: VaultItem | null;
  isLoading: boolean;
}

export const VaultItemModal: React.FC<VaultItemModalProps> = ({
  isOpen,
  onClose,
  onSave,
  item,
  isLoading,
}) => {
  const [title, setTitle] = useState('');
  const [password, setPassword] = useState('');
  const [notes, setNotes] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (item) {
        setTitle(item.title || '');
        setPassword(item.password || '');
        setNotes(item.notes || '');
      } else {
        setTitle('');
        setPassword('');
        setNotes('');
      }
      setValidationError(null);
    }
  }, [isOpen, item]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!title.trim()) {
      setValidationError('O título é obrigatório.');
      return;
    }
    if (!password.trim()) {
      setValidationError('A senha é obrigatória.');
      return;
    }

    const payload: VaultItemInput = {
      title: title.trim(),
      password: password.trim(),
      notes: notes.trim() || undefined,
    };

    const success = await onSave(payload);
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-text-primary/60 backdrop-blur-sm transition-all duration-300">
      <div className="w-full max-w-lg scale-95 transform rounded-2xl border border-border-default bg-background-surface p-6 shadow-xl transition-all duration-300">
        <h2 className="text-xl font-bold text-text-primary flex items-center gap-2 border-b border-border-muted pb-3">
          <svg className="h-6 w-6 text-action-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          {item ? 'Editar Credencial' : 'Nova Credencial Sigilosa'}
        </h2>

        {validationError && (
          <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm font-medium text-destructive leading-snug">
            {validationError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label htmlFor="vault-title" className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">
              Título / Nome do Acesso *
            </label>
            <input
              id="vault-title"
              type="text"
              required
              placeholder="Ex: Portal e-CAC, Acesso Servidor AWS"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-border-default bg-background-primary px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus-visible:border-action-primary focus-visible:bg-background-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary/20 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label htmlFor="vault-password" className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">
                Senha / Chave Secreta *
              </label>
              <input
                id="vault-password"
                type="text"
                required
                placeholder="Digite a senha sigilosa"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-border-default bg-background-primary px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus-visible:border-action-primary focus-visible:bg-background-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary/20 transition-all"
              />
            </div>
          </div>

          <div>
            <label htmlFor="vault-notes" className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">
              Observações / Instruções Sigilosas (Opcional)
            </label>
            <textarea
              id="vault-notes"
              rows={3}
              placeholder="Ex: Utilizar token gerado no app corporativo para autenticação de 2 fatores."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-lg border border-border-default bg-background-primary px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus-visible:border-action-primary focus-visible:bg-background-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary/20 transition-all resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border-muted">
            <Button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              variant="outline"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              isLoading={isLoading}
              variant="primary"
            >
              {item ? 'Salvar Alterações' : 'Guardar Credencial'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
