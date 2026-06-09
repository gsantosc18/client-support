-- +goose Up
CREATE TABLE deleted_processes (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    data JSON NOT NULL,
    deleted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- +goose Down
DROP TABLE IF EXISTS deleted_processes;
