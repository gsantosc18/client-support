# Database Specification - MariaDB Migration

## Table Mappings & Conversions

All SQL schema migration files in `backend/migrations/*.sql` will be updated to target the MariaDB/MySQL SQL dialect.

### Type Transformations
| PostgreSQL Type | MariaDB Type | Notes |
|---|---|---|
| `UUID` | `CHAR(36)` | Fixed-length string to store UUID values in standard format. |
| `uuid_generate_v4()` | `(UUID())` | Built-in UUID generator in MariaDB. Parentheses are required. |
| `BIGSERIAL` | `BIGINT AUTO_INCREMENT` | Auto-incrementing primary keys. |
| `JSONB` | `JSON` | Stored as text with JSON validation checks enforced by MariaDB. |
| `TIMESTAMP WITH TIME ZONE` | `TIMESTAMP` | UTC-aligned timestamp data type. |

### Migration Updates

#### 1. Schema Modifications
- Remove `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";` as it is PostgreSQL-specific.
- Replace all table primary and foreign keys of type `UUID` with `CHAR(36)`.
- Replace all column defaults of `uuid_generate_v4()` with `(UUID())`.
- In `deleted_clients`, change `id BIGSERIAL PRIMARY KEY` to `id BIGINT AUTO_INCREMENT PRIMARY KEY` and `data JSONB NOT NULL` to `data JSON NOT NULL`.
- In `deleted_processes`, change `data JSONB NOT NULL` to `data JSON NOT NULL`.

#### 2. Index Modification
MariaDB handles indexes on nullable columns natively. Partial indexes with `WHERE column IS NOT NULL` are not supported in standard MariaDB/MySQL index declarations.
- Old: `CREATE INDEX idx_clients_company_cpf ON clients (company_id, cpf) WHERE cpf IS NOT NULL;`
- New: `CREATE INDEX idx_clients_company_cpf ON clients (company_id, cpf);`

#### 3. Foreign Key / Check Constraints
- In MariaDB, check constraints are supported natively: `CONSTRAINT chk_client_status CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED'))`.
- Foreign key constraints: `REFERENCES companies(id) ON DELETE CASCADE`.

## Docker Infrastructure
- Docker Compose service `db` image updated from `postgres:15-alpine` to `mariadb:10.11`.
- Update environment variables:
  - `MARIADB_ROOT_PASSWORD` / `MYSQL_ROOT_PASSWORD`
  - `MARIADB_DATABASE` / `MYSQL_DATABASE`
- Update Docker healthcheck to: `mysqladmin ping -h localhost -u root -p$$MARIADB_ROOT_PASSWORD` (or using `mariadb-admin ping`).
