import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/forms/Button';
import { ShieldAlert } from 'lucide-react';

interface DocumentSafetyConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
}

export const DocumentSafetyConfirmModal: React.FC<DocumentSafetyConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}) => {
  const [typedText, setTypedText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTypedText('');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isMatched = typedText.trim().toLowerCase() === 'alterar documento';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isMatched) {
      await onConfirm();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-text-primary/75 backdrop-blur-sm transition-all duration-300">
      <div className="w-full max-w-md scale-95 transform rounded-2xl border border-destructive/20 bg-background-surface p-6 shadow-2xl transition-all duration-300">
        <h2 className="text-xl font-bold text-destructive flex items-center gap-2">
          <ShieldAlert className="h-6 w-6 text-destructive" />
          Confirmar Alteração de Arquivo
        </h2>

        <p className="mt-3 text-sm text-text-secondary leading-relaxed">
          Você está substituindo o arquivo físico deste documento. O arquivo antigo continuará disponível apenas nos logs do storage, mas será permanentemente removido da listagem ativa.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="safety-confirm-input"
              className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1"
            >
              Para confirmar, digite <span className="font-mono text-destructive font-bold bg-destructive/10 px-1.5 py-0.5 rounded">alterar documento</span> no campo abaixo:
            </label>
            <input
              ref={inputRef}
              id="safety-confirm-input"
              type="text"
              required
              placeholder="Digite a frase de segurança aqui"
              value={typedText}
              onChange={(e) => setTypedText(e.target.value)}
              className="w-full rounded-lg border border-border-default bg-background-primary px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus-visible:border-destructive focus-visible:bg-background-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive transition-all"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              variant="outline"
            >
              Voltar
            </Button>
            <Button
              type="submit"
              disabled={!isMatched || isLoading}
              isLoading={isLoading}
              className="bg-destructive hover:bg-destructive/90 text-white border-transparent focus-visible:ring-destructive disabled:opacity-50"
            >
              Confirmar Alteração
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
