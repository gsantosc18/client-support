"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { authService } from '@/services/auth.service';
import { Input } from '@/components/forms/Input';
import { Button } from '@/components/forms/Button';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authService.recoverPassword({ email, company_id: '11111111-1111-1111-1111-111111111111' });
      setMessage(response.message);
    } catch (err) {
      setMessage("Ocorreu um erro inesperado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-primary py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-background-surface p-8 rounded-xl shadow-sm border border-border-default">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-text-primary">
            Recuperar Senha
          </h2>
          <p className="mt-2 text-center text-sm text-text-secondary">
            Informe seu e-mail para receber as instruções de recuperação.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={onSubmit} method="post">
          {message && (
            <div className="p-4 rounded-lg bg-success/10 text-success text-green-700 text-sm font-medium border border-success/20">
              {message}
            </div>
          )}
          
          {!message && (
            <>
              <div className="space-y-4">
                <Input 
                  label="E-mail"
                  id="email" 
                  name="email" 
                  type="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com" 
                />
              </div>

              <div>
                <Button type="submit" className="w-full" isLoading={loading}>
                  Enviar link de recuperação
                </Button>
              </div>
            </>
          )}
          
          <div className="text-center text-sm">
            <Link href="/login" className="font-semibold text-action-primary hover:text-action-hover transition-colors">
              Voltar para o login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
