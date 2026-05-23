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
        <span className="inline-flex items-center px-2 py-0.5 rounded bg-info/10 text-info border border-info/20 text-[10px] font-bold select-none gap-1">
          🔒 Privada (Interna)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded bg-action-primary/10 text-action-primary border border-action-primary/20 text-[10px] font-bold select-none gap-1">
        🌍 Pública (Geral)
      </span>
    );
  };

  const authorName = annotation.user
    ? `${annotation.user.first_name} ${annotation.user.last_name}`
    : 'Operador';

  return (
    <div className="bg-background-surface bg-white p-5 rounded-xl border border-border-default shadow-sm transition-all duration-200 hover:shadow-md space-y-3">
      {/* Cabeçalho do Card */}
      <div className="flex justify-between items-start gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-bold text-text-primary">{authorName}</span>
          {getVisibilityBadge()}
          <span className="text-[10px] text-text-muted font-medium">
            {formatTime(annotation.created_at)}
          </span>
          {canModify && timeRemainingLabel && (
            <span className="text-[10px] text-warning font-bold animate-pulse">
              {timeRemainingLabel}
            </span>
          )}
        </div>

        {/* Botões de Ação Dinâmicos */}
        {canModify && !isEditing && !isDeleting && (
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs font-semibold text-text-muted hover:text-action-primary transition-colors p-1"
              title="Editar anotação inline"
              aria-label="Editar anotação"
            >
              Editar
            </button>
            <span className="text-border-default text-xs select-none">|</span>
            <button
              onClick={() => setIsDeleting(true)}
              className="text-xs font-semibold text-text-muted hover:text-destructive transition-colors p-1"
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
            className="w-full rounded-lg border border-border-default bg-background-surface px-3 py-2 text-sm text-text-primary focus-visible:border-action-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring transition-all resize-none"
          />
          <div className="flex justify-end gap-2">
            <Button
              onClick={() => {
                setIsEditing(false);
                setEditText(annotation.annotation);
              }}
              disabled={isActionLoading}
              variant="outline"
              className="text-xs px-3 py-1.5"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={isActionLoading || !editText.trim()}
              isLoading={isActionLoading}
              variant="primary"
              className="text-xs px-4 py-1.5"
            >
              Salvar Alterações
            </Button>
          </div>
        </div>
      ) : isDeleting ? (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <span className="text-xs font-semibold text-destructive">
            ⚠️ Tem certeza que deseja deletar fisicamente esta anotação do banco de dados?
          </span>
          <div className="flex gap-2 shrink-0 w-full sm:w-auto justify-end">
            <Button
              onClick={() => setIsDeleting(false)}
              disabled={isActionLoading}
              variant="outline"
              className="text-[10px] px-3 py-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDelete}
              disabled={isActionLoading}
              isLoading={isActionLoading}
              className="bg-destructive hover:bg-destructive/90 text-white border-transparent focus-visible:ring-destructive text-[10px] px-3 py-1"
            >
              Excluir Definitivo
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
          {annotation.annotation}
        </p>
      )}
    </div>
  );
};
