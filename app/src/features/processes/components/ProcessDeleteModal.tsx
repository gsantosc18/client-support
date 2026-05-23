import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/forms/Button';

interface ProcessDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  processProtocol: string;
  isLoading: boolean;
  errorMessage: string | null;
}

export const ProcessDeleteModal: React.FC<ProcessDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  processProtocol,
  isLoading,
  errorMessage,
}) => {
  const [confirmText, setConfirmText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setConfirmText('');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isButtonEnabled = confirmText === 'delete';

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isButtonEnabled) {
      await onConfirm();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
      <div className="w-full max-w-md scale-95 transform rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl transition-all duration-300">
        <h2 className="text-xl font-bold text-red-600 flex items-center gap-2">
          <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Excluir Processo?
        </h2>
        
        <p className="mt-3 text-sm text-slate-600 leading-relaxed">
          Tem certeza de que deseja excluir o processo <strong className="text-slate-800 font-semibold">{processProtocol}</strong>? 
          Esta operação irá excluir permanentemente o processo do sistema, limpar todos os seus vínculos com clientes e excluir o estabelecimento associado. Esta ação é irreversível.
        </p>

        {errorMessage && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-100 text-sm font-medium text-red-600 leading-snug">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleConfirm} className="mt-5 space-y-4">
          <div>
            <label htmlFor="delete-confirm" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Para confirmar a exclusão, digite <span className="font-mono lowercase text-red-600 font-bold bg-red-50 px-1.5 py-0.5 rounded">delete</span> no campo abaixo:
            </label>
            <input
              ref={inputRef}
              id="delete-confirm"
              type="text"
              required
              placeholder="Digite delete aqui"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-100 transition-all"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!isButtonEnabled || isLoading}
              isLoading={isLoading}
              className="bg-red-600 hover:bg-red-700 text-white disabled:bg-red-200"
            >
              Remover
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
