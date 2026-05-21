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
