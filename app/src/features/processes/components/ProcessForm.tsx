import React, { useState, useEffect, useRef } from 'react';
import { useClients } from '@/features/clients/hooks/useClients';
import { useEstablishments } from '../hooks/useEstablishments';
import { useUsers } from '../hooks/useUsers';
import { EstablishmentCreateModal } from './EstablishmentCreateModal';
import { Process, ProcessStatus } from '@/interfaces/process.interface';
import { Client } from '@/interfaces/client.interface';
import { Establishment } from '@/interfaces/establishment.interface';
import { Button } from '@/components/forms/Button';

// COMPONENTE SEARCHABLE SELECT CUSTOMIZADO E PREMIUM
interface SearchableSelectProps {
  label: string;
  placeholder: string;
  options: { value: string; label: string }[];
  selectedValue: string;
  onChange: (value: string) => void;
  required?: boolean;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  label,
  placeholder,
  options,
  selectedValue,
  onChange,
  required,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const selectedOption = options.find((opt) => opt.value === selectedValue);
  
  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative" ref={containerRef}>
      <label className="block text-sm font-bold text-text-secondary text-slate-800 mb-1.5">
        {label} {required && <span className="text-destructive font-extrabold">*</span>}
      </label>
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between rounded-lg border border-border-default bg-background-surface px-3 py-2 text-sm text-text-primary hover:border-border-default focus-visible:border-action-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring transition-all text-left"
      >
        <span className={selectedOption ? "text-text-primary font-medium" : "text-text-muted"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg className={`h-4 w-4 text-text-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-30 w-full mt-1 bg-background-surface border border-border-default rounded-lg shadow-md overflow-hidden transform transition-all duration-100">
          <div className="p-2 border-b border-border-default">
            <input
              type="text"
              placeholder="Digite para filtrar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border border-border-default bg-background-primary px-2.5 py-1.5 text-xs text-text-primary focus-visible:border-action-primary focus-visible:outline-none"
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className={`w-full text-left px-3 py-2 text-xs transition-colors hover:bg-background-muted flex items-center justify-between ${
                    opt.value === selectedValue ? 'bg-action-primary/10 font-semibold text-action-primary' : 'text-text-secondary'
                  }`}
                >
                  <span>{opt.label}</span>
                  {opt.value === selectedValue && (
                    <svg className="h-4 w-4 text-action-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-xs text-text-muted text-center">Nenhum resultado encontrado</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};


// COMPONENTE MODAL DE SELEÇÃO MULTI-CLIENTE COM CHECKBOX
interface ClientSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  selectedClients: Client[];
  onConfirm: (selected: Client[]) => void;
}

const ClientSelectModal: React.FC<ClientSelectModalProps> = ({
  isOpen,
  onClose,
  clients,
  selectedClients,
  onConfirm,
}) => {
  const [search, setSearch] = useState('');
  const [checkedClients, setCheckedClients] = useState<Client[]>([]);

  useEffect(() => {
    if (isOpen) {
      setCheckedClients(selectedClients);
      setSearch('');
    }
  }, [isOpen, selectedClients]);

  if (!isOpen) return null;

  const handleToggleClient = (client: Client) => {
    if (checkedClients.some((c) => c.id === client.id)) {
      setCheckedClients(checkedClients.filter((c) => c.id !== client.id));
    } else {
      setCheckedClients([...checkedClients, client]);
    }
  };

  const filteredClients = clients.filter((c) =>
    c.full_name.toLowerCase().includes(search.toLowerCase()) ||
    (c.cpf && c.cpf.includes(search))
  );

  const handleSave = () => {
    onConfirm(checkedClients);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-text-primary/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg scale-95 transform rounded-2xl border border-border-default bg-background-surface p-6 shadow-lg transition-all duration-200">
        <h2 className="text-lg font-bold text-text-primary flex items-center gap-2 mb-3">
          <svg className="h-5 w-5 text-action-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          Selecionar Clientes
        </h2>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Buscar por nome ou CPF..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border-default bg-background-primary px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus-visible:border-action-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring transition-all"
          />
        </div>

        <div className="max-h-60 overflow-y-auto border border-border-default rounded-lg divide-y divide-border-default mb-6">
          {filteredClients.length > 0 ? (
            filteredClients.map((client) => {
              const isChecked = checkedClients.some((c) => c.id === client.id);
              return (
                <div
                  key={client.id}
                  onClick={() => handleToggleClient(client)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-background-muted/30 cursor-pointer select-none transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}} // Handled by parent click
                    className="h-4 w-4 rounded border-border-default text-action-primary focus-visible:ring-focus-ring cursor-pointer"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-text-primary">{client.full_name}</div>
                    <div className="text-xs text-text-secondary">CPF: {client.cpf || 'Não cadastrado'}</div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-6 text-center text-sm text-text-muted">Nenhum cliente ativo encontrado</div>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-border-default pt-4">
          <Button
            type="button"
            onClick={onClose}
            variant="outline"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            variant="primary"
          >
            Confirmar Seleção ({checkedClients.length})
          </Button>
        </div>
      </div>
    </div>
  );
};


// FORMULÁRIO PRINCIPAL
interface ProcessFormProps {
  initialData?: Process | null;
  onSubmit: (data: Partial<Process>) => Promise<void>;
  isLoading: boolean;
  onCancel: () => void;
  errorMessage: string | null;
}

export const ProcessForm: React.FC<ProcessFormProps> = ({
  initialData,
  onSubmit,
  isLoading,
  onCancel,
  errorMessage,
}) => {
  const { fetchClients, paginatedData: clientsData } = useClients();
  const { fetchEstablishments, paginatedData: estData } = useEstablishments();
  const { fetchUsers, users } = useUsers();

  const [selectedClients, setSelectedClients] = useState<Client[]>([]);
  const [establishmentId, setEstablishmentId] = useState('');
  const [protocol, setProtocol] = useState('');
  const [observation, setObservation] = useState('');
  const [status, setStatus] = useState<ProcessStatus>('PENDING');
  const [userId, setUserId] = useState('');

  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isEstModalOpen, setIsEstModalOpen] = useState(false);
  const [localEstablishments, setLocalEstablishments] = useState<Establishment[]>([]);

  // Load dependency data
  useEffect(() => {
    fetchClients({ limit: 100, status: 'ACTIVE' });
    fetchEstablishments({ limit: 100 });
    fetchUsers();
  }, [fetchClients, fetchEstablishments, fetchUsers]);

  // Sync loaded establishments
  useEffect(() => {
    if (estData?.data) {
      setLocalEstablishments(estData.data);
    }
  }, [estData]);

  // Prefill when editing
  useEffect(() => {
    if (initialData) {
      setSelectedClients(initialData.clients || []);
      setEstablishmentId(initialData.establishment_id || '');
      setProtocol(initialData.protocol || '');
      setObservation(initialData.observation || '');
      setStatus(initialData.status || 'PENDING');
      setUserId(initialData.user_id || '');
    }
  }, [initialData]);

  const handleRemoveClient = (clientId: string) => {
    setSelectedClients(selectedClients.filter((c) => c.id !== clientId));
  };

  const handleEstablishmentCreated = (newEst: Establishment) => {
    setLocalEstablishments((prev) => [newEst, ...prev]);
    if (newEst.id) {
      setEstablishmentId(newEst.id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedClients.length === 0) {
      alert('Selecione pelo menos um cliente');
      return;
    }

    if (!establishmentId) {
      alert('Selecione um estabelecimento');
      return;
    }

    if (!userId) {
      alert('Selecione um responsável');
      return;
    }

    const payload: Partial<Process> = {
      user_id: userId,
      establishment_id: establishmentId,
      protocol: protocol.trim() || null,
      observation: observation.trim() || null,
      status: status,
      client_ids: selectedClients.map((c) => c.id as string),
    };

    await onSubmit(payload);
  };

  // Maps options for SearchableSelect
  const establishmentOptions = localEstablishments.map((est) => ({
    value: est.id || '',
    label: `${est.name} (${est.city}/${est.state})`,
  }));

  const userOptions = users.map((u) => ({
    value: u.id,
    label: `${u.first_name} ${u.last_name}`,
  }));

  const allClientsList = clientsData?.data || [];

  const inputClass = "w-full rounded-lg border border-border-default bg-background-surface bg-white px-3 py-2 text-sm text-text-primary text-slate-800 placeholder:text-text-muted focus-visible:border-action-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring transition-all";

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6 bg-background-surface p-8 rounded-xl border border-border-default shadow-sm">
        {errorMessage && (
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20 animate-in fade-in duration-150">
            {errorMessage}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Clients section (Many-to-Many modal trigger and badges) */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-bold text-text-secondary text-slate-800 mb-1.5">
              Clientes Associados <span className="text-destructive font-extrabold">*</span> <span className="text-xs font-normal text-text-muted">(Selecione um ou mais)</span>
            </label>
            <div className="flex flex-wrap gap-2 p-2.5 min-h-[46px] border border-border-default rounded-lg bg-background-primary transition-all mb-2.5">
              {selectedClients.map((c) => (
                <span
                  key={c.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-action-primary/10 text-action-primary text-xs font-semibold border border-action-primary/20 animate-in zoom-in-95 duration-150"
                >
                  {c.full_name}
                  <button
                    type="button"
                    onClick={() => handleRemoveClient(c.id!)}
                    className="hover:bg-action-primary/20 text-action-primary rounded-full w-4 h-4 flex items-center justify-center transition-colors font-extrabold"
                  >
                    &times;
                  </button>
                </span>
              ))}
              {selectedClients.length === 0 && (
                <span className="text-text-muted text-sm select-none">Nenhum cliente selecionado</span>
              )}
            </div>

            <Button
              type="button"
              onClick={() => setIsClientModalOpen(true)}
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Adicionar Clientes
            </Button>
          </div>

          {/* Searchable Select for Establishment */}
          <div className="col-span-1">
            <div className="flex justify-between items-center mb-0.5">
              <span />
              <button
                type="button"
                onClick={() => setIsEstModalOpen(true)}
                className="text-xs font-bold text-action-primary hover:text-action-hover flex items-center gap-1 transition-colors z-10"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                Novo Estabelecimento
              </button>
            </div>
            <SearchableSelect
              label="Estabelecimento"
              placeholder="Selecione um estabelecimento..."
              options={establishmentOptions}
              selectedValue={establishmentId}
              onChange={setEstablishmentId}
              required
            />
          </div>

          {/* Searchable Select for Responsável (User) */}
          <div className="col-span-1">
            <SearchableSelect
              label="Responsável pelo Processo"
              placeholder="Selecione o operador responsável..."
              options={userOptions}
              selectedValue={userId}
              onChange={setUserId}
              required
            />
          </div>

          {/* Protocol Input */}
          <div className="col-span-1">
            <label htmlFor="protocol" className="block text-sm font-bold text-text-secondary text-slate-800 mb-1.5">
              Protocolo / Identificador Externo
            </label>
            <input
              id="protocol"
              type="text"
              placeholder="Ex: PROC-2026-99"
              value={protocol}
              onChange={(e) => setProtocol(e.target.value)}
              className={inputClass}
            />
          </div>

          {/* Status Selection (Visible in both screens) */}
          <div className="col-span-1">
            <label htmlFor="status" className="block text-sm font-bold text-text-secondary text-slate-800 mb-1.5">
              Status do Processo <span className="text-destructive font-extrabold">*</span>
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as ProcessStatus)}
              className={inputClass}
            >
              <option value="PENDING">Pendente</option>
              <option value="IN_PROGRESS">Em Andamento</option>
              <option value="AWAITING_DOCUMENTATION">Aguardando Documentação</option>
              <option value="IN_ANALYSIS">Em Análise</option>
              <option value="COMPLETED">Concluído</option>
              <option value="CANCELLED">Cancelado</option>
            </select>
          </div>

          {/* Observation Textarea */}
          <div className="col-span-1 md:col-span-2">
            <label htmlFor="observation" className="block text-sm font-bold text-text-secondary text-slate-800 mb-1.5">
              Observações / Anotações
            </label>
            <textarea
              id="observation"
              rows={4}
              placeholder="Escreva detalhes ou anotações importantes sobre o processo..."
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              className={`${inputClass} resize-none`}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border-default mt-6">
          <Button
            type="button"
            onClick={onCancel}
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
            Salvar Processo
          </Button>
        </div>
      </form>

      {/* Modal de Seleção de Clientes */}
      <ClientSelectModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        clients={allClientsList}
        selectedClients={selectedClients}
        onConfirm={setSelectedClients}
      />

      {/* Establishment Creation Modal */}
      <EstablishmentCreateModal
        isOpen={isEstModalOpen}
        onClose={() => setIsEstModalOpen(false)}
        onSuccess={handleEstablishmentCreated}
      />
    </>
  );
};
