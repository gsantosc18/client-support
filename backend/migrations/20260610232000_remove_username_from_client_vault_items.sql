-- +goose Up
ALTER TABLE client_vault_items 
DROP COLUMN username;

-- +goose Down
ALTER TABLE client_vault_items 
ADD COLUMN username TEXT DEFAULT NULL AFTER title;
