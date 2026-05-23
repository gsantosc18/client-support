import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/forms/Button';
import { UploadCloud, File, AlertCircle } from 'lucide-react';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string, description: string, file: File) => Promise<void>;
  isLoading: boolean;
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setDescription('');
      setFile(null);
      setDragActive(false);
      setValidationError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleFileChange = (newFile: File) => {
    const allowed = ['.pdf', '.png', '.jpg', '.jpeg', '.docx', '.xlsx'];
    const ext = newFile.name.substring(newFile.name.lastIndexOf('.')).toLowerCase();
    
    if (!allowed.includes(ext)) {
      setValidationError('Extensão de arquivo não permitida. Use PDF, PNG, JPG, JPEG, DOCX ou XLSX.');
      return;
    }
    
    if (newFile.size > 10 * 1024 * 1024) {
      setValidationError('O arquivo excede o limite de 10MB.');
      return;
    }

    setValidationError(null);
    setFile(newFile);
    
    // Autofill name from file name without extension
    const defaultName = newFile.name.substring(0, newFile.name.lastIndexOf('.'));
    setName(defaultName);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileChange(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setValidationError('O nome do documento é obrigatório.');
      return;
    }
    if (!file) {
      setValidationError('Por favor, selecione ou arraste um arquivo.');
      return;
    }

    await onConfirm(name, description, file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-text-primary/60 backdrop-blur-sm transition-all duration-300">
      <div className="w-full max-w-lg scale-95 transform rounded-2xl border border-border-default bg-background-surface p-6 shadow-xl transition-all duration-300">
        <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
          <UploadCloud className="h-6 w-6 text-brand-primary" />
          Adicionar Novo Documento
        </h2>

        {validationError && (
          <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm font-medium text-destructive flex items-start gap-2">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <span>{validationError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Drag & Drop File Zone */}
          <div>
            <span className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">
              Arquivo do Documento <span className="text-destructive">*</span>
            </span>
            
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-brand-primary bg-brand-primary/5'
                  : file
                  ? 'border-border-default bg-background-muted'
                  : 'border-border-default hover:border-brand-primary/60 hover:bg-background-muted'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileInput}
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg,.docx,.xlsx"
              />
              
              {file ? (
                <div className="flex flex-col items-center justify-center space-y-2">
                  <File className="h-10 w-10 text-brand-primary" />
                  <span className="text-sm font-medium text-text-primary max-w-xs truncate">
                    {file.name}
                  </span>
                  <span className="text-xs text-text-muted">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-2">
                  <UploadCloud className="h-10 w-10 text-text-muted" />
                  <span className="text-sm text-text-secondary">
                    Arraste o arquivo aqui ou <strong className="text-brand-primary">clique para buscar</strong>
                  </span>
                  <span className="text-xs text-text-muted">
                    PDF, PNG, JPG, JPEG, DOCX ou XLSX (Máx. 10MB)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Nome */}
          <div>
            <label htmlFor="upload-doc-name" className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">
              Nome do Documento <span className="text-destructive">*</span>
            </label>
            <input
              id="upload-doc-name"
              type="text"
              required
              placeholder="Ex: Contrato de Prestação de Serviços"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-border-default bg-background-primary px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus-visible:border-brand-primary focus-visible:bg-background-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary transition-all"
            />
          </div>

          {/* Descrição */}
          <div>
            <label htmlFor="upload-doc-desc" className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">
              Descrição (Opcional)
            </label>
            <textarea
              id="upload-doc-desc"
              rows={3}
              placeholder="Descreva brevemente os detalhes deste documento..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-border-default bg-background-primary px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus-visible:border-brand-primary focus-visible:bg-background-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary transition-all resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              variant="outline"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !file || !name.trim()}
              isLoading={isLoading}
            >
              Salvar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
