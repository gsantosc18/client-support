import React, { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useClients } from '@/features/clients/hooks/useClients';
import { useEstablishments } from '../hooks/useEstablishments';
import { useUsers } from '../hooks/useUsers';
import { EstablishmentCreateModal } from './EstablishmentCreateModal';
import { Process, ProcessStatus } from '@/interfaces/process.interface';
import { Client } from '@/interfaces/client.interface';
import { Establishment } from '@/interfaces/establishment.interface';
import { Button } from '@/components/forms/Button';
import { FormContainer } from '@/components/forms/FormContainer';
import { FormSection } from '@/components/forms/FormSection';
import { FormField } from '@/components/forms/FormField';
import { Input } from '@/components/forms/Input';
import { Select } from '@/components/forms/Select';
import { Textarea } from '@/components/forms/Textarea';
import { FormActions } from '@/components/forms/FormActions';

// COMPONENTE SEARCHABLE SELECT CUSTOMIZADO E PREMIUM
interface SearchableSelectProps {
  label: string;
  placeholder: string;
  options: { value: string; label: string }[];
  selectedValue: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  error?: string;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  label,
  placeholder,
  options,
  selectedValue,
  onChange,
  required,
  disabled,
  error,
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
      <label className="block text-sm font-semibold text-text-secondary mb-1.5 select-none">
        {label} {required && <span className="text-destructive font-bold select-none">*</span>}
      </label>
      
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between rounded-lg border px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring transition-all text-left bg-background-surface ${
          error ? 'border-destructive focus-visible:ring-destructive' : 'border-border-default'
        } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span className={selectedOption ? "text-text-primary font-medium" : "text-text-muted"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg className={`h-4 w-4 text-text-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {error && (
        <span className="text-xs text-destructive font-medium mt-1 animate-in fade-in duration-100 block">
          {error}
        </span>
      )}

      {isOpen && !disabled && (
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


// Esquema de Validação Zod para Processos
const processSchema = z.object({
  user_id: z.string().min(1, 'Selecione o operador responsável'),
  establishment_id: z.string().min(1, 'Selecione um estabelecimento'),
  protocol: z.string().nullable().or(z.literal('')),
  observation: z.string().nullable().or(z.literal('')),
  status: z.enum([
    'PENDING',
    'IN_PROGRESS',
    'AWAITING_DOCUMENTATION',
    'IN_ANALYSIS',
    'COMPLETED',
    'CANCELLED',
  ]),
  client_ids: z.array(z.string()).min(1, 'Selecione pelo menos um cliente'),
});

type ProcessFormValues = z.infer<typeof processSchema>;

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
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isEstModalOpen, setIsEstModalOpen] = useState(false);
  const [localEstablishments, setLocalEstablishments] = useState<Establishment[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    formState: { errors },
  } = useForm<ProcessFormValues>({
    resolver: zodResolver(processSchema),
    defaultValues: {
      user_id: '',
      establishment_id: '',
      protocol: '',
      observation: '',
      status: 'PENDING',
      client_ids: [],
    },
  });

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
      const clientsList = initialData.clients || [];
      setSelectedClients(clientsList);
      reset({
        user_id: initialData.user_id || '',
        establishment_id: initialData.establishment_id || '',
        protocol: initialData.protocol || '',
        observation: initialData.observation || '',
        status: initialData.status || 'PENDING',
        client_ids: clientsList.map((c) => c.id as string),
      });
    } else {
      setSelectedClients([]);
      reset({
        user_id: '',
        establishment_id: '',
        protocol: '',
        observation: '',
        status: 'PENDING',
        client_ids: [],
      });
    }
  }, [initialData, reset]);

  // Sync selected clients list state to React Hook Form field client_ids
  const handleConfirmClients = (selected: Client[]) => {
    setSelectedClients(selected);
    setValue('client_ids', selected.map((c) => c.id as string), { shouldValidate: true });
  };

  const handleRemoveClient = (clientId: string) => {
    const updated = selectedClients.filter((c) => c.id !== clientId);
    setSelectedClients(updated);
    setValue('client_ids', updated.map((c) => c.id as string), { shouldValidate: true });
  };

  const handleEstablishmentCreated = (newEst: Establishment) => {
    setLocalEstablishments((prev) => [newEst, ...prev]);
    if (newEst.id) {
      setValue('establishment_id', newEst.id, { shouldValidate: true });
    }
  };

  const handleFormSubmit = async (values: ProcessFormValues) => {
    const payload: Partial<Process> = {
      user_id: values.user_id,
      establishment_id: values.establishment_id,
      protocol: values.protocol?.trim() || null,
      observation: values.observation?.trim() || null,
      status: values.status,
      client_ids: values.client_ids,
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

  const statusOptions = [
    { value: 'PENDING', label: 'Pendente' },
    { value: 'IN_PROGRESS', label: 'Em Andamento' },
    { value: 'AWAITING_DOCUMENTATION', label: 'Aguardando Documentação' },
    { value: 'IN_ANALYSIS', label: 'Em Análise' },
    { value: 'COMPLETED', label: 'Concluído' },
    { value: 'CANCELLED', label: 'Cancelado' },
  ];

  return (
    <>
      <FormContainer onSubmit={handleSubmit(handleFormSubmit)} errorMessage={errorMessage}>
        
        {/* SEÇÃO 1: Participantes e Estabelecimento */}
        <FormSection title="Participantes e Estabelecimento" columns={2}>
          
          {/* Clients section (Many-to-Many modal trigger and badges) */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-semibold text-text-secondary mb-1.5 select-none">
              Clientes Associados <span className="text-destructive font-bold select-none">*</span>{' '}
              <span className="text-xs font-normal text-text-muted select-none">(Selecione um ou mais)</span>
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
                    disabled={isLoading}
                    onClick={() => handleRemoveClient(c.id!)}
                    className="hover:bg-action-primary/20 text-action-primary rounded-full w-4 h-4 flex items-center justify-center transition-colors font-extrabold disabled:opacity-50 disabled:pointer-events-none"
                  >
                    &times;
                  </button>
                </span>
              ))}
              {selectedClients.length === 0 && (
                <span className="text-text-muted text-sm select-none self-center">
                  Nenhum cliente selecionado
                </span>
              )}
            </div>

            <Button
              type="button"
              disabled={isLoading}
              onClick={() => setIsClientModalOpen(true)}
              variant="outline"
              className="w-full flex items-center justify-center gap-2 font-semibold"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Adicionar Clientes
            </Button>
            
            {errors.client_ids?.message && (
              <span className="text-xs text-destructive font-medium mt-1.5 block animate-in fade-in duration-100">
                {errors.client_ids.message}
              </span>
            )}
          </div>

          {/* Searchable Select for Establishment */}
          <div className="col-span-1">
            <div className="flex justify-between items-center mb-0.5 select-none">
              <span />
              <button
                type="button"
                disabled={isLoading}
                onClick={() => setIsEstModalOpen(true)}
                className="text-xs font-bold text-action-primary hover:text-action-hover flex items-center gap-1 transition-colors z-10 disabled:opacity-50 disabled:pointer-events-none"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                Novo Estabelecimento
              </button>
            </div>
            
            <Controller
              name="establishment_id"
              control={control}
              render={({ field }) => (
                <SearchableSelect
                  label="Estabelecimento"
                  placeholder="Selecione um estabelecimento..."
                  options={establishmentOptions}
                  selectedValue={field.value}
                  onChange={(val) => field.onChange(val)}
                  required
                  disabled={isLoading}
                  error={errors.establishment_id?.message}
                />
              )}
            />
          </div>

          {/* Searchable Select for Responsável (User) */}
          <div className="col-span-1">
            <Controller
              name="user_id"
              control={control}
              render={({ field }) => (
                <SearchableSelect
                  label="Responsável pelo Processo"
                  placeholder="Selecione o operador responsável..."
                  options={userOptions}
                  selectedValue={field.value}
                  onChange={(val) => field.onChange(val)}
                  required
                  disabled={isLoading}
                  error={errors.user_id?.message}
                />
              )}
            />
          </div>
        </FormSection>

        {/* SEÇÃO 2: Identificação e Observações */}
        <FormSection title="Identificação e Observações" columns={2}>
          
          {/* Protocol Input */}
          <FormField label="Protocolo / Identificador Externo" id="protocol" error={errors.protocol?.message}>
            <Input
              id="protocol"
              type="text"
              placeholder="Ex: PROC-2026-99"
              disabled={isLoading}
              {...register('protocol')}
            />
          </FormField>

          {/* Status Selection */}
          <FormField label="Status do Processo" id="status" required error={errors.status?.message}>
            <Select
              id="status"
              options={statusOptions}
              disabled={isLoading}
              {...register('status')}
            />
          </FormField>

          {/* Observation Textarea */}
          <div className="col-span-1 md:col-span-2">
            <FormField label="Observações / Anotações" id="observation" error={errors.observation?.message}>
              <Textarea
                id="observation"
                rows={4}
                placeholder="Escreva detalhes ou anotações importantes sobre o processo..."
                disabled={isLoading}
                {...register('observation')}
              />
            </FormField>
          </div>
        </FormSection>

        <FormActions
          isLoading={isLoading}
          onCancel={onCancel}
          cancelText="Cancelar"
          submitText="Salvar Processo"
        />
      </FormContainer>

      {/* Modal de Seleção de Clientes */}
      <ClientSelectModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        clients={allClientsList}
        selectedClients={selectedClients}
        onConfirm={handleConfirmClients}
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
