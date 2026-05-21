# Tarefas de Desenvolvimento do CRUD de Clientes

Este documento contém o checklist de tarefas a serem realizadas para a implementação completa e integrada do CRUD de Clientes.

---

## Backend

- [ ] **Injeção de ProcessRepository em ClientService**:
  - [ ] Adicionar o campo `processRepo domain.ProcessRepository` no `ClientService` em `backend/internal/service/client.go`.
  - [ ] Atualizar o construtor `NewClientService`.
  - [ ] Atualizar a inicialização do `clientService` em `backend/cmd/api/main.go` passando `processRepo`.
- [ ] **Validação de Vínculo de Processo na Deleção**:
  - [ ] No método `Delete` em `backend/internal/service/client.go`, realizar a busca de processos pertencentes ao cliente e empresa.
  - [ ] Se existirem processos vinculados, abortar e retornar o erro `"O cliente está vinculado a um processo e não pode ser removido."`.
- [ ] **Testes de Unidade de Backend**:
  - [ ] Criar/atualizar testes do `ClientService` em `backend/internal/service/client_test.go` cobrindo o fluxo de deleção de cliente com e sem processos vinculados.
  - [ ] Validar integridade e cobertura de testes unitários do backend acima de 80%.

---

## Frontend

- [ ] **Ajuste de Navegação no Login**:
  - [ ] Atualizar `app/src/app/login/page.tsx` para redirecionar para `/clients` após login bem-sucedido.
- [ ] **Configuração do Cliente de API de Clientes**:
  - [ ] Criar o arquivo `app/src/features/clients/services/client.service.ts` com os métodos: `list`, `getByID`, `create`, `update`, `delete`.
- [ ] **Criação do Hook de Clientes**:
  - [ ] Criar `app/src/features/clients/hooks/useClients.ts` para gerenciar a lógica de paginação, busca, filtros, criação, edição e deleção usando Axios/React Query.
- [ ] **Componentes da Interface**:
  - [ ] Criar `app/src/features/clients/components/ClientTable.tsx` (tabela responsiva com ordenação interativa).
  - [ ] Criar `app/src/features/clients/components/ClientFilters.tsx` (barra de busca e selects de status).
  - [ ] Criar `app/src/features/clients/components/ClientForm.tsx` (formulário unificado de criação/edição com máscaras de CPF e telefone).
  - [ ] Criar `app/src/features/clients/components/ClientDeleteModal.tsx` (modal de confirmação exigindo a escrita de "delete").
- [ ] **Páginas de Rotas**:
  - [ ] Criar rota principal `/clients` (`app/src/app/clients/page.tsx`).
  - [ ] Criar rota de criação `/clients/new` (`app/src/app/clients/new/page.tsx`).
  - [ ] Criar rota de detalhes `/clients/[id]` (`app/src/app/clients/[id]/page.tsx`).
  - [ ] Criar rota de edição `/clients/[id]/edit` (`app/src/app/clients/[id]/edit/page.tsx`).
- [ ] **Polimento Visual**:
  - [ ] Garantir estética premium com sombras, transições e paleta de cores elegantes (padrões HSL/Slate).
  - [ ] Responsividade total em dispositivos móveis.

---

## Qualidade e Testes (QA)

- [ ] **Testes E2E Cypress**:
  - [ ] Criar cenários de testes Cypress para o fluxo completo do CRUD de Clientes em `cypress/e2e/app/clients.cy.ts`.
  - [ ] Testar a listagem, paginação, filtros e ordenação.
  - [ ] Testar criação e edição com validações.
  - [ ] Testar remoção de cliente livre (deve ter sucesso).
  - [ ] Testar remoção de cliente bloqueada por processo vinculado (deve exibir a mensagem de erro esperada).
- [ ] **Testes de Regressão e Execução**:
  - [ ] Executar testes frontend e backend e validar 100% de sucesso.
