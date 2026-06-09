"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Input } from '@/components/forms/Input';
import { Button } from '@/components/forms/Button';

function RegisterForm() {
  const searchParams = useSearchParams();
  const urlCompanyId = searchParams.get('company_id') || searchParams.get('companyId');

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    birth_date: '',
    password: '',
    password_confirm: '',
    terms_accepted: false,
    company_id: '11111111-1111-1111-1111-111111111111', // Default for test
  });

  useEffect(() => {
    if (urlCompanyId) {
      setFormData((prev) => ({
        ...prev,
        company_id: urlCompanyId,
      }));
    }
  }, [urlCompanyId]);

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-primary py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full space-y-8 bg-background-surface p-8 rounded-xl shadow-sm border border-border-default">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-text-primary">
            Crie sua conta
          </h2>
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
              <Input label="E-mail" name="email" type="email" required value={formData.email} onChange={handleChange} />
            </div>

            <Input label="Telefone (opcional)" name="phone" type="tel" value={formData.phone} onChange={handleChange} />
            <Input label="Data de nascimento" name="birth_date" type="date" required value={formData.birth_date} onChange={handleChange} />

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
