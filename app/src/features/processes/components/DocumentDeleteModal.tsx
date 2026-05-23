import React from 'react';
import { Button } from '@/components/forms/Button';
import { Trash2, AlertTriangle } from 'lucide-react';
import { ProcessDocument } from '@/interfaces/document.interface';

interface DocumentDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: ProcessDocument | null;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
}

export const DocumentDeleteModal: React.FC<DocumentDeleteModalProps> = ({
  isOpen,
  onClose,
  document: doc,
  onConfirm,
  isLoading,
}) => {
  if (!isOpen || !doc) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-text-primary/60 backdrop-blur-sm transition-all duration-300">
      <div className="w-full max-w-md scale-95 transform rounded-2xl border border-border-default bg-background-surface p-6 shadow-xl transition-all duration-300">
        <h2 className="text-xl font-bold text-destructive flex items-center gap-2">
          <Trash2 className="h-6 w-6 text-destructive" />
          Excluir Documento?
        </h2>

        <p className="mt-3 text-sm text-text-secondary leading-relaxed">
          Tem certeza de que deseja excluir o documento <strong className="text-text-primary font-semibold">{doc.name}</strong>?
          O registro no banco de dados será deletado permanentemente e o arquivo associado no storage será arquivado na pasta de lixeira (`trash/`).
        </p>

        <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-xs font-semibold text-destructive flex items-start gap-2">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <span>Esta ação de remoção é definitiva no sistema.</span>
        </div>

        <div className="flex justify-end gap-3 pt-5 border-t border-border-default mt-5">
          <Button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            variant="outline"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            isLoading={isLoading}
            className="bg-destructive hover:bg-destructive/90 text-white border-transparent focus-visible:ring-destructive"
          >
            Excluir permanentemente
          </Button>
        </div>
      </div>
    </div>
  );
};
