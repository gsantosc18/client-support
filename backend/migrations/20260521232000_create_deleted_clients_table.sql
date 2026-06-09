-- +goose Up
CREATE TABLE deleted_clients (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    data JSON NOT NULL,
    deleted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- +goose Down
DROP TABLE IF EXISTS deleted_clients;
