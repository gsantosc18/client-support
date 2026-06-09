# Security Specification - MariaDB Migration

## Connection Credentials
- The database root password and credentials must be injected dynamically via environment variables (`MARIADB_ROOT_PASSWORD` / `DATABASE_URL`).
- In docker production environments (`docker-stack.yml`), credentials must be configured securely (e.g., using Docker Secrets or secure environment mapping).

## Port Isolation
- The database service is exposed on port `3306` inside the virtual docker networks.
- In local development, port `3306` is mapped to the host loopback adapter to allow local debugging and tests.
- In production swarm, port `3306` is isolated and only reachable by the `backend` service within the internal bridge network.
