import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useProcessAnnotations } from '../hooks/useProcessAnnotations';
import { AnnotationForm } from './AnnotationForm';
import { AnnotationCard } from './AnnotationCard';

interface ProcessAnnotationsProps {
  processId: string;
}

// Zero-dependency pure JS helper to decode JWT payload safely in Next.js/Browser environment
const decodeTokenPayload = (token: string | null): any => {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Error decoding JWT token payload:', e);
    return null;
  }
};

export const ProcessAnnotations: React.FC<ProcessAnnotationsProps> = ({ processId }) => {
  const {
    loading,
    error,
    annotations,
    fetchAnnotations,
    createAnnotation,
    updateAnnotation,
    deleteAnnotation,
  } = useProcessAnnotations();

  const [currentUserId, setCurrentUserId] = useState<string>('');
  const accessToken = useSelector((state: any) => state.auth?.accessToken);

  // Carregar dados iniciais e decodificar token do usuário
  useEffect(() => {
    if (processId) {
      fetchAnnotations(processId);
    }
  }, [processId, fetchAnnotations]);

  useEffect(() => {
    if (accessToken) {
      const payload = decodeTokenPayload(accessToken);
      if (payload && payload.user_id) {
        setCurrentUserId(payload.user_id);
      }
    }
  }, [accessToken]);

  const handleCreate = async (text: string, visibility: 'PUBLIC' | 'PRIVATE') => {
    if (!processId) return false;
    const res = await createAnnotation(processId, text, visibility);
    return !!res;
  };

  const handleUpdate = async (annotationId: string, text: string) => {
    if (!processId) return false;
    const res = await updateAnnotation(processId, annotationId, text);
    return !!res;
  };

  const handleDelete = async (annotationId: string) => {
    if (!processId) return false;
    return await deleteAnnotation(processId, annotationId);
  };

  return (
    <div className="space-y-6 mt-12 pt-10 border-t border-border-default">
      <div className="flex items-center gap-2">
        <svg className="h-5 w-5 text-action-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <h3 className="text-base font-bold text-text-primary uppercase tracking-wider">
          Anotações de Acompanhamento
        </h3>
      </div>

      {error && (
        <div className="p-3.5 rounded-lg bg-destructive/10 text-destructive text-xs font-semibold border border-destructive/20 animate-in fade-in duration-150">
          {error}
        </div>
      )}

      {/* Formulário de Criação */}
      <AnnotationForm onSubmit={handleCreate} isLoading={loading} />

      {/* Listagem */}
      <div className="space-y-4">
        {annotations.length > 0 ? (
          annotations.map((anno) => (
            <AnnotationCard
              key={anno.id}
              annotation={anno}
              currentUserId={currentUserId}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <div className="bg-background-surface border border-border-default rounded-xl p-8 text-center text-sm text-text-muted font-medium">
            Nenhuma anotação de acompanhamento foi registrada para este processo ainda.
          </div>
        )}
      </div>
    </div>
  );
};
