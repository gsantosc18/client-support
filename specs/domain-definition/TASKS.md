# Checklist de Execução: TASKS.md

Esta lista de tarefas orienta os próximos passos do ciclo de desenvolvimento para os agentes **Desenvolvedor**, **QA** e **Revisor**.

---

## 1. Banco de Dados & Infraestrutura

- [ ] **Criar Migration (Goose)**:
  - Gerar arquivo de migração SQL em `backend/migrations/` (ex: `YYYYMMDDHHMMSS_create_clients_and_processes.sql`).
  - Escrever comandos `CREATE TABLE` para `clients` e `processes` com todas as chaves estrangeiras, enums (check constraints) e índices compostos.
  - Validar migration com `make infra` (ou executando comandos do goose).

---

## 2. Backend (Golang / Fiber)

### 2.1. Camada de Domínio
- [ ] Criar entidade de domínio e enum em `internal/domain/client.go` com tags GORM/JSON.
- [ ] Criar entidade de domínio e enum em `internal/domain/process.go` com tags GORM/JSON.
- [ ] Definir a interface `ClientRepository` com as assinaturas de métodos (Create, FindByID, FindAll, Update).
- [ ] Definir a interface `ProcessRepository` com as assinaturas de métodos (Create, FindByID, FindAll, Update, UpdateStatus).

### 2.2. Camada de Repositório (Postgres GORM)
- [ ] Implementar os métodos da interface `ClientRepository` em `internal/repository/postgres/`.
- [ ] Implementar os métodos da interface `ProcessRepository` em `internal/repository/postgres/`.
- [ ] Garantir o isolamento de `company_id` em todas as queries e escritas.

### 2.3. Camada de Serviço (Regras de Negócio)
- [ ] Desenvolver `ClientService` implementando validações de unicidade de e-mail/documento na empresa (`company_id`).
- [ ] Desenvolver `ProcessService` com regras de validação que impedem vincular clientes ou usuários que pertençam a uma empresa diferente do processo.
- [ ] Implementar tratamento seguro de transações ao criar/atualizar entidades.

### 2.4. Camada de APIs & Handlers (HTTP Fiber)
- [ ] Criar DTOs de Request e Response para Clientes e Processos (ocultando `company_id` nos payloads de entrada).
- [ ] Implementar handlers HTTP do Fiber para Clientes (`CreateClient`, `ListClients`, `GetClient`, `UpdateClient`, `DeleteClient`).
- [ ] Implementar handlers HTTP do Fiber para Processos (`CreateProcess`, `ListProcesses`, `GetProcess`, `UpdateProcessStatus`, `UpdateProcess`).
- [ ] Registrar rotas no roteador do Fiber sob middleware de autenticação JWT.

---

## 3. Frontend (Next.js / React / TypeScript)

### 3.1. Tipagem & Comunicação com API
- [ ] Criar contratos TypeScript em `src/interfaces/client.ts` e `src/interfaces/process.ts`.
- [ ] Implementar endpoints na camada de `src/services/` para consumo do backend com tratamento correto dos tokens JWT.
- [ ] Integrar chamadas de API com hooks do React Query para cache, busca textual e paginação de dados.

### 3.2. Interface e Telas (UI)
- [ ] Desenvolver página de listagem de Clientes com busca em tempo real, paginação e filtros de status.
- [ ] Criar formulário modal ou página de criação/edição de Clientes (com validações de campos RG, CPF, CNH).
- [ ] Desenvolver tela/board de Processos para exibir a listagem dos chamados abertos e seus status correspondentes.
- [ ] Criar funcionalidade para transição/mudança rápida de status do processo diretamente na interface.
- [ ] Assegurar responsividade em dispositivos móveis e acessibilidade semântica nos botões/inputs.

---

## 4. Quality Assurance (QA) & Testes

- [ ] **Testes Unitários (Backend)**:
  - Criar testes unitários para os Casos de Uso/Serviços de Cliente (mockando o repositório para testar colisões de CPF/E-mail na empresa).
  - Criar testes unitários para Processos (testando rejeição de criação com cliente/usuário de outra empresa).
- [ ] **Testes de Integração de API (Cypress)**:
  - Escrever testes automatizados Cypress na pasta `cypress/e2e/api/` validando os contratos de payload e respostas HTTP (sucessos 201, falhas 400/409, autenticação 401).
- [ ] **Testes E2E (Interface)**:
  - Criar cenário de teste E2E navegando pela interface do Next.js: cadastrar cliente com RG/CPF, criar processo, mudar status e listar com filtro.
- [ ] Garantir 80% de cobertura nos códigos alterados.
