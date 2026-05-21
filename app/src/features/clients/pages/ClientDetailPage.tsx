"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useClients } from '../hooks/useClients';
import { ClientDeleteModal } from '../components/ClientDeleteModal';
import { Button } from '@/components/forms/Button';

interface ClientDetailPageProps {
  id: string;
}

// Funções de formatação locais
const formatCPF = (cpf?: string | null): string => {
  if (!cpf) return '-';
  const clean = cpf.replace(/\D/g, '');
  return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

const formatPhone = (phone?: string | null): string => {
  if (!phone) return '-';
  const clean = phone.replace(/\D/g, '');
  if (clean.length === 10) {
    return clean.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return clean.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
};

const formatDate = (dateStr?: string): string => {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch (e) {
    return dateStr;
  }
};

const formatBirthDate = (dateStr?: string | null): string => {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr.substring(0, 10) + 'T00:00:00');
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  } catch (e) {
    return dateStr;
  }
};

export const ClientDetailPage: React.FC<ClientDetailPageProps> = ({ id }) => {
  const router = useRouter();
  const { fetchClientByID, deleteClient, client, loading, error } = useClients();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    fetchClientByID(id);
  }, [id, fetchClientByID]);

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      const res = await deleteClient(id);
      if (res.success) {
        setDeleteModalOpen(false);
        router.push('/clients');
      } else {
        setDeleteError(res.error || "O cliente está vinculado a um processo e não pode ser removido.");
      }
    } catch (err: any) {
      setDeleteError("Erro ao remover cliente.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const getStatusBadgeClass = (status?: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'INACTIVE':
        return 'bg-slate-50 text-slate-600 border-slate-200';
      case 'SUSPENDED':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Ativo';
      case 'INACTIVE':
        return 'Inativo';
      case 'SUSPENDED':
        return 'Suspenso';
      default:
        return status;
    }
  };

  if (!client && loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-100 rounded-xl shadow-md px-10">
          <div className="h-10 w-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm font-medium mt-4 font-semibold animate-pulse">Carregando detalhes do cliente...</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-xl border border-slate-100 shadow-md text-center">
          <h2 className="text-xl font-bold text-slate-800">Cliente não encontrado</h2>
          <p className="text-slate-500 text-sm mt-2 mb-6">O cliente solicitado não pôde ser localizado ou foi excluído.</p>
          <Button onClick={() => router.push('/clients')} className="bg-blue-600 hover:bg-blue-700 text-white w-full">
            Voltar para Clientes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Top Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <button
            onClick={() => router.push('/clients')}
            className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors self-start"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Voltar para Clientes
          </button>

          <div className="flex gap-3">
            <Button
              onClick={() => router.push(`/clients/${client.id}/edit`)}
              className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
            >
              <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editar Cliente
            </Button>
            <Button
              onClick={() => setDeleteModalOpen(true)}
              className="bg-red-50 border border-red-100 text-red-600 hover:bg-red-100 flex items-center gap-2"
            >
              <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Excluir Cliente
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        {/* Título Principal */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl font-black">
              {client.full_name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">{client.full_name}</h1>
              <p className="text-slate-400 text-xs mt-0.5 font-mono">ID: {client.id}</p>
            </div>
          </div>

          <span className={`inline-flex items-center rounded-full border px-3.5 py-1 text-sm font-semibold self-start sm:self-auto ${getStatusBadgeClass(client.status)}`}>
            {getStatusLabel(client.status)}
          </span>
        </div>

        {/* Informações em Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Informações Gerais */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-50 pb-3 mb-4">
              Informações Gerais
            </h3>
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="text-slate-400 font-semibold">Nome Completo</dt>
                <dd className="text-slate-800 font-semibold mt-0.5">{client.full_name}</dd>
              </div>
              <div>
                <dt className="text-slate-400 font-semibold">Data de Nascimento</dt>
                <dd className="text-slate-800 mt-0.5 font-mono">{formatBirthDate(client.birth_date)}</dd>
              </div>
            </dl>
          </div>

          {/* Card 2: Informações de Contato */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-50 pb-3 mb-4">
              Contato
            </h3>
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="text-slate-400 font-semibold">E-mail</dt>
                <dd className="text-slate-800 font-semibold mt-0.5">
                  {client.email ? (
                    <a href={`mailto:${client.email}`} className="text-blue-600 hover:underline">
                      {client.email}
                    </a>
                  ) : (
                    '-'
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-slate-400 font-semibold">Telefone</dt>
                <dd className="text-slate-800 font-semibold mt-0.5 font-mono">{formatPhone(client.phone)}</dd>
              </div>
            </dl>
          </div>

          {/* Card 3: Documentação */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-50 pb-3 mb-4">
              Documentação
            </h3>
            <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <dt className="text-slate-400 font-semibold">CPF</dt>
                <dd className="text-slate-800 font-semibold mt-0.5 font-mono">{formatCPF(client.cpf)}</dd>
              </div>
              <div>
                <dt className="text-slate-400 font-semibold">RG</dt>
                <dd className="text-slate-800 font-semibold mt-0.5 font-mono">{client.rg || '-'}</dd>
              </div>
              <div>
                <dt className="text-slate-400 font-semibold">CNH</dt>
                <dd className="text-slate-800 font-semibold mt-0.5 font-mono">{client.cnh || '-'}</dd>
              </div>
            </dl>
          </div>

          {/* Card 4: Histórico */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-50 pb-3 mb-4">
              Histórico de Registro
            </h3>
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="text-slate-400 font-semibold">Criado em</dt>
                <dd className="text-slate-800 font-semibold mt-0.5 font-mono text-xs">{formatDate(client.created_at)}</dd>
              </div>
              <div>
                <dt className="text-slate-400 font-semibold">Última atualização</dt>
                <dd className="text-slate-800 font-semibold mt-0.5 font-mono text-xs">{formatDate(client.updated_at)}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Modal de Exclusão */}
      <ClientDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        clientName={client.full_name}
        isLoading={deleteLoading}
        errorMessage={deleteError}
      />
    </div>
  );
};
