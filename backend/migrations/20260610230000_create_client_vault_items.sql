-- +goose Up
CREATE TABLE client_vault_items (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    client_id CHAR(36) NOT NULL,
    company_id CHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    username TEXT DEFAULT NULL,
    password TEXT NOT NULL,
    notes TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_vault_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    CONSTRAINT fk_vault_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE INDEX idx_vault_client ON client_vault_items (client_id);
CREATE INDEX idx_vault_company ON client_vault_items (company_id);

-- +goose Down
DROP TABLE IF EXISTS client_vault_items;
