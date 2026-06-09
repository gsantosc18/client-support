# Especificação de Frontend: Header e Cache do Cliente

Este documento especifica a interface com o usuário, a organização de componentes, o estado global e o fluxo de inicialização do cache de Empresa no cliente web.

---

## 1. Modificações no Estado Global (Redux)

### Arquivo: `app/src/state/authStore.ts`

* **Extensão da Interface `AuthState`**:
  ```typescript
  interface AuthState {
    accessToken: string | null;
    isAuthenticated: boolean;
    companyName: string | null; // Novo campo
  }
  ```
* **Novas Reducers/Actions**:
  * `setCompany`: Define o nome da empresa e persiste no Web Storage correspondente.
  * Atualizar o reducer `logout` para remover o `companyName` do estado e dos storages.

### Lógica de Persistência Local (Bootstrap)

O estado inicial deve ler o nome da empresa cacheado na sessão/local storage:
```typescript
const getInitialCompany = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('companyName') || sessionStorage.getItem('companyName');
  }
  return null;
};
```

---

## 2. Estrutura de Componentes

### Novo Componente: `app/src/components/Header.tsx`

* **Responsabilidades**:
  * Exibir o logo circular reativo com a primeira letra da empresa autenticada.
  * Exibir o nome da empresa de forma estilizada.
  * Renderizar a navegação superior:
    * Botão "Clientes" (aponta para `/clients`, ativo se a URL começar com `/clients`).
    * Botão "Processos" (aponta para `/processes`, ativo se a URL começar com `/processes`).
  * Botão de Logout ("Sair") integrado ao hook de autenticação.
* **Layout Visual**:
  * Manter a barra premium: fundo `bg-background-surface`, borda inferior `border-b border-border-default`, sombra sutil `shadow-sm`, grudado no topo `sticky top-0 z-40`.
  * Animação pulse (skeleton) enquanto o nome da empresa é carregado via rede.

---

## 3. Hook Reativo de Empresa

### Novo Hook: `app/src/features/company/hooks/useCompany.ts`

* **Comportamento**:
  * Verifica se o usuário está logado (`isAuthenticated`).
  * Se o nome da empresa não estiver no estado Redux, dispara a requisição `GET /company`.
  * No sucesso, atualiza o Redux e o Web Storage (`localStorage` ou `sessionStorage`, espelhando onde o `accessToken` está gravado).
  * Retorna `{ companyName, loading }`.

---

## 4. Requisitos de Acessibilidade (a11y) e Responsividade

* **Acessibilidade**:
  * Elementos interativos de navegação e logout devem possuir semântica correta (`<nav>`, `<button>`).
  * O botão de logout deve incluir `aria-label="Sair do sistema"`.
  * Links e botões devem responder ao foco via teclado (`focus-visible`).
* **Responsividade**:
  * O layout do header deve se adaptar a telas menores (Mobile). Em dispositivos pequenos, manter a legibilidade do nome e a consistência dos botões.
