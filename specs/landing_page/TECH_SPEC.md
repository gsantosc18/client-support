# Especificação Técnica: Landing Page

Este documento detalha o desenho técnico da solução para a landing page do **SuporteCliente**.

---

## 1. Organização do Código de Frontend

A nova landing page será implementada substituindo o arquivo raiz de página do Next.js:

* **Página Principal**: `app/src/app/page.tsx`
* **Tipo**: Componente de Cliente (`"use client"`) para ler dinamicamente o estado do Redux Store.

### Dependências Utilizadas

* **React & Next.js App Router**: Utilização do `useRouter` para navegação programática e `Link` para navegação estática otimizada.
* **Redux Toolkit**: Importação do seletor para verificar o estado de autenticação (`state.auth.isAuthenticated`).
* **Lucide React**: Ícones premium para ilustrar os recursos na grade de features.
* **TailwindCSS**: Utilitários de estilização combinados com variáveis de CSS do design system (`globals.css`).

---

## 2. Divisão de Camadas e Componentização

A landing page será dividida de forma limpa nos seguintes blocos lógicos:

1. **Header (Barra de Navegação da Landing Page)**:
   * Se o usuário estiver autenticado, exibe o logo e o link "Ir para o Painel".
   * Se o usuário não estiver autenticado, exibe o logo e os links "Entrar" e "Cadastrar".
2. **Hero Section (Seção Principal)**:
   * Título destacado com gradiente linear do design system (`from-brand-cyan to-brand-vibrant`).
   * CTAs acionáveis de acordo com a sessão.
   * Ilustração CSS simulando o painel de processos para evitar arquivos pesados e garantir carregamento instantâneo.
3. **Features Grid (Grade de Recursos)**:
   * Grid contendo 4 cards com ícones e animações sutis ao passar o mouse.
4. **Stats Section (Métricas)**:
   * Exibição em destaque de números do sistema com efeitos de sombra e gradientes.
5. **Footer (Rodapé)**:
   * Links estáticos e rodapé simplificado.

---

## 3. Estratégia de Carregamento (Hydration Match)

Para evitar erros de hidratação (hydration errors) do Next.js decorrentes de verificação de `localStorage` durante o server-side rendering (SSR), a verificação de autenticação deve:

* Executar de forma segura dentro de um `useEffect` ou encapsulada reativamente no cliente.
* Enquanto o estado Redux ou localStorage inicializa, exibir um estado neutro ou amigável (skeleton ou loading placeholder sutil).
