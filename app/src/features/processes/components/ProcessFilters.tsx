import React, { useState, useEffect } from 'react';
import { Button } from '@/components/forms/Button';

interface ProcessFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: { protocol: string; status: string }) => void;
  onClear: () => void;
  initialProtocol: string;
  initialStatus: string;
}

export const ProcessFilters: React.FC<ProcessFiltersProps> = ({
  isOpen,
  onClose,
  onApply,
  onClear,
  initialProtocol,
  initialStatus,
}) => {
  const [protocol, setProtocol] = useState(initialProtocol);
  const [status, setStatus] = useState(initialStatus);

  useEffect(() => {
    if (isOpen) {
      setProtocol(initialProtocol);
      setStatus(initialStatus);
    }
  }, [isOpen, initialProtocol, initialStatus]);

  if (!isOpen) return null;

  const handleApply = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onApply({ protocol, status });
  };

  const handleClear = () => {
    setProtocol('');
    setStatus('');
    onClear();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-text-primary/60 backdrop-blur-sm transition-all duration-300">
      <div className="w-full max-w-md scale-95 transform rounded-2xl border border-border-default bg-background-surface p-6 shadow-lg transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <svg className="h-5 w-5 text-action-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filtrar Processos
          </h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleApply} className="space-y-4">
          <div>
            <label htmlFor="filter-protocol" className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
              Buscar por Protocolo
            </label>
            <input
              id="filter-protocol"
              type="text"
              placeholder="Ex: PROC-2026-99"
              value={protocol}
              onChange={(e) => setProtocol(e.target.value)}
              className="w-full rounded-lg border border-border-default bg-background-primary px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus-visible:border-action-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring transition-all"
            />
          </div>

          <div>
            <label htmlFor="filter-status" className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
              Status do Processo
            </label>
            <select
              id="filter-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-lg border border-border-default bg-background-primary px-3 py-2 text-sm text-text-primary focus-visible:border-action-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring transition-all"
            >
              <option value="">Todos os Status</option>
              <option value="PENDING">Pendente</option>
              <option value="IN_PROGRESS">Em Andamento</option>
              <option value="AWAITING_DOCUMENTATION">Aguardando Documentação</option>
              <option value="IN_ANALYSIS">Em Análise</option>
              <option value="COMPLETED">Concluído</option>
              <option value="CANCELLED">Cancelado</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border-default">
            <Button
              type="button"
              onClick={handleClear}
              variant="outline"
            >
              Limpar Filtros
            </Button>
            <Button
              type="submit"
              variant="primary"
            >
              Aplicar Filtros
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
