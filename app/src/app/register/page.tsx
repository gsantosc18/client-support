"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Input } from '@/components/forms/Input';
import { Button } from '@/components/forms/Button';
import { authService } from '@/services/auth.service';

function RegisterForm() {
  const searchParams = useSearchParams();
  const invitationToken = searchParams.get('invitation_token') || searchParams.get('invitationToken') || '';

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    birth_date: '',
    password: '',
    password_confirm: '',
    terms_accepted: false,
    company_id: process.env.NEXT_PUBLIC_COMPANY_ID || '11111111-1111-1111-1111-111111111111',
    access_code: '',
    invitation_token: '',
  });

  const [checkingInvitation, setCheckingInvitation] = useState(false);
  const [invitationError, setInvitationError] = useState<string | null>(null);

  useEffect(() => {
    if (invitationToken) {
      setCheckingInvitation(true);
      setInvitationError(null);
      authService.validateInvitation(invitationToken)
        .then((res: any) => {
          setFormData((prev) => ({
            ...prev,
            email: res.email,
            company_id: res.company_id || prev.company_id,
            invitation_token: invitationToken,
          }));
        })
        .catch((err: any) => {
          setInvitationError(err.response?.data?.error || 'Convite inválido, expirado ou já utilizado');
        })
        .finally(() => {
          setCheckingInvitation(false);
        });
    }
  }, [invitationToken]);

  const { handleRegister, loading, error } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Converter data para o formato aceito pelo backend (RFC3339 ou iso)
    const payload = {
      ...formData,
      birth_date: formData.birth_date ? new Date(formData.birth_date).toISOString() : '',
    };
    const success = await handleRegister(payload);
    if (success) {
      router.push('/login?registered=true');
    }
  };

  if (checkingInvitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-primary py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl w-full space-y-8 bg-background-surface p-8 rounded-xl shadow-sm border border-border-default text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-action-primary mx-auto"></div>
          <p className="mt-4 text-text-secondary">Validando convite...</p>
        </div>
      </div>
    );
  }

  if (invitationError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-primary py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl w-full space-y-8 bg-background-surface p-8 rounded-xl shadow-sm border border-border-default text-center">
          <div className="text-destructive text-red-600 font-medium text-lg mb-4">
            ⚠️ {invitationError}
          </div>
          <p className="text-text-secondary text-sm mb-6">
            Este link de convite pode ter expirado ou já ter sido usado para cadastrar um usuário.
          </p>
          <Link href="/login" className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-action-primary hover:bg-action-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-focus-ring">
            Voltar para o Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-primary py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full space-y-8 bg-background-surface p-8 rounded-xl shadow-sm border border-border-default">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-text-primary">
            Crie sua conta
          </h2>
          {invitationToken && (
            <p className="mt-2 text-center text-sm text-green-600 font-medium">
              Convite verificado com sucesso!
            </p>
          )}
        </div>
        <form className="mt-8 space-y-6" onSubmit={onSubmit} method="post">
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-red-600 text-sm font-medium border border-destructive/20">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            <Input label="Nome" name="first_name" required value={formData.first_name} onChange={handleChange} />
            <Input label="Sobrenome" name="last_name" required value={formData.last_name} onChange={handleChange} />
            
            <div className="sm:col-span-2">
              <Input 
                label="E-mail" 
                name="email" 
                type="email" 
                required 
                value={formData.email} 
                onChange={handleChange} 
                disabled={!!invitationToken}
                className={invitationToken ? "bg-background-muted opacity-80 cursor-not-allowed" : ""}
              />
            </div>

            <Input label="Telefone (opcional)" name="phone" type="tel" value={formData.phone} onChange={handleChange} />
            <Input label="Data de nascimento" name="birth_date" type="date" required value={formData.birth_date} onChange={handleChange} />

            {!invitationToken && (
              <div className="sm:col-span-2">
                <Input 
                  label="Código de Acesso" 
                  name="access_code" 
                  required 
                  value={formData.access_code} 
                  onChange={handleChange} 
                  placeholder="Digite o código de acesso para cadastro"
                />
              </div>
            )}

            <div className="sm:col-span-2">
              <Input label="Senha" name="password" type="password" required value={formData.password} onChange={handleChange} />
              <p className="mt-1 text-xs text-text-muted">
                Mínimo de 8 caracteres, 1 número, 1 símbolo, 1 letra maiúscula e 1 minúscula. Não pode conter sequências (ex: 123, abc).
              </p>
            </div>

            <div className="sm:col-span-2">
              <Input label="Confirme a Senha" name="password_confirm" type="password" required value={formData.password_confirm} onChange={handleChange} />
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="terms_accepted"
              name="terms_accepted"
              type="checkbox"
              required
              checked={formData.terms_accepted}
              onChange={handleChange}
              className="h-4 w-4 text-action-primary focus-visible:ring-focus-ring border-border-default rounded"
            />
            <label htmlFor="terms_accepted" className="ml-2 block text-sm text-text-secondary">
              Aceito os termos de uso
            </label>
          </div>

          <div>
            <Button type="submit" className="w-full" isLoading={loading}>
              Cadastrar
            </Button>
          </div>
          
          <div className="text-center text-sm">
            <span className="text-text-secondary">Já tem uma conta? </span>
            <Link href="/login" className="font-semibold text-action-primary hover:text-action-hover transition-colors">
              Faça login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
