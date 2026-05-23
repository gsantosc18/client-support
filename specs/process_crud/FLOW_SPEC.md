# Flow Specification: Process CRUD

Este documento descreve os fluxos de controle e sequenciamento de interações entre o Frontend, o Backend e o Banco de Dados para os casos de uso críticos de Processos.

---

## 1. Fluxo de Criação de Processo com Criação Inline de Estabelecimento

Este diagrama de sequência descreve o cenário em que o usuário preenche o formulário de processo, percebe a falta do estabelecimento, cria-o de forma inline e depois submete o processo com sucesso.

```mermaid
sequenceDiagram
    autonumber
    actor Operador as Usuário (Navegador)
    participant Front as Frontend (React App)
    participant Back as Backend (Go API)
    participant DB as Banco de Dados (Postgres)

    Operador->>Front: Clica em "+ Novo" ao lado de Estabelecimento
    Front->>Operador: Exibe Modal rápido "Adicionar Estabelecimento"
    Operador->>Front: Preenche Nome, Endereço, Cidade, Estado e clica em Salvar
    Front->>Back: POST /api/establishments (Payload Estabelecimento)
    Note over Back: Autentica Token JWT<br/>Valida dados & Tenant (CompanyID)
    Back->>DB: INSERT INTO establishments (...)
    DB-->>Back: Sucesso (ID do Estabelecimento)
    Back-->>Front: 201 Created (JSON Estabelecimento Completo)
    Front->>Front: Fecha modal e pré-seleciona estabelecimento recém-criado
    Operador->>Front: Insere Clientes, Responsável, Protocolo e clica em Salvar Processo
    Front->>Back: POST /api/processes (Payload contendo client_ids, establishment_id, user_id, etc.)
    Note over Back: Valida Clientes Ativos<br/>Valida Responsável Ativo<br/>Valida Estabelecimento do mesmo Tenant
    Back->>DB: Inicia Transação (Transaction Began)
    Back->>DB: INSERT INTO processes (id, user_id, establishment_id, status='PENDING', ...)
    Back->>DB: INSERT INTO client_processes (client_id, process_id) para cada ID
    Back->>DB: Commit Transação
    DB-->>Back: Sucesso
    Back-->>Front: 201 Created (JSON Processo Completo)
    Front-->>Operador: Notifica sucesso e redireciona para detalhes do processo
```

---

## 2. Fluxo de Edição / Reatribuição de Responsável

```mermaid
sequenceDiagram
    autonumber
    actor Operador as Usuário (Navegador)
    participant Front as Frontend (React App)
    participant Back as Backend (Go API)
    participant DB as Banco de Dados (Postgres)

    Operador->>Front: Acessa Detalhes do Processo e abre Edição
    Front->>Back: GET /api/processes/:id
    Back->>DB: SELECT com Preload de Clients, User, Establishment
    DB-->>Back: Registro do Processo
    Back-->>Front: 200 OK (JSON Processo)
    Front->>Operador: Preenche formulário de edição
    Operador->>Front: Altera o operador Responsável e clica em Salvar
    Front->>Back: PUT /api/processes/:id (Payload completo com novo user_id)
    Note over Back: Valida se o novo responsável existe e está ativo na mesma empresa
    Back->>DB: Inicia Transação
    Back->>DB: UPDATE processes SET user_id = <novo_id>, updated_at = NOW() WHERE id = :id AND company_id = :company_id
    Back->>DB: Atualiza relacionamentos de clientes (sync client_processes)
    Back->>DB: Commit Transação
    DB-->>Back: Sucesso
    Back-->>Front: 200 OK (JSON Processo Completo)
    Front-->>Operador: Exibe dados atualizados com notificação de reatribuição bem-sucedida
```
