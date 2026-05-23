"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useProcesses } from '../hooks/useProcesses';
import { ProcessStatusBadge } from '../components/ProcessStatusBadge';
import { ProcessStatus } from '@/interfaces/process.interface';
import { ProcessDeleteModal } from '../components/ProcessDeleteModal';
import { ProcessAnnotations } from '../components/ProcessAnnotations';

export const ProcessDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const { fetchProcessByID, updateProcessStatus, deleteProcess, process, loading, error } = useProcesses();
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="h-10 w-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-slate-400 text-sm font-medium mt-4">Carregando detalhes do processo...</p>
      </div>
    );
  }

  if (!process) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="text-red-500 text-lg font-bold">Processo não encontrado</div>
        <button
          onClick={() => router.push('/processes')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Voltar para Processos
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Barra de Navegação Superior */}
      <header className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-45">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/processes')}
              className="text-slate-400 hover:text-slate-600 transition-colors mr-2"
              title="Voltar para a Listagem"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <span className="font-extrabold text-slate-800 tracking-tight text-lg">
              Detalhes do <span className="text-blue-600 font-medium">Processo</span>
            </span>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal em 4 Categorias de Alto Padrão Visual */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* COLUNA 1 & 2: INFORMAÇÕES DO PROCESSO & CLIENTES ASSOCIADOS */}
          <div className="lg:col-span-2 space-y-6">

            {/* CATEGORIA 1: Informações do Processo */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
              <div className="flex justify-between items-start flex-wrap gap-4">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Protocolo de Controle</span>
                  <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-mono">
                    {process.protocol || 'Sem Protocolo'}
                  </h1>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-400 block mb-1 uppercase tracking-wider">Status do Processo</span>
                    <ProcessStatusBadge status={process.status || 'PENDING'} />
                  </div>
                  <div className="border-l border-slate-100 pl-4">
                    <span className="text-xs font-bold text-slate-400 block mb-1 uppercase tracking-wider">Alterar Status</span>
                    <select
                      id="status-select"
                      disabled={updatingStatus}
                      value={process.status || 'PENDING'}
                      onChange={(e) => handleStatusChange(e.target.value as ProcessStatus)}
                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all font-semibold"
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-t border-b border-slate-100 text-sm">
                <div>
                  <span className="text-slate-400 block text-xs uppercase tracking-wider mb-0.5">Data de Abertura</span>
                  <span className="font-semibold text-slate-700">
                    {process.created_at ? new Date(process.created_at).toLocaleString('pt-BR') : '-'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs uppercase tracking-wider mb-0.5">Última Atualização</span>
                  <span className="font-semibold text-slate-700">
                    {process.updated_at ? new Date(process.updated_at).toLocaleString('pt-BR') : '-'}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Observações / Anotações Gerais</span>
                <p className="text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100 whitespace-pre-wrap min-h-[100px]">
                  {process.observation || 'Nenhuma observação cadastrada para este processo.'}
                </p>
              </div>
            </div>

            {/* CATEGORIA 2: Clientes Associados */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <div>
                  <h2 className="text-base font-bold text-slate-800 tracking-tight">Clientes Associados</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Lista de beneficiários vinculados a este processo</p>
                </div>
                <span className="px-2.5 py-1 bg-blue-55 text-blue-700 text-xs font-bold rounded-full border border-blue-100">
                  {process.clients?.length || 0} cliente(s)
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6 bg-slate-50/10">
                {process.clients && process.clients.length > 0 ? (
                  [...process.clients]
                    .sort((a, b) => a.full_name.localeCompare(b.full_name))
                    .map((c) => (
                      <div key={c.id} className="bg-white p-4 rounded-xl border border-slate-150 shadow-sm hover:shadow-md hover:bg-slate-50/50 transition-all flex flex-col justify-between gap-3">
                        <div className="space-y-1">
                          <h3 className="font-bold text-slate-800 text-sm">
                            {c.full_name}
                          </h3>
                          {process.establishment && (
                            <p className="text-xs text-slate-400 font-semibold">
                              ({process.establishment.city}/{process.establishment.state})
                            </p>
                          )}
                        </div>
                        <div>
                          <button
                            onClick={() => router.push(`/clients/${c.id}`)}
                            className="w-full text-center px-3 py-2 bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
                          >
                            Ver Perfil do Cliente
                          </button>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="p-8 text-center text-sm text-slate-400 col-span-1 sm:col-span-2">Nenhum cliente vinculado a este processo.</div>
                )}
              </div>
            </div>

          </div>

          {/* COLUNA 3: RESPONSÁVEL & ESTABELECIMENTO */}
          <div className="space-y-6">

            {/* CATEGORIA 3: Responsável pelo Processo */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Responsável</h2>
              </div>

              {process.user ? (
                <div className="space-y-2">
                  <div className="text-base font-bold text-slate-800">
                    {process.user.first_name} {process.user.last_name}
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {process.user.email}
                  </div>
                  <span className="inline-flex px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-[10px] font-bold border border-green-200">
                    Operador Ativo
                  </span>
                </div>
              ) : (
                <p className="text-sm text-slate-500">Nenhum operador atribuído.</p>
              )}
            </div>

            {/* CATEGORIA 4: Estabelecimento */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Estabelecimento</h2>
              </div>

              {process.establishment ? (
                <div className="space-y-3">
                  <div>
                    <h3 className="font-bold text-slate-800 text-base">{process.establishment.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 flex items-start gap-1">
                      <svg className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {process.establishment.address}
                    </p>
                    <p className="text-xs text-slate-400 mt-1 font-semibold">
                      {process.establishment.city} - {process.establishment.state}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500">Este processo não possui estabelecimento associado.</p>
              )}
            </div>

            {/* CATEGORIA 5: Ações do Processo */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <div className="h-8 w-8 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Ações do Processo</h2>
              </div>
              <div className="flex flex-col gap-2 pt-1">
                <button
                  type="button"
                  title="Editar"
                  onClick={() => router.push(`/processes/${process.id}/edit`)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-amber-700 hover:border-amber-200 transition-all font-bold text-sm shadow-sm"
                >
                  <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Editar Processo
                </button>
                <button
                  type="button"
                  title="Excluir"
                  onClick={() => handleDeleteClick()}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-red-50/50 border border-red-100 text-red-700 hover:bg-red-50 hover:text-red-800 hover:border-red-200 transition-all font-bold text-sm shadow-sm"
                >
                  <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Excluir Processo
                </button>
              </div>
            </div>

          </div>

        </div>

        <ProcessAnnotations processId={process.id as string} />
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
