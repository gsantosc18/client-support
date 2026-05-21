-- +goose Up
-- +goose StatementBegin
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    birth_date DATE,
    cpf VARCHAR(14),
    rg VARCHAR(20),
    cnh VARCHAR(20),
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT uq_client_company_email UNIQUE (company_id, email),
    CONSTRAINT uq_client_company_cpf UNIQUE (company_id, cpf),
    CONSTRAINT uq_client_company_rg UNIQUE (company_id, rg),
    CONSTRAINT uq_client_company_cnh UNIQUE (company_id, cnh),
    CONSTRAINT chk_client_status CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED'))
);

CREATE TABLE processes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    external_id VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'STARTED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT uq_process_company_external UNIQUE (company_id, external_id),
    CONSTRAINT chk_process_status CHECK (status IN ('STARTED', 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'))
);

CREATE INDEX idx_clients_company_name ON clients (company_id, full_name);
CREATE INDEX idx_clients_company_cpf ON clients (company_id, cpf) WHERE cpf IS NOT NULL;
CREATE INDEX idx_clients_company_email ON clients (company_id, email) WHERE email IS NOT NULL;

CREATE INDEX idx_processes_company_client ON processes (company_id, client_id);
CREATE INDEX idx_processes_company_user_status ON processes (company_id, user_id, status);
CREATE INDEX idx_processes_external_id ON processes (company_id, external_id) WHERE external_id IS NOT NULL;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS processes;
DROP TABLE IF EXISTS clients;
-- +goose StatementEnd
