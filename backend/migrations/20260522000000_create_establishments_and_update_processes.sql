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

-- 2. Modificar tabela de processos existente (drop de constraints antigas)
ALTER TABLE processes DROP CONSTRAINT IF EXISTS chk_process_status;
ALTER TABLE processes DROP CONSTRAINT IF EXISTS uq_process_company_external;

-- Remover coluna client_id e external_id
ALTER TABLE processes DROP COLUMN IF EXISTS client_id;
ALTER TABLE processes DROP COLUMN IF EXISTS external_id;

-- Adicionar novas colunas
ALTER TABLE processes ADD COLUMN establishment_id UUID NOT NULL REFERENCES establishments(id) ON DELETE RESTRICT;
ALTER TABLE processes ADD COLUMN protocol TEXT;
ALTER TABLE processes ADD COLUMN observation TEXT;

-- Atualizar status padrão e adicionar constraint CHECK de status
ALTER TABLE processes ALTER COLUMN status SET DEFAULT 'PENDING';
ALTER TABLE processes ADD CONSTRAINT chk_process_status CHECK (status IN ('PENDING', 'IN_PROGRESS', 'AWAITING_DOCUMENTATION', 'IN_ANALYSIS', 'COMPLETED', 'CANCELLED'));

-- 3. Criar tabela de associação client_processes
CREATE TABLE client_processes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    process_id UUID NOT NULL REFERENCES processes(id) ON DELETE CASCADE,
    CONSTRAINT uq_client_process UNIQUE (client_id, process_id)
);

CREATE INDEX idx_client_processes_process_id ON client_processes(process_id);
CREATE INDEX idx_client_processes_client_id ON client_processes(client_id);

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS client_processes;
ALTER TABLE processes DROP CONSTRAINT IF EXISTS chk_process_status;
ALTER TABLE processes DROP COLUMN IF EXISTS establishment_id;
ALTER TABLE processes DROP COLUMN IF EXISTS protocol;
ALTER TABLE processes DROP COLUMN IF EXISTS observation;
ALTER TABLE processes ADD COLUMN client_id UUID REFERENCES clients(id) ON DELETE RESTRICT;
ALTER TABLE processes ADD COLUMN external_id VARCHAR(255);
ALTER TABLE processes ADD CONSTRAINT uq_process_company_external UNIQUE (company_id, external_id);
ALTER TABLE processes ADD CONSTRAINT chk_process_status CHECK (status IN ('STARTED', 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'));
DROP TABLE IF EXISTS establishments;
-- +goose StatementEnd
