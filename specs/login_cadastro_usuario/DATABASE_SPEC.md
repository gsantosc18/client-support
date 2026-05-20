# Database Specification

## Tabelas

### `companies`
- `id` UUID PRIMARY KEY
- `name` VARCHAR NOT NULL
- `status` VARCHAR NOT NULL (ex: ACTIVE, INACTIVE)
- `created_at` TIMESTAMP
- `updated_at` TIMESTAMP

### `users`
- `id` UUID PRIMARY KEY
- `company_id` UUID FK -> companies(id)
- `first_name` VARCHAR NOT NULL
- `last_name` VARCHAR NOT NULL
- `email` VARCHAR NOT NULL
- `phone` VARCHAR
- `birth_date` DATE NOT NULL
- `password_hash` VARCHAR NOT NULL
- `status` VARCHAR NOT NULL
- `failed_login_attempts` INT DEFAULT 0
- `locked_until` TIMESTAMP NULL
- `created_at` TIMESTAMP
- `updated_at` TIMESTAMP
- **Indexes**: UNIQUE(email, company_id)

### `password_recovery_tokens`
- `token` VARCHAR PRIMARY KEY
- `user_id` UUID FK -> users(id)
- `expires_at` TIMESTAMP NOT NULL
- `used` BOOLEAN DEFAULT FALSE

### `token_blacklist` (Opcional, se não usar Redis)
- `token_hash` VARCHAR PRIMARY KEY
- `expires_at` TIMESTAMP NOT NULL
