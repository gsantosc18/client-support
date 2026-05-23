-- +goose Up
-- +goose StatementBegin
CREATE TABLE deleted_processes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    data JSONB NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS deleted_processes;
-- +goose StatementEnd
