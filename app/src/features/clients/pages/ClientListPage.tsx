"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useClients } from '../hooks/useClients';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { ClientFilters } from '../components/ClientFilters';
import { ClientTable } from '../components/ClientTable';
import { ClientDeleteModal } from '../components/ClientDeleteModal';
import { Client } from '@/interfaces/client.interface';
import { Button } from '@/components/forms/Button';

export const ClientListPage: React.FC = () => {
  const router = useRouter();
  const { handleLogout } = useAuth();
  const {
    loading,
    error,
    paginatedData,
    fetchClients,
    deleteClient,
    setError,
  } = useClients();

  // Estados locais para busca, paginação, filtros e ordenação
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | ''>('desc');

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

  // Função para lidar com ordenação local no array recebido para performance e dinamismo
  const handleSort = (field: string) => {
    let nextDirection: 'asc' | 'desc' | '' = 'asc';
    if (sortField === field) {
      if (sortDirection === 'asc') nextDirection = 'desc';
      else if (sortDirection === 'desc') nextDirection = '';
    }
    setSortField(field);
    setSortDirection(nextDirection);
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
  const showPagination = pagination && pagination.total_records > 10;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Barra de Navegação Superior Premium */}
      <header className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-blue-200">
                C
              </div>
              <span className="font-extrabold text-slate-800 tracking-tight text-lg">
                Suporte<span className="text-blue-600 font-medium">Cliente</span>
              </span>
            </div>

            <nav className="flex items-center gap-4 border-l border-slate-100 pl-6">
              <button
                onClick={() => router.push('/clients')}
                className="text-sm font-bold text-blue-600 transition-colors"
              >
                Clientes
              </button>
              <button
                onClick={() => router.push('/processes')}
                className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors"
              >
                Processos
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => handleLogout()}
              className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-red-600 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Clientes</h1>
            <p className="text-slate-500 text-sm mt-1">
              {pagination ? `Exibindo ${Math.min((page - 1) * 10 + 1, pagination.total_records)}-${Math.min(page * 10, pagination.total_records)} de ${pagination.total_records} clientes` : 'Carregando clientes...'}
            </p>
          </div>

          <Button
            onClick={() => router.push('/clients/new')}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-100 flex items-center gap-2 self-start sm:self-auto"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Adicionar Cliente
          </Button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        <ClientFilters
          search={search}
          onSearchChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          status={status}
          onStatusChange={(val) => {
            setStatus(val);
            setPage(1);
          }}
        />

        {loading && sortedClients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-100 rounded-xl shadow-sm">
            <div className="h-10 w-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-slate-400 text-sm font-medium mt-4">Buscando clientes no servidor...</p>
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

            {showPagination && pagination && (
              <div className="flex items-center justify-between mt-6 bg-white px-5 py-3 rounded-xl border border-slate-100 shadow-sm">
                <span className="text-sm font-medium text-slate-500">
                  Página {page} de {pagination.total_pages}
                </span>

                <div className="flex gap-2">
                  <Button
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    disabled={page === 1}
                    className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 px-3 py-1 text-xs"
                  >
                    Anterior
                  </Button>
                  <Button
                    onClick={() => setPage((p) => Math.min(p + 1, pagination.total_pages))}
                    disabled={page === pagination.total_pages}
                    className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 px-3 py-1 text-xs"
                  >
                    Próximo
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

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
