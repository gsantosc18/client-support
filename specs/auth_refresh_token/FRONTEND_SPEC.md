# Frontend Specification: Autenticação Persistente e Renovação de Sessão (Refresh Token)

## Arquitetura de Comunicação e Estado

### 1. Interceptor de Resposta Axios (`app/src/services/api.ts`)
- **Mecanismo de Lock / Mutex**:
  - `let isRefreshing = false;`
  - `let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: any) => void }> = [];`
- **Fluxo do Interceptor**:
  - Interceptar erros com status `401`.
  - Ignorar se a requisição original for `/auth/login` ou `/auth/refresh` (evita loop infinito).
  - Se `isRefreshing` for `true`, adicionar a promessa da requisição à `failedQueue`.
  - Se `isRefreshing` for `false`, marcar como `true`, recuperar o `refreshToken` do `localStorage` (ou `sessionStorage`).
  - Caso não exista `refreshToken`, disparar `logout()` e redirecionar para `/login`.
  - Chamar `authService.refreshToken(refreshToken)`.
  - Em caso de sucesso:
    - Atualizar tokens no Redux Store (`setAuthTokens`).
    - Salvar novo `accessToken` e `refreshToken` nos storages correspondentes.
    - Resolver a fila `failedQueue` passando o novo token.
    - Atualizar header `Authorization` da requisição original e refazê-la via `api(originalRequest)`.
  - Em caso de falha:
    - Rejeitar todos os itens da `failedQueue`.
    - Disparar `logout()`, limpar tokens e redirecionar para `/login`.
  - Resetar `isRefreshing = false` no bloco `finally`.

### 2. Gerenciamento de Estado (`app/src/state/authStore.ts`)
- O slice Redux `auth` já possui a action `setAuthTokens({ accessToken, keepMeLoggedIn })`.
- Assegurar sincronização perfeita entre o `accessToken` em memória e no storage persistente.

### 3. Integração com `authService` (`app/src/services/auth.service.ts`)
- Implementar:
  ```typescript
  refreshToken: async (refreshToken: string) => {
    const response = await axios.post(`${baseURL}/auth/refresh`, {
      refresh_token: refreshToken
    });
    return response.data;
  }
  ```
  *(Nota: utilizar uma instância direta do axios sem o interceptor padrão para a chamada de refresh, prevenindo interceptação circular)*.
