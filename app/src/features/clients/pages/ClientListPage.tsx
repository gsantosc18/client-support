"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useClients } from '../hooks/useClients';
import { ClientFilters } from '../components/ClientFilters';
import { ClientTable } from '../components/ClientTable';
import { ClientDeleteModal } from '../components/ClientDeleteModal';
import { Client } from '@/interfaces/client.interface';
import { Button } from '@/components/forms/Button';
import { Header } from '@/components/Header';

export const ClientListPage: React.FC = () => {
  const router = useRouter();
  const {
    loading,
    error,
    paginatedData,
    fetchClients,
    deleteClient,
  } = useClients();

  // Estados locais para busca, paginação, filtros e ordenação
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Estado para modal de filtros
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Estado para exclusão
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Efeito de busca em tempo real com debounce ou re-fetch
  useEffect(() => {
    fetchClients({
      search,
      status,
      page,
      limit: 10,
    });
  }, [search, status, page, fetchClients]);

  // Função para lidar com ordenação local de forma bidirecional estrita
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortedClients = (): Client[] => {
    const data = paginatedData?.data || [];
    if (!sortField || !sortDirection) return data;

    return [...data].sort((a, b) => {
      const valA = (a as any)[sortField];
      const valB = (b as any)[sortField];

      if (valA == null) return 1;
      if (valB == null) return -1;

      let comparison = 0;
      if (typeof valA === 'string') {
        comparison = valA.localeCompare(valB);
      } else {
        comparison = valA < valB ? -1 : valA > valB ? 1 : 0;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  };

  const handleDeleteClick = (client: Client) => {
    setSelectedClient(client);
    setDeleteError(null);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedClient?.id) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      const res = await deleteClient(selectedClient.id);
      if (res.success) {
        setDeleteModalOpen(false);
        setSelectedClient(null);
        // Atualizar listagem
        fetchClients({ search, status, page, limit: 10 });
      } else {
        setDeleteError(res.error || "O cliente está vinculado a um processo e não pode ser removido.");
      }
    } catch (err: any) {
      setDeleteError("Erro ao remover cliente.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const sortedClients = getSortedClients();
  const pagination = paginatedData?.pagination;
  const showPaginationFooter = pagination && pagination.total_records > 0;
  const rangeStart = pagination ? (page - 1) * 10 + 1 : 0;
  const rangeEnd = pagination ? Math.min(page * 10, pagination.total_records) : 0;
  const totalRecords = pagination ? pagination.total_records : 0;

  return (
    <div className="min-h-screen bg-background-primary flex flex-col">
      <Header />

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cabeçalho da Página */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">Clientes</h1>
          <p className="text-text-secondary text-sm mt-1">
            Gerencie os clientes cadastrados no sistema.
          </p>
        </div>

        {/* Área de Ações Principais (Alinhada acima da tabela) */}
        <div className="flex items-center justify-between gap-4 mb-6">
          {/* Botão de Funil de Filtros (Alinhado à Esquerda) */}
          <Button
            onClick={() => setIsFilterModalOpen(true)}
            variant="outline"
            className="flex items-center gap-2 shadow-sm text-text-secondary hover:text-action-primary border-border-default"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filtros
          </Button>

          {/* Botão Criar Registro (Alinhado à Direita, Padrão "+ Novo Cliente") */}
          <Button
            onClick={() => router.push('/clients/new')}
            variant="primary"
            className="flex items-center gap-2 shadow-sm"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Novo Cliente
          </Button>
        </div>

        {/* Banner de Erros Globais */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-sm font-medium text-destructive">
            {error}
          </div>
        )}

        {/* Área de Filtros Aplicados */}
        {(search || status) && (
          <div className="flex flex-wrap items-center gap-2 mb-6 bg-background-surface px-4 py-3 rounded-xl border border-border-default shadow-sm">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider mr-2">Filtros ativos:</span>
            {search && (
              <span className="inline-flex items-center gap-1 bg-action-primary/10 border border-action-primary/20 text-action-primary text-xs font-semibold px-3 py-1 rounded-full">
                Busca: &quot;{search}&quot;
                <button
                  onClick={() => {
                    setSearch('');
                    setPage(1);
                  }}
                  className="hover:text-action-primary-hover font-bold ml-1.5 text-sm leading-none"
                  title="Remover busca"
                >
                  &times;
                </button>
              </span>
            )}
            {status && (
              <span className="inline-flex items-center gap-1 bg-action-primary/10 border border-action-primary/20 text-action-primary text-xs font-semibold px-3 py-1 rounded-full">
                Status: {status === 'ACTIVE' ? 'Ativo' : status === 'INACTIVE' ? 'Inativo' : 'Suspenso'}
                <button
                  onClick={() => {
                    setStatus('');
                    setPage(1);
                  }}
                  className="hover:text-action-primary-hover font-bold ml-1.5 text-sm leading-none"
                  title="Remover status"
                >
                  &times;
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setSearch('');
                setStatus('');
                setPage(1);
              }}
              className="text-xs font-semibold text-destructive hover:underline ml-auto"
            >
              Limpar todos
            </button>
          </div>
        )}

        {loading && sortedClients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-background-surface border border-border-default rounded-xl shadow-sm">
            <div className="h-10 w-10 border-4 border-border-default border-t-action-primary rounded-full animate-spin"></div>
            <p className="text-text-muted text-sm font-medium mt-4">Buscando clientes no servidor...</p>
          </div>
        ) : (
          <>
            <ClientTable
              clients={sortedClients}
              onDeleteClick={handleDeleteClick}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
            />

            {/* Linha Inferior de Paginação e Resumo */}
            {showPaginationFooter && pagination && (
              <div className="flex items-center justify-between mt-6 bg-background-surface px-5 py-3 rounded-xl border border-border-default shadow-sm">
                <span className="text-sm font-medium text-text-secondary">
                  Mostrando {rangeStart}–{rangeEnd} de {totalRecords} clientes
                </span>

                <div className="flex gap-2">
                  <Button
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    disabled={page === 1}
                    variant="outline"
                    className="px-3 py-1 text-xs"
                  >
                    Anterior
                  </Button>
                  <Button
                    onClick={() => setPage((p) => Math.min(p + 1, pagination.total_pages))}
                    disabled={page === pagination.total_pages}
                    variant="outline"
                    className="px-3 py-1 text-xs"
                  >
                    Próximo
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Modal de Filtros Funil */}
      <ClientFilters
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        initialSearch={search}
        initialStatus={status}
        onApply={(filters) => {
          setSearch(filters.search);
          setStatus(filters.status);
          setPage(1);
          setIsFilterModalOpen(false);
        }}
        onClear={() => {
          setSearch('');
          setStatus('');
          setPage(1);
          setIsFilterModalOpen(false);
        }}
      />

      {/* Modal de Exclusão */}
      <ClientDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        clientName={selectedClient?.full_name || ''}
        isLoading={deleteLoading}
        errorMessage={deleteError}
      />
    </div>
  );
};
