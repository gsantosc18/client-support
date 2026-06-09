# Technical Specification - MariaDB Migration

## Architecture Changes

### 1. Database Driver Replacement
- Remove `gorm.io/driver/postgres` from Go dependencies.
- Add `gorm.io/driver/mysql` to Go dependencies.
- Update `backend/cmd/api/main.go` to import `"gorm.io/driver/mysql"` and instantiate the DB connection using `mysql.Open(cfg.Database.URL)`.

### 2. Configuration & DSN Changes
The database connection string changes from PostgreSQL format to MySQL/MariaDB DSN format:
- Old (PostgreSQL): `host=db user=root password=rootpassword dbname=client_support port=5432 sslmode=disable TimeZone=UTC`
- New (MariaDB): `root:rootpassword@tcp(db:3306)/client_support?charset=utf8mb4&parseTime=True&loc=Local`

### 3. Goose Migrations Engine
- The migrations runner inside the Docker container must run in `mysql` mode:
  - Old: `goose -dir ./migrations postgres "$DATABASE_URL" up`
  - New: `goose -dir ./migrations mysql "$DATABASE_URL" up`

### 4. Integration Test Updates
- Update `backend/internal/repository/postgres/user_repository_test.go` and `backend/internal/repository/postgres/company_repository_test.go` to import `"gorm.io/driver/mysql"` and use a local MariaDB connection DSN for testing: `root:rootpassword@tcp(localhost:3306)/client_support?charset=utf8mb4&parseTime=True&loc=Local`.
- *Note*: GORM abstracts database operations, so the database repositories in `internal/repository/postgres/` will work seamlessly with MariaDB/MySQL. For simplicity and to avoid breaking imports, we can keep the repository folder name or rename it if necessary (for now, keeping it as the SQL implementation folder is safer to minimize code churn, but we'll document this choice in the ADR).
