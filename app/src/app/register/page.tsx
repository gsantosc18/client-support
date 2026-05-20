"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Input } from '@/components/forms/Input';
import { Button } from '@/components/forms/Button';

export default function RegisterPage() {
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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-slate-100">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
            Crie sua conta
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={onSubmit}>
          {error && (
            <div className="p-3 rounded-md bg-red-50 text-red-600 text-sm font-medium border border-red-200">
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
              <p className="mt-1 text-xs text-slate-500">
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
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="terms_accepted" className="ml-2 block text-sm text-gray-900">
              Aceito os termos de uso
            </label>
          </div>

          <div>
            <Button type="submit" className="w-full" isLoading={loading}>
              Cadastrar
            </Button>
          </div>
          
          <div className="text-center text-sm">
            <span className="text-gray-600">Já tem uma conta? </span>
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Faça login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
