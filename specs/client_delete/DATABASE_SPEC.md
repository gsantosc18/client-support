# Database Specification: Client Delete

Este documento define o modelo físico do banco de dados PostgreSQL, tabelas, migrações e índices para a feature de exclusão de clientes.

---

## 1. Definições de Tabelas e Esquema

### 1.1. Nova Tabela: `deleted_clients`
Esta tabela é criada para fins de conformidade e auditoria, armazenando o estado histórico completo de todos os registros excluídos de `clients`.

```sql
CREATE TABLE deleted_clients (
    id BIGSERIAL PRIMARY KEY,
    data JSONB NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

#### Destaques Arquiteturais:
* **Uso de JSONB**: Escolheu-se `JSONB` em vez de `JSON` plano devido à eficiência superior no armazenamento, descompactação, performance de consultas futuras e suporte a indexação GIN caso seja necessário no futuro buscar clientes por atributos como CPF, e-mail ou nome dentro do log de excluídos.
* **Fuso Horário (`TIMESTAMP WITH TIME ZONE`)**: Garante que o carimbo de data e hora do arquivamento seja consistente com a convenção global adotada nas tabelas `companies`, `users`, `clients` e `processes`.

---

## 2. Script de Migração (Goose)

O arquivo de migração deve ser nomeado sequencialmente de acordo com o padrão do projeto:
`backend/migrations/20260521232000_create_deleted_clients_table.sql`

```sql
-- +goose Up
-- +goose StatementBegin
CREATE TABLE deleted_clients (
    id BIGSERIAL PRIMARY KEY,
    data JSONB NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS deleted_clients;
-- +goose StatementEnd
```
