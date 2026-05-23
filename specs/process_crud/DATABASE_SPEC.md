# Database Specification: Process & Establishment CRUD

Este documento especifica o modelo físico do banco de dados PostgreSQL, migrações e índices para dar suporte aos Processos e Estabelecimentos.

---

## 1. Definições de Tabelas e Esquema

### 1.1. Tabela: `establishments` [NEW]
Armazena os estabelecimentos cadastrados por empresa.

* **Campos**:
  * `id`: `UUID PRIMARY KEY DEFAULT uuid_generate_v4()`
  * `company_id`: `UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT`
  * `name`: `VARCHAR(255) NOT NULL`
  * `address`: `TEXT NOT NULL`
  * `city`: `VARCHAR(100) NOT NULL`
  * `state`: `VARCHAR(2) NOT NULL`
  * `created_at`: `TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP`
  * `updated_at`: `TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP`

* **Restrições & Índices**:
  * Índice composto em `(company_id, name)` para busca rápida e autocomplete.

### 1.2. Tabela: `processes` [MODIFY]
A tabela `processes` existente precisa de uma migração de esquema para se adequar ao novo contrato.

* **Campos**:
  * `id`: `UUID PRIMARY KEY DEFAULT uuid_generate_v4()`
  * `company_id`: `UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT`
  * `user_id`: `UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT` (Responsável)
  * `establishment_id`: `UUID NOT NULL REFERENCES establishments(id) ON DELETE RESTRICT`
  * `protocol`: `TEXT` (opcional)
  * `observation`: `TEXT` (opcional)
  * `status`: `VARCHAR(50) NOT NULL DEFAULT 'PENDING'`
  * `created_at`: `TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP`
  * `updated_at`: `TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP`

* **Alterações de Migração necessárias**:
  1. Remover coluna `client_id` (vínculos agora ocorrem via tabela associativa many-to-many).
  2. Remover coluna `external_id` (substituída por `protocol`).
  3. Adicionar coluna `establishment_id` como chave estrangeira.
  4. Adicionar coluna `protocol` e `observation`.
  5. Atualizar a constraint `chk_process_status` para refletir os novos valores válidos:
     `CONSTRAINT chk_process_status CHECK (status IN ('PENDING', 'IN_PROGRESS', 'AWAITING_DOCUMENTATION', 'IN_ANALYSIS', 'COMPLETED', 'CANCELLED'))`

### 1.3. Tabela Associativa: `client_processes` [NEW]
Tabela de junção para mapear o relacionamento N:N entre clientes e processos.

* **Campos**:
  * `id`: `UUID PRIMARY KEY DEFAULT uuid_generate_v4()`
  * `client_id`: `UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE`
  * `process_id`: `UUID NOT NULL REFERENCES processes(id) ON DELETE CASCADE`

* **Restrições & Índices**:
  * Constraint de Unicidade em `(client_id, process_id)` para evitar vinculações duplicadas do mesmo cliente ao mesmo processo.
  * Índice em `(process_id)` para aceleração de pré-carregamentos de clientes.
  * Índice em `(client_id)` para busca de processos relacionados a um cliente.

---

## 2. Instruções SQL de Migração (Goose)

```sql
-- +goose Up
-- +goose StatementBegin

-- 1. Criar tabela de estabelecimentos
CREATE TABLE establishments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_establishments_company_name ON establishments(company_id, name);

-- 2. Limpar/Preparar a tabela de processos existente (drop de constraints antigas)
ALTER TABLE processes DROP CONSTRAINT IF EXISTS chk_process_status;
ALTER TABLE processes DROP CONSTRAINT IF EXISTS uq_process_company_external;

-- 3. Modificar tabela de processos
ALTER TABLE processes DROP COLUMN IF EXISTS client_id;
ALTER TABLE processes DROP COLUMN IF EXISTS external_id;

ALTER TABLE processes Add COLUMN establishment_id UUID NOT NULL REFERENCES establishments(id) ON DELETE RESTRICT;
ALTER TABLE processes ADD COLUMN protocol TEXT;
ALTER TABLE processes ADD COLUMN observation TEXT;

-- Atualizar status padrão e adicionar constraint CHECK de status
ALTER TABLE processes ALTER COLUMN status SET DEFAULT 'PENDING';
ALTER TABLE processes ADD CONSTRAINT chk_process_status CHECK (status IN ('PENDING', 'IN_PROGRESS', 'AWAITING_DOCUMENTATION', 'IN_ANALYSIS', 'COMPLETED', 'CANCELLED'));

-- 4. Criar tabela de associação client_processes
CREATE TABLE client_processes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    process_id UUID NOT NULL REFERENCES processes(id) ON DELETE CASCADE,
    CONSTRAINT uq_client_process UNIQUE (client_id, process_id)
);

CREATE INDEX idx_client_processes_process_id ON client_processes(process_id);
CREATE INDEX idx_client_processes_client_id ON client_processes(client_id);

-- +goose StatementEnd
```
