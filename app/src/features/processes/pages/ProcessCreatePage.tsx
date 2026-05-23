"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useProcesses } from '../hooks/useProcesses';
import { ProcessForm } from '../components/ProcessForm';
import { Process } from '@/interfaces/process.interface';

export const ProcessCreatePage: React.FC = () => {
  const router = useRouter();
  const { createProcess, loading, error } = useProcesses();

  const handleSubmit = async (data: Partial<Process>) => {
    const res = await createProcess(data);
    if (res) {
      router.push('/processes');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/processes')}
              className="text-slate-400 hover:text-slate-600 transition-colors mr-2"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <span className="font-extrabold text-slate-800 tracking-tight text-lg">
              Novo <span className="text-blue-600 font-medium">Processo</span>
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Abertura de Processo</h1>
          <p className="text-slate-500 text-sm mt-1">
            Preencha as informações para associar um estabelecimento e múltiplos clientes a um novo processo.
          </p>
        </div>

        <ProcessForm
          onSubmit={handleSubmit}
          isLoading={loading}
          onCancel={() => router.push('/processes')}
          errorMessage={error}
        />
      </main>
    </div>
  );
};
