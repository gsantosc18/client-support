import React, { useState, useEffect } from 'react';
import { Annotation } from '@/interfaces/annotation.interface';
import { Button } from '@/components/forms/Button';

interface AnnotationCardProps {
  annotation: Annotation;
  currentUserId: string;
  onUpdate: (id: string, text: string) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

export const AnnotationCard: React.FC<AnnotationCardProps> = ({
  annotation,
  currentUserId,
  onUpdate,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(annotation.annotation);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [timeRemainingLabel, setTimeRemainingLabel] = useState('');
  const [canModify, setCanModify] = useState(false);

  // Formatar data de forma amigável
  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Efeito reativo para calcular a janela de 15 minutos
  useEffect(() => {
    const checkTimeLimit = () => {
      if (!annotation.created_at) return;
      const createdTime = new Date(annotation.created_at).getTime();
      const now = new Date().getTime();
      const diffMs = now - createdTime;
      const fifteenMinutesMs = 15 * 60 * 1000;

      const isOwner = currentUserId === annotation.user_id;
      const isWithinWindow = diffMs <= fifteenMinutesMs;

      setCanModify(isOwner && isWithinWindow);

      if (isOwner && isWithinWindow) {
        const remainingMin = Math.ceil((fifteenMinutesMs - diffMs) / (60 * 1000));
        setTimeRemainingLabel(`(Edição livre por mais ${remainingMin} min)`);
      } else {
        setTimeRemainingLabel('');
      }
    };

    checkTimeLimit();
    const interval = setInterval(checkTimeLimit, 15000); // recalcula a cada 15 segundos
    return () => clearInterval(interval);
  }, [annotation.created_at, annotation.user_id, currentUserId]);

  const handleUpdate = async () => {
    if (!editText.trim()) return;
    setIsActionLoading(true);
    const success = await onUpdate(annotation.id!, editText.trim());
    setIsActionLoading(false);
    if (success) {
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    setIsActionLoading(true);
    const success = await onDelete(annotation.id!);
    setIsActionLoading(false);
    if (success) {
      setIsDeleting(false);
    }
  };

  const getVisibilityBadge = () => {
    if (annotation.visibility === 'PRIVATE') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-100 text-[10px] font-bold select-none gap-1">
          🔒 Privada (Interna)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-bold select-none gap-1">
        🌍 Pública (Geral)
      </span>
    );
  };

  const authorName = annotation.user
    ? `${annotation.user.first_name} ${annotation.user.last_name}`
    : 'Operador';

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm transition-all duration-200 hover:shadow-md space-y-3">
      {/* Cabeçalho do Card */}
      <div className="flex justify-between items-start gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-bold text-slate-800">{authorName}</span>
          {getVisibilityBadge()}
          <span className="text-[10px] text-slate-400 font-medium">
            {formatTime(annotation.created_at)}
          </span>
          {canModify && timeRemainingLabel && (
            <span className="text-[10px] text-amber-500 font-bold animate-pulse">
              {timeRemainingLabel}
            </span>
          )}
        </div>

        {/* Botões de Ação Dinâmicos */}
        {canModify && !isEditing && !isDeleting && (
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs font-semibold text-slate-400 hover:text-blue-650 transition-colors p-1"
              title="Editar anotação inline"
              aria-label="Editar anotação"
            >
              Editar
            </button>
            <span className="text-slate-200 text-xs select-none">|</span>
            <button
              onClick={() => setIsDeleting(true)}
              className="text-xs font-semibold text-slate-400 hover:text-red-650 transition-colors p-1"
              title="Excluir anotação permanentemente"
              aria-label="Excluir anotação permanente"
            >
              Excluir
            </button>
          </div>
        )}
      </div>

      {/* Corpo / Modos de Exibição ou Edição */}
      {isEditing ? (
        <div className="space-y-3">
          <textarea
            rows={2}
            value={editText}
            onChange={(e) => setEditText(e.target.value.slice(0, 2000))}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all resize-none"
          />
          <div className="flex justify-end gap-2">
            <Button
              onClick={() => {
                setIsEditing(false);
                setEditText(annotation.annotation);
              }}
              disabled={isActionLoading}
              className="bg-white border border-slate-200 text-slate-650 hover:bg-slate-50 text-xs px-3 py-1.5"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={isActionLoading || !editText.trim()}
              isLoading={isActionLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-1.5"
            >
              Salvar Alterações
            </Button>
          </div>
        </div>
      ) : isDeleting ? (
        <div className="bg-red-50/50 border border-red-100 rounded-lg p-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <span className="text-xs font-semibold text-red-700">
            ⚠️ Tem certeza que deseja deletar fisicamente esta anotação do banco de dados?
          </span>
          <div className="flex gap-2 shrink-0 w-full sm:w-auto justify-end">
            <Button
              onClick={() => setIsDeleting(false)}
              disabled={isActionLoading}
              className="bg-white border border-slate-200 text-slate-650 hover:bg-slate-50 text-[10px] px-3 py-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDelete}
              disabled={isActionLoading}
              isLoading={isActionLoading}
              className="bg-red-600 hover:bg-red-700 text-white text-[10px] px-3 py-1"
            >
              Excluir Definitivo
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-650 leading-relaxed white-space-pre-wrap">
          {annotation.annotation}
        </p>
      )}
    </div>
  );
};
