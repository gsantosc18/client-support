-- +goose Up

-- 1. Criar tabela de estabelecimentos
CREATE TABLE establishments (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    company_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_establishments_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE RESTRICT
);

CREATE INDEX idx_establishments_company_name ON establishments(company_id, name);

-- 2. Modificar tabela de processos existente (drop de constraints antigas)
ALTER TABLE processes DROP CONSTRAINT IF EXISTS chk_process_status;
ALTER TABLE processes DROP KEY IF EXISTS uq_process_company_external;
ALTER TABLE processes DROP FOREIGN KEY fk_processes_client;

-- Remover coluna client_id e external_id
ALTER TABLE processes DROP COLUMN IF EXISTS client_id;
ALTER TABLE processes DROP COLUMN IF EXISTS external_id;

-- Adicionar novas colunas
ALTER TABLE processes ADD COLUMN establishment_id CHAR(36) NOT NULL;
ALTER TABLE processes ADD CONSTRAINT fk_processes_establishment FOREIGN KEY (establishment_id) REFERENCES establishments(id) ON DELETE RESTRICT;
ALTER TABLE processes ADD COLUMN protocol TEXT;
ALTER TABLE processes ADD COLUMN observation TEXT;

-- Atualizar status padrão e adicionar constraint CHECK de status
ALTER TABLE processes ALTER COLUMN status SET DEFAULT 'PENDING';
ALTER TABLE processes ADD CONSTRAINT chk_process_status CHECK (status IN ('PENDING', 'IN_PROGRESS', 'AWAITING_DOCUMENTATION', 'IN_ANALYSIS', 'COMPLETED', 'CANCELLED'));

-- 3. Criar tabela de associação client_processes
CREATE TABLE client_processes (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    client_id CHAR(36) NOT NULL,
    process_id CHAR(36) NOT NULL,
    CONSTRAINT uq_client_process UNIQUE (client_id, process_id),
    CONSTRAINT fk_client_processes_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    CONSTRAINT fk_client_processes_process FOREIGN KEY (process_id) REFERENCES processes(id) ON DELETE CASCADE
);

CREATE INDEX idx_client_processes_process_id ON client_processes(process_id);
CREATE INDEX idx_client_processes_client_id ON client_processes(client_id);

-- +goose Down
DROP TABLE IF EXISTS client_processes;
ALTER TABLE processes DROP CONSTRAINT IF EXISTS chk_process_status;
ALTER TABLE processes DROP FOREIGN KEY fk_processes_establishment;
ALTER TABLE processes DROP COLUMN IF EXISTS establishment_id;
ALTER TABLE processes DROP COLUMN IF EXISTS protocol;
ALTER TABLE processes DROP COLUMN IF EXISTS observation;
ALTER TABLE processes ADD COLUMN client_id CHAR(36) NOT NULL;
ALTER TABLE processes ADD CONSTRAINT fk_processes_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE RESTRICT;
ALTER TABLE processes ADD COLUMN external_id VARCHAR(255);
ALTER TABLE processes ADD CONSTRAINT uq_process_company_external UNIQUE (company_id, external_id);
ALTER TABLE processes ADD CONSTRAINT chk_process_status CHECK (status IN ('STARTED', 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'));
DROP TABLE IF EXISTS establishments;
