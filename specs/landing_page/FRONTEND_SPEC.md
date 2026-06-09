# Frontend Specification: Landing Page

Este documento especifica os aspectos visuais, design system, componentes, estados de interface e acessibilidade da nova landing page.

---

## 1. Design System e Identidade Visual

A landing page utilizará o sistema de design estabelecido em `globals.css` com foco em uma estética premium e moderna.

### Paleta de Cores Aplicada

* **Fundo Principal**: `bg-background-primary` (`#f8fafc`) com áreas de destaque usando fundos escuros e gradientes `from-brand-cyan to-brand-vibrant`.
* **Superfícies (Cards)**: `bg-background-surface` (`#ffffff`) com bordas suaves `border-border-default` (`#e2e8f0`).
* **Textos**: `text-text-primary` (`#0f172a`) e `text-text-secondary` (`#475569`).
* **Destaques & Ações**: `text-action-primary` (`#1ec3ea`) e gradientes de marca.

---

## 2. Layout da Página e Componentes

### 2.1 Cabeçalho Público (Header)

* **Seção Fica no Topo**: `sticky top-0 z-50 bg-background-surface/80 backdrop-blur-md border-b border-border-default`.
* **Identidade**: Logotipo com ícone de avatar e nome "SuporteCliente".
* **Ações**:
  * Se `isAuthenticated === false`: Botão "Entrar" (Estilo: Outline) e Botão "Cadastrar" (Estilo: Primary).
  * Se `isAuthenticated === true`: Botão "Ir para o Painel" (Estilo: Primary).

### 2.2 Seção Hero (Destaque Principal)

* **Título (H1)**: "Gerencie seus clientes e processos com facilidade e segurança."
* **Subtítulo**: "Uma plataforma completa para escritórios de suporte, advocacia e atendimento ao cliente controlarem fluxos, prazos e históricos de forma centralizada."
* **Ações**:
  * Botão Principal: "Iniciar Agora" (direciona para `/clients` se logado, ou `/register` se deslogado).
  * Botão Secundário: "Conhecer Funcionalidades" (ancora suave para a seção de features).
* **Mockup Visual Interativo (CSS Mockup)**:
  * Elemento visual imitando um dashboard de processos:
    * Uma barra lateral (sidebar) com itens ativos.
    * Gráficos simplificados em CSS com micro-animações.
    * Lista de processos com tags coloridas (Em Andamento, Concluído, Pendente).

### 2.3 Grade de Funcionalidades (Features)

* Layout de 4 colunas em telas grandes (`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8`).
* Cada card terá:
  * Um contêiner com bordas arredondadas e efeito de levitação no hover (`hover:-translate-y-1 hover:shadow-lg transition-all duration-300`).
  * Ícone correspondente usando cores vibrantes da marca (`text-brand-cyan` ou `text-brand-vibrant`).
  * Título curto e descrição do recurso.

### 2.4 Seção de Estatísticas (Stats)

* Exibição de 3 a 4 métricas ilustrativas com fonte grande e pesada (`text-4xl font-extrabold text-text-primary`).
* Fundo sutil com gradiente radial suave para dar profundidade.

### 2.5 Rodapé (Footer)

* Layout simples centralizado ou com seções.
* Links de redes sociais fictícias, termo de uso e copyright.

---

## 3. Responsividade e Animações

* **Pontos de Quebra (Breakpoints)**:
  * Mobile (`< 640px`): Menus condensados ou empilhados verticalmente. O mockup de dashboard some ou fica em escala reduzida.
  * Tablet (`>= 768px`): Layout em 2 colunas para features e hero horizontal.
  * Desktop (`>= 1024px`): Layout completo com mockup expandido ao lado do texto hero.
* **Transições e Micro-animações**:
  * Todos os botões devem ter transição de cor de fundo e sombra de `transition-all duration-200`.
  * Cards de features levitam suavemente 4px ao passar o mouse.
  * Entrada suave da página (fade-in inicial).

---

## 4. Acessibilidade (a11y) e SEO

* **Tags de Cabeçalho**: Usar um único `<h1>` para o título principal do Hero, `<h2>` para os títulos de seções (Recursos, Estatísticas) e `<h3>` para títulos dos cards.
* **Contraste**: Manter contraste mínimo de cores nas relações texto-fundo.
* **Foco do Teclado**: Elementos interativos (`Link`, `button`) devem destacar-se visualmente com `focus-visible:ring-2 focus-visible:ring-focus-ring`.
* **SEO**: Configurar `metadata` com título ("SuporteCliente | Gestão de Clientes e Processos") e descrição informativa voltada para captação.
