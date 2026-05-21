# Tasks: Client Delete

Este documento lista todas as tarefas necessárias para a implementação completa da feature de exclusão física com arquivamento.

## Banco de Dados

- [ ] Criar arquivo de migração Goose `backend/migrations/20260521232000_create_deleted_clients_table.sql` para criar a tabela `deleted_clients` com `id`, `data` (JSONB) e `deleted_at`.

## Backend

- [ ] Criar entidade `DeletedClient` em `backend/internal/domain/client.go`.
- [ ] Atualizar interface `ClientRepository` para suportar o método de exclusão física e transacional.
- [ ] Implementar a lógica de exclusão atômica e salvamento do log no repositório Postgres.
- [ ] Atualizar o método `Delete` do `ClientService` para realizar a validação contra processos e invocar a exclusão física transacional.
- [ ] Atualizar a resposta do `ClientHandler.Delete` no HTTP controller para retornar a mensagem de exclusão física.
- [ ] Escrever/atualizar testes unitários em `backend/internal/service/client_test.go` para validar a exclusão de clientes com e sem processos.

## Frontend

- [ ] Atualizar o componente `ClientDeleteModal` em `app/src/features/clients/components/ClientDeleteModal.tsx` para refletir as descrições da exclusão definitiva física.
- [ ] Ajustar o fluxo de deleção na página de listagem ou detalhes para garantir a limpeza do cache de dados e exibir um feedback Toast adequado.

## QA & Testes E2E

- [ ] Criar cenários de teste automatizados em Cypress para validar:
  - Tentar deletar um cliente que possui processos associados (deve falhar exibindo a mensagem correta).
  - Deletar com sucesso um cliente sem processos (deve sumir da listagem e exibir toast).
