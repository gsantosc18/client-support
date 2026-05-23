import React, { useState, useEffect } from 'react';
import { Button } from '@/components/forms/Button';
import { X, FileText, Download, Loader2, Image, AlertCircle } from 'lucide-react';
import { ProcessDocument } from '@/interfaces/document.interface';
import { documentService } from '../services/documentService';

interface DocumentViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: ProcessDocument | null;
  processId: string;
  onDownload: () => void;
}

export const DocumentViewModal: React.FC<DocumentViewModalProps> = ({
  isOpen,
  onClose,
  document: doc,
  processId,
  onDownload,
}) => {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let localUrl: string | null = null;

    if (isOpen && doc && processId) {
      setLoading(true);
      setError(null);
      
      const loadFile = async () => {
        try {
          const blob = await documentService.download(processId, doc.id);
          if (active) {
            localUrl = window.URL.createObjectURL(blob);
            setObjectUrl(localUrl);
          }
        } catch (err) {
          if (active) {
            setError('Não foi possível carregar o arquivo para visualização.');
          }
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      };

      loadFile();
    }

    return () => {
      active = false;
      if (localUrl) {
        window.URL.revokeObjectURL(localUrl);
      }
    };
  }, [isOpen, doc, processId]);

  if (!isOpen || !doc) return null;

  const isImage = doc.file_type.startsWith('image/');
  const isPdf = doc.file_type === 'application/pdf';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-text-primary/60 backdrop-blur-sm transition-all duration-300">
      <div className="w-full max-w-4xl scale-95 transform rounded-2xl border border-border-default bg-background-surface p-6 shadow-xl transition-all duration-300 flex flex-col max-h-[90vh]">
        
        <div className="flex items-center justify-between pb-4 border-b border-border-default">
          <div className="flex items-center gap-2">
            {isImage ? (
              <Image className="h-6 w-6 text-brand-primary" />
            ) : (
              <FileText className="h-6 w-6 text-brand-primary" />
            )}
            <div>
              <h2 className="text-lg font-bold text-text-primary truncate max-w-xl">
                {doc.name}
              </h2>
              <p className="text-xs text-text-muted">
                {doc.file_type} • {(doc.file_size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-background-muted transition-colors text-text-secondary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto min-h-[40vh] max-h-[65vh] flex items-center justify-center p-4 bg-background-primary rounded-xl border border-border-default mt-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center space-y-2 py-10">
              <Loader2 className="h-10 w-10 text-brand-primary animate-spin" />
              <span className="text-sm text-text-secondary">Carregando visualização...</span>
            </div>
          ) : error ? (
            <div className="text-center py-10 space-y-3">
              <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
              <p className="text-sm text-text-secondary">{error}</p>
              <Button onClick={onDownload} variant="primary" className="gap-2">
                <Download className="h-4 w-4" /> Baixar Documento
              </Button>
            </div>
          ) : objectUrl ? (
            isImage ? (
              <img
                src={objectUrl}
                alt={doc.name}
                className="max-h-[60vh] object-contain rounded-lg shadow-md mx-auto"
              />
            ) : isPdf ? (
              <embed
                src={objectUrl}
                type="application/pdf"
                className="w-full h-[60vh] rounded-lg border-transparent"
              />
            ) : (
              <div className="text-center py-10 space-y-4">
                <FileText className="h-16 w-16 text-text-muted mx-auto" />
                <div>
                  <h3 className="text-base font-semibold text-text-primary">
                    Visualização indisponível para este formato
                  </h3>
                  <p className="text-sm text-text-muted max-w-sm mx-auto mt-1">
                    Formatos como Word (.docx) ou Excel (.xlsx) não podem ser renderizados diretamente no navegador.
                  </p>
                </div>
                <Button onClick={onDownload} variant="primary" className="gap-2">
                  <Download className="h-4 w-4" /> Baixar e Abrir Arquivo
                </Button>
              </div>
            )
          ) : null}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border-default mt-4 shrink-0">
          <Button onClick={onClose} variant="outline">
            Fechar
          </Button>
          <Button onClick={onDownload} variant="primary" className="gap-2">
            <Download className="h-4 w-4" /> Baixar
          </Button>
        </div>

      </div>
    </div>
  );
};
