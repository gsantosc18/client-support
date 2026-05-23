import React from 'react';
import { ProcessStatus } from '@/interfaces/process.interface';

interface ProcessStatusBadgeProps {
  status: ProcessStatus;
}

export const ProcessStatusBadge: React.FC<ProcessStatusBadgeProps> = ({ status }) => {
  const getStyles = () => {
    switch (status) {
      case 'PENDING':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'IN_PROGRESS':
        return 'bg-action-primary/10 text-action-primary border-action-primary/20';
      case 'AWAITING_DOCUMENTATION':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'IN_ANALYSIS':
        return 'bg-info/10 text-info border-info/20';
      case 'COMPLETED':
        return 'bg-success/10 text-success border-success/20';
      case 'CANCELLED':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-background-muted text-text-secondary border-border-default';
    }
  };

  const getLabel = () => {
    switch (status) {
      case 'PENDING':
        return 'Pendente';
      case 'IN_PROGRESS':
        return 'Em Andamento';
      case 'AWAITING_DOCUMENTATION':
        return 'Aguardando Docs';
      case 'IN_ANALYSIS':
        return 'Em Análise';
      case 'COMPLETED':
        return 'Concluído';
      case 'CANCELLED':
        return 'Cancelado';
      default:
        return status;
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getStyles()}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse" />
      {getLabel()}
    </span>
  );
};
