-- +goose Up
ALTER TABLE client_vault_items 
ADD COLUMN user_id CHAR(36) NOT NULL AFTER company_id,
ADD CONSTRAINT fk_vault_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT;

CREATE INDEX idx_vault_user ON client_vault_items (user_id);

-- +goose Down
ALTER TABLE client_vault_items 
DROP FOREIGN KEY fk_vault_user,
DROP INDEX idx_vault_user,
DROP COLUMN user_id;
