# Flow Specification: Autenticação Persistente e Renovação de Sessão (Refresh Token)

## Fluxo Completo de Renovação Transparente (Silent Refresh)

```mermaid
sequenceDiagram
    autonumber
    actor User as Usuário
    participant Frontend as Frontend (Axios Interceptor)
    participant AuthAPI as Backend /api/auth/refresh
    participant ResourceAPI as Backend /api/clients
    participant Redis as Redis Blacklist

    User->>Frontend: Clica para listar clientes (após 35min)
    Frontend->>ResourceAPI: GET /api/clients (Bearer ExpiredAccessToken)
    ResourceAPI-->>Frontend: 401 Unauthorized (Token expirado)
    Note over Frontend: Interceptor captura 401
    Frontend->>AuthAPI: POST /api/auth/refresh (RefreshToken)
    AuthAPI->>Redis: Verifica se RefreshToken está na Blacklist
    Redis-->>AuthAPI: Não está na Blacklist
    AuthAPI->>Redis: Adiciona RefreshToken antigo à Blacklist (TTL = tempo restante)
    AuthAPI-->>Frontend: 200 OK (Novo AccessToken + Novo RefreshToken)
    Note over Frontend: Atualiza Redux e Storages locais
    Frontend->>ResourceAPI: GET /api/clients (Bearer Novo AccessToken)
    ResourceAPI-->>Frontend: 200 OK (Dados de clientes)
    Frontend-->>User: Exibe clientes na tela sem interrupção
```

## Fluxo de Sessão Definitivamente Expirada ou Revogada

```mermaid
sequenceDiagram
    autonumber
    actor User as Usuário
    participant Frontend as Frontend (Axios Interceptor)
    participant AuthAPI as Backend /api/auth/refresh
    participant ResourceAPI as Backend /api/clients

    Frontend->>ResourceAPI: GET /api/clients (Bearer ExpiredAccessToken)
    ResourceAPI-->>Frontend: 401 Unauthorized
    Frontend->>AuthAPI: POST /api/auth/refresh (RefreshToken expirado/revogado)
    AuthAPI-->>Frontend: 401 Unauthorized (Token inválido ou expirado)
    Note over Frontend: Falha no refresh
    Frontend->>Frontend: Dispara logout() & Limpa localStorage
    Frontend-->>User: Redireciona para /login
```
