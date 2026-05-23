"use client";

import React, { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useProcesses } from '../hooks/useProcesses';
import { ProcessForm } from '../components/ProcessForm';
import { Process } from '@/interfaces/process.interface';

export const ProcessEditPage: React.FC = () => {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const { fetchProcessByID, updateProcess, process, loading, error } = useProcesses();

  useEffect(() => {
    if (id) {
      fetchProcessByID(id);
    }
  }, [id, fetchProcessByID]);

  const handleSubmit = async (data: Partial<Process>) => {
    const res = await updateProcess(id, data);
    if (res) {
      router.push('/processes');
    }
  };

  return (
    <div className="min-h-screen bg-background-primary flex flex-col">
      <header className="bg-background-surface border-b border-border-default shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/processes')}
              className="text-text-muted hover:text-text-primary transition-colors mr-2"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <span className="font-bold text-text-primary tracking-tight text-lg">
              Editar <span className="text-action-primary font-medium">Processo</span>
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">Edição de Processo</h1>
          <p className="text-text-secondary text-sm mt-1">
            Modifique as informações associadas a este processo.
          </p>
        </div>

        {loading && !process ? (
          <div className="flex flex-col items-center justify-center py-20 bg-background-surface border border-border-default rounded-xl shadow-sm">
            <div className="h-10 w-10 border-4 border-border-default border-t-action-primary rounded-full animate-spin"></div>
            <p className="text-text-muted text-sm font-medium mt-4 animate-pulse">Carregando dados do processo...</p>
          </div>
        ) : (
          <ProcessForm
            initialData={process}
            onSubmit={handleSubmit}
            isLoading={loading}
            onCancel={() => router.push('/processes')}
            errorMessage={error}
          />
        )}
      </main>
    </div>
  );
};
