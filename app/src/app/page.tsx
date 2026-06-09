"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/state/authStore";
import {
  Users,
  Briefcase,
  Shield,
  Cpu,
  ArrowRight,
  CheckCircle2,
  Lock,
  Clock,
  Plus,
  Search,
  ChevronRight,
  Sparkles
} from "lucide-react";

export default function Home() {
  const router = useRouter();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration flicker of authentication state
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleHeroCTA = () => {
    if (isAuthenticated) {
      router.push("/clients");
    } else {
      router.push("/register");
    }
  };

  return (
    <>
      <title>SuporteCliente | Gestão Inteligente de Clientes e Processos</title>
      <meta
        name="description"
        content="Otimize o controle de seus processos internos, anotações de progresso e cadastros de clientes com uma interface premium e extremamente veloz."
      />

      <main className="min-h-screen bg-background-primary flex flex-col selection:bg-action-primary/30 selection:text-text-primary overflow-x-hidden">
        {/* PUBLIC HEADER */}
        <header className="sticky top-0 z-50 bg-background-surface/85 backdrop-blur-md border-b border-border-default/80 transition-all duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-brand-cyan to-brand-vibrant flex items-center justify-center text-text-primary font-bold text-lg shadow-md shadow-brand-cyan/20 animate-pulse">
                S
              </div>
              <span className="font-bold text-text-primary tracking-tight text-lg">
                Suporte<span className="text-action-primary font-medium">Cliente</span>
              </span>
            </div>

            {/* Navigation / Actions */}
            <nav className="flex items-center gap-4">
              {mounted && (
                <>
                  {isAuthenticated ? (
                    <button
                      id="nav-dashboard-btn"
                      onClick={() => router.push("/clients")}
                      className="inline-flex justify-center items-center gap-1.5 px-4 py-2 border border-transparent text-sm font-semibold rounded-lg text-text-primary bg-action-primary hover:bg-action-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow shadow-action-primary/10"
                    >
                      Ir para o Painel
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <>
                      <Link
                        id="nav-login-btn"
                        href="/login"
                        className="inline-flex justify-center items-center px-4 py-2 border border-border-default text-sm font-semibold rounded-lg text-text-secondary bg-background-surface hover:bg-background-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring transition-colors duration-200"
                      >
                        Entrar
                      </Link>
                      <Link
                        id="nav-register-btn"
                        href="/register"
                        className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-lg text-text-primary bg-action-primary hover:bg-action-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 transition-all duration-200 shadow-sm shadow-action-primary/10"
                      >
                        Criar Conta
                      </Link>
                    </>
                  )}
                </>
              )}
            </nav>
          </div>
        </header>

        {/* HERO SECTION */}
        <section className="relative pt-16 pb-20 lg:pt-24 lg:pb-28 flex-grow">
          {/* Subtle Ambient Background Gradients */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] overflow-hidden pointer-events-none z-0">
            <div className="absolute -top-40 left-10 w-96 h-96 bg-brand-cyan/10 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute top-20 right-10 w-96 h-96 bg-brand-vibrant/10 rounded-full blur-[100px] animate-pulse" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              
              {/* Left Column: Headline and Call-to-actions */}
              <div className="lg:col-span-6 space-y-8 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-action-primary/10 border border-action-primary/20 text-action-primary font-bold text-xs uppercase tracking-wider mb-2">
                  <Sparkles className="h-3.5 w-3.5 animate-spin" />
                  Plataforma Unificada v2.0
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-text-primary leading-[1.15]">
                  Gerencie seus clientes e processos com{" "}
                  <span className="bg-gradient-to-r from-brand-cyan to-brand-vibrant bg-clip-text text-transparent drop-shadow-sm">
                    facilidade e segurança
                  </span>
                </h1>

                <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto lg:mx-0 font-medium">
                  Acompanhe fluxos de trabalho, anotações de progresso e informações de contato em um dashboard rápido, intuitivo e moderno.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                  <button
                    id="hero-cta-primary"
                    onClick={handleHeroCTA}
                    className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-8 py-4 border border-transparent text-base font-bold rounded-xl text-text-primary bg-action-primary hover:bg-action-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 transition-all duration-200 shadow-lg shadow-action-primary/20 hover:scale-[1.02]"
                  >
                    {mounted && isAuthenticated ? "Ir para o Painel" : "Iniciar Agora Grátis"}
                    <ArrowRight className="h-5 w-5" />
                  </button>
                  <a
                    id="hero-cta-secondary"
                    href="#features"
                    className="w-full sm:w-auto inline-flex justify-center items-center px-8 py-4 border border-border-default text-base font-bold rounded-xl text-text-secondary bg-background-surface hover:bg-background-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring transition-all duration-200"
                  >
                    Conhecer Recursos
                  </a>
                </div>
              </div>

              {/* Right Column: Premium CSS Dashboard Mockup */}
              <div className="lg:col-span-6 flex justify-center">
                <div className="relative w-full max-w-lg aspect-[4/3] rounded-2xl bg-gradient-to-tr from-border-default to-border-default/40 p-2 shadow-2xl shadow-text-primary/10 border border-border-default/60 group">
                  {/* Outer Panel */}
                  <div className="w-full h-full rounded-xl bg-background-surface overflow-hidden flex flex-col text-[11px] font-sans border border-border-default/40">
                    
                    {/* Mockup Header */}
                    <div className="h-10 bg-background-muted/70 border-b border-border-default flex items-center justify-between px-3">
                      <div className="flex items-center gap-2">
                        {/* Windows-like circles */}
                        <div className="flex gap-1">
                          <div className="w-2.5 h-2.5 rounded-full bg-destructive/80" />
                          <div className="w-2.5 h-2.5 rounded-full bg-warning/80" />
                          <div className="w-2.5 h-2.5 rounded-full bg-success/80" />
                        </div>
                        <span className="font-semibold text-text-muted select-none ml-2">painel.suportecliente.com</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-5 rounded bg-background-surface border border-border-default flex items-center px-1.5 gap-1 text-text-muted">
                          <Search className="h-3 w-3" />
                          <span>Buscar...</span>
                        </div>
                        <div className="w-5 h-5 rounded-full bg-action-primary/20 flex items-center justify-center text-[9px] font-bold text-action-primary">
                          GC
                        </div>
                      </div>
                    </div>

                    {/* Mockup Main Layout */}
                    <div className="flex flex-grow overflow-hidden">
                      
                      {/* Sidebar */}
                      <div className="w-16 bg-background-muted/40 border-r border-border-default flex flex-col items-center py-3 gap-3">
                        <div className="w-8 h-8 rounded-lg bg-action-primary/10 flex items-center justify-center text-action-primary shadow-sm">
                          <Cpu className="h-4 w-4" />
                        </div>
                        <div className="w-8 h-8 rounded-lg hover:bg-background-muted flex items-center justify-center text-text-muted transition-colors cursor-pointer">
                          <Users className="h-4 w-4" />
                        </div>
                        <div className="w-8 h-8 rounded-lg hover:bg-background-muted flex items-center justify-center text-text-muted transition-colors cursor-pointer">
                          <Briefcase className="h-4 w-4" />
                        </div>
                        <div className="w-8 h-8 rounded-lg hover:bg-background-muted flex items-center justify-center text-text-muted transition-colors cursor-pointer mt-auto">
                          <Shield className="h-4 w-4" />
                        </div>
                      </div>

                      {/* Content Area */}
                      <div className="flex-grow p-4 flex flex-col gap-3 overflow-hidden bg-background-primary/35">
                        <div className="flex justify-between items-center">
                          <h3 className="font-bold text-text-primary text-[13px]">Atividades & Processos</h3>
                          <button className="px-2 py-1 bg-action-primary text-text-primary rounded-md font-semibold hover:bg-action-hover transition-colors flex items-center gap-0.5">
                            <Plus className="h-3 w-3" /> Novo
                          </button>
                        </div>

                        {/* Widgets Row */}
                        <div className="grid grid-cols-3 gap-2">
                          <div className="bg-background-surface p-2 rounded-lg border border-border-default flex flex-col shadow-sm">
                            <span className="text-text-muted font-medium text-[9px]">Clientes</span>
                            <span className="text-text-primary font-bold text-[14px] mt-0.5">142</span>
                          </div>
                          <div className="bg-background-surface p-2 rounded-lg border border-border-default flex flex-col shadow-sm">
                            <span className="text-text-muted font-medium text-[9px]">Processos</span>
                            <span className="text-text-primary font-bold text-[14px] mt-0.5">38</span>
                          </div>
                          <div className="bg-background-surface p-2 rounded-lg border border-border-default flex flex-col shadow-sm">
                            <span className="text-text-muted font-medium text-[9px]">Concluídos</span>
                            <span className="text-success font-bold text-[14px] mt-0.5">92%</span>
                          </div>
                        </div>

                        {/* Table / Process List Sim */}
                        <div className="flex-grow bg-background-surface border border-border-default rounded-lg shadow-sm flex flex-col overflow-hidden">
                          <div className="h-6 bg-background-muted/50 border-b border-border-default flex items-center px-2 font-semibold text-text-secondary text-[9px]">
                            <span className="w-1/2">Processo</span>
                            <span className="w-1/4">Status</span>
                            <span className="w-1/4 text-right">Ação</span>
                          </div>
                          
                          <div className="flex-grow flex flex-col divide-y divide-border-muted overflow-hidden">
                            {/* Process Item 1 */}
                            <div className="h-7 flex items-center px-2 text-text-secondary hover:bg-background-muted/40 transition-colors">
                              <span className="w-1/2 font-semibold text-text-primary truncate">Revisão Tributária</span>
                              <span className="w-1/4">
                                <span className="px-1.5 py-0.5 bg-success/10 text-success rounded-full font-bold text-[8px] inline-block">Concluído</span>
                              </span>
                              <span className="w-1/4 text-right text-action-primary font-bold cursor-pointer hover:underline">Ver</span>
                            </div>

                            {/* Process Item 2 */}
                            <div className="h-7 flex items-center px-2 text-text-secondary hover:bg-background-muted/40 transition-colors">
                              <span className="w-1/2 font-semibold text-text-primary truncate">Abertura de Filial</span>
                              <span className="w-1/4">
                                <span className="px-1.5 py-0.5 bg-action-primary/10 text-action-primary rounded-full font-bold text-[8px] inline-block animate-pulse">Andamento</span>
                              </span>
                              <span className="w-1/4 text-right text-action-primary font-bold cursor-pointer hover:underline">Ver</span>
                            </div>

                            {/* Process Item 3 */}
                            <div className="h-7 flex items-center px-2 text-text-secondary hover:bg-background-muted/40 transition-colors">
                              <span className="w-1/2 font-semibold text-text-primary truncate">Contrato Social</span>
                              <span className="w-1/4">
                                <span className="px-1.5 py-0.5 bg-warning/10 text-warning rounded-full font-bold text-[8px] inline-block">Pendente</span>
                              </span>
                              <span className="w-1/4 text-right text-action-primary font-bold cursor-pointer hover:underline">Ver</span>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>

                  {/* Float Graphic Detail */}
                  <div className="absolute -bottom-6 -right-6 w-32 bg-background-surface rounded-xl p-3 border border-border-default shadow-xl flex flex-col gap-1.5 transform hover:scale-105 transition-transform duration-200 hidden sm:flex">
                    <span className="text-text-muted text-[8px] font-bold uppercase tracking-wider">Eficiência Anual</span>
                    <div className="flex items-end gap-1.5 h-10 pt-2">
                      <div className="w-3 bg-action-primary/30 h-4 rounded-t-sm" />
                      <div className="w-3 bg-action-primary/50 h-6 rounded-t-sm" />
                      <div className="w-3 bg-action-primary/70 h-8 rounded-t-sm" />
                      <div className="w-3 bg-action-primary h-10 rounded-t-sm animate-bounce" />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* FEATURES GRID SECTION */}
        <section id="features" className="py-20 bg-background-surface border-t border-border-default/50 scroll-mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <h2 className="text-3xl font-extrabold text-text-primary sm:text-4xl tracking-tight">
                Tudo o que sua equipe precisa para vencer
              </h2>
              <p className="text-lg text-text-secondary font-medium">
                Desenvolvemos recursos focados em simplificar a rotina, melhorar o controle e garantir transparência operacional.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Feature 1 */}
              <div className="bg-background-primary/30 border border-border-default rounded-2xl p-6 hover:-translate-y-1 hover:shadow-lg hover:border-action-primary/30 transition-all duration-300 group">
                <div className="h-12 w-12 rounded-xl bg-action-primary/10 text-action-primary flex items-center justify-center mb-6 group-hover:bg-action-primary group-hover:text-text-primary transition-colors duration-300 shadow-sm">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-3">Gestão de Clientes</h3>
                <p className="text-text-secondary text-sm leading-relaxed font-medium">
                  Centralize cadastros, empresas e contatos de maneira intuitiva. Encontre qualquer dado em segundos com buscas rápidas.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-background-primary/30 border border-border-default rounded-2xl p-6 hover:-translate-y-1 hover:shadow-lg hover:border-action-primary/30 transition-all duration-300 group">
                <div className="h-12 w-12 rounded-xl bg-action-primary/10 text-action-primary flex items-center justify-center mb-6 group-hover:bg-action-primary group-hover:text-text-primary transition-colors duration-300 shadow-sm">
                  <Briefcase className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-3">Acompanhamento</h3>
                <p className="text-text-secondary text-sm leading-relaxed font-medium">
                  Monitore o progresso dos processos corporativos com status reativos, anexação de notas detalhadas e histórico completo de alterações.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-background-primary/30 border border-border-default rounded-2xl p-6 hover:-translate-y-1 hover:shadow-lg hover:border-action-primary/30 transition-all duration-300 group">
                <div className="h-12 w-12 rounded-xl bg-action-primary/10 text-action-primary flex items-center justify-center mb-6 group-hover:bg-action-primary group-hover:text-text-primary transition-colors duration-300 shadow-sm">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-3">Segurança Robusta</h3>
                <p className="text-text-secondary text-sm leading-relaxed font-medium">
                  Autenticação segura via tokens JWT criptografados e proteção ativa de dados para manter as informações confidenciais sempre blindadas.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="bg-background-primary/30 border border-border-default rounded-2xl p-6 hover:-translate-y-1 hover:shadow-lg hover:border-action-primary/30 transition-all duration-300 group">
                <div className="h-12 w-12 rounded-xl bg-action-primary/10 text-action-primary flex items-center justify-center mb-6 group-hover:bg-action-primary group-hover:text-text-primary transition-colors duration-300 shadow-sm">
                  <Cpu className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-3">Desempenho Extremo</h3>
                <p className="text-text-secondary text-sm leading-relaxed font-medium">
                  Utiliza arquitetura otimizada em Next.js no frontend e Golang no backend para transições instantâneas e carregamentos ágeis.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* STATS SECTION */}
        <section className="py-20 bg-background-primary relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-brand-cyan/5 rounded-full blur-[80px]" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="bg-gradient-to-tr from-border-default to-border-default/20 rounded-3xl p-8 sm:p-12 border border-border-default/60 shadow-inner">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
                <div className="space-y-2">
                  <div className="text-3xl sm:text-4xl font-extrabold text-text-primary">+10k</div>
                  <div className="text-xs sm:text-sm text-text-muted font-bold uppercase tracking-wider">Processos Ativos</div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl sm:text-4xl font-extrabold text-text-primary">99.9%</div>
                  <div className="text-xs sm:text-sm text-text-muted font-bold uppercase tracking-wider">Garantia de Uptime</div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl sm:text-4xl font-extrabold text-text-primary">&lt; 1.2s</div>
                  <div className="text-xs sm:text-sm text-text-muted font-bold uppercase tracking-wider">Latência de Resposta</div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl sm:text-4xl font-extrabold text-text-primary">100%</div>
                  <div className="text-xs sm:text-sm text-text-muted font-bold uppercase tracking-wider">Conformidade LGPD</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA FOOTER AD */}
        <section className="py-16 bg-gradient-to-tr from-text-primary to-text-primary/95 text-background-surface text-center px-4 relative">
          <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-3xl font-extrabold sm:text-4xl">Pronto para transformar sua gestão?</h2>
            <p className="text-text-muted max-w-xl mx-auto text-base">
              Junte-se a centenas de empresas que já otimizaram seus fluxos e simplificaram o suporte aos seus clientes.
            </p>
            <div>
              <button
                id="footer-cta-primary"
                onClick={handleHeroCTA}
                className="inline-flex justify-center items-center gap-2 px-8 py-4 border border-transparent text-base font-bold rounded-xl text-text-primary bg-action-primary hover:bg-action-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 transition-all duration-200 shadow-lg shadow-action-primary/20 hover:scale-[1.02]"
              >
                {mounted && isAuthenticated ? "Ir para o Painel" : "Criar Minha Conta Grátis"}
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="bg-background-surface border-t border-border-default py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-lg bg-action-primary flex items-center justify-center text-text-primary font-bold text-sm">
                S
              </div>
              <span className="font-semibold text-text-primary text-sm tracking-tight">
                SuporteCliente
              </span>
            </div>
            <p className="text-xs text-text-muted font-medium">
              &copy; {new Date().getFullYear()} SuporteCliente. Todos os direitos reservados.
            </p>
            <div className="flex gap-4 text-xs font-semibold text-text-secondary">
              <a href="#" className="hover:text-action-primary transition-colors">Termos</a>
              <a href="#" className="hover:text-action-primary transition-colors">Privacidade</a>
              <a href="#" className="hover:text-action-primary transition-colors">Contato</a>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
