# Product Specification - MariaDB Migration

## Objectives
Migrate the primary relational database of the Client Support service from PostgreSQL 15 to MariaDB. This migration aims to adapt the stack to MariaDB while retaining all current system features, performance characteristics, and data structures.

## Requirements
1. **Fully Replace PostgreSQL**: The application must run entirely on MariaDB.
2. **Data Consistency**: All tables, relationships, constraints, and data integrity checks must be preserved.
3. **Identical System Behavior**: All existing functionality (user authentication, client management, process flows, annotations, and document handling) must function identically.
4. **Environment Portability**: The local development configuration (`docker-compose.yml`) and production stack definition (`docker-stack.yml`) must be updated to use MariaDB.

## Acceptance Criteria
- MariaDB is used as the relational database in `docker-compose.yml` and `docker-stack.yml`.
- The backend application initializes, connects, and successfully migrates the database schema on start using MariaDB-compatible SQL migrations.
- All backend unit and integration tests pass.
- End-to-end (E2E) Cypress tests run and verify all frontend-to-backend flows without error.
- Health check (`/health`) reports database status correctly.
