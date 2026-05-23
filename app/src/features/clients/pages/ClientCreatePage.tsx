"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useClients } from '../hooks/useClients';
import { ClientForm } from '../components/ClientForm';
import { Client } from '@/interfaces/client.interface';

export const ClientCreatePage: React.FC = () => {
  const router = useRouter();
  const { createClient, loading, error } = useClients();

  const handleSubmit = async (data: Client) => {
    const success = await createClient(data);
    if (success) {
      router.push('/clients');
    }
  };

  return (
    <div className="min-h-screen bg-background-primary py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.push('/clients')}
          className="flex items-center gap-1.5 text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors mb-6"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Voltar para Clientes
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">Novo Cliente</h1>
          <p className="text-text-secondary text-sm mt-1">Preencha as informações do cliente para cadastrá-lo na empresa.</p>
        </div>

        <ClientForm
          onSubmit={handleSubmit}
          isLoading={loading}
          onCancel={() => router.push('/clients')}
          errorMessage={error}
        />
      </div>
    </div>
  );
};
