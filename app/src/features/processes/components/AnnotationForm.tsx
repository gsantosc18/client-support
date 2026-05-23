import React, { useState } from 'react';
import { Button } from '@/components/forms/Button';

interface AnnotationFormProps {
  onSubmit: (text: string, visibility: 'PUBLIC' | 'PRIVATE') => Promise<boolean>;
  isLoading: boolean;
}

export const AnnotationForm: React.FC<AnnotationFormProps> = ({ onSubmit, isLoading }) => {
  const [text, setText] = useState('');
  const [visibility, setVisibility] = useState<'PUBLIC' | 'PRIVATE'>('PUBLIC');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const success = await onSubmit(text.trim(), visibility);
    if (success) {
      setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
      <div>
        <label htmlFor="annotation-text" className="block text-sm font-bold text-slate-800 mb-1.5">
          Nova Anotação de Acompanhamento
        </label>
        <textarea
          id="annotation-text"
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 2000))}
          placeholder="Escreva detalhes ou observações sobre o andamento deste processo..."
          className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all resize-none"
          required
        />
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-slate-400">
            Anotações privadas são marcadas internamente, mas visíveis para a equipe.
          </span>
          <span className={`text-xs font-semibold ${text.length >= 1900 ? 'text-amber-600' : 'text-slate-400'}`}>
            {text.length} / 2000
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-2">
        <div className="flex items-center gap-2">
          <label htmlFor="annotation-visibility" className="text-xs font-bold text-slate-600 select-none">
            Visibilidade:
          </label>
          <select
            id="annotation-visibility"
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as 'PUBLIC' | 'PRIVATE')}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
          >
            <option value="PUBLIC">🌍 Pública (Geral)</option>
            <option value="PRIVATE">🔒 Privada (Interna)</option>
          </select>
        </div>

        <Button
          type="submit"
          disabled={isLoading || !text.trim()}
          isLoading={isLoading}
          className="bg-blue-600 hover:bg-blue-750 text-white font-semibold text-xs px-5 py-2.5 rounded-lg shadow-sm transition-all"
        >
          Adicionar Anotação
        </Button>
      </div>
    </form>
  );
};
