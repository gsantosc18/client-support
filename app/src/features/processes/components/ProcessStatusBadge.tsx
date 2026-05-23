import React from 'react';
import { ProcessStatus } from '@/interfaces/process.interface';

interface ProcessStatusBadgeProps {
  status: ProcessStatus;
}

export const ProcessStatusBadge: React.FC<ProcessStatusBadgeProps> = ({ status }) => {
  const getStyles = () => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'IN_PROGRESS':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'AWAITING_DOCUMENTATION':
        return 'bg-orange-50 text-orange-700 border-orange-100';
      case 'IN_ANALYSIS':
        return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'COMPLETED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'CANCELLED':
        return 'bg-red-50 text-red-700 border-red-100';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-100';
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
