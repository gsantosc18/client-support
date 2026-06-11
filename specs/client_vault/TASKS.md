# Tasks: Client Credentials Vault

## Banco de Dados
- [ ] Criar arquivo de migração Goose para a tabela `client_vault_items`.
- [ ] Criar arquivo de migração para adicionar a coluna `user_id` e foreign key na tabela `client_vault_items`.
- [ ] Rodar as migrações locais para validar.

## Backend
- [ ] Criar utilitário de encriptação/decriptação em `pkg/utils/crypto.go`.
- [ ] Criar testes unitários para a criptografia em `pkg/utils/crypto_test.go`.
- [ ] Criar entidade `ClientVaultItem` em `internal/domain/client_vault.go` incluindo o campo `UserID`.
- [ ] Criar interface `ClientVaultRepository` em `internal/domain/client_vault.go`.
- [ ] Implementar repositório `ClientVaultRepository` em `internal/repository/postgres/client_vault_repository.go`.
- [ ] Criar struct `ClientVaultService` em `internal/service/client_vault_service.go` com métodos `Create`, `ListByClient`, `GetDecrypted`, `Update` e `Delete`.
- [ ] Adicionar testes unitários para o `ClientVaultService` cobrindo o campo `UserID`.
- [ ] Criar struct `ClientVaultHandler` em `internal/handlers/http/client_vault_handler.go` extraindo o `user_id` do JWT e populando-o automaticamente.
- [ ] Configurar rotas em `cmd/api/main.go`.

## Frontend
- [ ] Criar `vaultService.ts` em `app/src/features/clients/services/vaultService.ts` com funções de integração.
- [ ] Criar custom hook `useClientVault.ts` em `app/src/features/clients/hooks/useClientVault.ts`.
- [ ] Criar componente `VaultItemModal.tsx` em `app/src/features/clients/components/VaultItemModal.tsx`.
- [ ] Criar componente `ClientVaultSection.tsx` em `app/src/features/clients/components/ClientVaultSection.tsx`.
- [ ] Integrar o cofre em `ClientDetailPage.tsx`.

## QA / Testes
- [ ] Criar cenários de testes automatizados Cypress em `cypress/e2e/app/client_vault.cy.ts` ou similar.
