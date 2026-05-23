import React from 'react';

interface ClientFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
}

export const ClientFilters: React.FC<ClientFiltersProps> = ({
  search,
  onSearchChange,
  status,
  onStatusChange,
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 bg-background-surface p-5 rounded-xl border border-border-default shadow-sm mb-6">
      <div className="flex-1 relative">
        <label htmlFor="search-input" className="sr-only">Buscar cliente</label>
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
        <input
          id="search-input"
          type="text"
          placeholder="Buscar por nome, e-mail ou CPF..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-border-default bg-background-primary placeholder:text-text-muted focus-visible:border-action-primary focus-visible:bg-background-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring transition-all text-sm text-text-primary"
        />
      </div>

      <div className="w-full md:w-48">
        <label htmlFor="status-select" className="sr-only">Filtrar por Status</label>
        <select
          id="status-select"
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-border-default bg-background-primary focus-visible:border-action-primary focus-visible:bg-background-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring transition-all text-sm text-text-primary"
        >
          <option value="">Todos os status</option>
          <option value="ACTIVE">Ativo</option>
          <option value="INACTIVE">Inativo</option>
          <option value="SUSPENDED">Suspenso</option>
        </select>
      </div>
    </div>
  );
};
