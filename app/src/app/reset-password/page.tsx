"use client";

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { Input } from '@/components/forms/Input';
import { Button } from '@/components/forms/Button';

function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("Token inválido.");
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      await authService.resetPassword({ token, password, password_confirm: passwordConfirm });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || "Ocorreu um erro ao redefinir a senha.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-slate-100">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
            Nova Senha
          </h2>
        </div>
        
        {success ? (
          <div className="mt-8 space-y-6">
            <div className="p-4 rounded-md bg-green-50 text-green-700 text-sm font-medium border border-green-200">
              Senha redefinida com sucesso!
            </div>
            <div className="text-center text-sm">
              <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Fazer login agora
              </Link>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={onSubmit} method="post">
            {error && (
              <div className="p-3 rounded-md bg-red-50 text-red-600 text-sm font-medium border border-red-200">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <Input 
                label="Nova Senha"
                name="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Input 
                label="Confirme a Nova Senha"
                name="password_confirm" 
                type="password" 
                required 
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
              />
            </div>

            <div>
              <Button type="submit" className="w-full" isLoading={loading}>
                Redefinir senha
              </Button>
            </div>
            
            <div className="text-center text-sm">
              <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Voltar para o login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
