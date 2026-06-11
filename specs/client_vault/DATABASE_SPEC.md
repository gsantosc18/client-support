# Database Spec: Client Credentials Vault

## Tabelas e Esquema Relacional

A tabela `client_vault_items` armazenará as credenciais encriptadas.

```sql
CREATE TABLE client_vault_items (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    client_id CHAR(36) NOT NULL,
    company_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    password TEXT NOT NULL,           -- Campo encriptado (Base64/Hex do texto cifrado)
    notes TEXT DEFAULT NULL,          -- Campo encriptado (Base64/Hex do texto cifrado)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_vault_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    CONSTRAINT fk_vault_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    CONSTRAINT fk_vault_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX idx_vault_client ON client_vault_items (client_id);
CREATE INDEX idx_vault_company ON client_vault_items (company_id);
CREATE INDEX idx_vault_user ON client_vault_items (user_id);
```

### Índices e Chaves Estrangeiras
- Chave estrangeira para `clients` com `ON DELETE CASCADE`: se um cliente for deletado, suas credenciais de cofre também devem ser removidas para segurança.
- Chave estrangeira para `companies` com `ON DELETE CASCADE`.
- Índice composto ou simples por `client_id` para aceleração das consultas de listagem por cliente.
