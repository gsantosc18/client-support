"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Input } from '@/components/forms/Input';
import { Button } from '@/components/forms/Button';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keepMeLoggedIn, setKeepMeLoggedIn] = useState(false);
  
  const { handleLogin, loading, error } = useAuth();
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await handleLogin({ email, password, keep_me_logged_in: keepMeLoggedIn });
    if (success) {
      router.push('/clients');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-primary py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-background-surface p-8 rounded-xl shadow-sm border border-border-default">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-text-primary">
            Acesse sua conta
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={onSubmit} method="post">
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-red-600 text-sm font-medium border border-destructive/20">
              {error}
            </div>
          )}
          
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
            <Input 
              label="Senha"
              id="password" 
              name="password" 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={keepMeLoggedIn}
                onChange={(e) => setKeepMeLoggedIn(e.target.checked)}
                className="h-4 w-4 text-action-primary focus-visible:ring-focus-ring border-border-default rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-text-secondary">
                Manter-me logado
              </label>
            </div>

            <div className="text-sm">
              <Link href="/forgot-password" className="font-semibold text-action-primary hover:text-action-hover transition-colors">
                Esqueci minha senha
              </Link>
            </div>
          </div>

          <div>
            <Button type="submit" className="w-full" isLoading={loading}>
              Entrar
            </Button>
          </div>
          
          <div className="text-center text-sm">
            <span className="text-text-secondary">Não tem uma conta? </span>
            <Link href="/register" className="font-semibold text-action-primary hover:text-action-hover transition-colors">
              Cadastre-se
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
