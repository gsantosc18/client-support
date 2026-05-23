import React from 'react';
import { Client } from '@/interfaces/client.interface';
import Link from 'next/link';

interface ClientTableProps {
  clients: Client[];
  onDeleteClick: (client: Client) => void;
  sortField: string;
  sortDirection: 'asc' | 'desc';
  onSort: (field: string) => void;
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

export const ClientTable: React.FC<ClientTableProps> = ({
  clients,
  onDeleteClick,
  sortField,
  sortDirection,
  onSort,
}) => {
  const renderSortIcon = (field: string) => {
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

  const getStatusBadgeClass = (status?: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-success/10 text-success border-success/20';
      case 'INACTIVE':
        return 'bg-background-muted text-text-secondary border-border-default';
      case 'SUSPENDED':
        return 'bg-warning/10 text-warning border-warning/20';
      default:
        return 'bg-background-muted text-text-secondary border-border-default';
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

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-border-default bg-background-surface shadow-sm">
      <table className="w-full border-collapse text-left text-sm text-text-secondary">
        <thead className="bg-background-muted text-xs font-semibold uppercase tracking-wider text-text-secondary border-b border-border-default">
          <tr>
            <th scope="col" className="px-6 py-4 cursor-pointer hover:bg-background-muted/60 hover:text-text-primary transition-colors select-none" onClick={() => onSort('full_name')}>
              <div className="flex items-center">
                Nome {renderSortIcon('full_name')}
              </div>
            </th>
            <th scope="col" className="px-6 py-4 cursor-pointer hover:bg-background-muted/60 hover:text-text-primary transition-colors select-none" onClick={() => onSort('email')}>
              <div className="flex items-center">
                E-mail {renderSortIcon('email')}
              </div>
            </th>
            <th scope="col" className="px-6 py-4 cursor-pointer hover:bg-background-muted/60 hover:text-text-primary transition-colors select-none" onClick={() => onSort('phone')}>
              <div className="flex items-center">
                Telefone {renderSortIcon('phone')}
              </div>
            </th>
            <th scope="col" className="px-6 py-4 cursor-pointer hover:bg-background-muted/60 hover:text-text-primary transition-colors select-none" onClick={() => onSort('status')}>
              <div className="flex items-center">
                Status {renderSortIcon('status')}
              </div>
            </th>
            <th scope="col" className="px-6 py-4 cursor-pointer hover:bg-background-muted/60 hover:text-text-primary transition-colors select-none" onClick={() => onSort('created_at')}>
              <div className="flex items-center">
                Data de Criação {renderSortIcon('created_at')}
              </div>
            </th>
            <th scope="col" className="px-6 py-4 cursor-pointer hover:bg-background-muted/60 hover:text-text-primary transition-colors select-none" onClick={() => onSort('updated_at')}>
              <div className="flex items-center">
                Última Atualização {renderSortIcon('updated_at')}
              </div>
            </th>
            <th scope="col" className="px-6 py-4 text-center font-bold">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-default">
          {clients.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-6 py-10 text-center text-text-muted font-medium">
                Nenhum cliente cadastrado ou encontrado.
              </td>
            </tr>
          ) : (
            clients.map((c) => (
              <tr key={c.id} className="hover:bg-background-muted/30 transition-colors duration-150">
                <td className="px-6 py-4 font-semibold text-text-primary">
                  {c.full_name}
                </td>
                <td className="px-6 py-4 text-text-secondary">
                  {c.email || '-'}
                </td>
                <td className="px-6 py-4 text-text-secondary font-mono">
                  {formatPhone(c.phone)}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusBadgeClass(c.status)}`}>
                    {getStatusLabel(c.status)}
                  </span>
                </td>
                <td className="px-6 py-4 text-text-muted font-mono text-xs">
                  {formatDate(c.created_at)}
                </td>
                <td className="px-6 py-4 text-text-muted font-mono text-xs">
                  {formatDate(c.updated_at)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center items-center gap-3">
                    <Link
                      href={`/clients/${c.id}`}
                      title="Ver detalhes"
                      className="p-1.5 rounded-lg text-info/85 hover:bg-info/10 hover:text-info transition-all"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </Link>
                    <Link
                      href={`/clients/${c.id}/edit`}
                      title="Editar"
                      className="p-1.5 rounded-lg text-success/85 hover:bg-success/10 hover:text-success transition-all"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Link>
                    <button
                      type="button"
                      title="Excluir"
                      onClick={() => onDeleteClick(c)}
                      className="p-1.5 rounded-lg text-destructive/85 hover:bg-destructive/10 hover:text-destructive transition-all"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
