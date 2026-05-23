"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useProcesses } from '../hooks/useProcesses';
import { ProcessStatusBadge } from '../components/ProcessStatusBadge';
import { ProcessStatus } from '@/interfaces/process.interface';
import { ProcessDeleteModal } from '../components/ProcessDeleteModal';
import { ProcessAnnotations } from '../components/ProcessAnnotations';
import { ProcessDocuments } from '../components/ProcessDocuments';
import { Button } from '@/components/forms/Button';

export const ProcessDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const { fetchProcessByID, updateProcessStatus, deleteProcess, process, loading, error } = useProcesses();
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'annotations' | 'documents'>('annotations');

  useEffect(() => {
    if (id) {
      fetchProcessByID(id);
    }
  }, [id, fetchProcessByID]);

  const handleStatusChange = async (newStatus: ProcessStatus) => {
    setUpdatingStatus(true);
    const success = await updateProcessStatus(id, newStatus);
    if (success) {
      fetchProcessByID(id);
    }
    setUpdatingStatus(false);
  };

  const handleDeleteClick = () => {
    setDeleteError(null);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!process?.id) return;
    setDeleteLoading(true);
    setDeleteError(null);
    const success = await deleteProcess(process.id);
    if (success) {
      setDeleteModalOpen(false);
      router.push('/processes');
    } else {
      setDeleteError('Erro ao excluir processo. Verifique dependências ou permissões.');
    }
    setDeleteLoading(false);
  };

  if (loading && !process) {
    return (
      <div className="min-h-screen bg-background-primary flex flex-col items-center justify-center">
        <div className="h-10 w-10 border-4 border-border-default border-t-action-primary rounded-full animate-spin"></div>
        <p className="text-text-muted text-sm font-medium mt-4 font-semibold">Carregando detalhes do processo...</p>
      </div>
    );
  }

  if (!process) {
    return (
      <div className="min-h-screen bg-background-primary flex flex-col items-center justify-center p-4">
        <div className="text-destructive text-lg font-bold">Processo não encontrado</div>
        <Button
          onClick={() => router.push('/processes')}
          variant="primary"
          className="mt-4"
        >
          Voltar para Processos
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-primary flex flex-col">
      {/* Barra de Navegação Superior */}
      <header className="bg-background-surface border-b border-border-default shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/processes')}
              className="text-text-muted hover:text-text-primary transition-colors mr-2"
              title="Voltar para a Listagem"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <span className="font-bold text-text-primary tracking-tight text-lg">
              Detalhes do <span className="text-action-primary font-medium">Processo</span>
            </span>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal em 4 Categorias de Alto Padrão Visual */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {error && (
          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-sm font-medium text-destructive">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* COLUNA 1 & 2: INFORMAÇÕES DO PROCESSO & CLIENTES ASSOCIADOS */}
          <div className="lg:col-span-2 space-y-6">

            {/* CATEGORIA 1: Informações do Processo */}
            <div className="bg-background-surface p-6 rounded-2xl border border-border-default shadow-sm space-y-6">
              <div className="flex justify-between items-start flex-wrap gap-4">
                <div>
                  <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Protocolo de Controle</span>
                  <h1 className="text-2xl font-bold text-text-primary tracking-tight font-mono">
                    {process.protocol || 'Sem Protocolo'}
                  </h1>
                </div>
                <div className="flex items-center gap-4">
                  <div className="border-l border-border-default pl-4">
                    <span className="text-xs font-bold text-text-muted block mb-1 uppercase tracking-wider">Alterar Status</span>
                    <select
                      id="status-select"
                      disabled={updatingStatus}
                      value={process.status || 'PENDING'}
                      onChange={(e) => handleStatusChange(e.target.value as ProcessStatus)}
                      className="rounded-lg border border-border-default bg-background-surface px-2.5 py-1 text-xs text-text-primary focus-visible:border-action-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring transition-all font-semibold"
                    >
                      <option value="PENDING">Pendente</option>
                      <option value="IN_PROGRESS">Em Andamento</option>
                      <option value="AWAITING_DOCUMENTATION">Aguardando Documentação</option>
                      <option value="IN_ANALYSIS">Em Análise</option>
                      <option value="COMPLETED">Concluído</option>
                      <option value="CANCELLED">Cancelado</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-t border-b border-border-default text-sm">
                <div>
                  <span className="text-text-muted block text-xs uppercase tracking-wider mb-0.5">Data de Abertura</span>
                  <span className="font-semibold text-text-secondary">
                    {process.created_at ? new Date(process.created_at).toLocaleString('pt-BR') : '-'}
                  </span>
                </div>
                <div>
                  <span className="text-text-muted block text-xs uppercase tracking-wider mb-0.5">Última Atualização</span>
                  <span className="font-semibold text-text-secondary">
                    {process.updated_at ? new Date(process.updated_at).toLocaleString('pt-BR') : '-'}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">Observações / Anotações Gerais</span>
                <p className="text-sm text-text-secondary bg-background-primary p-4 rounded-xl border border-border-default whitespace-pre-wrap min-h-[100px]">
                  {process.observation || 'Nenhuma observação cadastrada para este processo.'}
                </p>
              </div>
            </div>

            {/* CATEGORIA 2: Clientes Associados */}
            <div className="bg-background-surface rounded-2xl border border-border-default shadow-sm overflow-hidden">
              <div className="p-6 border-b border-border-default bg-background-muted/40 flex justify-between items-center">
                <div>
                  <h2 className="text-base font-bold text-text-primary tracking-tight">Clientes Associados</h2>
                  <p className="text-xs text-text-muted mt-0.5">Lista de beneficiários vinculados a este processo</p>
                </div>
                <span className="px-2.5 py-1 bg-action-primary/10 text-action-primary text-xs font-bold rounded-full border border-action-primary/20">
                  {process.clients?.length || 0} cliente(s)
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6 bg-background-surface">
                {process.clients && process.clients.length > 0 ? (
                  [...process.clients]
                    .sort((a, b) => a.full_name.localeCompare(b.full_name))
                    .map((c) => (
                      <div key={c.id} className="bg-background-surface p-4 rounded-xl border border-border-default shadow-sm hover:shadow-md hover:bg-background-muted/30 transition-all flex flex-col justify-between gap-3">
                        <div className="space-y-1">
                          <h3 className="font-bold text-text-primary text-sm">
                            {c.full_name}
                          </h3>
                          {process.establishment && (
                            <p className="text-xs text-text-muted font-semibold">
                              ({process.establishment.city}/{process.establishment.state})
                            </p>
                          )}
                        </div>
                        <div>
                          <button
                            onClick={() => router.push(`/clients/${c.id}`)}
                            className="w-full text-center px-3 py-2 bg-background-primary border border-border-default text-text-secondary text-xs font-bold rounded-lg hover:bg-action-primary/10 hover:text-action-primary hover:border-action-primary/20 transition-all shadow-sm"
                          >
                            Ver Perfil do Cliente
                          </button>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="p-8 text-center text-sm text-text-muted col-span-1 sm:col-span-2">Nenhum cliente vinculado a este processo.</div>
                )}
              </div>
            </div>

          </div>

          {/* COLUNA 3: RESPONSÁVEL & ESTABELECIMENTO */}
          <div className="space-y-6">

            {/* CATEGORIA 3: Responsável pelo Processo */}
            <div className="bg-background-surface p-6 rounded-2xl border border-border-default shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-border-default pb-3">
                <div className="h-8 w-8 rounded-lg bg-action-primary/10 text-action-primary flex items-center justify-center flex-shrink-0">
                  <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">Responsável</h2>
              </div>

              {process.user ? (
                <div className="space-y-2">
                  <div className="text-base font-bold text-text-primary">
                    {process.user.first_name} {process.user.last_name}
                  </div>
                  <div className="text-xs text-text-secondary flex items-center gap-1.5 font-mono">
                    <svg className="w-3.5 h-3.5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {process.user.email}
                  </div>
                  <span className="inline-flex px-2 py-0.5 rounded-full bg-success/10 text-success text-[10px] font-bold border border-success/20">
                    Operador Ativo
                  </span>
                </div>
              ) : (
                <p className="text-sm text-text-muted">Nenhum operador atribuído.</p>
              )}
            </div>

            {/* CATEGORIA 4: Estabelecimento */}
            <div className="bg-background-surface p-6 rounded-2xl border border-border-default shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-border-default pb-3">
                <div className="h-8 w-8 rounded-lg bg-warning/10 text-warning flex items-center justify-center flex-shrink-0">
                  <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">Estabelecimento</h2>
              </div>

              {process.establishment ? (
                <div className="space-y-3">
                  <div>
                    <h3 className="font-bold text-text-primary text-base">{process.establishment.name}</h3>
                    <p className="text-xs text-text-secondary mt-1 flex items-start gap-1">
                      <svg className="w-3.5 h-3.5 text-text-muted mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {process.establishment.address}
                    </p>
                    <p className="text-xs text-text-muted mt-1 font-semibold">
                      {process.establishment.city} - {process.establishment.state}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-text-muted">Este processo não possui estabelecimento associado.</p>
              )}
            </div>

            {/* CATEGORIA 5: Ações do Processo */}
            <div className="bg-background-surface p-6 rounded-2xl border border-border-default shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-border-default pb-3">
                <div className="h-8 w-8 rounded-lg bg-background-muted text-text-secondary flex items-center justify-center flex-shrink-0">
                  <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">Ações do Processo</h2>
              </div>
              <div className="flex flex-col gap-2 pt-1">
                <button
                  type="button"
                  title="Editar"
                  onClick={() => router.push(`/processes/${process.id}/edit`)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-background-primary border border-border-default text-text-secondary hover:bg-background-muted hover:text-warning hover:border-warning/30 transition-all font-bold text-sm shadow-sm duration-150"
                >
                  <svg className="h-5 w-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Editar Processo
                </button>
                <button
                  type="button"
                  title="Excluir"
                  onClick={() => handleDeleteClick()}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive hover:bg-destructive/20 hover:border-destructive/30 transition-all font-bold text-sm shadow-sm duration-150"
                >
                  <svg className="h-5 w-5 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Excluir Processo
                </button>
              </div>
            </div>

          </div>

        </div>

        <div className="mt-8 border-b border-border-default">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('annotations')}
              className={`pb-3 text-sm font-bold transition-all relative ${
                activeTab === 'annotations'
                  ? 'text-brand-primary'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Anotações de Acompanhamento
              {activeTab === 'annotations' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary rounded-full animate-fade-in" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`pb-3 text-sm font-bold transition-all relative ${
                activeTab === 'documents'
                  ? 'text-brand-primary'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Documentos do Processo
              {activeTab === 'documents' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary rounded-full animate-fade-in" />
              )}
            </button>
          </div>
        </div>

        <div className="mt-6">
          {activeTab === 'annotations' ? (
            <ProcessAnnotations processId={process.id as string} />
          ) : (
            <ProcessDocuments processId={process.id as string} />
          )}
        </div>
      </main>

      <ProcessDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        processProtocol={process.protocol || ''}
        isLoading={deleteLoading}
        errorMessage={deleteError}
      />
    </div>
  );
};
