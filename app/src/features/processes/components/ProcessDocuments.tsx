import React, { useEffect, useState } from 'react';
import { Button } from '@/components/forms/Button';
import { useProcessDocuments } from '../hooks/useProcessDocuments';
import { ProcessDocument } from '@/interfaces/document.interface';
import { DocumentUploadModal } from './DocumentUploadModal';
import { DocumentEditModal } from './DocumentEditModal';
import { DocumentSafetyConfirmModal } from './DocumentSafetyConfirmModal';
import { DocumentDeleteModal } from './DocumentDeleteModal';
import { DocumentViewModal } from './DocumentViewModal';
import { File, Eye, Download, Edit2, Trash2, Plus, AlertCircle, Loader2 } from 'lucide-react';

interface ProcessDocumentsProps {
  processId: string;
}

export const ProcessDocuments: React.FC<ProcessDocumentsProps> = ({ processId }) => {
  const {
    loading,
    error,
    documents,
    fetchDocuments,
    uploadDocument,
    updateDocument,
    deleteDocument,
    downloadDocument,
  } = useProcessDocuments();

  const [selectedDoc, setSelectedDoc] = useState<ProcessDocument | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const [isSafetyOpen, setIsSafetyOpen] = useState(false);
  const [pendingEditData, setPendingEditData] = useState<{
    name: string;
    description: string;
    file: File;
  } | null>(null);

  const [localLoading, setLocalLoading] = useState(false);

  useEffect(() => {
    if (processId) {
      fetchDocuments(processId);
    }
  }, [processId, fetchDocuments]);

  const handleUploadConfirm = async (name: string, description: string, file: File) => {
    setLocalLoading(true);
    const res = await uploadDocument(processId, name, description, file);
    setLocalLoading(false);
    if (res) {
      setIsUploadOpen(false);
    }
  };

  const handleEditConfirm = async (name: string, description: string, file: File | null) => {
    if (!selectedDoc) return;
    setLocalLoading(true);
    const res = await updateDocument(processId, selectedDoc.id, name, description, file || undefined);
    setLocalLoading(false);
    if (res) {
      setIsEditOpen(false);
      setSelectedDoc(null);
    }
  };

  const handleTriggerSafety = (name: string, description: string, file: File) => {
    setPendingEditData({ name, description, file });
    setIsSafetyOpen(true);
  };

  const handleSafetyConfirm = async () => {
    if (!selectedDoc || !pendingEditData) return;
    setLocalLoading(true);
    const res = await updateDocument(
      processId,
      selectedDoc.id,
      pendingEditData.name,
      pendingEditData.description,
      pendingEditData.file
    );
    setLocalLoading(false);
    if (res) {
      setIsSafetyOpen(false);
      setIsEditOpen(false);
      setSelectedDoc(null);
      setPendingEditData(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedDoc) return;
    setLocalLoading(true);
    const success = await deleteDocument(processId, selectedDoc.id);
    setLocalLoading(false);
    if (success) {
      setIsDeleteOpen(false);
      setSelectedDoc(null);
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-text-primary">
            Documentos Associados
          </h3>
          <p className="text-sm text-text-secondary">
            Gerencie e visualize arquivos anexados a este processo.
          </p>
        </div>
        <Button onClick={() => setIsUploadOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Adicionar Documento
        </Button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-sm font-semibold text-destructive flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {loading && documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-2">
          <Loader2 className="h-10 w-10 text-brand-primary animate-spin" />
          <span className="text-sm text-text-secondary">Carregando documentos...</span>
        </div>
      ) : documents.length === 0 ? (
        <div className="border border-border-default rounded-2xl p-10 text-center bg-background-surface">
          <File className="h-12 w-12 text-text-muted mx-auto mb-3" />
          <h4 className="text-base font-semibold text-text-primary">Nenhum documento anexado</h4>
          <p className="text-sm text-text-muted mt-1 max-w-sm mx-auto">
            Este processo ainda não possui documentos. Adicione contratos, PDFs, fotos ou planilhas relevantes.
          </p>
          <Button onClick={() => setIsUploadOpen(true)} variant="outline" className="mt-4 gap-2">
            <Plus className="h-4 w-4" /> Enviar Primeiro Documento
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border-default bg-background-surface">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background-muted/50 border-b border-border-default text-xs font-semibold uppercase tracking-wider text-text-secondary">
                <th className="px-6 py-4">Nome</th>
                <th className="px-6 py-4">Descrição</th>
                <th className="px-6 py-4">Data de Envio</th>
                <th className="px-6 py-4">Tamanho</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default text-sm text-text-primary">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-background-muted/30 transition-colors">
                  <td className="px-6 py-4 font-medium flex items-center gap-3">
                    <File className="h-5 w-5 text-brand-primary shrink-0" />
                    <span className="truncate max-w-[200px]" title={doc.name}>
                      {doc.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-text-secondary max-w-[300px] truncate" title={doc.description}>
                    {doc.description || <span className="text-text-muted italic">Sem descrição</span>}
                  </td>
                  <td className="px-6 py-4 text-text-secondary whitespace-nowrap">
                    {formatDate(doc.created_at)}
                  </td>
                  <td className="px-6 py-4 text-text-secondary whitespace-nowrap">
                    {(doc.file_size / 1024 / 1024).toFixed(2)} MB
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          setSelectedDoc(doc);
                          setIsViewOpen(true);
                        }}
                        title="Visualizar"
                        className="p-2 hover:bg-background-muted rounded-lg text-text-secondary hover:text-brand-primary transition-all"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => downloadDocument(processId, doc.id, doc.name)}
                        title="Baixar"
                        className="p-2 hover:bg-background-muted rounded-lg text-text-secondary hover:text-brand-primary transition-all"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedDoc(doc);
                          setIsEditOpen(true);
                        }}
                        title="Editar"
                        className="p-2 hover:bg-background-muted rounded-lg text-text-secondary hover:text-brand-primary transition-all"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedDoc(doc);
                          setIsDeleteOpen(true);
                        }}
                        title="Excluir"
                        className="p-2 hover:bg-background-muted rounded-lg text-text-secondary hover:text-destructive transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <DocumentUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onConfirm={handleUploadConfirm}
        isLoading={localLoading}
      />

      <DocumentEditModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedDoc(null);
        }}
        document={selectedDoc}
        onConfirm={handleEditConfirm}
        onTriggerSafety={handleTriggerSafety}
        isLoading={localLoading}
      />

      <DocumentSafetyConfirmModal
        isOpen={isSafetyOpen}
        onClose={() => {
          setIsSafetyOpen(false);
          setPendingEditData(null);
        }}
        onConfirm={handleSafetyConfirm}
        isLoading={localLoading}
      />

      <DocumentDeleteModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedDoc(null);
        }}
        document={selectedDoc}
        onConfirm={handleDeleteConfirm}
        isLoading={localLoading}
      />

      <DocumentViewModal
        isOpen={isViewOpen}
        onClose={() => {
          setIsViewOpen(false);
          setSelectedDoc(null);
        }}
        document={selectedDoc}
        processId={processId}
        onDownload={() => selectedDoc && downloadDocument(processId, selectedDoc.id, selectedDoc.name)}
      />
    </div>
  );
};
