"use client";

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/state/authStore';
import { Header } from '@/components/Header';
import { Button } from '@/components/forms/Button';
import { Input } from '@/components/forms/Input';
import { userService } from '@/features/processes/services/user.service';
import { authService } from '@/services/auth.service';
import { User } from '@/interfaces/user.interface';

// Helper function to decode JWT payload safely
function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

function OperatorsContent() {
  const router = useRouter();
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [errorUsers, setErrorUsers] = useState<string | null>(null);

  // Invite section state
  const [inviteEmail, setInviteEmail] = useState('');
  const [loadingInvite, setLoadingInvite] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Fetch users on mount if authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    setLoadingUsers(true);
    setErrorUsers(null);
    userService.list()
      .then((data) => {
        setUsers(data);
      })
      .catch((err) => {
        setErrorUsers(err?.response?.data?.error || err?.message || 'Erro ao carregar operadores');
      })
      .finally(() => {
        setLoadingUsers(false);
      });
  }, [isAuthenticated, router]);

  // Determine current user and admin status
  const currentUserInfo = useMemo(() => {
    if (!accessToken) return null;
    const decoded = parseJwt(accessToken);
    if (!decoded || !decoded.user_id) return null;
    
    const matchedUser = users.find(u => u.id === decoded.user_id);
    return {
      userId: decoded.user_id,
      isAdmin: matchedUser ? !!matchedUser.admin : false,
      user: matchedUser || null
    };
  }, [accessToken, users]);

  const handleGenerateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    setLoadingInvite(true);
    setInviteError(null);
    setInviteSuccess(null);
    setCopied(false);

    try {
      const res = await authService.createInvitation(inviteEmail);
      // Construct the invitation link
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const link = `${origin}/register?invitation_token=${res.Token}`;
      setInviteSuccess(link);
      setInviteEmail('');
    } catch (err: any) {
      setInviteError(err?.response?.data?.error || 'Erro ao gerar convite.');
    } finally {
      setLoadingInvite(false);
    }
  };

  const handleCopy = () => {
    if (!inviteSuccess) return;
    navigator.clipboard.writeText(inviteSuccess);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="min-h-screen bg-background-primary flex flex-col">
      <Header />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">Operadores</h1>
          <p className="text-text-secondary text-sm mt-1">
            Lista de operadores registrados e gerenciamento de convites de acesso.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left / Middle: Operators List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-background-surface border border-border-default rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-border-default">
                <h2 className="text-lg font-semibold text-text-primary">Membros da Equipe</h2>
              </div>

              {loadingUsers && users.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="h-8 w-8 border-4 border-border-default border-t-action-primary rounded-full animate-spin"></div>
                  <p className="text-text-muted text-sm mt-3">Buscando operadores...</p>
                </div>
              ) : errorUsers ? (
                <div className="p-6 text-destructive text-red-600 text-sm font-medium text-center">
                  {errorUsers}
                </div>
              ) : (
                <div className="divide-y divide-border-muted">
                  {users.map((user) => {
                    const isSelf = currentUserInfo?.userId === user.id;
                    return (
                      <div key={user.id} className="px-6 py-4 flex items-center justify-between hover:bg-background-muted/20 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-action-primary/10 flex items-center justify-center text-action-primary font-bold">
                            {user.first_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-text-primary flex items-center gap-2">
                              {user.first_name} {user.last_name}
                              {isSelf && (
                                <span className="px-1.5 py-0.5 bg-action-primary/10 text-action-primary text-[10px] font-bold rounded-full">
                                  Você
                                </span>
                              )}
                              {user.admin && (
                                <span className="px-1.5 py-0.5 bg-warning/10 text-warning text-[10px] font-bold rounded-full">
                                  Admin
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-text-secondary">{user.email}</div>
                          </div>
                        </div>
                        <div className="text-xs text-text-muted">
                          {user.admin ? 'Administrador' : 'Operador'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right: Invitation management form (Only for admin) */}
          <div className="space-y-6">
            {currentUserInfo?.isAdmin ? (
              <div className="bg-background-surface border border-border-default rounded-xl shadow-sm p-6 space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-text-primary">Gerenciar Convites</h2>
                  <p className="text-xs text-text-secondary mt-1">
                    Crie um link exclusivo de cadastro para novos operadores. O link expira em 24h e é de uso único.
                  </p>
                </div>

                <form onSubmit={handleGenerateInvite} className="space-y-4">
                  {inviteError && (
                    <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-red-600 text-xs font-medium border border-destructive/20">
                      {inviteError}
                    </div>
                  )}

                  <Input
                    label="E-mail do Convidado"
                    id="invite-email"
                    type="email"
                    required
                    placeholder="email@novo-operador.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    disabled={loadingInvite}
                  />

                  <Button
                    type="submit"
                    className="w-full flex justify-center items-center gap-1.5 text-sm font-semibold"
                    isLoading={loadingInvite}
                    disabled={loadingInvite || !inviteEmail}
                  >
                    Gerar Convite
                  </Button>
                </form>

                {inviteSuccess && (
                  <div className="mt-4 pt-4 border-t border-border-default space-y-2">
                    <span className="text-xs font-semibold text-text-secondary block">Link de Convite Gerado:</span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={inviteSuccess}
                        className="flex-grow text-xs bg-background-muted text-text-primary px-3 py-2 rounded-lg border border-border-default outline-none select-all"
                      />
                      <Button
                        onClick={handleCopy}
                        variant={copied ? 'outline' : 'primary'}
                        className={`text-xs px-3 py-2 shrink-0 ${
                          copied ? 'border-success text-green-700 bg-success/10' : ''
                        }`}
                      >
                        {copied ? 'Copiado!' : 'Copiar'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-background-surface border border-border-default rounded-xl shadow-sm p-6 text-center">
                <span className="text-2xl">🔒</span>
                <h3 className="text-sm font-semibold text-text-primary mt-2">Área de Admin Reservada</h3>
                <p className="text-xs text-text-secondary mt-1">
                  Apenas usuários administradores podem gerar links de convite para cadastrar novos operadores.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function OperatorsPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <OperatorsContent />
    </Suspense>
  );
}
