# Flow Specification - MariaDB Migration

## System Flows
All data flows (authentication, client operations, process handling, annotations, documents) remain unchanged:

```mermaid
sequenceDiagram
    participant User/Client as Frontend App (Next.js)
    participant Backend as Backend Server (Fiber)
    participant DB as Relational Database (MariaDB)
    participant Cache as Redis

    User/Client->>Backend: HTTP Request (JWT Auth)
    Backend->>Cache: Token Blacklist check / Session cache
    Cache-->>Backend: Status OK
    Backend->>DB: SQL Query (GORM + MySQL/MariaDB Driver)
    DB-->>Backend: Query Result
    Backend-->>User/Client: JSON Response
```

## Migration & Startup Flow
At container startup, the backend initialization flow executes migrations and connects to the database:

```mermaid
sequenceDiagram
    participant OS as Container CMD
    participant Goose as Goose Migration Runner
    participant DB as MariaDB Container
    participant App as Backend Binary (main)

    OS->>Goose: Run: goose mysql <dsn> up
    Goose->>DB: Connect & Apply Migrations (*.sql)
    DB-->>Goose: Migrations Applied Successfully
    OS->>App: Execute: ./main
    App->>DB: Open GORM pool (mysql)
    App->>DB: Ping database
    DB-->>App: Pong
    App->>OS: Start Fiber HTTP Server (Port 8080)
```
