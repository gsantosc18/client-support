# Documentação do Frontend: Autenticação

## Visão Geral

O frontend foi desenvolvido em Next.js (App Router), focado na implementação da interface de usuário para Cadastro, Login, Recuperação de Senha e Redefinição. Ele utiliza React-Redux para gerenciamento de estado e Axios para integração HTTP com o backend.

---

## Estrutura do Módulo

O módulo foi organizado utilizando o padrão Feature-Sliced Design:

- `src/features/auth/hooks/useAuth.ts`: Hook customizado que abstrai as chamadas HTTP (usando `authService`), controla estados locais de carregamento e erro, e interage com o Redux para despachar ações como `setAuthTokens` e `logout`.
- `src/services/api.ts`: Instância customizada do Axios configurada com Interceptors. O interceptor de `request` anexa o `Access Token` nas requisições. O interceptor de `response` intercepta erros 401 e efetua o logout automático redirecionando o usuário.
- `src/services/auth.service.ts`: Abstração de chamadas da API REST do backend para registrar, logar, solicitar link de recuperação e resetar senhas.
- `src/state/slices/authSlice.ts`: Slice do Redux utilizando `@reduxjs/toolkit` para armazenar se o usuário está autenticado e guardar o `AccessToken`.
- `src/utils/navigation.ts`: Utilitário de redirecionamento programático seguro contra SSR (Server-Side Rendering). Evita acidentes ao chamar `window.location` em ciclos de renderização do servidor Next.js.

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
- **Input:** Campo de formulário responsivo com animações CSS nos estados `:focus` e suporte completo a mensagens de erro estilizadas em vermelho.

---

## Fluxos de Navegação

1. **Acesso não logado:** O usuário inicia no `/login`. Pode navegar para `/register` ou `/forgot-password`.
2. **Esqueci minha senha:** Em `/forgot-password`, após o envio do e-mail, se o usuário clicar no link recebido com o token, será redirecionado para `/reset-password?token=XXX`.
3. **Pós-Login:** Após o login com sucesso, os tokens são recebidos. O `AccessToken` vai para o Redux State e o aplicativo redireciona o usuário para o `/dashboard`.
4. **Pós-Cadastro:** Após sucesso em `/register`, o usuário é redirecionado de volta ao `/login?registered=true`, mostrando a tela de login.

---

## Cobertura e Estratégia de Testes (QA)

O frontend possui cobertura total de statements superior a **80%** (**89.01% obtidos**), estruturada usando Jest e React Testing Library:

### 1. Testes de Utilidade SSR-Safe
Garante que a função `navigateTo` não executa em contextos de servidor e chama `window.location.assign` perfeitamente no navegador.

### 2. Testes de Interceptação da API
Simula respostas da API HTTP do Axios para testar se tokens de autorização são mapeados devidamente nos headers e se retornos `401 Unauthorized` limpam a store do Redux e realizam o redirecionamento.

### 3. Testes do Redux Slice
Valida todas as transições de estado do slice de autenticação (`setAuthTokens`, `clearAuthTokens`).

### Comando para Execução
```bash
make tests-front
```
*(ou execute `npm run test -- --coverage` na pasta app)*
