    User->>API: POST /api/clients/:id/vault {title, password, notes}
    API->>Service: CreateVaultItem(ctx, clientId, data)
    Service->>Crypto: Encrypt(password), Encrypt(notes)
    Crypto-->>Service: Return Encrypted Hex Strings
    Service->>DB: INSERT INTO client_vault_items
    DB-->>Service: Ok (Saved)
    Service-->>API: Return Created Item (sensitives masked/hidden)
    API-->>User: 201 Created {id, title}
```

## Fluxo de Revelação (Decriptação)
```mermaid
sequenceDiagram
    participant User as Usuário (Frontend)
    participant API as ClientVaultHandler (Backend)
    participant Service as ClientVaultService (Backend)
    participant DB as Banco de Dados (MariaDB)
    participant Crypto as CryptoUtils (AES-256-GCM)

    User->>API: GET /api/clients/:id/vault/:item_id
    API->>Service: GetDecryptedItem(ctx, clientId, itemId)
    Service->>DB: SELECT * FROM client_vault_items WHERE id = itemId
    DB-->>Service: Return Encrypted Record
    Service->>Crypto: Decrypt(password), Decrypt(notes)
    Crypto-->>Service: Return Plaintext Strings
    Service-->>API: Return Plaintext Struct
    API-->>User: 200 OK {id, title, password, notes}
```
