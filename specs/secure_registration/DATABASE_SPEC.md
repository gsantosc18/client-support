# DATABASE SPECIFICATION (DATABASE_SPEC.md) - Cadastro Seguro de Usuários

## Novas Tabelas e Migrações

Para suportar o fluxo de convites, adicionaremos a tabela `user_invitations` através de uma nova migration no MariaDB.

### 1. Estrutura da Tabela `user_invitations`

```sql
CREATE TABLE user_invitations (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    company_id CHAR(36) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_invitations_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);
```

### 2. Índices e Constraints

- **Chave Primária**: `id` (UUID).
- **Chave Estrangeira**: `company_id` referenciando `companies(id)`. Garante integridade do tenant.
- **Unique Constraint**: `token` para impedir colisões de tokens de convite.
- **Index**: Criar índice em `(company_id, email)` para otimizar a consulta e evitar convites duplicados pendentes para o mesmo e-mail na mesma empresa.

### 3. Script da Migration (`backend/migrations/20260609080000_create_user_invitations.sql`)

```sql
-- +goose Up
CREATE TABLE user_invitations (
    id CHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    company_id CHAR(36) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_invitations_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE INDEX idx_invitations_company_email ON user_invitations (company_id, email);

-- +goose Down
DROP TABLE IF EXISTS user_invitations;
```

### 4. Adição da Flag `admin` na Tabela `users`

Para distinguir administradores de operadores comuns, adicionaremos a coluna `admin` na tabela `users`.

#### Script da Migration (`backend/migrations/20260609090000_add_admin_flag_to_users.sql`)

```sql
-- +goose Up
ALTER TABLE users ADD COLUMN admin BOOLEAN NOT NULL DEFAULT FALSE;

-- +goose Down
ALTER TABLE users DROP COLUMN admin;
```

