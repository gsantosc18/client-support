# API Specification - MariaDB Migration

## API Endpoints
All existing REST API endpoints remain unchanged in their paths, HTTP methods, headers, request bodies, and response schemas.

## Health Check Endpoint
The health check endpoint `GET /health` is modified/verified to ensure database status check works correctly with MariaDB:
- Path: `/health`
- Method: `GET`
- Response Payload:
  ```json
  {
    "status": "healthy",
    "services": {
      "database": {
        "status": "up"
      },
      "redis": {
        "status": "up"
      }
    }
  }
  ```
- Behind the scenes, the endpoint queries the GORM database client pool via `db.DB()` and runs a `Ping()` check against the MariaDB service.
