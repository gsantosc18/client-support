# Documentação do Frontend: Autenticação

## Visão Geral

O frontend foi desenvolvido em Next.js (App Router), focado na implementação da interface de usuário para Cadastro, Login, Recuperação de Senha e Redefinição. Ele utiliza React-Redux para gerenciamento de estado e Axios para integração HTTP com o backend.

---

## Estrutura do Módulo

O módulo foi organizado utilizando o padrão Feature-Sliced Design:

- `src/features/auth/hooks/useAuth.ts`: Hook customizado que abstrai as chamadas HTTP (usando `authService`), controla estados locais de carregamento e erro, realiza o redirecionamento pós-logout, e interage com o Redux.
- `src/features/company/hooks/useCompany.ts`: Hook customizado que gerencia o carregamento sob demanda do nome da empresa e coordena o cache Redux + Web Storage.
- `src/features/company/services/company.service.ts`: Abstração de chamadas para a rota de consulta aos dados da empresa `/api/company`.
- `src/components/Header.tsx`: Componente global e centralizado de cabeçalho superior que substitui os blocos duplicados de navbar e exibe o logo reativo e nome da empresa.
- `src/services/api.ts`: Instância customizada do Axios configurada com Interceptors. O interceptor de `request` anexa o `Access Token` nas requisições. O interceptor de `response` intercepta erros 401 e efetua o logout automático redirecionando o usuário.
- `src/services/auth.service.ts`: Abstração de chamadas da API REST do backend para registrar, logar, solicitar link de recuperação e resetar senhas.
- `src/state/authStore.ts`: Store global e slice do Redux utilizando `@reduxjs/toolkit` para armazenar tokens de acesso, status de login, e cache em memória de `companyName`.
- `src/utils/navigation.ts`: Utilitário de redirecionamento programático seguro contra SSR (Server-Side Rendering).

---

## Redirecionamento SSR-Safe

Para evitar falhas de execução no Next.js durante a pré-renderização no servidor (onde o objeto global `window` não existe), criamos a utilidade [navigation.ts](file:///Users/gedalias.caldas/Documents/client-suport/app/src/utils/navigation.ts):

```typescript
export const navigateTo = (url: string): void => {
  if (typeof window !== "undefined") {
    window.location.assign(url);
  }
};
```
Esta utilidade é empregada principalmente no interceptor de respostas do Axios (`api.ts`). Se o backend retornar status `401 Unauthorized`, o interceptor limpa o token de autenticação e redireciona de forma robusta e segura para o `/login`.

---

## Componentes Reutilizáveis (UI)

Foram implementados componentes agnósticos utilizando Tailwind CSS para manter a consistência visual:
- **Button:** Botão com estados de hover suave, desabilitado e animação de carregamento (`isLoading prop` com Spinner SVG).
- **Input:** Campo de formulário responsivo com animações CSS nos estados `:focus` e suporte completo a mensagens de erro estilizadas em vermelho. *Nota de Estilo: Em conformidade com a regra de design de fundo claro e fonte escura, todas as classes de Dark Mode reversas (`dark:`) foram totalmente removidas do componente. O campo é renderizado sempre com fundo branco (`bg-white`) e texto escuro (`text-slate-900`), garantindo contraste ideal e eliminando regressões de legibilidade em qualquer tema do sistema.*

---

## Segurança e Semântica de Formulários

Todos os formulários que transitam dados e credenciais sensíveis (Login, Cadastro de Usuário, Recuperação de Senha e Redefinição de Senha) utilizam explicitamente o atributo `method="post"` na tag `<form>`. Isso previne o comportamento padrão de submissão via `GET` do HTML5 e impede a exposição acidental de credenciais na barra de endereços (e no histórico do navegador) caso ocorra alguma falha na interrupção do envio de dados do lado do cliente (`preventDefault`).

---

## Fluxos de Navegação

1. **Acesso não logado:** O usuário inicia no `/login`. Pode navegar para `/register` ou `/forgot-password`.
2. **Esqueci minha senha:** Em `/forgot-password`, após o envio do e-mail, se o usuário clicar no link recebido com o token, será redirecionado para `/reset-password?token=XXX`.
3. **Pós-Login:** Após o login com sucesso, os tokens são recebidos. O `AccessToken` vai para o Redux State e é persistido de forma robusta no `localStorage` (se a opção "Manter-me logado" foi selecionada) ou no `sessionStorage` (comportamento padrão de aba). Isso previne a perda de sessão ao recarregar a página. O aplicativo então redireciona o usuário para `/clients`.
4. **Pós-Cadastro:** Após sucesso em `/register`, o usuário é redirecionado de volta ao `/login?registered=true`, mostrando a tela de login.

---

## Persistência de Sessão e Hidratação

Para evitar que o usuário seja desconectado e redirecionado para a página de login ao recarregar a página, implementamos um mecanismo híbrido de persistência e hidratação no Redux Store (`authStore.ts`):

1. **Persistência Seletiva (Login)**:
   - Se o usuário selecionar **"Manter-me logado"**, o `AccessToken` e o `companyName` são persistidos no `localStorage`.
   - Se a opção estiver desmarcada, o `AccessToken` e o `companyName` são armazenados no `sessionStorage` (destruídos ao fechar a aba/navegador).
2. **Hidratação Inicial**:
   - Ao iniciar a aplicação (client-side), a store do Redux é hidratada automaticamente tentando ler o `AccessToken` e o `companyName` de ambas as storages.
3. **Limpeza Consistente**:
   - Ao realizar logout voluntário ou receber uma resposta `401 Unauthorized` de qualquer endpoint protegido do backend, os tokens e dados de empresa são limpos de forma consistente de ambas as storages (`localStorage` e `sessionStorage`).

---

## Cobertura e Estratégia de Testes (QA)

O frontend possui cobertura total de statements superior a **80%** (**89.01% obtidos**), estruturada usando Jest e React Testing Library:

### 1. Testes de Utilidade SSR-Safe
Garante que a função `navigateTo` não executa em contextos de servidor e chama `window.location.assign` perfeitamente no navegador.

### 2. Testes de Interceptação da API
Simula respostas da API HTTP do Axios para testar se tokens de autorização são mapeados devidamente nos headers e se retornos `401 Unauthorized` limpam a store do Redux e realizam o redirecionamento.

### 3. Testes do Redux Slice
Valida todas as transições de estado do slice de autenticação (`setAuthTokens`, `setCompany`, `logout` e testes de Web Storage de empresa).

### 4. Testes de Análise de Cabeçalho (E2E Cypress)
Um arquivo de teste em `cypress/e2e/app/company_header.cy.js` foi criado para certificar:
* Exibição dinâmica da marca do cliente logado.
* Funcionamento do cache silencioso que impede chamadas de rede redundantes a cada transição de rota.
* Limpeza de dados de inquilino (tenant) e redirecionamento de login no logout.

### Comando para Execução
```bash
make tests-front
```
*(ou execute `npm run test -- --coverage` na pasta app)*
