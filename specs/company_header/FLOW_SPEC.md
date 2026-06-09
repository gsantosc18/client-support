# Especificação de Fluxo: Exibição de Empresa e Decisões de Cache

Este documento mapeia os fluxos do sistema para obter e exibir os dados da empresa na interface, especificando quando os caches de frontend e backend são acionados.

---

## 1. Fluxo de Inicialização do Header (Montagem)

```mermaid
sequenceDiagram
    autonumber
    actor User as Usuário
    participant Header as Componente Header
    participant Hook as Hook useCompany
    participant Redux as Redux Store
    participant Storage as localStorage/sessionStorage
    participant Backend as Backend API (/company)

    User->>Header: Acessa Página (ex: /clients)
    Header->>Hook: Carrega Hook de Empresa
    Hook->>Redux: Verifica se companyName existe no estado
    alt Cache Miss no Redux (Estado vazio)
        Hook->>Storage: Verifica se existe nos storages locais
        alt Cache Hit no Web Storage
            Storage-->>Hook: Retorna Nome da Empresa
            Hook->>Redux: Atualiza Estado Redux (setCompany)
            Hook-->>Header: Retorna Nome da Empresa
            Header-->>User: Exibe Header com Nome da Empresa
        else Cache Miss no Web Storage
            Hook->>Backend: Envia requisição GET /api/company (com JWT)
            activate Backend
            Backend-->>Hook: Retorna Dados da Empresa (JSON)
            deactivate Backend
            Hook->>Storage: Salva no localStorage / sessionStorage
            Hook->>Redux: Atualiza Estado Redux (setCompany)
            Hook-->>Header: Retorna Nome da Empresa
            Header-->>User: Exibe Header com Nome da Empresa
        end
    else Cache Hit no Redux
        Redux-->>Hook: Retorna Nome da Empresa
        Hook-->>Header: Retorna Nome da Empresa
        Header-->>User: Exibe Header com Nome da Empresa
    end
```

---

## 2. Fluxo Interno de Cache no Backend (API `/company`)

```mermaid
sequenceDiagram
    autonumber
    participant API as API Route (/company)
    participant Redis as Redis Cache
    participant DB as Banco MariaDB

    API->>API: Extrai ID da empresa do Token JWT
    API->>Redis: Consulta chave "company:<id>"
    alt Cache Hit no Redis
        Redis-->>API: Retorna JSON Serializado
        API-->>API: Faz Unmarshal para Struct
    else Cache Miss no Redis
        API->>DB: Executa query SELECT no MariaDB por ID
        DB-->>API: Retorna Linha do Banco (Company)
        API->>Redis: Serializa e salva em "company:<id>" com TTL 24h
    end
    API-->>API: Envia resposta HTTP 200 JSON
```

---

## 3. Fluxo de Limpeza de Cache no Logout

1. O usuário clica no botão "Sair".
2. O frontend chama o endpoint `/api/auth/logout` para invalidar a sessão no backend (colocando o token de acesso na blacklist).
3. Ao mesmo tempo, o frontend dispara a action `logout` do Redux.
4. O reducer do `authSlice` redefini todos os estados em memória para nulo e apaga os itens do storage físico do navegador:
   * `accessToken`
   * `companyName`
5. A aplicação redireciona o usuário para a tela de login.
