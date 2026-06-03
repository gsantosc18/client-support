# Flow Specification: Containerização de Frontend e Backend

Este documento mapeia visual e conceitualmente os fluxos de inicialização do sistema orquestrado (Bootstrap Sequence) e o fluxo de requisição do usuário na arquitetura containerizada.

---

## 1. Fluxo de Inicialização do Sistema (Bootstrap Sequence)

O diagrama abaixo especifica a ordem correta de inicialização dos containers e a verificação de saúde antes que a aplicação esteja totalmente pronta para uso.

```mermaid
sequenceDiagram
    autonumber
    actor Dev as Desenvolvedor (Host)
    participant Compose as Docker Compose
    participant DB as Postgres Container
    participant Redis as Redis Container
    participant Back as Backend Container
    participant Front as Frontend Container

    Dev->>Compose: Executa "make infra"
    critical Inicialização Física
        Compose->>DB: Levanta Postgres (Porta 5432)
        Compose->>Redis: Levanta Redis (Porta 6379)
    end
    Note over DB: Inicializando Motor do Banco
    loop Healthcheck DB
        Compose->>DB: pg_isready -U root -d client_support
        DB-->>Compose: Retorna status (saudável / não-saudável)
    end
    critical Bootstrap Backend
        Compose->>Back: Levanta Backend (Porta 8080)
        Back->>DB: Executa "goose up" (rodando migrações SQL)
        DB-->>Back: Migrações aplicadas com sucesso
        Back->>Back: Inicia Servidor HTTP Fiber
    end
    critical Bootstrap Frontend
        Compose->>Front: Levanta Next.js Standalone (Porta 3000)
    end
    Note over Dev: Sistema totalmente pronto em localhost:3000 e api em :8080!
```

---

## 2. Fluxo de Requisição e Comunicação de Rede

O diagrama abaixo descreve a comunicação física de rede durante a interação do usuário final com a aplicação no browser:

```mermaid
sequenceDiagram
    autonumber
    actor User as Navegador do Usuário
    participant Front as Frontend standalone (:3000)
    participant Back as Backend Fiber (:8080)
    participant DB as Postgres (:5432)
    participant Redis as Redis (:6379)

    User->>Front: Acessa http://localhost:3000/clients
    Front-->>User: Retorna HTML/JS/CSS estático otimizado
    Note over User: Browser renderiza a página do cliente e dispara fetch local
    User->>Back: GET http://localhost:8080/api/clients (com JWT)
    Back->>Redis: GET session_token:id (Validação de cache)
    Redis-->>Back: Token válido em cache
    Back->>DB: SELECT * FROM clients WHERE company_id = ?
    DB-->>Back: Retorna dados dos clientes
    Back-->>User: Retorna JSON HTTP 200 OK
    Note over User: Browser popula a tabela e remove o skeleton loading!
```
