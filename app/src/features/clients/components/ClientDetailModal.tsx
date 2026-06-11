import React, { useEffect, useState } from 'react';
import { useClients } from '../hooks/useClients';
import { Button } from '@/components/forms/Button';

interface ClientDetailModalProps {
  clientId: string;
  isOpen: boolean;
  onClose: () => void;
}

// Local formatting helpers
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

export const ClientDetailModal: React.FC<ClientDetailModalProps> = ({
  clientId,
  isOpen,
  onClose,
}) => {
  const { fetchClientByID, client, loading, error } = useClients();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && clientId) {
      fetchClientByID(clientId);
    }
  }, [clientId, isOpen, fetchClientByID]);

  // Close modal on Esc press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopy = async (field: string, value?: string | null) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      setTimeout(() => {
        setCopiedField(null);
      }, 1500);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
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
        return status || '-';
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-primary/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-background-surface border border-border-default w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-border-default flex items-center justify-between bg-background-muted/40">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-action-primary/10 text-action-primary flex items-center justify-center font-bold text-lg">
              {client ? client.full_name.charAt(0).toUpperCase() : 'C'}
            </div>
            <div>
              <h3 className="font-bold text-text-primary text-base">Perfil do Cliente</h3>
              <p className="text-xs text-text-muted font-semibold">Visualização rápida de informações</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary hover:bg-background-muted p-1.5 rounded-lg transition-all"
            title="Fechar"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-background-primary space-y-6">
          {loading && !client ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="h-10 w-10 border-4 border-border-default border-t-action-primary rounded-full animate-spin"></div>
              <p className="text-text-muted text-sm font-medium mt-4 font-semibold animate-pulse">Carregando perfil do cliente...</p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-sm font-medium text-destructive">
              {error}
            </div>
          ) : client ? (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-background-surface border border-border-default rounded-xl shadow-sm">
                <div>
                  <h4 className="text-lg font-bold text-text-primary">{client.full_name}</h4>
                  <p className="text-xs text-text-muted font-mono mt-0.5">ID: {client.id}</p>
                </div>
                <span className={`inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold self-start sm:self-auto ${getStatusBadgeClass(client.status)}`}>
                  {getStatusLabel(client.status)}
                </span>
              </div>

              {/* Grid de Informações */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Email */}
                <div className="bg-background-surface border border-border-default p-4 rounded-xl shadow-sm space-y-1 relative">
                  <span className="text-xs font-bold text-text-muted uppercase tracking-wider block">E-mail</span>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm text-text-primary font-medium truncate">
                      {client.email || '-'}
                    </span>
                    {client.email && (
                      <button
                        onClick={() => handleCopy('email', client.email)}
                        className="flex items-center gap-1 p-1.5 rounded-lg hover:bg-background-muted text-text-muted hover:text-text-primary transition-all text-xs font-bold"
                        title="Copiar E-mail"
                      >
                        {copiedField === 'email' ? (
                          <>
                            <svg className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-success text-[10px] animate-fade-in font-bold">Copiado!</span>
                          </>
                        ) : (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                          </svg>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Telefone */}
                <div className="bg-background-surface border border-border-default p-4 rounded-xl shadow-sm space-y-1">
                  <span className="text-xs font-bold text-text-muted uppercase tracking-wider block">Telefone</span>
                  <span className="text-sm text-text-primary font-medium block font-mono">
                    {formatPhone(client.phone)}
                  </span>
                </div>

                {/* Data de Nascimento */}
                <div className="bg-background-surface border border-border-default p-4 rounded-xl shadow-sm space-y-1 relative">
                  <span className="text-xs font-bold text-text-muted uppercase tracking-wider block">Data de Nascimento</span>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm text-text-primary font-medium font-mono">
                      {formatBirthDate(client.birth_date)}
                    </span>
                    {client.birth_date && (
                      <button
                        onClick={() => handleCopy('birth_date', formatBirthDate(client.birth_date))}
                        className="flex items-center gap-1 p-1.5 rounded-lg hover:bg-background-muted text-text-muted hover:text-text-primary transition-all text-xs font-bold"
                        title="Copiar Data de Nascimento"
                      >
                        {copiedField === 'birth_date' ? (
                          <>
                            <svg className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-success text-[10px] animate-fade-in font-bold">Copiado!</span>
                          </>
                        ) : (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                          </svg>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* CPF */}
                <div className="bg-background-surface border border-border-default p-4 rounded-xl shadow-sm space-y-1 relative">
                  <span className="text-xs font-bold text-text-muted uppercase tracking-wider block">CPF</span>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm text-text-primary font-medium font-mono">
                      {formatCPF(client.cpf)}
                    </span>
                    {client.cpf && (
                      <button
                        onClick={() => handleCopy('cpf', client.cpf)}
                        className="flex items-center gap-1 p-1.5 rounded-lg hover:bg-background-muted text-text-muted hover:text-text-primary transition-all text-xs font-bold"
                        title="Copiar CPF"
                      >
                        {copiedField === 'cpf' ? (
                          <>
                            <svg className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-success text-[10px] animate-fade-in font-bold">Copiado!</span>
                          </>
                        ) : (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                          </svg>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* RG */}
                <div className="bg-background-surface border border-border-default p-4 rounded-xl shadow-sm space-y-1 relative">
                  <span className="text-xs font-bold text-text-muted uppercase tracking-wider block">RG</span>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm text-text-primary font-medium font-mono">
                      {client.rg || '-'}
                    </span>
                    {client.rg && (
                      <button
                        onClick={() => handleCopy('rg', client.rg)}
                        className="flex items-center gap-1 p-1.5 rounded-lg hover:bg-background-muted text-text-muted hover:text-text-primary transition-all text-xs font-bold"
                        title="Copiar RG"
                      >
                        {copiedField === 'rg' ? (
                          <>
                            <svg className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-success text-[10px] animate-fade-in font-bold">Copiado!</span>
                          </>
                        ) : (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                          </svg>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* CNH */}
                <div className="bg-background-surface border border-border-default p-4 rounded-xl shadow-sm space-y-1 relative">
                  <span className="text-xs font-bold text-text-muted uppercase tracking-wider block">CNH</span>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm text-text-primary font-medium font-mono">
                      {client.cnh || '-'}
                    </span>
                    {client.cnh && (
                      <button
                        onClick={() => handleCopy('cnh', client.cnh)}
                        className="flex items-center gap-1 p-1.5 rounded-lg hover:bg-background-muted text-text-muted hover:text-text-primary transition-all text-xs font-bold"
                        title="Copiar CNH"
                      >
                        {copiedField === 'cnh' ? (
                          <>
                            <svg className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-success text-[10px] animate-fade-in font-bold">Copiado!</span>
                          </>
                        ) : (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                          </svg>
                        )}
                      </button>
                    )}
                  </div>
                </div>

              </div>
            </div>
          ) : (
            <div className="text-center text-sm text-text-muted py-6">Cliente não encontrado.</div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-border-default flex justify-end bg-background-muted/40">
          <Button onClick={onClose} variant="outline">
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
};
