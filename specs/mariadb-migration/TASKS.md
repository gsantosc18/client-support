# TASKS - MariaDB Migration

## Backend & Database

- [ ] **Domain Models Update**:
  - [ ] In `backend/internal/domain/`, update all entities (`Company`, `User`, `Client`, `Process`, `Establishment`, `Annotation`, `Document`) to replace GORM tags:
    - [ ] `type:uuid` and `default:uuid_generate_v4()` to `type:char(36);default:(uuid())`.
    - [ ] `type:jsonb` to `type:json`.
    - [ ] `type:timestamp with time zone` or `type:timestamptz` to `type:timestamp`.
- [ ] **Migrations Migration**:
  - [ ] Rewrite all files in `backend/migrations/*.sql` to use MariaDB/MySQL compatible SQL syntax.
- [ ] **Main Application Changes**:
  - [ ] Modify `backend/go.mod` to include `gorm.io/driver/mysql` and remove `gorm.io/driver/postgres`.
  - [ ] Update DB startup connection block in `backend/cmd/api/main.go` to use the MySQL driver.
- [ ] **Integration Test Configuration**:
  - [ ] Update `company_repository_test.go` and `user_repository_test.go` to connect via MySQL/MariaDB driver.

## Infrastructure Configuration

- [ ] **Docker Compose Integration**:
  - [ ] Edit `docker-compose.yml` to replace Postgres service with `mariadb:10.11` and set appropriate variables and healthchecks.
  - [ ] Update backend environment variable `DATABASE_URL` to match MySQL DSN format.
- [ ] **Docker Stack Deployment**:
  - [ ] Edit `docker-stack.yml` to replace Postgres with MariaDB and adjust connection settings.
- [ ] **Goose Dialect Update**:
  - [ ] In `backend/Dockerfile`, update cmd to run migrations using the `mysql` dialect driver: `goose -dir ./migrations mysql "$DATABASE_URL" up`.

## Verification & QA

- [ ] **Execution & Backend Tests**:
  - [ ] Run local backend integration and unit tests: `make tests-back`.
- [ ] **End-to-End Tests**:
  - [ ] Start backend and frontend infrastructure locally: `make infra`.
  - [ ] Verify health status: `GET http://localhost:8080/health`.
  - [ ] Execute Cypress test suite to validate all business features: `make tests-e2e`.
