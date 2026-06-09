"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProcesses } from '../hooks/useProcesses';
import { ProcessStatusBadge } from '../components/ProcessStatusBadge';
import { ProcessFilters } from '../components/ProcessFilters';
import { Process } from '@/interfaces/process.interface';
import { Button } from '@/components/forms/Button';
import { ProcessDeleteModal } from '../components/ProcessDeleteModal';
import { Header } from '@/components/Header';

export const ProcessListPage: React.FC = () => {
  const router = useRouter();
  const {
    loading,
    error,
    paginatedData,
    fetchProcesses,
    deleteProcess,
  } = useProcesses();

  const [status, setStatus] = useState('');
  const [protocol, setProtocol] = useState('');
  const [page, setPage] = useState(1);

  // Estado para modal de filtros
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState<Process | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Ordenação Local
  const [sortField, setSortField] = useState<'protocol' | 'establishment' | 'clients' | 'user' | 'status' | 'created_at' | 'updated_at'>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchProcesses({
      status: status || undefined,
      protocol: protocol.trim() || undefined,
      page,
      limit: 10,
    });
  }, [status, protocol, page, fetchProcesses]);

  const handleDeleteClick = (proc: Process) => {
    setSelectedProcess(proc);
    setDeleteError(null);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProcess?.id) return;
    setDeleteLoading(true);
    setDeleteError(null);
    const success = await deleteProcess(selectedProcess.id);
    if (success) {
      setDeleteModalOpen(false);
      setSelectedProcess(null);
      fetchProcesses({ status: status || undefined, protocol: protocol.trim() || undefined, page, limit: 10 });
    } else {
      setDeleteError('Erro ao excluir processo. Verifique se você possui permissão.');
    }
    setDeleteLoading(false);
  };

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortValue = (proc: Process, field: typeof sortField) => {
    switch (field) {
      case 'protocol':
        return proc.protocol || '';
      case 'establishment':
        return proc.establishment?.name || '';
      case 'clients':
        return proc.clients?.map(c => c.full_name).join(', ') || '';
      case 'user':
        return proc.user ? `${proc.user.first_name} ${proc.user.last_name}` : '';
      case 'status':
        return proc.status || '';
      case 'created_at':
        return proc.created_at ? new Date(proc.created_at).getTime() : 0;
      case 'updated_at':
        return proc.updated_at ? new Date(proc.updated_at).getTime() : 0;
      default:
        return '';
    }
  };

  const processes = paginatedData?.data || [];
  const pagination = paginatedData?.pagination;
  const showPaginationFooter = pagination && pagination.total_records > 0;
  const rangeStart = pagination ? (page - 1) * 10 + 1 : 0;
  const rangeEnd = pagination ? Math.min(page * 10, pagination.total_records) : 0;
  const totalRecords = pagination ? pagination.total_records : 0;

  const sortedProcesses = [...processes].sort((a, b) => {
    const valA = getSortValue(a, sortField);
    const valB = getSortValue(b, sortField);

    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortDirection === 'asc' ? valA - valB : valB - valA;
    }

    const strA = String(valA);
    const strB = String(valB);
    return sortDirection === 'asc'
      ? strA.localeCompare(strB, 'pt-BR')
      : strB.localeCompare(strA, 'pt-BR');
  });

  const renderSortChevron = (field: typeof sortField) => {
    if (sortField !== field) {
      return (
        <span className="text-text-muted ml-1 text-[10px] inline-block transition-colors">
          ▲▼
        </span>
      );
    }
    if (sortDirection === 'asc') {
      return <span className="text-action-primary ml-1 text-[10px] inline-block font-bold">▲</span>;
    }
    if (sortDirection === 'desc') {
      return <span className="text-action-primary ml-1 text-[10px] inline-block font-bold">▼</span>;
    }
    return (
      <span className="text-text-muted ml-1 text-[10px] inline-block">
        ▲▼
      </span>
    );
  };

  const getStatusLabel = (statusKey: string) => {
    switch (statusKey) {
      case 'PENDING': return 'Pendente';
      case 'IN_PROGRESS': return 'Em Andamento';
      case 'AWAITING_DOCUMENTATION': return 'Aguardando Documentação';
      case 'IN_ANALYSIS': return 'Em Análise';
      case 'COMPLETED': return 'Concluído';
      case 'CANCELLED': return 'Cancelado';
      default: return statusKey;
    }
  };

  return (
    <div className="min-h-screen bg-background-primary flex flex-col relative">
      <Header />

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cabeçalho da Página */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">Processos</h1>
          <p className="text-text-secondary text-sm mt-1">
            Gerencie os processos cadastrados no sistema.
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

          {/* Botão Criar Registro (Alinhado à Direita, Padrão "+ Novo Processo") */}
          <Button
            onClick={() => router.push('/processes/new')}
            variant="primary"
            className="flex items-center gap-2 shadow-sm"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Novo Processo
          </Button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-sm font-medium text-destructive">
            {error}
          </div>
        )}

        {/* Área de Filtros Aplicados */}
        {(protocol || status) && (
          <div className="flex flex-wrap items-center gap-2 mb-6 bg-background-surface px-4 py-3 rounded-xl border border-border-default shadow-sm">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider mr-2">Filtros ativos:</span>
            {protocol && (
              <span className="inline-flex items-center gap-1 bg-action-primary/10 border border-action-primary/20 text-action-primary text-xs font-semibold px-3 py-1 rounded-full">
                Protocolo: &quot;{protocol}&quot;
                <button
                  onClick={() => {
                    setProtocol('');
                    setPage(1);
                  }}
                  className="hover:text-action-primary-hover font-bold ml-1.5 text-sm leading-none"
                  title="Remover protocolo"
                >
                  &times;
                </button>
              </span>
            )}
            {status && (
              <span className="inline-flex items-center gap-1 bg-action-primary/10 border border-action-primary/20 text-action-primary text-xs font-semibold px-3 py-1 rounded-full">
                Status: {getStatusLabel(status)}
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
                setProtocol('');
                setStatus('');
                setPage(1);
              }}
              className="text-xs font-semibold text-destructive hover:underline ml-auto"
            >
              Limpar todos
            </button>
          </div>
        )}

        {/* Listagem */}
        {loading && sortedProcesses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-background-surface border border-border-default rounded-xl shadow-sm">
            <div className="h-10 w-10 border-4 border-border-default border-t-action-primary rounded-full animate-spin"></div>
            <p className="text-text-muted text-sm font-medium mt-4">Buscando processos no servidor...</p>
          </div>
        ) : sortedProcesses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-background-surface border border-border-default rounded-xl shadow-sm">
            <svg className="w-12 h-12 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-text-muted text-sm font-medium mt-4">Nenhum processo encontrado</p>
          </div>
        ) : (
          <>
            <div className="bg-background-surface border border-border-default rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-background-muted border-b border-border-default text-xs font-bold text-text-secondary uppercase tracking-wider">
                      <th
                        className="px-6 py-4 cursor-pointer hover:bg-background-muted hover:text-text-primary transition-colors select-none"
                        onClick={() => handleSort('protocol')}
                      >
                        Protocolo {renderSortChevron('protocol')}
                      </th>
                      <th
                        className="px-6 py-4 cursor-pointer hover:bg-background-muted hover:text-text-primary transition-colors select-none"
                        onClick={() => handleSort('establishment')}
                      >
                        Estabelecimento {renderSortChevron('establishment')}
                      </th>
                      <th
                        className="px-6 py-4 cursor-pointer hover:bg-background-muted hover:text-text-primary transition-colors select-none"
                        onClick={() => handleSort('clients')}
                      >
                        Clientes Associados {renderSortChevron('clients')}
                      </th>
                      <th
                        className="px-6 py-4 cursor-pointer hover:bg-background-muted hover:text-text-primary transition-colors select-none"
                        onClick={() => handleSort('user')}
                      >
                        Responsável {renderSortChevron('user')}
                      </th>
                      <th
                        className="px-6 py-4 cursor-pointer hover:bg-background-muted hover:text-text-primary transition-colors select-none"
                        onClick={() => handleSort('status')}
                      >
                        Status {renderSortChevron('status')}
                      </th>
                      <th
                        className="px-6 py-4 cursor-pointer hover:bg-background-muted hover:text-text-primary transition-colors select-none"
                        onClick={() => handleSort('created_at')}
                      >
                        Data Abertura {renderSortChevron('created_at')}
                      </th>
                      <th
                        className="px-6 py-4 cursor-pointer hover:bg-background-muted hover:text-text-primary transition-colors select-none"
                        onClick={() => handleSort('updated_at')}
                      >
                        Última Atualização {renderSortChevron('updated_at')}
                      </th>
                      <th scope="col" className="px-6 py-4 text-center font-bold text-text-primary">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-default text-sm text-text-primary">
                    {sortedProcesses.map((proc) => (
                      <tr key={proc.id} className="hover:bg-background-muted/30 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-text-secondary">
                          {proc.protocol || '-'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-text-primary">{proc.establishment?.name || 'Sem Estabelecimento'}</div>
                          <div className="text-xs text-text-muted">{proc.establishment ? `${proc.establishment.city}/${proc.establishment.state}` : ''}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {proc.clients && proc.clients.length > 0 ? (
                              proc.clients.map((c) => {
                                const firstName = c.full_name.split(' ')[0];
                                return (
                                  <span key={c.id} className="inline-flex px-2 py-0.5 rounded-full bg-action-primary/10 text-action-primary text-xs font-semibold border border-action-primary/20">
                                    {firstName}
                                  </span>
                                );
                              })
                            ) : (
                              <span className="text-xs text-text-muted">Nenhum</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {proc.user ? (
                            <span className="inline-flex px-2 py-0.5 rounded-full bg-background-muted text-text-primary text-xs font-medium border border-border-default">
                              {`${proc.user.first_name} ${proc.user.last_name}`}
                            </span>
                          ) : (
                            <span className="text-xs text-text-muted">Sem Responsável</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <ProcessStatusBadge status={proc.status || 'PENDING'} />
                        </td>
                        <td className="px-6 py-4 text-text-secondary">
                          {proc.created_at ? new Date(proc.created_at).toLocaleDateString('pt-BR') : '-'}
                        </td>
                        <td className="px-6 py-4 text-text-secondary">
                          {proc.updated_at ? new Date(proc.updated_at).toLocaleDateString('pt-BR') : '-'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center items-center gap-3">
                            <button
                              type="button"
                              title="Ver detalhes"
                              onClick={() => router.push(`/processes/${proc.id}`)}
                              className="p-1.5 rounded-lg text-info/85 hover:bg-info/10 hover:text-info transition-all"
                            >
                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              title="Editar"
                              onClick={() => router.push(`/processes/${proc.id}/edit`)}
                              className="p-1.5 rounded-lg text-success/85 hover:bg-success/10 hover:text-success transition-all"
                            >
                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              title="Excluir"
                              onClick={() => handleDeleteClick(proc)}
                              className="p-1.5 rounded-lg text-destructive/85 hover:bg-destructive/10 hover:text-destructive transition-all"
                            >
                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Linha Inferior de Paginação e Resumo */}
            {showPaginationFooter && pagination && (
              <div className="flex items-center justify-between mt-6 bg-background-surface px-5 py-3 rounded-xl border border-border-default shadow-sm">
                <span className="text-sm font-medium text-text-secondary">
                  Mostrando {rangeStart}–{rangeEnd} de {totalRecords} processos
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
      <ProcessFilters
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        initialProtocol={protocol}
        initialStatus={status}
        onApply={(filters) => {
          setProtocol(filters.protocol);
          setStatus(filters.status);
          setPage(1);
          setIsFilterModalOpen(false);
        }}
        onClear={() => {
          setProtocol('');
          setStatus('');
          setPage(1);
          setIsFilterModalOpen(false);
        }}
      />

      {/* Modal de Confirmação de Exclusão Defensiva */}
      <ProcessDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        processProtocol={selectedProcess?.protocol || 'Sem Protocolo'}
        isLoading={deleteLoading}
        errorMessage={deleteError}
      />
    </div>
  );
};
