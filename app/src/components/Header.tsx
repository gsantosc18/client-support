"use client";

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useCompany } from '@/features/company/hooks/useCompany';

export const Header: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { handleLogout } = useAuth();
  const { companyName, loading } = useCompany();

  const isClientsActive = pathname.startsWith('/clients');
  const isProcessesActive = pathname.startsWith('/processes');

  const displayCompany = companyName || 'SuporteCliente';
  const firstLetter = displayCompany.charAt(0).toUpperCase();

  const renderLogoText = () => {
    if (loading && !companyName) {
      return (
        <span className="font-bold text-text-primary tracking-tight text-lg animate-pulse bg-background-muted rounded h-6 w-32 inline-block" />
      );
    }

    if (displayCompany === 'SuporteCliente') {
      return (
        <span className="font-bold text-text-primary tracking-tight text-lg">
          Suporte<span className="text-action-primary font-medium">Cliente</span>
        </span>
      );
    }

    const words = displayCompany.split(' ');
    if (words.length > 1) {
      const lastWord = words.pop();
      const firstPart = words.join(' ');
      return (
        <span className="font-bold text-text-primary tracking-tight text-lg">
          {firstPart} <span className="text-action-primary font-medium">{lastWord}</span>
        </span>
      );
    }

    return (
      <span className="font-bold text-text-primary tracking-tight text-lg">
        {displayCompany}
      </span>
    );
  };

  return (
    <header className="bg-background-surface border-b border-border-default shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-action-primary flex items-center justify-center text-text-primary font-bold text-lg shadow-sm">
              {loading && !companyName ? (
                <div className="h-4 w-4 border-2 border-border-default border-t-text-primary rounded-full animate-spin" />
              ) : (
                firstLetter
              )}
            </div>
            {renderLogoText()}
          </div>

          <nav className="flex items-center gap-4 border-l border-border-default pl-6">
            <button
              onClick={() => router.push('/clients')}
              className={`text-sm font-semibold transition-colors ${
                isClientsActive
                  ? 'text-action-primary font-bold'
                  : 'text-text-secondary hover:text-action-primary font-medium'
              }`}
            >
              Clientes
            </button>
            <button
              onClick={() => router.push('/processes')}
              className={`text-sm font-semibold transition-colors ${
                isProcessesActive
                  ? 'text-action-primary font-bold'
                  : 'text-text-secondary hover:text-action-primary font-medium'
              }`}
            >
              Processos
            </button>
            <button
              onClick={() => router.push('/operators')}
              className={`text-sm font-semibold transition-colors ${
                pathname.startsWith('/operators')
                  ? 'text-action-primary font-bold'
                  : 'text-text-secondary hover:text-action-primary font-medium'
              }`}
            >
              Operadores
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => handleLogout()}
            aria-label="Sair do sistema"
            className="flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-destructive transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sair
          </button>
        </div>
      </div>
    </header>
  );
};
